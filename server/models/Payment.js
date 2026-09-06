const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    fee: { type: mongoose.Schema.Types.ObjectId, ref: "Fee", required: true },
    amount: { type: Number, required: true },
    paymentMode: { type: String, enum: ["Cash", "UPI", "Bank"], required: true },
    paymentDate: { type: Date, default: Date.now },
    notes: { type: String, trim: true },
    receiptNumber: { type: String, unique: true },
  },
  { timestamps: true }
);

// Auto-generate a simple receipt number before saving
paymentSchema.pre("validate", async function (next) {
  if (!this.receiptNumber) {
    const count = await mongoose.model("Payment").countDocuments();
    this.receiptNumber = `RCPT-${Date.now().toString().slice(-6)}-${count + 1}`;
  }
  next();
});

module.exports = mongoose.model("Payment", paymentSchema);
