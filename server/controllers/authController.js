const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const Session = require("../models/Session.js");
const bcrypt = require("bcryptjs");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, masterPassword } = req.body;

    if (!name || !email || !password || !masterPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    if (password !== confirmPassword) {
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

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      masterPasswordHash: masterPassword, // This will be hashed in pre-save hook
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
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

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

module.exports = {
  registerUser,
  loginUser,
  verifyMasterPassword,
  validateSession,
  getUserProfile,
};
