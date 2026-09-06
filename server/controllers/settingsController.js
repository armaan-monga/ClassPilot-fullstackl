const asyncHandler = require("express-async-handler");
const Settings = require("../models/Settings");

// @desc    Get settings for logged-in teacher (creates default if missing)
// @route   GET /api/settings
// @access  Private
const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ teacher: req.teacher._id });

  if (!settings) {
    settings = await Settings.create({
      teacher: req.teacher._id,
      instituteName: req.teacher.instituteName,
      teacherName: req.teacher.name,
    });
  }

  res.json({ success: true, data: settings });
});

// @desc    Update settings for logged-in teacher
// @route   PUT /api/settings
// @access  Private
const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne({ teacher: req.teacher._id });

  if (!settings) {
    settings = new Settings({ teacher: req.teacher._id });
  }

  const allowedFields = [
    "instituteName",
    "teacherName",
    "instituteLogo",
    "themeColor",
    "feeReminderDate",
    "currency",
    "lateFeeEnabled",
    "lateFeeAmount",
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) settings[field] = req.body[field];
  });

  const updated = await settings.save();
  res.json({ success: true, data: updated });
});

module.exports = { getSettings, updateSettings };
