const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, "Please add a valid email"],
  },
  masterPasswordHash: {
    type: String,
    required: [true, "Master password is required"],
    select: false,
  },
  recoveryKey: {
    type: String,
    required: [true, "Recovery key is required"],
    select: false,
  },
  resetOTP: {
    type: String,
    select: false,
  },
  resetOTPExpiry: {
    type: Date,
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
  loginCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt passwords using bcrypt
userSchema.pre("save", async function () {
  const user = this;

  // Hash master password if modified
  if (user.isModified("masterPasswordHash")) {
    const salt = await bcrypt.genSalt(10);
    user.masterPasswordHash = await bcrypt.hash(user.masterPasswordHash, salt);
  }

  // Hash recovery key if modified
  if (user.isModified("recoveryKey")) {
    const salt = await bcrypt.genSalt(10);
    user.recoveryKey = await bcrypt.hash(user.recoveryKey, salt);
  }
});

// Match master password
userSchema.methods.matchMasterPassword = async function (
  enteredMasterPassword,
) {
  return await bcrypt.compare(enteredMasterPassword, this.masterPasswordHash);
};

// Match recovery key
userSchema.methods.matchRecoveryKey = async function (enteredRecoveryKey) {
  return await bcrypt.compare(enteredRecoveryKey, this.recoveryKey);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
