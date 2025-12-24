/**
 * Smart Debug Utility
 * Controls logging to prevent console spam and improve performance
 */

interface DebugConfig {
  enabled: boolean;
  throttleMs: number;
  logStateChanges: boolean;
  logTimers: boolean;
}

// Debug configuration based on environment
const DEBUG_CONFIG: DebugConfig = {
  enabled: false, // Disabled to prevent console spam
  throttleMs: 5000, // Only log every 5 seconds for frequent operations
  logStateChanges: false,
  logTimers: false, // Disable timer logs by default (too frequent)
};

// Throttle cache for different log types
const throttleCache: Record<string, number> = {};

/**
 * Smart logger that throttles frequent logs and respects environment
 */
class DebugLogger {
  private static shouldLog(key: string, useThrottle: boolean = false): boolean {
    if (!DEBUG_CONFIG.enabled) return false;

    if (useThrottle) {
      const now = Date.now();
      const lastLog = throttleCache[key] || 0;

      if (now - lastLog < DEBUG_CONFIG.throttleMs) {
        return false;
      }

      throttleCache[key] = now;
    }

    return true;
  }

  /**
   * Log state changes (important events)
   */
  static logStateChange(component: string, message: string, data?: any): void {
    if (!DEBUG_CONFIG.logStateChanges) return;

    if (this.shouldLog(`state-${component}`)) {
      console.log(`🔄 [${component}] ${message}`, data || '');
    }
  }

  /**
   * Log timer updates (throttled to prevent spam)
   */
  static logTimer(component: string, timeRemaining: number, data?: any): void {
    if (!DEBUG_CONFIG.logTimers) return;

    if (this.shouldLog(`timer-${component}`, true)) {
      console.log(`⏰ [${component}] Timer: ${timeRemaining}s`, data || '');
    }
  }

  /**
   * Log render cycles (throttled heavily)
   */
  static logRender(component: string, data?: any): void {
    if (this.shouldLog(`render-${component}`, true)) {
      console.log(`🖥️ [${component}] Render`, data || '');
    }
  }

  /**
   * Log important events (always shown in dev)
   */
  static logEvent(component: string, event: string, data?: any): void {
    if (this.shouldLog(`event-${component}`)) {
      console.log(`🎯 [${component}] ${event}`, data || '');
    }
  }

  /**
   * Log errors (always shown)
   */
  static logError(component: string, error: string, data?: any): void {
    if (DEBUG_CONFIG.enabled) {
      console.error(`❌ [${component}] ${error}`, data || '');
    }
  }

  /**
   * Log successful operations
   */
  static logSuccess(component: string, message: string, data?: any): void {
    if (this.shouldLog(`success-${component}`)) {
      console.log(`✅ [${component}] ${message}`, data || '');
    }
  }

  /**
   * Log performance-related info
   */
  static logPerformance(component: string, operation: string, duration: number): void {
    if (this.shouldLog(`perf-${component}`)) {
      console.log(`⚡ [${component}] ${operation} took ${duration}ms`);
    }
  }

  /**
   * Get debug configuration
   */
  static getConfig(): DebugConfig {
    return DEBUG_CONFIG;
  }

  /**
   * Update debug configuration (useful for runtime debugging)
   */
  static updateConfig(updates: Partial<DebugConfig>): void {
    Object.assign(DEBUG_CONFIG, updates);
    this.logEvent('DebugLogger', 'Config updated', DEBUG_CONFIG);
  }
}

export { DebugLogger };

// Make available globally for runtime debugging
if (typeof window !== 'undefined') {
  (window as any).DebugLogger = DebugLogger;
}