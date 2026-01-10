import api from "./api";

// Appointment endpoints
export const addAppointment = (data) => api.post("/api/appointments", data);
export const getAppointments = () => api.get("/api/appointments");
export const updateAppointment = (id, data) => api.put(`/api/appointments/${id}`, data);
export const deleteAppointment = (id) => api.delete(`/api/appointments/${id}`);
export const cancelAppointment = (id) => api.put(`/api/appointments/${id}/cancel`);

