const asyncHandler = require("express-async-handler");
const crypto = require("crypto");
const Teacher = require("../models/Teacher");
const Settings = require("../models/Settings");
const generateToken = require("../utils/generateToken");

// @desc    Register a new teacher
// @route   POST /api/auth/register
// @access  Public
const registerTeacher = asyncHandler(async (req, res) => {
  const { name, email, password, instituteName, phone } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Name, email and password are required");
  }

  const existing = await Teacher.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error("An account with this email already exists");
  }

  const teacher = await Teacher.create({
    name,
    email,
    password,
    phone,
    instituteName: instituteName || "My Tuition Classes",
  });

  // Create default settings doc for this teacher
  await Settings.create({
    teacher: teacher._id,
    instituteName: teacher.instituteName,
    teacherName: teacher.name,
  });

  res.status(201).json({
    success: true,
    data: {
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      instituteName: teacher.instituteName,
      themeColor: teacher.themeColor,
      token: generateToken(teacher._id),
    },
  });
});

// @desc    Login teacher
// @route   POST /api/auth/login
// @access  Public
const loginTeacher = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  const teacher = await Teacher.findOne({ email }).select("+password");
  if (!teacher || !(await teacher.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({
    success: true,
    data: {
      _id: teacher._id,
      name: teacher.name,
      email: teacher.email,
      instituteName: teacher.instituteName,
      themeColor: teacher.themeColor,
      token: generateToken(teacher._id),
    },
  });
});

// @desc    Get logged-in teacher profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.teacher });
});

// @desc    Update logged-in teacher profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.teacher._id);

  if (!teacher) {
    res.status(404);
    throw new Error("Teacher not found");
  }

  teacher.name = req.body.name ?? teacher.name;
  teacher.phone = req.body.phone ?? teacher.phone;
  teacher.instituteName = req.body.instituteName ?? teacher.instituteName;
  teacher.logo = req.body.logo ?? teacher.logo;
  teacher.themeColor = req.body.themeColor ?? teacher.themeColor;
  teacher.currency = req.body.currency ?? teacher.currency;

  if (req.body.password) {
    teacher.password = req.body.password; // will be hashed by pre-save hook
  }

  const updated = await teacher.save();

  res.json({
    success: true,
    data: {
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      instituteName: updated.instituteName,
      themeColor: updated.themeColor,
    },
  });
});

// @desc    Logout (client should discard token; endpoint provided for completeness)
// @route   POST /api/auth/logout
// @access  Private
const logoutTeacher = asyncHandler(async (req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
});

// @desc    Request password reset (generates a reset token; email sending simulated)
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ email: req.body.email });
  if (!teacher) {
    // Don't reveal whether the email exists
    return res.json({ success: true, message: "If that account exists, a reset link has been sent" });
  }

  const resetToken = crypto.randomBytes(20).toString("hex");
  teacher.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  teacher.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 min
  await teacher.save({ validateBeforeSave: false });

  // In production this would be emailed. For now it's simulated and returned for dev/testing.
  res.json({
    success: true,
    message: "Password reset token generated (simulated email send)",
    resetToken: process.env.NODE_ENV === "production" ? undefined : resetToken,
  });
});

// @desc    Reset password using token
// @route   PUT /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

  const teacher = await Teacher.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  }).select("+password");

  if (!teacher) {
    res.status(400);
    throw new Error("Reset token is invalid or has expired");
  }

  teacher.password = req.body.password;
  teacher.resetPasswordToken = undefined;
  teacher.resetPasswordExpire = undefined;
  await teacher.save();

  res.json({ success: true, message: "Password reset successful", token: generateToken(teacher._id) });
});

module.exports = {
  registerTeacher,
  loginTeacher,
  getProfile,
  updateProfile,
  logoutTeacher,
  forgotPassword,
  resetPassword,
};
