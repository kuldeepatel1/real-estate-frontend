import api from "./api";

// Location CRUD endpoints
export const addLocation = (data) => api.post("/api/locations", data);
export const getAllLocations = () => api.get("/api/locations");
export const updateLocation = (id, data) => api.put(`/api/locations/${id}`, data);
export const deleteLocation = (id) => api.delete(`/api/locations/${id}`);

