const express = require("express");
const router = express.Router();
const {
  generateMonthlyFees,
  getFees,
  getFee,
  markFeePaid,
  recordPartialPayment,
  getPendingOverview,
} = require("../controllers/feeController");
const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/generate", generateMonthlyFees);
router.get("/pending-overview", getPendingOverview);
router.route("/").get(getFees);
router.route("/:id").get(getFee);
router.put("/:id/mark-paid", markFeePaid);
router.post("/:id/partial-payment", recordPartialPayment);

module.exports = router;
