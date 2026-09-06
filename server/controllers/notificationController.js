const asyncHandler = require("express-async-handler");
const Fee = require("../models/Fee");
const Notification = require("../models/Notification");
const Settings = require("../models/Settings");
const { buildFeeReminderEmail } = require("../utils/messageTemplates");
const { sendMail } = require("../utils/mailer");

/**
 * Picks the best email address to remind: the student's own if present,
 * otherwise the parent's.
 */
const resolveRecipient = (student) => student.email || student.parentEmail || null;

const sendOneReminder = async ({ teacher, fee, settings }) => {
  const to = resolveRecipient(fee.student);
  const { subject, text, html } = buildFeeReminderEmail({
    studentName: fee.student.fullName,
    amount: fee.amount + (fee.lateFee || 0) - fee.paidAmount,
    month: fee.month,
    year: fee.year,
    dueDate: fee.dueDate,
    instituteName: settings?.instituteName,
    currency: settings?.currency,
  });

  if (!to) {
    return Notification.create({
      teacher,
      student: fee.student._id,
      fee: fee._id,
      channel: "Email",
      message: text,
      status: "Failed",
      failureReason: "No email address on file for this student or their parent",
    });
  }

  try {
    await sendMail({ to, subject, text, html });
    return Notification.create({
      teacher,
      student: fee.student._id,
      fee: fee._id,
      channel: "Email",
      message: text,
      status: "Sent",
    });
  } catch (err) {
    return Notification.create({
      teacher,
      student: fee.student._id,
      fee: fee._id,
      channel: "Email",
      message: text,
      status: "Failed",
      failureReason: err.message,
    });
  }
};

// @desc    Send an email reminder for one fee record
// @route   POST /api/notifications/send-reminder/:feeId
// @access  Private
const sendReminder = asyncHandler(async (req, res) => {
  const fee = await Fee.findOne({ _id: req.params.feeId, teacher: req.teacher._id }).populate(
    "student",
    "fullName email parentEmail"
  );

  if (!fee) {
    res.status(404);
    throw new Error("Fee record not found");
  }

  const settings = await Settings.findOne({ teacher: req.teacher._id });
  const notification = await sendOneReminder({ teacher: req.teacher._id, fee, settings });

  if (notification.status === "Failed") {
    res.status(422);
    throw new Error(notification.failureReason || "Couldn't send the reminder email");
  }

  res.status(201).json({ success: true, data: notification });
});

// @desc    Email reminders to ALL students with pending/overdue fees
// @route   POST /api/notifications/send-all-pending
// @access  Private
const sendAllPendingReminders = asyncHandler(async (req, res) => {
  const pendingFees = await Fee.find({
    teacher: req.teacher._id,
    status: { $in: ["Pending", "Overdue", "Partial"] },
  }).populate("student", "fullName email parentEmail");

  const settings = await Settings.findOne({ teacher: req.teacher._id });

  const results = await Promise.all(
    pendingFees.map((fee) => sendOneReminder({ teacher: req.teacher._id, fee, settings }))
  );

  const sent = results.filter((n) => n.status === "Sent").length;
  const failed = results.length - sent;

  res.status(201).json({
    success: true,
    message: `Emailed ${sent} reminder(s)${failed ? `, ${failed} couldn't be sent (missing email address)` : ""}`,
    data: results,
  });
});

// @desc    Get notification history
// @route   GET /api/notifications?student=&status=
// @access  Private
const getNotificationHistory = asyncHandler(async (req, res) => {
  const { student, status, page = 1, limit = 30 } = req.query;

  const query = { teacher: req.teacher._id };
  if (student) query.student = student;
  if (status) query.status = status;

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
