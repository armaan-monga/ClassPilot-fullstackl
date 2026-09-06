const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    month: { type: Number, required: true }, // 1-12
    year: { type: Number, required: true },
    amount: { type: Number, required: true },
    lateFee: { type: Number, default: 0 },
    paidAmount: { type: Number, default: 0 },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date },
    paymentMode: { type: String, enum: ["Cash", "UPI", "Bank", ""], default: "" },
    status: {
      type: String,
      enum: ["Paid", "Pending", "Partial", "Overdue"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// One fee record per student per month/year
feeSchema.index({ student: 1, month: 1, year: 1 }, { unique: true });

// Keep status in sync whenever amount/paidAmount/dueDate change
feeSchema.pre("save", function (next) {
  const total = this.amount + (this.lateFee || 0);
  if (this.paidAmount >= total && total > 0) {
    this.status = "Paid";
  } else if (this.paidAmount > 0 && this.paidAmount < total) {
    this.status = "Partial";
  } else if (this.paidAmount === 0) {
    this.status = new Date() > this.dueDate ? "Overdue" : "Pending";
  }
  next();
});

module.exports = mongoose.model("Fee", feeSchema);
