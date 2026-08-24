const asyncHandler = require("express-async-handler");
const Fee = require("../models/Fee");
const Payment = require("../models/Payment");
const Student = require("../models/Student");
const Settings = require("../models/Settings");

// @desc    Generate monthly fee records for all active students (or one batch)
// @route   POST /api/fees/generate
// @body    { month, year, batchId? }
// @access  Private
const generateMonthlyFees = asyncHandler(async (req, res) => {
  const { month, year, batchId } = req.body;

  if (!month || !year) {
    res.status(400);
    throw new Error("month and year are required");
  }

  const settings = await Settings.findOne({ teacher: req.teacher._id });
  const reminderDay = settings?.feeReminderDate || 10;

  const query = { teacher: req.teacher._id, status: "Active" };
  if (batchId) query.batch = batchId;

  const students = await Student.find(query);

  const dueDate = new Date(year, month - 1, reminderDay);

  let created = 0;
  let skipped = 0;

  for (const student of students) {
    try {
      await Fee.create({
        teacher: req.teacher._id,
        student: student._id,
        batch: student.batch,
        month,
        year,
        amount: student.monthlyFee,
        dueDate,
      });
      created++;
    } catch (err) {
      // Duplicate (already generated for this student/month/year) — skip silently
      if (err.code === 11000) {
        skipped++;
      } else {
        throw err;
      }
    }
  }

  res.status(201).json({
    success: true,
    message: `Generated ${created} fee record(s), skipped ${skipped} already-existing record(s)`,
  });
});

// @desc    Get fees (filterable by status, month, year, batch, student)
// @route   GET /api/fees?status=&month=&year=&batch=&student=
// @access  Private
const getFees = asyncHandler(async (req, res) => {
  const { status, month, year, batch, student, page = 1, limit = 30 } = req.query;

  const query = { teacher: req.teacher._id };
  if (status) query.status = status;
  if (month) query.month = Number(month);
  if (year) query.year = Number(year);
  if (batch) query.batch = batch;
  if (student) query.student = student;

  const skip = (Number(page) - 1) * Number(limit);

  const [fees, total] = await Promise.all([
    Fee.find(query)
      .populate("student", "fullName phone parentPhone")
      .populate("batch", "batchName colorTag")
      .sort({ dueDate: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Fee.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: fees,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

// @desc    Get a single fee record
// @route   GET /api/fees/:id
// @access  Private
const getFee = asyncHandler(async (req, res) => {
  const fee = await Fee.findOne({ _id: req.params.id, teacher: req.teacher._id })
    .populate("student", "fullName phone parentName parentPhone")
    .populate("batch", "batchName");

  if (!fee) {
    res.status(404);
    throw new Error("Fee record not found");
  }

  const payments = await Payment.find({ fee: fee._id }).sort({ paymentDate: -1 });

  res.json({ success: true, data: { fee, payments } });
});

// @desc    Mark a fee as fully paid
// @route   PUT /api/fees/:id/mark-paid
// @body    { paymentMode }
// @access  Private
const markFeePaid = asyncHandler(async (req, res) => {
  const { paymentMode = "Cash" } = req.body;

  const fee = await Fee.findOne({ _id: req.params.id, teacher: req.teacher._id });
  if (!fee) {
    res.status(404);
    throw new Error("Fee record not found");
  }

  const total = fee.amount + (fee.lateFee || 0);
  const remaining = total - fee.paidAmount;

  if (remaining > 0) {
    await Payment.create({
      teacher: req.teacher._id,
      student: fee.student,
      fee: fee._id,
      amount: remaining,
      paymentMode,
    });
  }

  fee.paidAmount = total;
  fee.paidDate = new Date();
  fee.paymentMode = paymentMode;
  const updated = await fee.save();

  res.json({ success: true, data: updated });
});

// @desc    Record a partial payment against a fee
// @route   POST /api/fees/:id/partial-payment
// @body    { amount, paymentMode, notes }
// @access  Private
const recordPartialPayment = asyncHandler(async (req, res) => {
  const { amount, paymentMode = "Cash", notes } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error("A valid payment amount is required");
  }

  const fee = await Fee.findOne({ _id: req.params.id, teacher: req.teacher._id });
  if (!fee) {
    res.status(404);
    throw new Error("Fee record not found");
  }

  const total = fee.amount + (fee.lateFee || 0);
  if (fee.paidAmount + amount > total) {
    res.status(400);
    throw new Error("Payment amount exceeds the remaining due amount");
  }

  await Payment.create({
    teacher: req.teacher._id,
    student: fee.student,
    fee: fee._id,
    amount,
    paymentMode,
    notes,
  });

  fee.paidAmount += Number(amount);
  fee.paymentMode = paymentMode;
  if (fee.paidAmount >= total) fee.paidDate = new Date();

  const updated = await fee.save();
  res.json({ success: true, data: updated });
});

// @desc    Get pending + overdue fee summary (for quick views)
// @route   GET /api/fees/pending-overview
// @access  Private
const getPendingOverview = asyncHandler(async (req, res) => {
  const [pending, overdue, partial] = await Promise.all([
    Fee.find({ teacher: req.teacher._id, status: "Pending" }).populate("student", "fullName phone"),
    Fee.find({ teacher: req.teacher._id, status: "Overdue" }).populate("student", "fullName phone"),
    Fee.find({ teacher: req.teacher._id, status: "Partial" }).populate("student", "fullName phone"),
  ]);

  res.json({ success: true, data: { pending, overdue, partial } });
});

module.exports = {
  generateMonthlyFees,
  getFees,
  getFee,
  markFeePaid,
  recordPartialPayment,
  getPendingOverview,
};
