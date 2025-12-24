'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { RateLimitService, RateLimitResult } from '@/lib/services/rateLimiter';
import { getClientId } from '@/lib/utils/clientFingerprint';
import { DebugLogger } from '@/lib/utils/debug';

type RateLimitAction = 'login' | 'register' | 'passwordReset' | 'passwordChange';

interface UseRateLimitOptions {
  action: RateLimitAction;
  autoCheck?: boolean; // Check rate limit on mount
  clientIdOverride?: string; // Override client ID for testing
}

interface UseRateLimitReturn {
  // Current rate limit state
  result: RateLimitResult;
  isLoading: boolean;

  // Actions
  checkRateLimit: () => RateLimitResult;
  recordFailure: () => RateLimitResult;
  recordSuccess: () => void;

  // Helper properties
  isBlocked: boolean;
  canSubmit: boolean;
  warningMessage: string;

  // Time helpers
  lockoutTimeRemaining: number;
  formattedTimeRemaining: string;

  // Progress helpers
  attemptsUsed: number;
  progressPercentage: number;
}

export function useRateLimit({
  action,
  autoCheck = true,
  clientIdOverride,
}: UseRateLimitOptions): UseRateLimitReturn {

  const [result, setResult] = useState<RateLimitResult>({
    allowed: true,
    attemptsRemaining: 5,
    lockoutTimeRemaining: 0,
    lockoutLevel: 0,
    totalAttempts: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Initialize rate limiter service
  const rateLimiter = useMemo(() => {
    const clientId = clientIdOverride || getClientId();
    return new RateLimitService(action, clientId);
  }, [action, clientIdOverride]);

  // Check rate limit status
  const checkRateLimit = useCallback((): RateLimitResult => {
    const currentResult = rateLimiter.checkRateLimit();
    setResult(currentResult);
    setTimeRemaining(currentResult.lockoutTimeRemaining);
    return currentResult;
  }, [rateLimiter]);

  // Record a failed attempt
  const recordFailure = useCallback((): RateLimitResult => {
    const currentResult = rateLimiter.recordFailure();
    console.log('[useRateLimit] recordFailure result:', currentResult);
    setResult(currentResult);
    setTimeRemaining(currentResult.lockoutTimeRemaining);
    return currentResult;
  }, [rateLimiter]);

  // Record a successful attempt
  const recordSuccess = useCallback((): void => {
    rateLimiter.recordSuccess();
    const currentResult = rateLimiter.checkRateLimit();
    setResult(currentResult);
    setTimeRemaining(0);
  }, [rateLimiter]);

  // Keep stable reference to checkRateLimit
  const checkRateLimitRef = useRef(checkRateLimit);
  checkRateLimitRef.current = checkRateLimit;

  // Auto-check on mount if enabled
  useEffect(() => {
    if (autoCheck) {
      setIsLoading(true);
      // Small delay to ensure client-side hydration is complete
      setTimeout(() => {
        checkRateLimitRef.current();
        setIsLoading(false);
      }, 100);
    } else {
      setIsLoading(false);
    }
  }, [autoCheck]);

  // Countdown timer for lockout
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev - 1);
        if (newTime === 0) {
          // When timer reaches zero, refresh the page to ensure clean state
          console.log('⏰ [useRateLimit] Timer reached zero - refreshing page');
          setTimeout(() => {
            window.location.reload();
          }, 500);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  // Computed properties
  const isBlocked = result.lockoutTimeRemaining > 0 || timeRemaining > 0;
  const canSubmit = result.allowed && !isBlocked;

  const warningMessage = useMemo(() => {
    if (isBlocked) {
      return rateLimiter.getMessage({
        ...result,
        lockoutTimeRemaining: timeRemaining,
      });
    }
    return rateLimiter.getMessage(result);
  }, [result, timeRemaining, rateLimiter, isBlocked]);

  const formattedTimeRemaining = useMemo(() => {
    if (timeRemaining <= 0) return '';

    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  }, [timeRemaining]);

  const maxAttempts = useMemo(() => {
    // Get max attempts based on action type
    const maxAttemptsByAction = {
      login: 5,
      register: 3,
      passwordReset: 3,
      passwordChange: 5,
    };
    return maxAttemptsByAction[action] || 5;
  }, [action]);

  const attemptsUsed = maxAttempts - result.attemptsRemaining;

  const progressPercentage = useMemo(() => {
    if (isBlocked) {
      // Show lockout progress
      const totalLockoutTime = result.lockoutLevel === 1 ? 120 : 600; // 2min or 10min
      const elapsed = Math.max(0, totalLockoutTime - timeRemaining);
      return Math.min(100, (elapsed / totalLockoutTime) * 100);
    }

    // Show attempts progress
    return Math.min(100, (attemptsUsed / maxAttempts) * 100);
  }, [isBlocked, timeRemaining, result.lockoutLevel, attemptsUsed, maxAttempts]);

  // Smart debug logging - only log important state changes
  const prevStateRef = useRef({ isBlocked: false, canSubmit: true, timeRemaining: 0 });

  useEffect(() => {
    const currentState = { isBlocked, canSubmit, timeRemaining };
    const prevState = prevStateRef.current;

    // Log only when important state changes
    if (prevState.isBlocked !== isBlocked) {
      DebugLogger.logStateChange('useRateLimit',
        isBlocked ? 'User is now blocked' : 'User is now unblocked',
        { timeRemaining, warningMessage }
      );
    }

    if (prevState.canSubmit !== canSubmit) {
      DebugLogger.logStateChange('useRateLimit',
        canSubmit ? 'Submissions allowed' : 'Submissions blocked',
        { isBlocked, timeRemaining }
      );
    }

    // Log timer updates (throttled)
    if (timeRemaining > 0) {
      DebugLogger.logTimer('useRateLimit', timeRemaining, { isBlocked, canSubmit });
    }

    prevStateRef.current = currentState;
  }, [isBlocked, canSubmit, timeRemaining, warningMessage]);

  return {
    // State
    result: {
      ...result,
      lockoutTimeRemaining: timeRemaining, // Use live countdown
    },
    isLoading,

    // Actions
    checkRateLimit,
    recordFailure,
    recordSuccess,

    // Helper properties
    isBlocked,
    canSubmit,
    warningMessage,

    // Time helpers
    lockoutTimeRemaining: timeRemaining,
    formattedTimeRemaining,

    // Progress helpers
    attemptsUsed,
    progressPercentage,
  };
}

/**
 * Simplified hook for basic rate limiting checks
 */
export function useBasicRateLimit(action: RateLimitAction) {
  const { isBlocked, canSubmit, recordFailure, recordSuccess, warningMessage } = useRateLimit({
    action,
    autoCheck: true,
  });

  return {
    isBlocked,
    canSubmit,
    recordFailure,
    recordSuccess,
    warningMessage,
  };
}

/**
 * Hook specifically for login rate limiting with enhanced features
 */
export function useLoginRateLimit() {
  const rateLimit = useRateLimit({ action: 'login' });

  const handleLoginAttempt = useCallback(async (
    loginFunction: () => Promise<void>
  ) => {
    if (!rateLimit.canSubmit) {
      throw new Error(rateLimit.warningMessage);
    }

    try {
      await loginFunction();
      rateLimit.recordSuccess();
    } catch (error) {
      rateLimit.recordFailure();
      throw error; // Re-throw the original error
    }
  }, [rateLimit]);

  return {
    ...rateLimit,
    handleLoginAttempt,
  };
}