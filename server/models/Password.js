const mongoose = require("mongoose");
const CryptoJS = require("crypto-js");

const passwordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  website: {
    type: String,
    required: [true, "Please add a website or application name"],
    trim: true,
  },
  username: {
    type: String,
    required: [true, "Please add a username or email"],
    trim: true,
  },
  encryptedPassword: {
    type: String,
    required: [true, "Password is required"],
  },
  category: {
    type: String,
    enum: ["social", "work", "finance", "shopping", "other"],
    default: "other",
  },
  notes: {
    type: String,
    trim: true,
  },
  url: {
    type: String,
    trim: true,
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  isFavorite: {
    type: Boolean,
    default: false,
  },
  lastModified: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Method to encrypt password
passwordSchema.methods.encryptPassword = function (password, masterPassword) {
  const encrypted = CryptoJS.AES.encrypt(password, masterPassword).toString();
  this.encryptedPassword = encrypted;
  return this;
};

// Method to decrypt password
passwordSchema.methods.decryptPassword = function (masterPassword) {
  try {
    const decrypted = CryptoJS.AES.decrypt(
      this.encryptedPassword,
      masterPassword,
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    throw new Error("Failed to decrypt password. Invalid master password.");
  }
};

// Update lastModified on save
passwordSchema.pre("save", async function () {
  this.lastModified = new Date();
});

const Password = mongoose.model("Password", passwordSchema);

module.exports = Password;
