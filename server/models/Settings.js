const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true, unique: true },
    instituteName: { type: String, default: "My Tuition Classes" },
    teacherName: { type: String, default: "" },
    instituteLogo: { type: String, default: "" },
    themeColor: { type: String, default: "#1F6F6B" },
    feeReminderDate: { type: Number, default: 10, min: 1, max: 28 }, // day of month
    currency: { type: String, default: "INR" },
    lateFeeEnabled: { type: Boolean, default: false },
    lateFeeAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
