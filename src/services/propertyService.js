import api from "./api";

// Property CRUD endpoints
// Note: We don't set Content-Type header explicitly for multipart/form-data
// because axios automatically sets it with the correct boundary when using FormData
export const addProperty = (data) => api.post("/api/properties", data);
export const getAllProperties = (params) => api.get("/api/properties", { params });
export const getPropertyById = (id) => api.get(`/api/properties/${id}`);
export const updateProperty = (id, data) => api.put(`/api/properties/${id}`, data);
export const deleteProperty = (id) => api.delete(`/api/properties/${id}`);

// Property status endpoints
export const markPropertySold = (id) => api.put(`/api/properties/${id}/sold`);
export const markPropertyPending = (id) => api.put(`/api/properties/${id}/pending`);
export const getSoldProperties = () => api.get("/api/properties/sold");
export const getPendingProperties = () => api.get("/api/properties/pending-status");

