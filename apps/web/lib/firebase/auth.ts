import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './config';

export const registerUser = async (email: string, password: string) => {
  if (!auth) {
    throw new Error('Firebase is not configured. Please add Firebase credentials to .env.local');
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const loginUser = async (email: string, password: string) => {
  if (!auth) {
    throw new Error('Firebase is not configured. Please add Firebase credentials to .env.local');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const logoutUser = async () => {
  if (!auth) {
    throw new Error('Firebase is not configured');
  }

  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
};

export const getCurrentUser = () => {
  return auth?.currentUser || null;
};

export const getIdToken = async (forceRefresh = false): Promise<string | null> => {
  if (!auth) {
    console.warn('[Firebase] Auth not configured - returning null token');
    return null;
  }

  const user = auth.currentUser;
  if (!user) {
    console.warn('[Firebase] No current user - returning null token');
    return null;
  }

  try {
    // Force refresh if token is close to expiration or if forceRefresh is true
    const token = await user.getIdToken(forceRefresh);
    console.log('[Firebase] Successfully retrieved token', forceRefresh ? '(forced refresh)' : '');
    return token;
  } catch (error) {
    console.error('[Firebase] Error getting ID token:', error);

    // Try to refresh token on error
    if (!forceRefresh) {
      console.log('[Firebase] Attempting token refresh after error...');
      return getIdToken(true);
    }

    return null;
  }
};
