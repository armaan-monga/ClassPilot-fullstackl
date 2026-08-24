import axiosClient from "./axiosClient";

export const registerTeacher = (payload) => axiosClient.post("/auth/register", payload);
export const loginTeacher = (payload) => axiosClient.post("/auth/login", payload);
export const getProfile = () => axiosClient.get("/auth/profile");
export const updateProfile = (payload) => axiosClient.put("/auth/profile", payload);
export const logoutTeacher = () => axiosClient.post("/auth/logout");
export const forgotPassword = (email) => axiosClient.post("/auth/forgot-password", { email });
export const resetPassword = (token, password) =>
  axiosClient.put(`/auth/reset-password/${token}`, { password });
