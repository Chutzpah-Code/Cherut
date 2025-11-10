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

export const getIdToken = async () => {
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
    const token = await user.getIdToken();
    console.log('[Firebase] Successfully retrieved token');
    return token;
  } catch (error) {
    console.error('[Firebase] Error getting ID token:', error);
    return null;
  }
};
