// AUTO-FIX CORRUPTED RATE LIMIT DATA
// This script runs automatically to detect and fix corrupted localStorage data

console.log('🔧 [AutoFix] Starting automatic localStorage corruption check...');

function autoFixRateLimitData() {
  try {
    console.log('🔍 [AutoFix] Scanning localStorage for rate limit data...');

    const rateLimitKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('_rate_limit_')) {
        rateLimitKeys.push(key);
      }
    }

    console.log(`📦 [AutoFix] Found ${rateLimitKeys.length} rate limit entries`);

    if (rateLimitKeys.length === 0) {
      console.log('✨ [AutoFix] No rate limit data found - system is clean');
      return;
    }

    const now = Date.now();
    let fixedCount = 0;

    rateLimitKeys.forEach(key => {
      try {
        const dataStr = localStorage.getItem(key);
        if (!dataStr) return;

        const data = JSON.parse(dataStr);
        console.log(`🔍 [AutoFix] Checking ${key}:`, data);

        // Detect corruption patterns
        const maxAttempts = getMaxAttemptsForKey(key);
        const hasMaxAttempts = data.attempts >= maxAttempts;
        const noActiveLockout = !data.lockoutUntil || now >= data.lockoutUntil;
        const shouldHaveBeenReset = hasMaxAttempts && noActiveLockout;

        const invalidAttempts = data.attempts < 0 || data.attempts > maxAttempts + 5;
        const expiredLockoutWithAttempts = data.lockoutUntil &&
                                          now >= data.lockoutUntil &&
                                          data.attempts > 0;

        const isCorrupted = shouldHaveBeenReset || invalidAttempts || expiredLockoutWithAttempts;

        if (isCorrupted) {
          console.log(`🩹 [AutoFix] CORRUPTED data detected in ${key}`);
          console.log('📊 [AutoFix] Corruption analysis:', {
            hasMaxAttempts,
            noActiveLockout,
            shouldHaveBeenReset,
            invalidAttempts,
            expiredLockoutWithAttempts,
            maxAttempts,
            currentAttempts: data.attempts,
            lockoutExpiry: data.lockoutUntil ? new Date(data.lockoutUntil) : null,
            currentTime: new Date(now)
          });

          // Fix the corruption
          const fixed = {
            attempts: 0, // Reset attempts
            lastAttempt: now,
            lockoutLevel: data.lockoutLevel || 0,
            lockoutUntil: undefined
          };

          // Preserve active lockouts
          if (data.lockoutUntil && now < data.lockoutUntil) {
            fixed.lockoutUntil = data.lockoutUntil;
            fixed.attempts = maxAttempts;
            console.log('🔒 [AutoFix] Preserving active lockout');
          }

          localStorage.setItem(key, JSON.stringify(fixed));
          fixedCount++;

          console.log(`✅ [AutoFix] Fixed ${key}:`, {
            before: data,
            after: fixed
          });
        } else {
          console.log(`✅ [AutoFix] ${key} is clean`);
        }

      } catch (error) {
        console.error(`❌ [AutoFix] Error processing ${key}:`, error);
        // Remove completely corrupted entries
        localStorage.removeItem(key);
        fixedCount++;
        console.log(`🗑️ [AutoFix] Removed corrupted entry ${key}`);
      }
    });

    if (fixedCount > 0) {
      console.log(`🎉 [AutoFix] COMPLETE! Fixed ${fixedCount} corrupted entries`);
      console.log('🔄 [AutoFix] Refreshing page to apply fixes...');

      // Delay refresh to allow logs to be seen
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      console.log('✨ [AutoFix] All rate limit data is clean - no fixes needed');
    }

  } catch (error) {
    console.error('❌ [AutoFix] Error during auto-fix:', error);
  }
}

function getMaxAttemptsForKey(key) {
  if (key.includes('auth_rate_limit')) return 5;
  if (key.includes('register_rate_limit')) return 3;
  if (key.includes('reset_rate_limit')) return 3;
  if (key.includes('password_change_rate_limit')) return 5;
  return 5; // Default
}

// Run auto-fix immediately
autoFixRateLimitData();

// Make function available globally for manual use
window.autoFixRateLimitData = autoFixRateLimitData;

console.log('🛠️ [AutoFix] Auto-fix function available as: autoFixRateLimitData()');