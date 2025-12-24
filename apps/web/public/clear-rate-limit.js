// Clear all rate limiting data from localStorage
function clearRateLimit() {
  const clientId = localStorage.getItem('client_fingerprint_id');
  console.log('Client ID:', clientId);

  const keys = [
    'auth_rate_limit_',
    'register_rate_limit_',
    'reset_rate_limit_',
    'password_change_rate_limit_'
  ];

  keys.forEach(key => {
    const fullKey = key + clientId;
    localStorage.removeItem(fullKey);
    console.log('Removed:', fullKey);
  });

  // Also clear the client ID to force regeneration
  localStorage.removeItem('client_fingerprint_id');
  console.log('All rate limit data cleared. Page will refresh.');

  setTimeout(() => {
    window.location.reload();
  }, 1000);
}

// Force a lockout for testing
function forceLockout(minutes = 0.5) {  // Default to 30 seconds for fast testing
  const clientId = localStorage.getItem('client_fingerprint_id') || 'test-client';
  const now = Date.now();
  const lockoutData = {
    attempts: 5,
    lastAttempt: now,
    lockoutUntil: now + (minutes * 60 * 1000),
    lockoutLevel: 1
  };

  localStorage.setItem(`auth_rate_limit_${clientId}`, JSON.stringify(lockoutData));
  console.log(`🔒 Forced lockout for ${minutes} minutes:`, lockoutData);
  console.log('Lockout until:', new Date(lockoutData.lockoutUntil));
  console.log('Reload the page to see the timer!');
}

// Check current lockout status
function checkLockout() {
  const clientId = localStorage.getItem('client_fingerprint_id');
  const data = localStorage.getItem(`auth_rate_limit_${clientId}`);
  if (data) {
    const parsed = JSON.parse(data);
    const now = Date.now();
    const remaining = parsed.lockoutUntil ? Math.max(0, Math.ceil((parsed.lockoutUntil - now) / 1000)) : 0;
    console.log('📊 Current lockout status:', {
      ...parsed,
      timeRemaining: remaining + ' seconds',
      isLocked: remaining > 0
    });
  } else {
    console.log('📊 No lockout data found');
  }
}

// Make functions available globally
window.clearRateLimit = clearRateLimit;
window.forceLockout = forceLockout;
window.checkLockout = checkLockout;
console.log('Rate limit tools loaded:');
console.log('- clearRateLimit() - Clear all data');
console.log('- forceLockout(minutes) - Force lockout for testing (default 30s)');
console.log('- checkLockout() - Check current status');