import api from "./api";

// Favorite endpoints
export const addFavorite = (data) => api.post("/api/favorites", data);
export const getFavorites = () => api.get("/api/favorites");
export const removeFavorite = (id) => api.delete(`/api/favorites/${id}`);

