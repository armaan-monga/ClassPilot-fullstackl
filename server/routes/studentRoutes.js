const express = require("express");
const router = express.Router();
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  moveStudentBatch,
} = require("../controllers/studentController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.route("/").get(getStudents).post(createStudent);
router.route("/:id").get(getStudent).put(updateStudent).delete(deleteStudent);
router.put("/:id/move-batch", moveStudentBatch);

module.exports = router;
