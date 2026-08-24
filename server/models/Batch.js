const mongoose = require("mongoose");

const batchSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    batchName: { type: String, required: true, trim: true },
    class: { type: String, required: true, trim: true },
    subject: { type: String, trim: true },
    teacherName: { type: String, trim: true },
    days: [{ type: String, enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] }],
    timing: { type: String, trim: true }, // e.g. "5:00 PM - 6:30 PM"
    maxStudents: { type: Number, default: 30 },
    monthlyFee: { type: Number, required: true, default: 0 },
    description: { type: String, trim: true },
    colorTag: { type: String, default: "#3B82F6" }, // blue default
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Virtual: current student count, populated on demand via controller
batchSchema.virtual("currentStudents", {
  ref: "Student",
  localField: "_id",
  foreignField: "batch",
  count: true,
});
batchSchema.set("toJSON", { virtuals: true });
batchSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Batch", batchSchema);
