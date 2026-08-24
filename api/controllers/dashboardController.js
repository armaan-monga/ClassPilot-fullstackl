const asyncHandler = require("express-async-handler");
const Student = require("../models/Student");
const Batch = require("../models/Batch");
const Fee = require("../models/Fee");
const Attendance = require("../models/Attendance");
const Payment = require("../models/Payment");

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// @desc    Get all dashboard stats/widgets in a single call
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = asyncHandler(async (req, res) => {
  const teacherId = req.teacher._id;
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const todayName = dayNames[now.getDay()];

  const [
    totalStudents,
    activeBatches,
    todaysClasses,
    pendingFeeCount,
    monthlyFees,
    allTimePayments,
    students,
    attendanceRecords,
    studentsPerBatch,
  ] = await Promise.all([
    Student.countDocuments({ teacher: teacherId, status: "Active" }),
    Batch.countDocuments({ teacher: teacherId, isActive: true }),
    Batch.find({ teacher: teacherId, isActive: true, days: todayName }).select(
      "batchName timing colorTag class"
    ),
    Fee.countDocuments({ teacher: teacherId, status: { $in: ["Pending", "Overdue", "Partial"] } }),
    Fee.find({ teacher: teacherId, month, year }),
    Payment.find({ teacher: teacherId }),
    Student.find({ teacher: teacherId, status: "Active" }).select("fullName dateOfBirth photo"),
    Attendance.find({ teacher: teacherId }),
    Batch.aggregate([
      { $match: { teacher: teacherId } },
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "batch",
          as: "students",
        },
      },
      { $project: { batchName: 1, colorTag: 1, count: { $size: "$students" } } },
    ]),
  ]);

  // Collection this month = sum of payments made within the current calendar month
  const collectionThisMonth = allTimePayments
    .filter((p) => {
      const d = new Date(p.paymentDate);
      return d.getMonth() + 1 === month && d.getFullYear() === year;
    })
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRevenue = allTimePayments.reduce((sum, p) => sum + p.amount, 0);

  // Upcoming birthdays (next 30 days, based on month/day only)
  const upcomingBirthdays = students
    .filter((s) => s.dateOfBirth)
    .map((s) => {
      const dob = new Date(s.dateOfBirth);
      const nextBirthday = new Date(now.getFullYear(), dob.getMonth(), dob.getDate());
      if (nextBirthday < now) nextBirthday.setFullYear(now.getFullYear() + 1);
      const daysAway = Math.ceil((nextBirthday - now) / (1000 * 60 * 60 * 24));
      return { name: s.fullName, photo: s.photo, date: nextBirthday, daysAway };
    })
    .filter((b) => b.daysAway <= 30)
    .sort((a, b) => a.daysAway - b.daysAway);

  // Attendance percentage (all-time)
  const totalAttendance = attendanceRecords.length;
  const presentCount = attendanceRecords.filter((a) => a.status === "Present").length;
  const attendancePercentage = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

  // Monthly collection trend — last 6 months
  const monthlyCollectionTrend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    const total = allTimePayments
      .filter((p) => {
        const pd = new Date(p.paymentDate);
        return pd.getMonth() + 1 === m && pd.getFullYear() === y;
      })
      .reduce((sum, p) => sum + p.amount, 0);
    monthlyCollectionTrend.push({
      label: d.toLocaleString("en-IN", { month: "short" }),
      amount: total,
    });
  }

  // Recent activity — latest payments + latest students added
  const recentPayments = await Payment.find({ teacher: teacherId })
    .populate("student", "fullName")
    .sort({ createdAt: -1 })
    .limit(5);

  const recentStudents = await Student.find({ teacher: teacherId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("fullName createdAt");

  const recentActivity = [
    ...recentPayments.map((p) => ({
      type: "payment",
      text: `${p.student?.fullName || "A student"} paid ${p.amount}`,
      date: p.createdAt,
    })),
    ...recentStudents.map((s) => ({
      type: "student_added",
      text: `${s.fullName} was added`,
      date: s.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  res.json({
    success: true,
    data: {
      totalStudents,
      activeBatches,
      todaysClasses,
      pendingFeeCount,
      collectionThisMonth,
      totalRevenue,
      upcomingBirthdays,
      attendancePercentage,
      recentActivity,
      charts: {
        monthlyCollectionTrend,
        studentsPerBatch: studentsPerBatch.map((b) => ({
          name: b.batchName,
          count: b.count,
          color: b.colorTag,
        })),
        feesPendingVsPaid: {
          pending: pendingFeeCount,
          paid: monthlyFees.filter((f) => f.status === "Paid").length,
        },
      },
    },
  });
});

module.exports = { getDashboardStats };
