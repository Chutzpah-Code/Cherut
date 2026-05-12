import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
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
  if (!auth) return null;

  const user = auth.currentUser;
  if (!user) return null;

  try {
    return await user.getIdToken(forceRefresh);
  } catch {
    if (!forceRefresh) {
      return getIdToken(true);
    }
    return null;
  }
};

export const resetPassword = async (email: string) => {
  if (!auth) {
    throw new Error('Firebase is not configured');
  }

  try {
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      handleCodeInApp: true,
    };

    await sendPasswordResetEmail(auth, email, actionCodeSettings);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const confirmPasswordReset = async (oobCode: string, newPassword: string) => {
  if (!auth) {
    throw new Error('Firebase is not configured');
  }

  try {
    await firebaseConfirmPasswordReset(auth, oobCode, newPassword);
  } catch (error: any) {
    if (error.code === 'auth/invalid-action-code') {
      throw new Error('Invalid or expired reset code. Please request a new password reset.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please choose a stronger password.');
    } else {
      throw new Error(error.message || 'Failed to reset password');
    }
  }
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  if (!auth) {
    throw new Error('Firebase is not configured');
  }

  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('No user is currently logged in');
  }

  try {
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  } catch (error: any) {
    if (error.code === 'auth/wrong-password') {
      throw new Error('Current password is incorrect');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('New password is too weak. Please choose a stronger password.');
    } else if (error.code === 'auth/requires-recent-login') {
      throw new Error('Please log out and log in again before changing your password');
    } else {
      throw new Error(error.message || 'Failed to change password');
    }
  }
};
