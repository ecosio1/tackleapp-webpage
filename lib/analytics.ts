/**
 * Analytics event tracking utility
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

interface EventParams {
  pageType?: string;
  slug?: string;
  location?: string;
  species?: string;
  position?: string;
  ctaType?: string;
  buttonText?: string;
  isIOS?: boolean;
  buttonLocation?: string;
  linkUrl?: string;
  stateCode?: string;
  success?: boolean;
  [key: string]: any;
}

/**
 * Track event to GA4
 */
export function trackEvent(eventName: string, params: EventParams = {}) {
  if (typeof window === 'undefined') return;
  
  if (window.gtag) {
    window.gtag('event', eventName, {
      ...params,
      timestamp: new Date().toISOString(),
    });
  } else {
    // Fallback: log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Event tracked:', eventName, params);
    }
  }
}

/**
 * Track page view
 */
export function trackPageView(path: string, title?: string) {
  if (typeof window === 'undefined') return;
  
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
    });
  }
}


