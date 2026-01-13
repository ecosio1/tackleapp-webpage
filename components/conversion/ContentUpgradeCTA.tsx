/**
 * ContentUpgradeCTA - Email capture for weekly fishing windows
 */

'use client';

import { useState, useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

interface ContentUpgradeCTAProps {
  location?: string;
  pageType: 'blog' | 'species' | 'how-to' | 'location';
  slug: string;
  className?: string;
}

export function ContentUpgradeCTA({
  location,
  pageType,
  slug,
  className = '',
}: ContentUpgradeCTAProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const headline = location
    ? `Want weekly fishing windows for ${location}?`
    : 'Want weekly fishing windows delivered to your inbox?';

  useEffect(() => {
    trackEvent('email_capture_view', {
      pageType,
      slug,
      location,
    });
  }, [pageType, slug, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Send to webhook endpoint
      const response = await fetch('/api/email-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          location,
          pageType,
          slug,
          source: 'content_upgrade',
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        trackEvent('email_capture_submit', {
          pageType,
          slug,
          location,
          success: true,
        });
      } else {
        throw new Error('Submission failed');
      }
    } catch (error) {
      trackEvent('email_capture_submit', {
        pageType,
        slug,
        location,
        success: false,
      });
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className={`content-upgrade-cta submitted ${className}`}>
        <p className="success-message">
          ✓ Check your email! We'll send you weekly fishing windows.
        </p>
      </div>
    );
  }

  return (
    <div className={`content-upgrade-cta ${className}`}>
      <h4 className="upgrade-headline">{headline}</h4>
      <p className="upgrade-copy">
        Get personalized fishing forecasts based on weather, tides, and moon phases.
      </p>
      <form onSubmit={handleSubmit} className="upgrade-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="upgrade-input"
        />
        <button type="submit" disabled={isSubmitting} className="upgrade-button">
          {isSubmitting ? 'Sending...' : 'Send me the forecast'}
        </button>
      </form>
      <p className="upgrade-consent">
        By submitting, you agree to receive weekly fishing forecasts. Unsubscribe anytime.
      </p>
    </div>
  );
}

