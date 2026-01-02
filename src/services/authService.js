import api from "./api";

export const login = (data) => api.post("/api/login", data);
export const register = (data) => api.post("/api/register", data);
export const getProfile = () => api.get("/api/profile");
export const updateProfile = (data) => api.put("/api/profile", data);
export const getAllUsers = () => api.get("/api/users");

