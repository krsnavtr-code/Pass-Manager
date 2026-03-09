const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const Session = require("../models/Session.js");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const CryptoJS = require("crypto-js");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// Email transporter setup
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, masterPassword, confirmPassword } = req.body;

    if (!name || !email || !masterPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please add all fields",
      });
    }

    if (masterPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Generate recovery key (32-character random string)
    const recoveryKey = crypto.randomBytes(16).toString("hex");

    // Create user
    const user = await User.create({
      name,
      email,
      masterPasswordHash: masterPassword, // This will be hashed in pre-save hook
      recoveryKey: recoveryKey, // This will be hashed in pre-save hook
    });

    // Create session in database
    const sessionExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const session = await Session.create({
      user: user._id,
      loginTime: new Date(),
      expiryTime: sessionExpiry,
      lastActivity: new Date(),
    });

    // Generate token with session ID
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      sessionId: session._id,
      recoveryKey: recoveryKey, // Send the recovery key to user
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, masterPassword } = req.body;

    if (!email || !masterPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and master password",
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select("+masterPasswordHash");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if master password matches
    const isMatch = await user.matchMasterPassword(masterPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Update login statistics
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    // Check if user already has an active session
    const existingSession = await Session.findOne({
      user: user._id,
      isActive: true,
      expiryTime: { $gt: new Date() },
    });

    let session;
    if (existingSession) {
      // Update existing session instead of creating new one
      existingSession.lastActivity = new Date();
      // Refresh expiry on each login so session endpoint stays valid
      existingSession.expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      session = await existingSession.save();
    } else {
      // Create new session only if none exists
      const sessionExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      session = await Session.create({
        user: user._id,
        loginTime: new Date(),
        expiryTime: sessionExpiry,
        lastActivity: new Date(),
      });
    }

    // Generate token with session ID
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      sessionId: session._id,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Verify master password
// @route   POST /api/auth/verify-master
// @access  Private
const verifyMasterPassword = async (req, res) => {
  try {
    const { masterPassword } = req.body;

    if (!masterPassword) {
      return res.status(400).json({
        success: false,
        message: "Master password is required",
      });
    }

    const user = await User.findById(req.user.id).select("+masterPasswordHash");

    const isMatch = await user.matchMasterPassword(masterPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid master password",
      });
    }

    res.json({
      success: true,
      message: "Master password verified",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Validate session
// @route   GET /api/auth/session
// @access   Private
const validateSession = async (req, res) => {
  try {
    // Clean up expired sessions first
    const cleanupResult = await Session.deleteMany({
      expiryTime: { $lt: new Date() },
    });

    const session = await Session.findOne({
      user: req.user.id,
      isActive: true,
      expiryTime: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: "Session expired or not found",
      });
    }

    // Update last activity
    session.lastActivity = new Date();
    await session.save();

    const timeRemaining = session.expiryTime.getTime() - Date.now();

    res.json({
      success: true,
      data: {
        session: {
          id: session._id,
          loginTime: session.loginTime,
          expiryTime: session.expiryTime,
          timeRemaining: Math.max(0, timeRemaining),
        },
      },
    });
  } catch (error) {
    console.error("Session validation error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };

    res.json({
      success: true,
      data: {
        user: userData,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Initiate master password reset
// @route   POST /api/auth/reset-master-request
// @access  Public
const requestMasterPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in user document (you might want to create a separate collection for this)
    user.resetOTP = otp;
    user.resetOTPExpiry = otpExpiry;
    await user.save();

    // Send email with OTP
    const transporter = createEmailTransporter();

    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: user.email,
      subject: "Master Password Reset OTP - Password Manager",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Master Password Reset</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Password Manager Security</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Your OTP Code</h2>
            <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; border: 2px dashed #667eea;">
              <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 5px;">${otp}</span>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404; font-size: 14px;">
                <strong>Important:</strong> This OTP will expire in 10 minutes. For your security, never share this code with anyone.
              </p>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #d1ecf1; border-radius: 8px; border-left: 4px solid #17a2b8;">
              <p style="margin: 0; color: #0c5460; font-size: 14px;">
                <strong>Note:</strong> Resetting your master password will require you to re-encrypt all your stored passwords. Make sure you have access to your email.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
            <p>If you didn't request this reset, please ignore this email.</p>
            <p>This is an automated message from Password Manager.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: "OTP sent to your email. Please check your inbox.",
    });
  } catch (error) {
    console.error("Master password reset request error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Verify OTP and reset master password
// @route   POST /api/auth/reset-master-verify
// @access  Public
const verifyAndResetMasterPassword = async (req, res) => {
  try {
    const { email, otp, newMasterPassword, currentMasterPassword } = req.body;

    if (!email || !otp || !newMasterPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Find user with valid OTP
    const user = await User.findOne({
      email,
      resetOTP: otp,
      resetOTPExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Get all passwords for this user
    const Password = require("../models/Password.js");
    const userPasswords = await Password.find({ user: user._id });

    let reencryptedPasswords = 0;
    let failedPasswords = 0;

    // Re-encrypt all passwords with new master password if current master password is provided
    if (currentMasterPassword && userPasswords.length > 0) {
      for (const passwordEntry of userPasswords) {
        try {
          // Decrypt with current master password
          const decrypted = passwordEntry.decryptPassword(
            currentMasterPassword,
          );

          // Re-encrypt with new master password
          const reencrypted = CryptoJS.AES.encrypt(
            decrypted,
            newMasterPassword,
          ).toString();
          passwordEntry.encryptedPassword = reencrypted;
          await passwordEntry.save();
          reencryptedPasswords++;
        } catch (decryptError) {
          failedPasswords++;
          console.error(
            `Failed to re-encrypt password for ${passwordEntry.website}:`,
            decryptError.message,
          );
        }
      }
    }

    // Hash new master password
    const salt = await bcrypt.genSalt(12);
    const masterPasswordHash = await bcrypt.hash(newMasterPassword, salt);

    // Update master password and clear OTP
    user.masterPasswordHash = masterPasswordHash;
    user.resetOTP = undefined;
    user.resetOTPExpiry = undefined;
    await user.save();

    // Send confirmation email
    const transporter = createEmailTransporter();

    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: user.email,
      subject: "Master Password Successfully Reset - Password Manager",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Password Reset Successful</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Password Manager Security</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Your Master Password Has Been Reset</h2>
            
            <div style="background: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 20px;">
              <p style="margin: 0; color: #155724; font-size: 16px;">
                ✅ Your master password has been successfully reset.
              </p>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
              <h3 style="margin-top: 0; color: #856404;">Important Next Steps:</h3>
              <ul style="color: #856404; margin: 10px 0; padding-left: 20px;">
                <li>Log out of all active sessions</li>
                <li>Log back in with your new master password</li>
                <li>Re-encrypt any passwords that may need updating</li>
                <li>Store your new master password in a secure location</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}/login" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Go to Login
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
            <p>If you didn't make this change, please contact support immediately.</p>
            <p>This is an automated message from Password Manager.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Prepare response message
    let responseMessage =
      "Master password reset successfully. Please log in with your new password.";

    if (currentMasterPassword && userPasswords.length > 0) {
      responseMessage = `Master password reset successfully! ${reencryptedPasswords} passwords re-encrypted with new master password${failedPasswords > 0 ? ` (${failedPasswords} failed)` : ""}. Please log in with your new password.`;
    } else if (userPasswords.length > 0) {
      responseMessage = `Master password reset successfully. ⚠️ You have ${userPasswords.length} existing passwords that were encrypted with your old master password. You will need to re-enter them manually or use the master password migration feature.`;
    }

    res.json({
      success: true,
      message: responseMessage,
      reencryptedPasswords,
      totalPasswords: userPasswords.length,
      failedPasswords,
    });
  } catch (error) {
    console.error("Master password reset verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Verify recovery key and reset master password
// @route   POST /api/auth/reset-master-with-recovery
// @access  Public
const resetMasterWithRecoveryKey = async (req, res) => {
  try {
    const { email, recoveryKey, newMasterPassword } = req.body;

    if (!email || !recoveryKey || !newMasterPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Find user with recovery key
    const user = await User.findOne({ email }).select("+recoveryKey");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    // Verify recovery key
    const isRecoveryKeyValid = await bcrypt.compare(
      recoveryKey,
      user.recoveryKey,
    );
    if (!isRecoveryKeyValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid recovery key",
      });
    }

    // Get all passwords for this user
    const Password = require("../models/Password.js");
    const userPasswords = await Password.find({ user: user._id });

    // Hash new master password
    const salt = await bcrypt.genSalt(12);
    const masterPasswordHash = await bcrypt.hash(newMasterPassword, salt);

    // Update master password
    user.masterPasswordHash = masterPasswordHash;
    await user.save();

    // Send confirmation email
    const transporter = createEmailTransporter();
    const mailOptions = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: user.email,
      subject: "Master Password Reset Using Recovery Key - Password Manager",
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Recovery Successful</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Password Manager Security</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 10px; margin-top: 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Master Password Reset Complete</h2>
            
            <div style="background: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin-bottom: 20px;">
              <p style="margin: 0; color: #155724; font-size: 16px;">
                ✅ Your master password has been successfully reset using your recovery key.
              </p>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
              <h3 style="margin-top: 0; color: #856404;">Important Information:</h3>
              <ul style="color: #856404; margin: 10px 0; padding-left: 20px;">
                <li>You have ${userPasswords.length} passwords in your vault</li>
                <li>Your passwords remain secure and accessible</li>
                <li>Log in with your new master password to access your vault</li>
                <li>Store your new master password in a secure location</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL}/login" style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Go to Login
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
            <p>If you didn't make this change, please contact support immediately.</p>
            <p>This is an automated message from Password Manager.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: `Master password reset successfully! You have ${userPasswords.length} passwords in your vault that remain accessible. Please log in with your new password.`,
      totalPasswords: userPasswords.length,
    });
  } catch (error) {
    console.error("Recovery key reset error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyMasterPassword,
  validateSession,
  getUserProfile,
  requestMasterPasswordReset,
  verifyAndResetMasterPassword,
  resetMasterWithRecoveryKey,
};
