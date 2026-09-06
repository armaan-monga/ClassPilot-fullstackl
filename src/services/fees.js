import axiosClient from "./axiosClient";

export const generateMonthlyFees = (payload) => axiosClient.post("/fees/generate", payload);
export const getFees = (params) => axiosClient.get("/fees", { params });
export const getFee = (id) => axiosClient.get(`/fees/${id}`);
export const markFeePaid = (id, paymentMode) =>
  axiosClient.put(`/fees/${id}/mark-paid`, { paymentMode });
export const recordPartialPayment = (id, payload) =>
  axiosClient.post(`/fees/${id}/partial-payment`, payload);
export const getPendingOverview = () => axiosClient.get("/fees/pending-overview");
