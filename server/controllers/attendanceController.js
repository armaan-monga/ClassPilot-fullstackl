const asyncHandler = require("express-async-handler");
const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

// @desc    Mark/update attendance for multiple students in a batch on a given date
// @route   POST /api/attendance/mark
// @body    { batchId, date, records: [{ studentId, status }] }
// @access  Private
const markAttendance = asyncHandler(async (req, res) => {
  const { batchId, date, records } = req.body;

  if (!batchId || !date || !Array.isArray(records) || records.length === 0) {
    res.status(400);
    throw new Error("batchId, date, and a non-empty records array are required");
  }

  const day = new Date(date);
  day.setHours(0, 0, 0, 0);

  const results = await Promise.all(
    records.map(({ studentId, status }) =>
      Attendance.findOneAndUpdate(
        { student: studentId, date: day },
        {
          teacher: req.teacher._id,
          student: studentId,
          batch: batchId,
          date: day,
          status,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  res.status(200).json({ success: true, data: results });
});

// @desc    Get attendance for a specific batch and date
// @route   GET /api/attendance/batch/:batchId?date=YYYY-MM-DD
// @access  Private
const getAttendanceByBatchDate = asyncHandler(async (req, res) => {
  const { batchId } = req.params;
  const { date } = req.query;

  const day = new Date(date || Date.now());
  day.setHours(0, 0, 0, 0);

  const [students, attendance] = await Promise.all([
    Student.find({ batch: batchId, teacher: req.teacher._id }).select("fullName photo"),
    Attendance.find({ batch: batchId, date: day }),
  ]);

  const attendanceMap = new Map(attendance.map((a) => [a.student.toString(), a.status]));

  const merged = students.map((s) => ({
    student: s._id,
    fullName: s.fullName,
    photo: s.photo,
    status: attendanceMap.get(s._id.toString()) || "Not Marked",
  }));

  res.json({ success: true, data: merged, date: day });
});

// @desc    Get a student's monthly attendance report + calendar view
// @route   GET /api/attendance/student/:studentId?month=&year=
// @access  Private
const getStudentAttendanceReport = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const month = Number(req.query.month) || new Date().getMonth() + 1; // 1-12
  const year = Number(req.query.year) || new Date().getFullYear();

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const records = await Attendance.find({
    student: studentId,
    date: { $gte: startDate, $lte: endDate },
  }).sort({ date: 1 });

  const totalMarked = records.length;
  const present = records.filter((r) => r.status === "Present").length;
  const absent = records.filter((r) => r.status === "Absent").length;
  const leave = records.filter((r) => r.status === "Leave").length;
  const percentage = totalMarked > 0 ? Math.round((present / totalMarked) * 100) : 0;

  res.json({
    success: true,
    data: {
      calendar: records.map((r) => ({ date: r.date, status: r.status })),
      summary: { totalMarked, present, absent, leave, percentage },
    },
  });
});

// @desc    Get overall attendance percentage across all batches (for dashboard)
// @route   GET /api/attendance/overview
// @access  Private
const getAttendanceOverview = asyncHandler(async (req, res) => {
  const records = await Attendance.find({ teacher: req.teacher._id });
  const total = records.length;
  const present = records.filter((r) => r.status === "Present").length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  res.json({ success: true, data: { total, present, percentage } });
});

module.exports = {
  markAttendance,
  getAttendanceByBatchDate,
  getStudentAttendanceReport,
  getAttendanceOverview,
};
