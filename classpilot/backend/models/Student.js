const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    batch: { type: mongoose.Schema.Types.ObjectId, ref: "Batch", required: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    parentName: { type: String, trim: true },
    parentPhone: { type: String, trim: true },
    address: { type: String, trim: true },
    schoolName: { type: String, trim: true },
    class: { type: String, trim: true },
    dateOfBirth: { type: Date },
    admissionDate: { type: Date, default: Date.now },
    joiningDate: { type: Date, default: Date.now },
    monthlyFee: { type: Number, required: true, default: 0 },
    photo: { type: String, default: "" },
    notes: { type: String, trim: true },
    status: { type: String, enum: ["Active", "Inactive", "On Hold"], default: "Active" },
  },
  { timestamps: true }
);

studentSchema.index({ fullName: "text", parentName: "text", phone: "text", parentPhone: "text" });

module.exports = mongoose.model("Student", studentSchema);
