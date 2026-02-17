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
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please add a valid email",
    ],
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  masterPasswordHash: {
    type: String,
    required: [true, "Master password is required"],
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt passwords using bcrypt
userSchema.pre("save", async function () {
  const user = this;

  // Hash password if modified
  if (user.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }

  // Hash master password if modified
  if (user.isModified("masterPasswordHash")) {
    const salt = await bcrypt.genSalt(10);
    user.masterPasswordHash = await bcrypt.hash(user.masterPasswordHash, salt);
  }
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Match master password
userSchema.methods.matchMasterPassword = async function (
  enteredMasterPassword,
) {
  return await bcrypt.compare(enteredMasterPassword, this.masterPasswordHash);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
