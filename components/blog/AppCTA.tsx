/**
 * AppCTA - Reusable CTA block for blog posts
 * Emphasizes personalization and real-time conditions (tide/wind/location)
 * Non-aggressive, helpful tone
 */

'use client';

import Link from 'next/link';
import { trackEvent } from '@/lib/analytics';
import { generateAppStoreUrl } from '@/lib/conversion/utils';

import { CTA } from '@/scripts/pipeline/types';

interface AppCTAProps {
  position?: 'top' | 'end';
  pageType: 'blog' | 'species' | 'how-to' | 'location';
  slug: string;
  location?: string;
  className?: string;
  cta?: CTA; // Optional structured CTA data (if provided, uses custom copy)
}

const CTA_COPY = {
  top: {
    title: 'Get Personalized Fishing Advice',
    copy: 'Want real-time conditions for your exact location? Tackle provides live tide data, wind forecasts, and AI-powered fishing advice tailored to where you fish.',
    buttonText: 'Get Tackle on iPhone',
  },
  end: {
    title: 'Never Fish Blind Again',
    copy: 'Download Tackle to get real-time tide charts, wind conditions, and personalized fishing advice for your location. Know before you go.',
    buttonText: 'Download Tackle',
  },
};

export function AppCTA({
  position = 'end',
  pageType,
  slug,
  location,
  className = '',
  cta,
}: AppCTAProps) {
  // Use structured CTA data if provided, otherwise fallback to default copy
  const copy = cta?.title && cta?.copy && cta?.buttonText
    ? {
        title: cta.title,
        copy: cta.copy,
        buttonText: cta.buttonText,
      }
    : CTA_COPY[position];
  
  // Use location from CTA if provided, otherwise use prop
  const effectiveLocation = cta?.location || location;
  
  const appStoreUrl = generateAppStoreUrl({
    pageType,
    slug,
    location: effectiveLocation,
  });

  const handleClick = () => {
    trackEvent('cta_click', {
      pageType,
      slug,
      location,
      position,
      ctaType: 'app_cta',
      buttonText: copy.buttonText,
    });
  };

  return (
    <div className={`app-cta-block ${className}`}>
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 md:p-8 border border-blue-100 shadow-sm">
        <div className="max-w-2xl mx-auto text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            {copy.title}
          </h3>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            {copy.copy}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={appStoreUrl}
              onClick={handleClick}
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              {copy.buttonText}
            </a>
            <Link
              href="/how-it-works"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm underline"
            >
              See how it works
            </Link>
          </div>
          <div className="mt-6 text-sm text-gray-600">
            <p>✓ Real-time tide charts • ✓ Wind & weather forecasts • ✓ AI fish identification</p>
          </div>
        </div>
      </div>
    </div>
  );
}
