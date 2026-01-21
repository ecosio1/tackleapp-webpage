/**
 * AppStoreBadge - Official Apple App Store download badge
 * High-trust conversion element
 */

'use client';

import { trackEvent } from '@/lib/analytics';
import { generateAppStoreUrl } from '@/lib/conversion/utils';

interface AppStoreBadgeProps {
  pageType: 'blog' | 'species' | 'how-to' | 'location' | 'landing' | 'download' | 'nav';
  slug: string;
  location?: string;
  size?: 'small' | 'medium' | 'large';
  theme?: 'black' | 'white';
  className?: string;
}

const SIZES = {
  small: { width: 120, height: 40 },
  medium: { width: 150, height: 50 },
  large: { width: 180, height: 60 },
};

export function AppStoreBadge({
  pageType,
  slug,
  location,
  size = 'medium',
  theme = 'black',
  className = '',
}: AppStoreBadgeProps) {
  const appStoreUrl = generateAppStoreUrl({ pageType, slug, location });
  const { width, height } = SIZES[size];

  const handleClick = () => {
    trackEvent('appstore_badge_click', {
      pageType,
      slug,
      location,
      size,
      theme,
    });
  };

  // Official Apple App Store badge SVG
  const badgeSvg = theme === 'black' ? (
    <svg viewBox="0 0 120 40" width={width} height={height} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="badge-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1a1a" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
      </defs>
      <rect width="120" height="40" rx="6" fill="url(#badge-gradient)" />
      <rect x="0.5" y="0.5" width="119" height="39" rx="5.5" fill="none" stroke="rgba(255,255,255,0.2)" />

      {/* Apple Logo */}
      <path d="M24.5 20.5c0-2.1 1.1-3.9 2.8-5-.1-.1-.1-.2-.2-.3-1-1.4-2.5-2.2-4.2-2.2-1.8 0-3.4 1-4.3 1s-2.3-1-3.8-1c-2.9.1-5.6 2.4-5.6 6.1 0 2.4.9 4.9 2.1 6.5 1 1.4 2.2 2.9 3.8 2.9 1.5 0 2.1-1 3.9-1s2.4 1 3.9 1 2.6-1.4 3.6-2.8c.6-.9 1.1-1.8 1.4-2.8-2.2-.9-3.4-3-3.4-5.4zm-3.1-9.8c.9-1.1 1.4-2.5 1.2-3.9-1.2.1-2.7.8-3.6 1.9-.8.9-1.5 2.4-1.3 3.8 1.4.1 2.8-.7 3.7-1.8z" fill="#fff"/>

      {/* Text */}
      <text x="38" y="15" fill="#fff" fontSize="8" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif">Download on the</text>
      <text x="38" y="28" fill="#fff" fontSize="14" fontWeight="600" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif">App Store</text>
    </svg>
  ) : (
    <svg viewBox="0 0 120 40" width={width} height={height} xmlns="http://www.w3.org/2000/svg">
      <rect width="120" height="40" rx="6" fill="#ffffff" />
      <rect x="0.5" y="0.5" width="119" height="39" rx="5.5" fill="none" stroke="rgba(0,0,0,0.2)" />

      {/* Apple Logo */}
      <path d="M24.5 20.5c0-2.1 1.1-3.9 2.8-5-.1-.1-.1-.2-.2-.3-1-1.4-2.5-2.2-4.2-2.2-1.8 0-3.4 1-4.3 1s-2.3-1-3.8-1c-2.9.1-5.6 2.4-5.6 6.1 0 2.4.9 4.9 2.1 6.5 1 1.4 2.2 2.9 3.8 2.9 1.5 0 2.1-1 3.9-1s2.4 1 3.9 1 2.6-1.4 3.6-2.8c.6-.9 1.1-1.8 1.4-2.8-2.2-.9-3.4-3-3.4-5.4zm-3.1-9.8c.9-1.1 1.4-2.5 1.2-3.9-1.2.1-2.7.8-3.6 1.9-.8.9-1.5 2.4-1.3 3.8 1.4.1 2.8-.7 3.7-1.8z" fill="#000"/>

      {/* Text */}
      <text x="38" y="15" fill="#000" fontSize="8" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif">Download on the</text>
      <text x="38" y="28" fill="#000" fontSize="14" fontWeight="600" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif">App Store</text>
    </svg>
  );

  return (
    <a
      href={appStoreUrl}
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      className={`app-store-badge ${className}`}
      aria-label="Download on the App Store"
    >
      {badgeSvg}
    </a>
  );
}
