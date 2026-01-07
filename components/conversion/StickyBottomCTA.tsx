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

export function StickyBottomCTA({
  pageType,
  slug,
  location,
  species,
  scrollThreshold = 25,
}: StickyBottomCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercent =
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

      if (scrollPercent >= scrollThreshold && !isVisible) {
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
  }, [scrollThreshold, isVisible, pageType, slug, location, species]);

  if (!isVisible) return null;

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


