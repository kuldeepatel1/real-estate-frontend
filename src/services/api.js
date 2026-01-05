import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000", // backend base URL
});

// Request interceptor - attach token to every request
api.interceptors.request.use(
  (config) => {
    // Read token from localStorage. Using the Redux store here caused a circular import.
    const token = localStorage.getItem("token");
    if (token) {
      // Backend expects the raw token string in the Authorization header
      // Use lowercase 'authorization' to ensure Flask can read it
      config.headers.authorization = token;
    }
    
    // For multipart/form-data requests, let axios set the Content-Type with boundary
    // Don't override Content-Type if it's multipart/form-data (from FormData)
    if (config.method === 'post' || config.method === 'put' || config.method === 'patch') {
      const isFormData = config.data instanceof FormData;
      if (isFormData) {
        // Delete Content-Type header so axios can set it automatically with boundary
        delete config.headers['Content-Type'];
      }
    }
    
    // Debug in dev only
    if (process.env.NODE_ENV !== "production") {
      try {
        // eslint-disable-next-line no-console
        console.debug("API request", config.method?.toUpperCase(), config.url, "Auth:", Boolean(config.headers?.authorization), "Content-Type:", config.headers?.['Content-Type'] || '(auto)');
      } catch (e) {}
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const config = error.config || {};
      const hadAuthHeader = Boolean(config.headers?.authorization || config.headers?.Authorization || config.headers?.authorization);

      // If the request did NOT include Authorization but a token is now present,
      // retry once with the token (helps when requests fire before login finishes).
      const nowToken = localStorage.getItem("token");
      if (!hadAuthHeader && nowToken && !config._retry) {
        config._retry = true;
        config.headers = config.headers || {};
        // Retry using the same raw token format used in requests
        config.headers.authorization = nowToken;
        return api.request(config);
      }

      // If the request included Authorization, treat as auth expiry.
      if (hadAuthHeader) {
        try {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          localStorage.setItem("auth:expired", String(Date.now()));
        } catch (e) {}
      }
    }
    return Promise.reject(error);
  }
);

export default api;
