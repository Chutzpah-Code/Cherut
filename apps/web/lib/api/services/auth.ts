import { apiClient } from '../client';
import axios from 'axios';

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
  console.log('[Auth API] Calling backend login with token length:', firebaseIdToken.length);

  // Debug: Test direct connection first
  try {
    console.log('[Auth API] Testing direct connection to backend...');
    const testResponse = await fetch('http://127.0.0.1:4000/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    console.log('[Auth API] Direct fetch test status:', testResponse.status);
  } catch (testError) {
    console.error('[Auth API] Direct fetch test failed:', testError);
  }

  try {
    const response = await apiClient.post('/auth/login', {
      firebaseIdToken,
    });
    console.log('[Auth API] Backend login successful:', response.data);
    return response.data;
  } catch (apiClientError) {
    console.error('[Auth API] apiClient failed, trying direct axios:', apiClientError);

    // Fallback: Try with a fresh axios instance
    try {
      const directResponse = await axios.post('http://127.0.0.1:4000/auth/login', {
        firebaseIdToken,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });
      console.log('[Auth API] Direct axios successful:', directResponse.data);
      return directResponse.data;
    } catch (directError) {
      console.error('[Auth API] Direct axios also failed:', directError);
      throw directError;
    }
  }
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