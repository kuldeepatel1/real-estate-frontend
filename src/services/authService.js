import api from "./api";

export const login = (data) => api.post("/api/login", data);
export const register = (data) => api.post("/api/register", data);
export const getProfile = () => api.get("/api/profile");

// Update profile with optional file upload (for profile picture)
export const updateProfile = (data) => {
  // Check if data contains a File object (for profile picture upload)
  if (data instanceof FormData) {
    return api.put("/api/profile", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }
  // Regular JSON update
  return api.put("/api/profile", data);
};

export const getAllUsers = () => api.get("/api/users");

