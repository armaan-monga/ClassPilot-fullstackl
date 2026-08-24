import axiosClient from "./axiosClient";

export const sendReminder = (feeId, channels) =>
  axiosClient.post(`/notifications/send-reminder/${feeId}`, { channels });
export const sendAllPendingReminders = (channels) =>
  axiosClient.post("/notifications/send-all-pending", { channels });
export const getNotificationHistory = (params) => axiosClient.get("/notifications", { params });
