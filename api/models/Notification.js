const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    fee: { type: mongoose.Schema.Types.ObjectId, ref: "Fee" },
    channel: { type: String, enum: ["WhatsApp", "SMS", "Email"], required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["Sent", "Failed"], default: "Sent" },
    sentAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
