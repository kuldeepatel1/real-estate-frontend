import api from "./api";

// Category CRUD endpoints
export const addCategory = (data) => api.post("/api/categories", data);
export const getAllCategories = () => api.get("/api/categories");
export const updateCategory = (id, data) => api.put(`/api/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/api/categories/${id}`);

