import { apiClient } from '../client';

export interface LoginResponse {
  user: {
    uid: string;
    email: string;
    displayName: string;
  };
}

export interface RegisterResponse {
  user: {
    uid: string;
    email: string;
    displayName: string;
  };
  message: string;
}

/**
 * Backend authentication using Firebase-Only strategy
 * This calls the backend /auth/login endpoint with a Firebase ID token
 */
export const loginWithBackend = async (firebaseIdToken: string): Promise<LoginResponse> => {
  const response = await apiClient.post('/auth/login', {
    firebaseIdToken,
  });
  return response.data;
};

/**
 * Register a new user via backend
 */
export const registerWithBackend = async (
  email: string,
  password: string,
  displayName?: string
): Promise<RegisterResponse> => {
  const response = await apiClient.post('/auth/register', {
    email,
    password,
    displayName,
  });
  return response.data;
};

/**
 * Get current user profile from backend
 */
export const getCurrentUserProfile = async () => {
  const response = await apiClient.get('/auth/me');
  return response.data;
};