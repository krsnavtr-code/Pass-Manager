const express = require("express");
const {
  getAllUsers,
  getStats,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  getUserDetails,
  getAllSessions,
  revokeSession,
} = require("../controllers/adminController.js");
const { protect, admin } = require("../middleware/admin.js");

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(protect);
router.use(admin);

// Dashboard stats
router.get("/stats", getStats);

// User management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserDetails);
router.put("/users/:id/status", updateUserStatus);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// Session management
router.get("/sessions", getAllSessions);
router.delete("/sessions/:id", revokeSession);

module.exports = router;
