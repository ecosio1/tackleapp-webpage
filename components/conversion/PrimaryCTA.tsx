/**
 * PrimaryCTA - Main call-to-action component
 * Used inline in content pages
 */

'use client';

import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';
import { generateAppStoreUrl } from '@/lib/conversion/utils';

interface PrimaryCTAProps {
  title?: string;
  copy?: string;
  buttonText?: 'default' | 'download' | 'get-tackle';
  secondaryLinkText?: string;
  secondaryLinkHref?: string;
  position?: 'above_fold' | 'mid' | 'end';
  pageType: 'blog' | 'species' | 'how-to' | 'location';
  slug: string;
  location?: string;
  species?: string;
  className?: string;
}

const DEFAULT_COPY = {
  title: 'Never Fish Blind Again',
  copy: 'Get real-time conditions, AI fish ID, and expert advice. Download Tackle for iPhone.',
  buttonText: {
    default: 'Get Tackle on iPhone',
    download: 'Download Tackle',
    'get-tackle': 'Get Tackle',
  },
  secondaryLink: {
    text: 'See how it works',
    href: '/how-it-works',
  },
};

export function PrimaryCTA({
  title = DEFAULT_COPY.title,
  copy = DEFAULT_COPY.copy,
  buttonText = 'default',
  secondaryLinkText = DEFAULT_COPY.secondaryLink.text,
  secondaryLinkHref = DEFAULT_COPY.secondaryLink.href,
  position = 'mid',
  pageType,
  slug,
  location,
  species,
  className = '',
}: PrimaryCTAProps) {
  const buttonLabel = DEFAULT_COPY.buttonText[buttonText];
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
      position,
      ctaType: 'primary',
      buttonText: buttonLabel,
    });
  };

  return (
    <div className={`primary-cta ${className}`}>
      <div className="cta-content">
        <h3 className="cta-title">{title}</h3>
        <p className="cta-copy">{copy}</p>
        <div className="cta-actions">
          <a
            href={appStoreUrl}
            onClick={handleClick}
            className="cta-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            {buttonLabel}
          </a>
          {secondaryLinkHref && (
            <Link href={secondaryLinkHref} className="cta-secondary-link">
              {secondaryLinkText}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}


