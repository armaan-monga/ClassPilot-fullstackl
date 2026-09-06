import axiosClient from "./axiosClient";

export const sendReminder = (feeId) => axiosClient.post(`/notifications/send-reminder/${feeId}`);
export const sendAllPendingReminders = () => axiosClient.post("/notifications/send-all-pending");
export const getNotificationHistory = (params) => axiosClient.get("/notifications", { params });
