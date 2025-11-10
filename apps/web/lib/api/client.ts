import axios from 'axios';
import { getIdToken } from '@/lib/firebase/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await getIdToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[DEBUG] Token added to request:', config.url, 'Token length:', token.length);
      } else {
        console.warn('[DEBUG] No token available for request:', config.url);
        // If no token is available, don't proceed with authenticated requests
        if (config.url && !config.url.includes('/auth/') && !config.url.includes('/health')) {
          console.warn('[DEBUG] Skipping authenticated request without token');
          throw new Error('Authentication required - no token available');
        }
      }
    } catch (error) {
      console.error('[DEBUG] Error getting token:', error);
      // Don't proceed with authenticated requests if token retrieval fails
      if (config.url && !config.url.includes('/auth/') && !config.url.includes('/health')) {
        throw error;
      }
    }
    return config;
  },
  (error) => {
    console.error('[API Client] Request error:', error);
    return Promise.reject(error);
  }
);

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      console.error('[API Client] 401 Unauthorized, attempting token refresh:', error.config?.url);
      originalRequest._retry = true;

      try {
        // Try to get a fresh token
        const newToken = await getIdToken(true); // Force refresh
        if (newToken) {
          console.log('[API Client] Token refreshed, retrying request');
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('[API Client] Token refresh failed:', refreshError);
        // Don't auto-redirect - let the component handle it
        // The dashboard layout will redirect if user is null
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
