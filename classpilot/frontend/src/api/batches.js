import axiosClient from "./axiosClient";

export const getBatches = (params) => axiosClient.get("/batches", { params });
export const getBatch = (id) => axiosClient.get(`/batches/${id}`);
export const createBatch = (payload) => axiosClient.post("/batches", payload);
export const updateBatch = (id, payload) => axiosClient.put(`/batches/${id}`, payload);
export const deleteBatch = (id) => axiosClient.delete(`/batches/${id}`);
