const express = require("express");
const {
  getPasswords,
  createPassword,
  getPassword,
  decryptPassword,
  updatePassword,
  deletePassword,
} = require("../controllers/passwordController.js");
const protect = require("../middleware/auth.js");

const router = express.Router();

// All password routes are protected
router.use(protect);

router.route("/").get(getPasswords).post(createPassword);

router
  .route("/:id")
  .get(getPassword)
  .put(updatePassword)
  .delete(deletePassword);

router.post("/:id/decrypt", decryptPassword);

module.exports = router;
