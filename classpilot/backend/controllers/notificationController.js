const asyncHandler = require("express-async-handler");
const Fee = require("../models/Fee");
const Notification = require("../models/Notification");
const Settings = require("../models/Settings");
const { buildFeeReminderMessage } = require("../utils/messageTemplates");

// @desc    Send a reminder for one fee record, across one or more channels
// @route   POST /api/notifications/send-reminder/:feeId
// @body    { channels: ["WhatsApp","SMS","Email"] }
// @access  Private
const sendReminder = asyncHandler(async (req, res) => {
  const { channels = ["WhatsApp"] } = req.body;

  const fee = await Fee.findOne({ _id: req.params.feeId, teacher: req.teacher._id }).populate(
    "student",
    "fullName phone parentPhone"
  );

  if (!fee) {
    res.status(404);
    throw new Error("Fee record not found");
  }

  const settings = await Settings.findOne({ teacher: req.teacher._id });

  const notifications = await Promise.all(
    channels.map(async (channel) => {
      const message = buildFeeReminderMessage({
        channel,
        studentName: fee.student.fullName,
        amount: fee.amount + (fee.lateFee || 0) - fee.paidAmount,
        month: fee.month,
        year: fee.year,
        dueDate: fee.dueDate,
        instituteName: settings?.instituteName,
        currency: settings?.currency,
      });

      // NOTE: actual sending is simulated — this is where a WhatsApp Business API,
      // Twilio SMS, or Nodemailer integration would be wired in for production use.
      return Notification.create({
        teacher: req.teacher._id,
        student: fee.student._id,
        fee: fee._id,
        channel,
        message,
        status: "Sent",
      });
    })
  );

  res.status(201).json({ success: true, data: notifications });
});

// @desc    Send reminders to ALL students with pending/overdue fees
// @route   POST /api/notifications/send-all-pending
// @body    { channels: ["WhatsApp"] }
// @access  Private
const sendAllPendingReminders = asyncHandler(async (req, res) => {
  const { channels = ["WhatsApp"] } = req.body;

  const pendingFees = await Fee.find({
    teacher: req.teacher._id,
    status: { $in: ["Pending", "Overdue", "Partial"] },
  }).populate("student", "fullName phone parentPhone");

  const settings = await Settings.findOne({ teacher: req.teacher._id });

  const allNotifications = [];
  for (const fee of pendingFees) {
    for (const channel of channels) {
      const message = buildFeeReminderMessage({
        channel,
        studentName: fee.student.fullName,
        amount: fee.amount + (fee.lateFee || 0) - fee.paidAmount,
        month: fee.month,
        year: fee.year,
        dueDate: fee.dueDate,
        instituteName: settings?.instituteName,
        currency: settings?.currency,
      });

      allNotifications.push({
        teacher: req.teacher._id,
        student: fee.student._id,
        fee: fee._id,
        channel,
        message,
        status: "Sent",
      });
    }
  }

  const created = await Notification.insertMany(allNotifications);

  res.status(201).json({
    success: true,
    message: `Sent ${created.length} reminder(s) to ${pendingFees.length} student(s)`,
    data: created,
  });
});

// @desc    Get notification history
// @route   GET /api/notifications?student=&channel=
// @access  Private
const getNotificationHistory = asyncHandler(async (req, res) => {
  const { student, channel, page = 1, limit = 30 } = req.query;

  const query = { teacher: req.teacher._id };
  if (student) query.student = student;
  if (channel) query.channel = channel;

  const skip = (Number(page) - 1) * Number(limit);

  const [notifications, total] = await Promise.all([
    Notification.find(query)
      .populate("student", "fullName")
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Notification.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: notifications,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

module.exports = { sendReminder, sendAllPendingReminders, getNotificationHistory };
