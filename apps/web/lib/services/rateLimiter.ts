/**
 * Rate Limiting Service with Progressive Penalties
 *
 * Security Features:
 * - IP + Browser fingerprinting
 * - Progressive lockout times (2min → 10min → 10min...)
 * - Persistent storage across browser sessions
 * - Automatic cleanup of expired entries
 */

export interface RateLimitEntry {
  attempts: number;
  lastAttempt: number;
  lockoutUntil?: number;
  lockoutLevel: number; // 0=no lockout, 1=2min, 2+=10min
}

export interface RateLimitResult {
  allowed: boolean;
  attemptsRemaining: number;
  lockoutTimeRemaining: number; // seconds
  lockoutLevel: number;
  totalAttempts: number;
}

export interface RateLimitConfig {
  maxAttempts: number;
  firstLockoutMinutes: number;
  extendedLockoutMinutes: number;
  storageKey: string;
}

const DEFAULT_CONFIGS: Record<string, RateLimitConfig> = {
  login: {
    maxAttempts: 5,
    firstLockoutMinutes: 2,
    extendedLockoutMinutes: 10,
    storageKey: 'auth_rate_limit',
  },
  register: {
    maxAttempts: 3,
    firstLockoutMinutes: 2,
    extendedLockoutMinutes: 10,
    storageKey: 'register_rate_limit',
  },
  passwordReset: {
    maxAttempts: 3,
    firstLockoutMinutes: 2,
    extendedLockoutMinutes: 10,
    storageKey: 'reset_rate_limit',
  },
  passwordChange: {
    maxAttempts: 5,
    firstLockoutMinutes: 5,
    extendedLockoutMinutes: 15,
    storageKey: 'password_change_rate_limit',
  },
};

export class RateLimitService {
  private config: RateLimitConfig;
  private clientId: string;

  constructor(action: keyof typeof DEFAULT_CONFIGS, clientId: string) {
    this.config = DEFAULT_CONFIGS[action];
    this.clientId = clientId;
  }

  /**
   * Check if an action is allowed and get current rate limit status
   */
  checkRateLimit(): RateLimitResult {
    const entry = this.getEntry();
    const now = Date.now();

    // Clean up expired lockouts
    if (entry.lockoutUntil && now >= entry.lockoutUntil) {
      console.log('🔓 [RateLimit] Lockout EXPIRED - resetting attempts');
      // Lockout expired - reset attempts to allow new tries
      entry.lockoutUntil = undefined;
      entry.attempts = 0; // RESET attempts after lockout expires!
      this.saveEntry(entry);
      console.log('💾 [RateLimit] Reset saved after lockout expiry');
    }

    // Check if currently locked out
    if (entry.lockoutUntil && now < entry.lockoutUntil) {
      const lockoutTimeRemaining = Math.ceil((entry.lockoutUntil - now) / 1000);

      console.log('⏰ [RateLimit] LOCKOUT ACTIVE:', {
        now,
        lockoutUntil: entry.lockoutUntil,
        lockoutTimeRemaining,
        lockoutLevel: entry.lockoutLevel,
        action: this.config.storageKey,
        lockoutUntilDate: new Date(entry.lockoutUntil),
        currentDate: new Date(now),
      });

      return {
        allowed: false,
        attemptsRemaining: 0,
        lockoutTimeRemaining,
        lockoutLevel: entry.lockoutLevel,
        totalAttempts: entry.attempts,
      };
    }

    // Check if within attempt limit
    const attemptsRemaining = Math.max(0, this.config.maxAttempts - entry.attempts);

    const result = {
      allowed: attemptsRemaining > 0,
      attemptsRemaining,
      lockoutTimeRemaining: 0,
      lockoutLevel: entry.lockoutLevel,
      totalAttempts: entry.attempts,
    };

    // Enhanced debug logging
    console.log('✅ [RateLimit] checkRateLimit SUCCESS:', {
      action: this.config.storageKey,
      maxAttempts: this.config.maxAttempts,
      currentAttempts: entry.attempts,
      attemptsRemaining,
      allowed: result.allowed,
      calculation: `${this.config.maxAttempts} - ${entry.attempts} = ${attemptsRemaining} (allowed: ${attemptsRemaining > 0})`,
      entry,
      result,
      timestamp: new Date(now).toLocaleTimeString()
    });

    return result;
  }

  /**
   * Record a failed attempt and apply penalties if necessary
   */
  recordFailure(): RateLimitResult {
    const entry = this.getEntry();
    const now = Date.now();

    // Increment attempts
    entry.attempts += 1;
    entry.lastAttempt = now;

    console.log('[RateLimit] recordFailure:', {
      attempts: entry.attempts,
      maxAttempts: this.config.maxAttempts,
      willLockout: entry.attempts >= this.config.maxAttempts,
      lockoutLevel: entry.lockoutLevel,
      action: this.config.storageKey,
    });

    // Check if lockout should be applied (when we hit or exceed max attempts)
    if (entry.attempts >= this.config.maxAttempts) {
      const lockoutMinutes = this.calculateLockoutDuration(entry.lockoutLevel);
      entry.lockoutUntil = now + (lockoutMinutes * 60 * 1000);
      entry.lockoutLevel += 1;

      console.log('🔒 [RateLimit] LOCKOUT APPLIED:', {
        lockoutMinutes,
        lockoutUntil: entry.lockoutUntil,
        lockoutLevel: entry.lockoutLevel,
        currentTime: now,
        timeUntilLockout: entry.lockoutUntil - now,
        lockoutSeconds: lockoutMinutes * 60,
        action: this.config.storageKey,
        maxAttempts: this.config.maxAttempts,
        actualAttempts: entry.attempts,
      });

      // Force save immediately after lockout
      this.saveEntry(entry);
      console.log('💾 [RateLimit] Entry saved after lockout');
    }

    this.saveEntry(entry);
    return this.checkRateLimit();
  }

  /**
   * Record a successful attempt (resets the counter)
   */
  recordSuccess(): void {
    const entry = this.getEntry();

    // Reset attempts but keep some history for progressive penalties
    // If user was in lockout level 2+, reduce by 1 instead of full reset
    if (entry.lockoutLevel >= 2) {
      entry.lockoutLevel = Math.max(0, entry.lockoutLevel - 1);
    } else {
      entry.lockoutLevel = 0;
    }

    entry.attempts = 0;
    entry.lastAttempt = Date.now();
    entry.lockoutUntil = undefined;

    this.saveEntry(entry);
  }

  /**
   * Get user-friendly message based on current state
   */
  getMessage(result: RateLimitResult): string {
    if (result.lockoutTimeRemaining > 0) {
      // Use same logic as formatTime component for consistency
      const minutes = Math.floor(result.lockoutTimeRemaining / 60);
      const seconds = result.lockoutTimeRemaining % 60;

      let timeStr: string;
      if (minutes > 0) {
        // Format as "6 minutes 57 seconds" to match the visual timer logic
        timeStr = `${minutes} minute${minutes > 1 ? 's' : ''}`;
        if (seconds > 0) {
          timeStr += ` ${seconds} second${seconds > 1 ? 's' : ''}`;
        }
      } else {
        timeStr = `${seconds} second${seconds > 1 ? 's' : ''}`;
      }

      if (result.lockoutLevel === 1) {
        return `Too many failed attempts. Please wait ${timeStr} before trying again.`;
      } else {
        return `Account temporarily locked for ${timeStr}. Repeated failures will extend lockout time.`;
      }
    }

    if (result.attemptsRemaining <= 2 && result.attemptsRemaining > 0) {
      if (result.lockoutLevel === 0) {
        return `${result.attemptsRemaining} attempt${result.attemptsRemaining > 1 ? 's' : ''} remaining before temporary lockout.`;
      } else {
        return `${result.attemptsRemaining} attempt${result.attemptsRemaining > 1 ? 's' : ''} remaining. Next failure will result in a ${this.config.extendedLockoutMinutes}-minute lockout.`;
      }
    }

    return '';
  }

  /**
   * Calculate lockout duration based on level
   */
  private calculateLockoutDuration(currentLevel: number): number {
    if (currentLevel === 0) {
      return this.config.firstLockoutMinutes; // First lockout: 2 minutes
    }
    return this.config.extendedLockoutMinutes; // Subsequent lockouts: 10 minutes
  }

  /**
   * Get current rate limit entry from storage
   */
  private getEntry(): RateLimitEntry {
    try {
      const storageKey = `${this.config.storageKey}_${this.clientId}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as RateLimitEntry;
        const now = Date.now();

        // Clean up old entries (older than 24 hours)
        if (now - parsed.lastAttempt > 24 * 60 * 60 * 1000) {
          console.log('📅 [RateLimit] Clearing old entry (24h+)');
          this.clearEntry();
          return this.createNewEntry();
        }

        // 🔧 CORRUPTION DETECTION & AUTO-FIX
        const isCorrupted = this.detectCorruption(parsed, now);
        if (isCorrupted) {
          console.log('🩹 [RateLimit] Corrupted data detected - auto-fixing');
          const fixed = this.fixCorruptedEntry(parsed, now);
          this.saveEntry(fixed);
          console.log('✅ [RateLimit] Data corruption fixed automatically');
          return fixed;
        }

        console.log('📂 [RateLimit] Loaded entry:', { storageKey, entry: parsed });
        return parsed;
      }
    } catch (error) {
      console.warn('Error reading rate limit data:', error);
    }

    return this.createNewEntry();
  }

  /**
   * Detect if the rate limit data is corrupted
   */
  private detectCorruption(entry: RateLimitEntry, now: number): boolean {
    // Case 1: User has max attempts but no active lockout and lockout time has passed
    const hasMaxAttempts = entry.attempts >= this.config.maxAttempts;
    const noActiveLockout = !entry.lockoutUntil || now >= entry.lockoutUntil;
    const shouldHaveBeenReset = hasMaxAttempts && noActiveLockout;

    // Case 2: Invalid attempt count (negative or way too high)
    const invalidAttempts = entry.attempts < 0 || entry.attempts > this.config.maxAttempts + 5;

    // Case 3: Lockout time is in the past but attempts weren't reset
    const expiredLockoutWithAttempts = entry.lockoutUntil &&
      now >= entry.lockoutUntil &&
      entry.attempts > 0;

    const isCorrupted = !!(shouldHaveBeenReset || invalidAttempts || expiredLockoutWithAttempts);

    if (isCorrupted) {
      console.log('🔍 [RateLimit] Corruption detected:', {
        hasMaxAttempts,
        noActiveLockout,
        shouldHaveBeenReset,
        invalidAttempts,
        expiredLockoutWithAttempts,
        currentEntry: entry,
        now: new Date(now),
        lockoutExpiry: entry.lockoutUntil ? new Date(entry.lockoutUntil) : null
      });
    }

    return isCorrupted;
  }

  /**
   * Fix corrupted rate limit entry
   */
  private fixCorruptedEntry(entry: RateLimitEntry, now: number): RateLimitEntry {
    console.log('🔧 [RateLimit] Fixing corrupted entry:', entry);

    const fixed: RateLimitEntry = {
      attempts: 0, // Reset attempts to allow new tries
      lastAttempt: now,
      lockoutLevel: entry.lockoutLevel || 0, // Preserve lockout level for progressive penalties
      lockoutUntil: undefined, // Clear any expired lockout
    };

    // If there's an active lockout that hasn't expired, preserve it
    if (entry.lockoutUntil && now < entry.lockoutUntil) {
      fixed.lockoutUntil = entry.lockoutUntil;
      fixed.attempts = this.config.maxAttempts; // Keep max attempts during active lockout
      console.log('🔒 [RateLimit] Preserving active lockout');
    }

    console.log('✨ [RateLimit] Fixed entry:', fixed);
    return fixed;
  }

  /**
   * Save rate limit entry to storage
   */
  private saveEntry(entry: RateLimitEntry): void {
    try {
      localStorage.setItem(`${this.config.storageKey}_${this.clientId}`, JSON.stringify(entry));
    } catch (error) {
      console.warn('Error saving rate limit data:', error);
    }
  }

  /**
   * Create new rate limit entry
   */
  private createNewEntry(): RateLimitEntry {
    return {
      attempts: 0,
      lastAttempt: Date.now(),
      lockoutLevel: 0,
    };
  }

  /**
   * Clear rate limit entry
   */
  private clearEntry(): void {
    try {
      localStorage.removeItem(`${this.config.storageKey}_${this.clientId}`);
    } catch (error) {
      console.warn('Error clearing rate limit data:', error);
    }
  }

  /**
   * Clean up all expired entries (maintenance function)
   */
  static cleanupExpired(): void {
    if (typeof window === 'undefined') return;

    try {
      const now = Date.now();
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.includes('_rate_limit_')) continue;

        try {
          const data = JSON.parse(localStorage.getItem(key) || '');

          // Remove if older than 24 hours or lockout expired more than 1 hour ago
          const isOld = now - data.lastAttempt > 24 * 60 * 60 * 1000;
          const lockoutExpiredLongAgo = data.lockoutUntil && now - data.lockoutUntil > 60 * 60 * 1000;

          if (isOld || lockoutExpiredLongAgo) {
            keysToRemove.push(key);
          }
        } catch {
          // Invalid data, remove it
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Error during rate limit cleanup:', error);
    }
  }
}

// Auto-cleanup on page load
if (typeof window !== 'undefined') {
  setTimeout(() => RateLimitService.cleanupExpired(), 1000);
}