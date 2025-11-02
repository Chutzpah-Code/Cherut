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
    const token = await getIdToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[API Client] Token attached to request:', config.url);
    } else {
      console.warn('[API Client] No token available for request:', config.url);
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
  (error) => {
    if (error.response?.status === 401) {
      console.error('[API Client] 401 Unauthorized:', error.config?.url);
      // Don't auto-redirect - let the component handle it
      // The dashboard layout will redirect if user is null
    }
    return Promise.reject(error);
  }
);

export default apiClient;
