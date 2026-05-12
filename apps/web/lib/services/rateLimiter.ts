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

  checkRateLimit(): RateLimitResult {
    const entry = this.getEntry();
    const now = Date.now();

    if (entry.lockoutUntil && now >= entry.lockoutUntil) {
      entry.lockoutUntil = undefined;
      entry.attempts = 0;
      this.saveEntry(entry);
    }

    if (entry.lockoutUntil && now < entry.lockoutUntil) {
      const lockoutTimeRemaining = Math.ceil((entry.lockoutUntil - now) / 1000);
      return {
        allowed: false,
        attemptsRemaining: 0,
        lockoutTimeRemaining,
        lockoutLevel: entry.lockoutLevel,
        totalAttempts: entry.attempts,
      };
    }

    const attemptsRemaining = Math.max(0, this.config.maxAttempts - entry.attempts);
    return {
      allowed: attemptsRemaining > 0,
      attemptsRemaining,
      lockoutTimeRemaining: 0,
      lockoutLevel: entry.lockoutLevel,
      totalAttempts: entry.attempts,
    };
  }

  recordFailure(): RateLimitResult {
    const entry = this.getEntry();
    const now = Date.now();

    entry.attempts += 1;
    entry.lastAttempt = now;

    if (entry.attempts >= this.config.maxAttempts) {
      const lockoutMinutes = this.calculateLockoutDuration(entry.lockoutLevel);
      entry.lockoutUntil = now + (lockoutMinutes * 60 * 1000);
      entry.lockoutLevel += 1;
      this.saveEntry(entry);
    }

    this.saveEntry(entry);
    return this.checkRateLimit();
  }

  recordSuccess(): void {
    const entry = this.getEntry();

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

  getMessage(result: RateLimitResult): string {
    if (result.lockoutTimeRemaining > 0) {
      const minutes = Math.floor(result.lockoutTimeRemaining / 60);
      const seconds = result.lockoutTimeRemaining % 60;

      let timeStr: string;
      if (minutes > 0) {
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

  private calculateLockoutDuration(currentLevel: number): number {
    if (currentLevel === 0) {
      return this.config.firstLockoutMinutes;
    }
    return this.config.extendedLockoutMinutes;
  }

  private getEntry(): RateLimitEntry {
    try {
      const storageKey = `${this.config.storageKey}_${this.clientId}`;
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as RateLimitEntry;
        const now = Date.now();

        if (now - parsed.lastAttempt > 24 * 60 * 60 * 1000) {
          this.clearEntry();
          return this.createNewEntry();
        }

        const isCorrupted = this.detectCorruption(parsed, now);
        if (isCorrupted) {
          const fixed = this.fixCorruptedEntry(parsed, now);
          this.saveEntry(fixed);
          return fixed;
        }

        return parsed;
      }
    } catch {
      // ignore
    }

    return this.createNewEntry();
  }

  private detectCorruption(entry: RateLimitEntry, now: number): boolean {
    const hasMaxAttempts = entry.attempts >= this.config.maxAttempts;
    const noActiveLockout = !entry.lockoutUntil || now >= entry.lockoutUntil;
    const shouldHaveBeenReset = hasMaxAttempts && noActiveLockout;
    const invalidAttempts = entry.attempts < 0 || entry.attempts > this.config.maxAttempts + 5;
    const expiredLockoutWithAttempts = entry.lockoutUntil && now >= entry.lockoutUntil && entry.attempts > 0;

    return !!(shouldHaveBeenReset || invalidAttempts || expiredLockoutWithAttempts);
  }

  private fixCorruptedEntry(entry: RateLimitEntry, now: number): RateLimitEntry {
    const fixed: RateLimitEntry = {
      attempts: 0,
      lastAttempt: now,
      lockoutLevel: entry.lockoutLevel || 0,
      lockoutUntil: undefined,
    };

    if (entry.lockoutUntil && now < entry.lockoutUntil) {
      fixed.lockoutUntil = entry.lockoutUntil;
      fixed.attempts = this.config.maxAttempts;
    }

    return fixed;
  }

  private saveEntry(entry: RateLimitEntry): void {
    try {
      localStorage.setItem(`${this.config.storageKey}_${this.clientId}`, JSON.stringify(entry));
    } catch {
      // ignore
    }
  }

  private createNewEntry(): RateLimitEntry {
    return {
      attempts: 0,
      lastAttempt: Date.now(),
      lockoutLevel: 0,
    };
  }

  private clearEntry(): void {
    try {
      localStorage.removeItem(`${this.config.storageKey}_${this.clientId}`);
    } catch {
      // ignore
    }
  }

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
          const isOld = now - data.lastAttempt > 24 * 60 * 60 * 1000;
          const lockoutExpiredLongAgo = data.lockoutUntil && now - data.lockoutUntil > 60 * 60 * 1000;

          if (isOld || lockoutExpiredLongAgo) {
            keysToRemove.push(key);
          }
        } catch {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch {
      // ignore
    }
  }
}

// Auto-cleanup on page load
if (typeof window !== 'undefined') {
  setTimeout(() => RateLimitService.cleanupExpired(), 1000);
}
