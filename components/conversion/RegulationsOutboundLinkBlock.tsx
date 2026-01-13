/**
 * RegulationsOutboundLinkBlock - Outbound link to official regulations
 */

'use client';

import { trackEvent } from '@/lib/analytics';
import { STATE_REGULATION_LINKS } from '@/lib/regLinks/stateRegLinks';

interface RegulationsOutboundLinkBlockProps {
  stateCode?: string; // e.g., 'FL', 'TX'
  pageType: 'blog' | 'species' | 'how-to' | 'location';
  slug: string;
  location?: string;
  className?: string;
}

export function RegulationsOutboundLinkBlock({
  stateCode,
  pageType,
  slug,
  location,
  className = '',
}: RegulationsOutboundLinkBlockProps) {
  const regulationLink = stateCode ? STATE_REGULATION_LINKS[stateCode] : null;

  const handleClick = () => {
    trackEvent('regulations_outbound_click', {
      pageType,
      slug,
      location,
      stateCode: stateCode || 'unknown',
      linkUrl: regulationLink?.url || '/locations',
    });
  };

  if (regulationLink) {
    return (
      <div className={`regulations-link-block ${className}`}>
        <h4 className="regulations-title">See local regulations</h4>
        <p className="regulations-copy">
          Regulations change—always verify with official sources.
        </p>
        <a
          href={regulationLink.url}
          onClick={handleClick}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="regulations-link"
        >
          <span className="link-icon">↗</span>
          {regulationLink.label}
        </a>
        {regulationLink.description && (
          <p className="regulations-description">{regulationLink.description}</p>
        )}
      </div>
    );
  }

  // Fallback: link to locations page
  return (
    <div className={`regulations-link-block ${className}`}>
      <h4 className="regulations-title">See local regulations</h4>
      <p className="regulations-copy">
        Regulations change—always verify with official sources.
      </p>
      <a
        href="/locations"
        onClick={handleClick}
        className="regulations-link"
      >
        Choose your state to view regulations
      </a>
    </div>
  );
}

