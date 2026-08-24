const express = require("express");
const router = express.Router();
const {
  sendReminder,
  sendAllPendingReminders,
  getNotificationHistory,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.get("/", getNotificationHistory);
router.post("/send-reminder/:feeId", sendReminder);
router.post("/send-all-pending", sendAllPendingReminders);

module.exports = router;
