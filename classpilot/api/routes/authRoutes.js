const express = require("express");
const router = express.Router();
const {
  registerTeacher,
  loginTeacher,
  getProfile,
  updateProfile,
  logoutTeacher,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerTeacher);
router.post("/login", loginTeacher);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.post("/logout", protect, logoutTeacher);

module.exports = router;
