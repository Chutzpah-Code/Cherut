/**
 * Utility function to convert Firebase authentication errors into user-friendly messages
 * This helps maintain security while providing helpful feedback to users
 */
export function getAuthErrorMessage(error: any): string {
  // Check for rate limit errors first (these are custom errors from our rate limiter)
  if (typeof error === 'string' && error.includes('attempt')) {
    return error; // Return rate limit messages as-is since they're already user-friendly
  }

  if (typeof error === 'object' && error.isRateLimit) {
    return error.message || 'Too many attempts. Please wait before trying again.';
  }
  // Handle cases where error might be a string or an object
  const errorCode = typeof error === 'object' ? error.code : error;
  const errorMessage = typeof error === 'object' ? error.message : error;

  // Check for Firebase error codes first
  if (typeof errorCode === 'string') {
    switch (errorCode) {
      // Authentication errors
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-email':
      case 'auth/invalid-credential':
        return 'Invalid email or password. Please check your credentials and try again.';

      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please wait a few minutes before trying again.';

      case 'auth/user-disabled':
        return 'This account has been temporarily disabled. Please contact support for assistance.';

      // Registration errors
      case 'auth/email-already-in-use':
        return 'An account with this email address already exists. Please try signing in instead.';

      case 'auth/weak-password':
        return 'Password must be at least 6 characters long. Please choose a stronger password.';

      // Password reset errors
      case 'auth/invalid-action-code':
      case 'auth/expired-action-code':
        return 'This password reset link has expired or is invalid. Please request a new one.';

      // Network and configuration errors
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.';

      case 'auth/app-deleted':
      case 'auth/app-not-authorized':
        return 'Service temporarily unavailable. Please try again later.';

      // Re-authentication errors
      case 'auth/requires-recent-login':
        return 'For security, please sign out and sign back in before making this change.';

      // Default for other auth errors
      default:
        if (errorCode.startsWith('auth/')) {
          return 'Authentication failed. Please try again or contact support if the problem persists.';
        }
    }
  }

  // Check for common error patterns in the message
  if (typeof errorMessage === 'string') {
    const message = errorMessage.toLowerCase();

    if (message.includes('firebase') || message.includes('auth/')) {
      return 'Authentication error. Please try again or contact support if the problem persists.';
    }

    if (message.includes('network') || message.includes('connection')) {
      return 'Network error. Please check your internet connection and try again.';
    }

    if (message.includes('password') && message.includes('weak')) {
      return 'Password must be at least 6 characters long. Please choose a stronger password.';
    }

    if (message.includes('email') && (message.includes('invalid') || message.includes('format'))) {
      return 'Please enter a valid email address.';
    }
  }

  // Fallback for any unknown errors
  return 'Something went wrong. Please try again or contact support if the problem persists.';
}

/**
 * Utility function specifically for login/signin errors
 */
export function getLoginErrorMessage(error: any): string {
  const errorCode = typeof error === 'object' ? error.code : error;

  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-email':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials.';

    case 'auth/too-many-requests':
      return 'Too many login attempts. Please wait a few minutes and try again.';

    default:
      return getAuthErrorMessage(error);
  }
}

/**
 * Utility function specifically for registration errors
 */
export function getRegistrationErrorMessage(error: any): string {
  const errorCode = typeof error === 'object' ? error.code : error;

  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in or use a different email.';

    case 'auth/weak-password':
      return 'Password must be at least 6 characters long.';

    case 'auth/invalid-email':
      return 'Please enter a valid email address.';

    default:
      return getAuthErrorMessage(error);
  }
}

/**
 * Utility function specifically for password change/reset errors
 */
export function getPasswordErrorMessage(error: any): string {
  // Check for rate limit errors first
  if (typeof error === 'string' && error.includes('attempt')) {
    return error;
  }

  if (typeof error === 'object' && error.isRateLimit) {
    return error.message || 'Too many attempts. Please wait before trying again.';
  }

  const errorCode = typeof error === 'object' ? error.code : error;

  switch (errorCode) {
    case 'auth/wrong-password':
      return 'Current password is incorrect. Please try again.';

    case 'auth/weak-password':
      return 'New password must be at least 6 characters long.';

    case 'auth/requires-recent-login':
      return 'For security, please sign out and sign back in before changing your password.';

    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes before trying again.';

    case 'auth/invalid-action-code':
    case 'auth/expired-action-code':
      return 'Password reset link has expired. Please request a new one.';

    default:
      return getAuthErrorMessage(error);
  }
}

/**
 * Create a rate limit error object
 */
export function createRateLimitError(message: string): Error {
  const error = new Error(message) as any;
  error.isRateLimit = true;
  return error;
}