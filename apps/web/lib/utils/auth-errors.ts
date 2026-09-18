/**
 * Utility function to convert Firebase authentication errors into user-friendly messages
 * This helps maintain security while providing helpful feedback to users
 */
export type AuthErrorTranslate = (key: string, values?: Record<string, string | number>) => string;

export function getAuthErrorMessage(error: any, t: AuthErrorTranslate): string {
  // Check for rate limit errors first (these are custom errors from our rate limiter)
  if (typeof error === 'string' && error.includes('attempt')) {
    return error; // Return rate limit messages as-is since they're already user-friendly
  }

  if (typeof error === 'object' && error.isRateLimit) {
    return error.message || t('rateLimitDefault');
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
        return t('invalidCredentials');

      case 'auth/too-many-requests':
        return t('tooManyRequests');

      case 'auth/user-disabled':
        return t('accountDisabled');

      // Registration errors
      case 'auth/email-already-in-use':
        return t('emailInUse');

      case 'auth/weak-password':
        return t('weakPassword');

      // Password reset errors
      case 'auth/invalid-action-code':
      case 'auth/expired-action-code':
        return t('resetLinkExpired');

      // Network and configuration errors
      case 'auth/network-request-failed':
        return t('networkError');

      case 'auth/app-deleted':
      case 'auth/app-not-authorized':
        return t('serviceUnavailable');

      // Re-authentication errors
      case 'auth/requires-recent-login':
        return t('requiresRecentLogin');

      // Default for other auth errors
      default:
        if (errorCode.startsWith('auth/')) {
          return t('authFailedGeneric');
        }
    }
  }

  // Check for common error patterns in the message
  if (typeof errorMessage === 'string') {
    const message = errorMessage.toLowerCase();

    if (message.includes('firebase') || message.includes('auth/')) {
      return t('authErrorGeneric');
    }

    if (message.includes('network') || message.includes('connection')) {
      return t('networkError');
    }

    if (message.includes('password') && message.includes('weak')) {
      return t('weakPassword');
    }

    if (message.includes('email') && (message.includes('invalid') || message.includes('format'))) {
      return t('invalidEmailFormat');
    }
  }

  // Fallback for any unknown errors
  return t('genericError');
}

/**
 * Utility function specifically for login/signin errors
 */
export function getLoginErrorMessage(error: any, t: AuthErrorTranslate): string {
  const errorCode = typeof error === 'object' ? error.code : error;

  switch (errorCode) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-email':
    case 'auth/invalid-credential':
      return t('loginInvalidCredentials');

    case 'auth/too-many-requests':
      return t('loginTooManyAttempts');

    default:
      return getAuthErrorMessage(error, t);
  }
}

/**
 * Utility function specifically for registration errors
 */
export function getRegistrationErrorMessage(error: any, t: AuthErrorTranslate): string {
  const errorCode = typeof error === 'object' ? error.code : error;

  switch (errorCode) {
    case 'auth/email-already-in-use':
      return t('registerEmailInUse');

    case 'auth/weak-password':
      return t('registerWeakPassword');

    case 'auth/invalid-email':
      return t('registerInvalidEmail');

    default:
      return getAuthErrorMessage(error, t);
  }
}

/**
 * Utility function specifically for password change/reset errors
 */
export function getPasswordErrorMessage(error: any, t: AuthErrorTranslate): string {
  // Check for rate limit errors first
  if (typeof error === 'string' && error.includes('attempt')) {
    return error;
  }

  if (typeof error === 'object' && error.isRateLimit) {
    return error.message || t('rateLimitDefault');
  }

  const errorCode = typeof error === 'object' ? error.code : error;

  switch (errorCode) {
    case 'auth/wrong-password':
      return t('passwordWrongCurrent');

    case 'auth/weak-password':
      return t('passwordWeakNew');

    case 'auth/requires-recent-login':
      return t('passwordRequiresRecentLogin');

    case 'auth/too-many-requests':
      return t('passwordTooManyAttempts');

    case 'auth/invalid-action-code':
    case 'auth/expired-action-code':
      return t('passwordResetLinkExpired');

    default:
      return getAuthErrorMessage(error, t);
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
