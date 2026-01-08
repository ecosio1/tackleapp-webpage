/**
 * StickyBottomCTA - Mobile sticky CTA that appears after scroll
 */

'use client';

import { useEffect, useState } from 'react';
import { trackEvent } from '@/lib/analytics';
import { generateAppStoreUrl } from '@/lib/conversion/utils';

interface StickyBottomCTAProps {
  pageType: 'blog' | 'species' | 'how-to' | 'location';
  slug: string;
  location?: string;
  species?: string;
  scrollThreshold?: number; // Percentage to trigger (default: 25)
}

const DISMISS_STORAGE_KEY = 'tackle_sticky_cta_dismissed';

export function StickyBottomCTA({
  pageType,
  slug,
  location,
  species,
  scrollThreshold = 25,
}: StickyBottomCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the CTA before
    const dismissed = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    const handleScroll = () => {
      const scrollPercent =
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

      if (scrollPercent >= scrollThreshold && !isVisible && !isDismissed) {
        setIsVisible(true);
        trackEvent('cta_view', {
          pageType,
          slug,
          location,
          species,
          position: 'sticky',
          ctaType: 'sticky_bottom',
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollThreshold, isVisible, isDismissed, pageType, slug, location, species]);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem(DISMISS_STORAGE_KEY, 'true');
    trackEvent('cta_dismiss', {
      pageType,
      slug,
      location,
      species,
      position: 'sticky',
      ctaType: 'sticky_bottom',
    });
  };

  if (!isVisible || isDismissed) return null;

  const appStoreUrl = generateAppStoreUrl({
    pageType,
    slug,
    location,
    species,
  });

  const handleClick = () => {
    trackEvent('cta_click', {
      pageType,
      slug,
      location,
      species,
      position: 'sticky',
      ctaType: 'sticky_bottom',
    });
  };

  return (
    <div className="sticky-bottom-cta">
      <button
        onClick={handleDismiss}
        className="sticky-cta-close"
        aria-label="Close"
        title="Close"
      >
        ×
      </button>
      <div className="sticky-cta-content">
        <p className="sticky-cta-text">Personalized fishing advice for your location.</p>
        <a
          href={appStoreUrl}
          onClick={handleClick}
          className="sticky-cta-button"
          target="_blank"
          rel="noopener noreferrer"
        >
          Get Tackle
        </a>
      </div>
    </div>
  );
}


