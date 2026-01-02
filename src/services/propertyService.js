import api from "./api";

// Property CRUD endpoints
export const addProperty = (data) => api.post("/api/properties", data);
export const getAllProperties = (params) => api.get("/api/properties", { params });
export const getPropertyById = (id) => api.get(`/api/properties/${id}`);
export const updateProperty = (id, data) => api.put(`/api/properties/${id}`, data);
export const deleteProperty = (id) => api.delete(`/api/properties/${id}`);

