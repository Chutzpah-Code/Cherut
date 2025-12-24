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
    console.log('[Firebase] Signing out user...');
    await signOut(auth);
    console.log('[Firebase] User signed out successfully');
  } catch (error: any) {
    console.error('[Firebase] Sign out error:', error);
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

export const resetPassword = async (email: string) => {
  if (!auth) {
    throw new Error('Firebase is not configured');
  }

  try {
    console.log('[Firebase] Sending password reset email to:', email);

    // Configure action code settings with custom URL
    const actionCodeSettings = {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
      handleCodeInApp: true,
    };

    await sendPasswordResetEmail(auth, email, actionCodeSettings);
    console.log('[Firebase] Password reset email request completed');

    // Firebase doesn't indicate if email exists - this is by design for security
    console.log('[Firebase] Note: Firebase does not reveal whether email exists in system');
  } catch (error: any) {
    console.error('[Firebase] Password reset error:', error);
    console.error('[Firebase] Error code:', error.code);
    console.error('[Firebase] Error message:', error.message);
    throw new Error(error.message);
  }
};

export const confirmPasswordReset = async (oobCode: string, newPassword: string) => {
  if (!auth) {
    throw new Error('Firebase is not configured');
  }

  try {
    console.log('[Firebase] Confirming password reset with code');
    await firebaseConfirmPasswordReset(auth, oobCode, newPassword);
    console.log('[Firebase] Password reset confirmed successfully');
  } catch (error: any) {
    console.error('[Firebase] Password reset confirmation error:', error);
    console.error('[Firebase] Error code:', error.code);
    console.error('[Firebase] Error message:', error.message);

    // Provide user-friendly error messages
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
    console.log('[Firebase] Changing password for user:', user.email);

    // Re-authenticate user with current password
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    console.log('[Firebase] User re-authenticated successfully');

    // Update password
    await updatePassword(user, newPassword);
    console.log('[Firebase] Password updated successfully');
  } catch (error: any) {
    console.error('[Firebase] Password change error:', error);
    console.error('[Firebase] Error code:', error.code);
    console.error('[Firebase] Error message:', error.message);

    // Provide user-friendly error messages
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
