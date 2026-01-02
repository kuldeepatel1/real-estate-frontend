import api from "./api";

// Review endpoints
export const addReview = (data) => api.post("/api/reviews", data);
export const getPropertyReviews = (propertyId) => api.get(`/api/reviews/property/${propertyId}`);
export const getPropertyReviewStats = (propertyId) => api.get(`/api/reviews/property/${propertyId}`);
export const getReviews = (params) => api.get("/api/reviews", { params });
export const deleteReview = (id) => api.delete(`/api/reviews/${id}`);

