/**
 * A/B Testing Utility
 * Simple cookie-based variant assignment
 */

/**
 * Get A/B test variant
 */
export function getVariant(testName: string): 'A' | 'B' {
  if (typeof window === 'undefined') return 'A';
  
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`ab_${testName}=`));
  
  if (cookie) {
    return cookie.split('=')[1] as 'A' | 'B';
  }
  
  // Random assignment (50/50 split)
  const variant = Math.random() < 0.5 ? 'A' : 'B';
  document.cookie = `ab_${testName}=${variant}; path=/; max-age=2592000`; // 30 days
  return variant;
}

/**
 * Track A/B test exposure
 */
export function trackABTest(testName: string, variant: 'A' | 'B', eventName: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ab_test: testName,
      variant,
    });
  }
}



