import axiosClient from "./axiosClient";

export const markAttendance = (payload) => axiosClient.post("/attendance/mark", payload);
export const getAttendanceByBatchDate = (batchId, date) =>
  axiosClient.get(`/attendance/batch/${batchId}`, { params: { date } });
export const getStudentAttendanceReport = (studentId, month, year) =>
  axiosClient.get(`/attendance/student/${studentId}`, { params: { month, year } });
export const getAttendanceOverview = () => axiosClient.get("/attendance/overview");
