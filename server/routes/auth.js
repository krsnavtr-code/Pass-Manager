const express = require("express");
const {
  registerUser,
  loginUser,
  verifyMasterPassword,
  validateSession,
  getUserProfile,
  requestMasterPasswordReset,
  verifyAndResetMasterPassword,
} = require("../controllers/authController.js");
const protect = require("../middleware/auth.js");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-master", protect, verifyMasterPassword);
router.get("/session", protect, validateSession);
router.get("/profile", protect, getUserProfile);
router.post("/reset-master-request", requestMasterPasswordReset);
router.post("/reset-master-verify", verifyAndResetMasterPassword);

module.exports = router;
