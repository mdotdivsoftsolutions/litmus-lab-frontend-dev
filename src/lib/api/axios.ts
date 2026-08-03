import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Important for sending/receiving cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle token refresh on 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet, AND it's not a login/refresh request
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login') && !originalRequest.url?.includes('/auth/refresh-token')) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        await axios.post(`${BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });
        
        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token failed, let the application logic handle the unauthenticated state
        // (e.g., ProtectedRoute will redirect, useQuery will return null for guest users)
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
