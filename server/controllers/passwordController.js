const Password = require("../models/Password.js");
const CryptoJS = require("crypto-js");

// @desc    Get all passwords for a user
// @route   GET /api/passwords
// @access  Private
const getPasswords = async (req, res) => {
  try {
    const { category, search } = req.query;

    let query = { user: req.user.id };

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { website: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const passwords = await Password.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: passwords.length,
      passwords,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Create a new password
// @route   POST /api/passwords
// @access  Private
const createPassword = async (req, res) => {
  try {
    const {
      website,
      username,
      password,
      masterPassword,
      category,
      notes,
      url,
      tags,
      isFavorite,
    } = req.body;

    if (!website || !username || !password || !masterPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Website, username, password, and master password are required",
      });
    }

    const newPassword = new Password({
      user: req.user.id,
      website,
      username,
      category: category || "other",
      notes,
      url,
      tags: tags || [],
      isFavorite: isFavorite || false,
    });

    // Encrypt password
    const encrypted = CryptoJS.AES.encrypt(password, masterPassword).toString();
    newPassword.encryptedPassword = encrypted;

    await newPassword.save();

    res.status(201).json({
      success: true,
      password: newPassword,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Get a single password
// @route   GET /api/passwords/:id
// @access  Private
const getPassword = async (req, res) => {
  try {
    const password = await Password.findById(req.params.id);

    if (!password) {
      return res.status(404).json({
        success: false,
        message: "Password not found",
      });
    }

    // Check if password belongs to user
    if (password.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    res.json({
      success: true,
      password,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Decrypt a password
// @route   POST /api/passwords/:id/decrypt
// @access  Private
const decryptPassword = async (req, res) => {
  try {
    const { masterPassword } = req.body;

    if (!masterPassword) {
      return res.status(400).json({
        success: false,
        message: "Master password is required",
      });
    }

    const password = await Password.findById(req.params.id);

    if (!password) {
      return res.status(404).json({
        success: false,
        message: "Password not found",
      });
    }

    // Check if password belongs to user
    if (password.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const decryptedPassword = password.decryptPassword(masterPassword);

    res.json({
      success: true,
      password: decryptedPassword,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// @desc    Update a password
// @route   PUT /api/passwords/:id
// @access  Private
const updatePassword = async (req, res) => {
  try {
    const {
      website,
      username,
      password,
      category,
      notes,
      url,
      tags,
      isFavorite,
    } = req.body;

    let passwordEntry = await Password.findById(req.params.id);

    if (!passwordEntry) {
      return res.status(404).json({
        success: false,
        message: "Password not found",
      });
    }

    // Check if password belongs to user
    if (passwordEntry.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Update fields
    if (website) passwordEntry.website = website;
    if (username) passwordEntry.username = username;
    if (category) passwordEntry.category = category;
    if (notes !== undefined) passwordEntry.notes = notes;
    if (url !== undefined) passwordEntry.url = url;
    if (tags !== undefined) passwordEntry.tags = tags;
    if (isFavorite !== undefined) passwordEntry.isFavorite = isFavorite;

    // Encrypt new password if provided
    if (password && req.masterPassword) {
      passwordEntry.encryptPassword(password, req.masterPassword);
    }

    await passwordEntry.save();

    res.json({
      success: true,
      password: passwordEntry,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Delete a password
// @route   DELETE /api/passwords/:id
// @access  Private
const deletePassword = async (req, res) => {
  try {
    const password = await Password.findById(req.params.id);

    if (!password) {
      return res.status(404).json({
        success: false,
        message: "Password not found",
      });
    }

    // Check if password belongs to user
    if (password.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    await password.deleteOne();

    res.json({
      success: true,
      message: "Password deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getPasswords,
  createPassword,
  getPassword,
  decryptPassword,
  updatePassword,
  deletePassword,
};
