/**
 * RegulationsBlock - Safe, neutral regulations reminder
 * No legal claims, no specific regulations data
 * Short and neutral tone
 */

'use client';

import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';
import { STATE_REGULATION_LINKS } from '@/lib/regLinks/stateRegLinks';

interface RegulationsBlockProps {
  stateCode?: string; // Optional state code (e.g., 'FL', 'TX')
  pageType: 'blog' | 'species' | 'how-to' | 'location';
  slug: string;
  className?: string;
}

export function RegulationsBlock({
  stateCode,
  pageType,
  slug,
  className = '',
}: RegulationsBlockProps) {
  const regulationLink = stateCode ? STATE_REGULATION_LINKS[stateCode] : null;

  const handleClick = () => {
    trackEvent('regulations_link_click', {
      pageType,
      slug,
      stateCode: stateCode || 'none',
      linkUrl: regulationLink?.url || '/locations',
    });
  };

  return (
    <div className={`regulations-block ${className}`}>
      <div className="border-t border-gray-200 pt-6 mt-8">
        <p className="text-sm text-gray-600 text-center">
          <span className="font-medium">See local regulations</span>
          {regulationLink ? (
            <>
              {' — '}
              <a
                href={regulationLink.url}
                onClick={handleClick}
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                {regulationLink.label}
              </a>
            </>
          ) : (
            <>
              {' — '}
              <Link
                href="/locations"
                onClick={handleClick}
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Find regulations for your area
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
