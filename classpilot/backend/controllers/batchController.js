const asyncHandler = require("express-async-handler");
const Batch = require("../models/Batch");
const Student = require("../models/Student");

// @desc    Get all batches for logged-in teacher (with current student counts)
// @route   GET /api/batches?search=&class=
// @access  Private
const getBatches = asyncHandler(async (req, res) => {
  const { search, class: className } = req.query;

  const query = { teacher: req.teacher._id };
  if (className) query.class = className;
  if (search) {
    query.$or = [
      { batchName: { $regex: search, $options: "i" } },
      { subject: { $regex: search, $options: "i" } },
      { class: { $regex: search, $options: "i" } },
    ];
  }

  const batches = await Batch.find(query).sort({ createdAt: -1 });

  // Attach live student counts
  const withCounts = await Promise.all(
    batches.map(async (batch) => {
      const count = await Student.countDocuments({ batch: batch._id });
      return { ...batch.toObject(), currentStudents: count };
    })
  );

  res.json({ success: true, data: withCounts });
});

// @desc    Get single batch with its students
// @route   GET /api/batches/:id
// @access  Private
const getBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findOne({ _id: req.params.id, teacher: req.teacher._id });
  if (!batch) {
    res.status(404);
    throw new Error("Batch not found");
  }

  const students = await Student.find({ batch: batch._id }).sort({ fullName: 1 });

  res.json({ success: true, data: { batch, students } });
});

// @desc    Create a batch
// @route   POST /api/batches
// @access  Private
const createBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.create({ ...req.body, teacher: req.teacher._id });
  res.status(201).json({ success: true, data: batch });
});

// @desc    Update a batch
// @route   PUT /api/batches/:id
// @access  Private
const updateBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findOne({ _id: req.params.id, teacher: req.teacher._id });
  if (!batch) {
    res.status(404);
    throw new Error("Batch not found");
  }

  Object.assign(batch, req.body);
  const updated = await batch.save();

  res.json({ success: true, data: updated });
});

// @desc    Delete a batch (blocked if students are still assigned)
// @route   DELETE /api/batches/:id
// @access  Private
const deleteBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findOne({ _id: req.params.id, teacher: req.teacher._id });
  if (!batch) {
    res.status(404);
    throw new Error("Batch not found");
  }

  const studentCount = await Student.countDocuments({ batch: batch._id });
  if (studentCount > 0) {
    res.status(400);
    throw new Error(
      `Cannot delete batch: ${studentCount} student(s) are still assigned. Move them first.`
    );
  }

  await batch.deleteOne();
  res.json({ success: true, message: "Batch deleted successfully" });
});

module.exports = { getBatches, getBatch, createBatch, updateBatch, deleteBatch };
