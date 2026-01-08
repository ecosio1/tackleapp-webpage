/**
 * Conversion utility functions
 */

interface AppStoreUrlParams {
  pageType: 'blog' | 'species' | 'how-to' | 'location';
  slug: string;
  location?: string;
  species?: string;
}

const APP_STORE_ID = process.env.NEXT_PUBLIC_APP_STORE_ID || 'YOUR_APP_ID';
const APP_STORE_BASE_URL = `https://apps.apple.com/app/id${APP_STORE_ID}`;

/**
 * Generate App Store URL with UTM parameters
 */
export function generateAppStoreUrl(params: AppStoreUrlParams): string {
  const { pageType, slug, location, species } = params;
  
  const utmParams = new URLSearchParams({
    utm_source: 'website',
    utm_medium: 'organic',
    utm_campaign: 'seo',
    utm_content: `${pageType}:${slug}`,
  });
  
  if (location) {
    utmParams.append('utm_term', location);
  }
  
  if (species) {
    utmParams.append('utm_term', species);
  }
  
  return `${APP_STORE_BASE_URL}?${utmParams.toString()}`;
}

/**
 * Detect iOS user agent
 */
export function isIOSUserAgent(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

/**
 * Generate QR code URL (for non-iOS users)
 */
export function generateQRCodeUrl(appStoreUrl: string): string {
  // Use a QR code service (e.g., qrcode.tec-it.com)
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(appStoreUrl)}`;
}

/**
 * Generate SMS link (optional)
 */
export function generateSMSLink(appStoreUrl: string): string {
  return `sms:?body=${encodeURIComponent(`Check out Tackle: ${appStoreUrl}`)}`;
}



