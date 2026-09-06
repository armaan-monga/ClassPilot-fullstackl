const asyncHandler = require("express-async-handler");
const Student = require("../models/Student");
const Batch = require("../models/Batch");
const Fee = require("../models/Fee");
const Attendance = require("../models/Attendance");

// @desc    Get all students for logged-in teacher (search, filter, pagination)
// @route   GET /api/students?search=&batch=&status=&page=&limit=
// @access  Private
const getStudents = asyncHandler(async (req, res) => {
  const { search, batch, status, page = 1, limit = 20 } = req.query;

  const query = { teacher: req.teacher._id };
  if (batch) query.batch = batch;
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { parentName: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
      { parentPhone: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [students, total] = await Promise.all([
    Student.find(query)
      .populate("batch", "batchName colorTag class")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Student.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: students,
    pagination: { total, page: Number(page), pages: Math.ceil(total / limit) },
  });
});

// @desc    Get single student profile (with fee + attendance summary)
// @route   GET /api/students/:id
// @access  Private
const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ _id: req.params.id, teacher: req.teacher._id }).populate(
    "batch",
    "batchName colorTag class timing"
  );

  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  const [fees, attendanceRecords] = await Promise.all([
    Fee.find({ student: student._id }).sort({ year: -1, month: -1 }),
    Attendance.find({ student: student._id }),
  ]);

  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter((a) => a.status === "Present").length;
  const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  res.json({
    success: true,
    data: { student, fees, attendancePercentage },
  });
});

// @desc    Create a student
// @route   POST /api/students
// @access  Private
const createStudent = asyncHandler(async (req, res) => {
  const { batch } = req.body;

  const batchDoc = await Batch.findOne({ _id: batch, teacher: req.teacher._id });
  if (!batchDoc) {
    res.status(404);
    throw new Error("Selected batch not found");
  }

  const currentCount = await Student.countDocuments({ batch });
  if (currentCount >= batchDoc.maxStudents) {
    res.status(400);
    throw new Error("This batch has reached its maximum student capacity");
  }

  const student = await Student.create({
    ...req.body,
    teacher: req.teacher._id,
    monthlyFee: req.body.monthlyFee ?? batchDoc.monthlyFee,
  });

  res.status(201).json({ success: true, data: student });
});

// @desc    Update a student
// @route   PUT /api/students/:id
// @access  Private
const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ _id: req.params.id, teacher: req.teacher._id });
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  Object.assign(student, req.body);
  const updated = await student.save();

  res.json({ success: true, data: updated });
});

// @desc    Delete a student
// @route   DELETE /api/students/:id
// @access  Private
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findOne({ _id: req.params.id, teacher: req.teacher._id });
  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }

  await student.deleteOne();
  // Clean up related records
  await Promise.all([
    Fee.deleteMany({ student: student._id }),
    Attendance.deleteMany({ student: student._id }),
  ]);

  res.json({ success: true, message: "Student deleted successfully" });
});

// @desc    Move a student to another batch
// @route   PUT /api/students/:id/move-batch
// @access  Private
const moveStudentBatch = asyncHandler(async (req, res) => {
  const { newBatchId } = req.body;

  const [student, newBatch] = await Promise.all([
    Student.findOne({ _id: req.params.id, teacher: req.teacher._id }),
    Batch.findOne({ _id: newBatchId, teacher: req.teacher._id }),
  ]);

  if (!student) {
    res.status(404);
    throw new Error("Student not found");
  }
  if (!newBatch) {
    res.status(404);
    throw new Error("Target batch not found");
  }

  const currentCount = await Student.countDocuments({ batch: newBatchId });
  if (currentCount >= newBatch.maxStudents) {
    res.status(400);
    throw new Error("Target batch has reached its maximum student capacity");
  }

  student.batch = newBatchId;
  await student.save();

  res.json({ success: true, data: student, message: `Moved to ${newBatch.batchName}` });
});

module.exports = {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  moveStudentBatch,
};
