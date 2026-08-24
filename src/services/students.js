import axiosClient from "./axiosClient";

export const getStudents = (params) => axiosClient.get("/students", { params });
export const getStudent = (id) => axiosClient.get(`/students/${id}`);
export const createStudent = (payload) => axiosClient.post("/students", payload);
export const updateStudent = (id, payload) => axiosClient.put(`/students/${id}`, payload);
export const deleteStudent = (id) => axiosClient.delete(`/students/${id}`);
export const moveStudentBatch = (id, newBatchId) =>
  axiosClient.put(`/students/${id}/move-batch`, { newBatchId });
