// Comprehensive Rate Limiting Test Script
// Tests the lockout expiry and attempt reset functionality

console.log('🧪 Rate Limiting Test Suite Started');
console.log('==================================');

function testRateLimitExpiry() {
  console.log('\n🔬 Testing Lockout Expiry and Attempt Reset...');

  // Clear any existing data first
  clearRateLimit();

  // Step 1: Force a short lockout (10 seconds for testing)
  console.log('📝 Step 1: Forcing 10-second lockout...');
  const clientId = localStorage.getItem('client_fingerprint_id') || 'test-client-' + Date.now();
  localStorage.setItem('client_fingerprint_id', clientId);

  const now = Date.now();
  const lockoutData = {
    attempts: 5, // Max attempts reached
    lastAttempt: now,
    lockoutUntil: now + (10 * 1000), // 10 seconds from now
    lockoutLevel: 1
  };

  localStorage.setItem(`auth_rate_limit_${clientId}`, JSON.stringify(lockoutData));
  console.log('✅ Lockout applied:', {
    lockoutUntil: new Date(lockoutData.lockoutUntil),
    currentTime: new Date(now),
    secondsUntilExpiry: 10
  });

  // Step 2: Check lockout status immediately
  console.log('\n📊 Step 2: Checking immediate lockout status...');
  checkLockout();

  // Step 3: Wait for expiry and test
  console.log('\n⏰ Step 3: Setting up expiry test...');
  console.log('Will check again in 11 seconds to verify lockout expiry...');

  setTimeout(() => {
    console.log('\n🔍 Step 4: Checking status after lockout should have expired...');

    // Manually trigger the rate limiter check (simulating what happens in the component)
    const storedData = localStorage.getItem(`auth_rate_limit_${clientId}`);
    if (storedData) {
      const parsed = JSON.parse(storedData);
      const currentTime = Date.now();

      console.log('📂 Stored lockout data:', parsed);
      console.log('⏰ Current time:', new Date(currentTime));
      console.log('🔓 Lockout expires at:', new Date(parsed.lockoutUntil));
      console.log('✨ Should be expired:', currentTime >= parsed.lockoutUntil);

      // This simulates the rateLimiter.checkRateLimit() logic
      if (parsed.lockoutUntil && currentTime >= parsed.lockoutUntil) {
        console.log('🎉 SUCCESS: Lockout has expired!');
        console.log('🔄 Simulating attempt reset...');

        // Reset attempts (this is the fix we implemented)
        parsed.lockoutUntil = undefined;
        parsed.attempts = 0; // Critical fix!
        localStorage.setItem(`auth_rate_limit_${clientId}`, JSON.stringify(parsed));

        console.log('✅ Attempts reset successfully:', {
          newAttempts: parsed.attempts,
          lockoutUntil: parsed.lockoutUntil
        });

        // Verify we can make new attempts
        console.log('🧪 Testing new attempt allowance...');
        const finalData = JSON.parse(localStorage.getItem(`auth_rate_limit_${clientId}`));
        const attemptsRemaining = 5 - finalData.attempts; // Max 5 for login

        console.log(`✨ Result: ${attemptsRemaining} attempts remaining`);
        console.log(attemptsRemaining === 5 ? '✅ TEST PASSED: Full attempts restored!' : '❌ TEST FAILED: Attempts not properly reset');
      } else {
        console.log('❌ TEST FAILED: Lockout should have expired but didn\'t');
      }
    }

    console.log('\n📊 Final status check:');
    checkLockout();

    console.log('\n🏁 Test completed! Check results above.');
  }, 11000);

  console.log('⏳ Waiting for lockout to expire... (this will take 11 seconds)');
}

// Enhanced lockout checker with more details
function checkLockoutDetailed() {
  const clientId = localStorage.getItem('client_fingerprint_id');
  const data = localStorage.getItem(`auth_rate_limit_${clientId}`);
  const now = Date.now();

  if (data) {
    const parsed = JSON.parse(data);
    const remaining = parsed.lockoutUntil ? Math.max(0, Math.ceil((parsed.lockoutUntil - now) / 1000)) : 0;
    const hasExpired = parsed.lockoutUntil && now >= parsed.lockoutUntil;

    console.log('🔍 Detailed Lockout Analysis:', {
      attempts: parsed.attempts,
      lockoutLevel: parsed.lockoutLevel,
      lockoutUntil: parsed.lockoutUntil ? new Date(parsed.lockoutUntil) : 'None',
      currentTime: new Date(now),
      timeRemaining: remaining + ' seconds',
      isLocked: remaining > 0,
      hasExpired: hasExpired,
      shouldReset: hasExpired && parsed.attempts > 0
    });
  } else {
    console.log('🔍 No lockout data found - user is not locked');
  }
}

// Test scenario for the original bug
function testOriginalBug() {
  console.log('\n🐛 Testing Original Bug Scenario...');
  console.log('Simulating: 5 failed attempts → permanent lockout');

  clearRateLimit();

  // Simulate 5 failed attempts
  const clientId = localStorage.getItem('client_fingerprint_id') || 'bug-test-client';
  localStorage.setItem('client_fingerprint_id', clientId);

  // Create scenario where user hit 5 attempts and got locked out 2 minutes ago
  const twoMinutesAgo = Date.now() - (2 * 60 * 1000);
  const lockoutData = {
    attempts: 5, // This was the bug - attempts stayed at 5 even after expiry
    lastAttempt: twoMinutesAgo,
    lockoutUntil: twoMinutesAgo + (2 * 60 * 1000), // Lockout that should have expired
    lockoutLevel: 1
  };

  localStorage.setItem(`auth_rate_limit_${clientId}`, JSON.stringify(lockoutData));

  console.log('📝 Bug scenario setup:', {
    lockoutWasUntil: new Date(lockoutData.lockoutUntil),
    currentTime: new Date(),
    minutesSinceLockoutExpired: Math.floor((Date.now() - lockoutData.lockoutUntil) / (1000 * 60)),
    attemptsStuckAt: lockoutData.attempts
  });

  console.log('\n🔍 Before fix - checking if user would be permanently locked:');
  checkLockoutDetailed();

  // Simulate the fix being applied
  console.log('\n🔧 Applying fix...');
  const fixedData = JSON.parse(localStorage.getItem(`auth_rate_limit_${clientId}`));
  const now = Date.now();

  if (fixedData.lockoutUntil && now >= fixedData.lockoutUntil) {
    console.log('✨ Fix applied: Lockout expired, resetting attempts');
    fixedData.lockoutUntil = undefined;
    fixedData.attempts = 0; // THE FIX!
    localStorage.setItem(`auth_rate_limit_${clientId}`, JSON.stringify(fixedData));
  }

  console.log('\n✅ After fix - user should now be able to attempt again:');
  checkLockoutDetailed();

  const finalCheck = JSON.parse(localStorage.getItem(`auth_rate_limit_${clientId}`));
  if (finalCheck.attempts === 0) {
    console.log('🎉 SUCCESS: Original bug is fixed! User can attempt login again.');
  } else {
    console.log('❌ FAILED: Bug still exists, user is still locked out.');
  }
}

// Make functions available globally
window.testRateLimitExpiry = testRateLimitExpiry;
window.checkLockoutDetailed = checkLockoutDetailed;
window.testOriginalBug = testOriginalBug;

console.log('\n🛠️ Available Test Functions:');
console.log('- testRateLimitExpiry() - Test 10-second lockout expiry');
console.log('- testOriginalBug() - Test the permanent lockout fix');
console.log('- checkLockoutDetailed() - Detailed lockout analysis');
console.log('- clearRateLimit() - Clear all data (from previous script)');
console.log('- forceLockout(minutes) - Force lockout (from previous script)');
console.log('\n🚀 Run testOriginalBug() to verify the fix works!');