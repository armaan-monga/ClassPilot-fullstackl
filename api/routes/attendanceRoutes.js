const express = require("express");
const router = express.Router();
const {
  markAttendance,
  getAttendanceByBatchDate,
  getStudentAttendanceReport,
  getAttendanceOverview,
} = require("../controllers/attendanceController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/mark", markAttendance);
router.get("/overview", getAttendanceOverview);
router.get("/batch/:batchId", getAttendanceByBatchDate);
router.get("/student/:studentId", getStudentAttendanceReport);

module.exports = router;
