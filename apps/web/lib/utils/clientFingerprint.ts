/**
 * Client Fingerprinting Utility
 *
 * Creates a unique identifier for the client based on:
 * - Browser characteristics
 * - Screen resolution
 * - Timezone
 * - Language
 * - Platform information
 *
 * This helps prevent simple IP changes from bypassing rate limits
 */

interface FingerprintData {
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  colorDepth: number;
  deviceMemory?: number;
  hardwareConcurrency: number;
}

/**
 * Generate a unique client fingerprint
 */
export function generateClientFingerprint(): string {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return 'server-side-' + Math.random().toString(36).substring(2);
  }

  try {
    const data: FingerprintData = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      colorDepth: screen.colorDepth,
      deviceMemory: (navigator as any).deviceMemory, // Optional - not all browsers
      hardwareConcurrency: navigator.hardwareConcurrency,
    };

    // Create a hash from the fingerprint data
    const fingerprintString = JSON.stringify(data);
    return hashString(fingerprintString);

  } catch (error) {
    console.warn('Error generating client fingerprint:', error);
    // Fallback to a random ID if fingerprinting fails
    return 'fallback-' + Math.random().toString(36).substring(2);
  }
}

/**
 * Get or create a persistent client ID
 * Uses localStorage for persistence across sessions
 */
export function getClientId(): string {
  const STORAGE_KEY = 'client_fingerprint_id';

  if (typeof window === 'undefined') {
    return 'server-side-client';
  }

  try {
    // Try to get existing ID from localStorage
    let clientId = localStorage.getItem(STORAGE_KEY);

    if (!clientId) {
      // Generate new fingerprint-based ID
      const fingerprint = generateClientFingerprint();
      const timestamp = Date.now();
      clientId = `${fingerprint}_${timestamp}`;

      // Store in localStorage
      localStorage.setItem(STORAGE_KEY, clientId);
    }

    return clientId;

  } catch (error) {
    console.warn('Error accessing localStorage for client ID:', error);
    // Return session-based ID if localStorage fails
    return `session-${generateClientFingerprint()}`;
  }
}

/**
 * Simple hash function for fingerprint data
 * Using djb2 algorithm for consistent hashing
 */
function hashString(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get additional security context for enhanced fingerprinting
 */
export function getSecurityContext(): Record<string, any> {
  if (typeof window === 'undefined') {
    return { context: 'server-side' };
  }

  try {
    return {
      // Viewport size (different from screen resolution)
      viewport: `${window.innerWidth}x${window.innerHeight}`,

      // Available screen size (excluding taskbar, etc.)
      availableScreen: `${screen.availWidth}x${screen.availHeight}`,

      // Touch support detection
      touchSupport: 'ontouchstart' in window,

      // Connection information (if available)
      connection: (navigator as any).connection?.effectiveType || 'unknown',

      // Do Not Track setting
      doNotTrack: navigator.doNotTrack,

      // Cookie enabled
      cookieEnabled: navigator.cookieEnabled,

      // Online status
      onLine: navigator.onLine,

      // PDF viewer plugin detection
      pdfViewerEnabled: navigator.pdfViewerEnabled,

      // WebGL support detection
      webglSupport: detectWebGLSupport(),

      // Local storage availability
      localStorageAvailable: testLocalStorage(),
    };
  } catch (error) {
    console.warn('Error getting security context:', error);
    return { error: 'failed' };
  }
}

/**
 * Detect WebGL support for additional fingerprinting
 */
function detectWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    ));
  } catch {
    return false;
  }
}

/**
 * Test localStorage availability
 */
function testLocalStorage(): boolean {
  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create an enhanced client ID that includes security context
 */
export function getEnhancedClientId(): string {
  const basicId = getClientId();
  const securityContext = getSecurityContext();

  // Hash the security context for additional uniqueness
  const contextHash = hashString(JSON.stringify(securityContext));

  return `${basicId}_${contextHash}`;
}

/**
 * Validate that the client ID appears to be legitimate
 */
export function validateClientId(clientId: string): boolean {
  if (!clientId || typeof clientId !== 'string') {
    return false;
  }

  // Basic format validation
  const parts = clientId.split('_');
  if (parts.length < 2) {
    return false;
  }

  // Check for obvious manipulation attempts
  const suspiciousPatterns = [
    /^(undefined|null|test|debug|admin)/i,
    /[<>'"&]/,
    /^\d+$/,  // All numbers
  ];

  return !suspiciousPatterns.some(pattern => pattern.test(clientId));
}