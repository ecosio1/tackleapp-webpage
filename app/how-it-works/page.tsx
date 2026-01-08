/**
 * How It Works Page
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import { PrimaryCTA } from '@/components/conversion/PrimaryCTA';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How It Works | Tackle - AI Fishing Assistant',
  description: 'Learn how Tackle uses AI and real-time data to help you catch more fish. See how our fishing assistant works.',
  alternates: {
    canonical: generateCanonical('/how-it-works'),
  },
};

export default function HowItWorksPage() {
  return (
    <article style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <header className="page-header" style={{ textAlign: 'center' }}>
        <h1>How Tackle Works</h1>
        <p className="page-intro">
          See how Tackle combines AI, real-time data, and expert knowledge to help you catch more fish.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flexShrink: 0, width: '48px', height: '48px', background: '#0066cc', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.25rem' }}>
              1
            </div>
            <h2>Get Your Daily Fishing Score</h2>
          </div>
          <div style={{ paddingLeft: '4rem' }}>
            <p>
              Every morning, Tackle analyzes current conditions for your location. We combine
              weather data, tide information, moon phases, and seasonal patterns to calculate
              your personalized fishing score (0-100%).
            </p>
            <p>
              The score helps you understand when conditions are optimal for fishing, so you can
              plan your trips for maximum success.
            </p>
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flexShrink: 0, width: '48px', height: '48px', background: '#0066cc', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.25rem' }}>
              2
            </div>
            <h2>Identify Fish Instantly</h2>
          </div>
          <div style={{ paddingLeft: '4rem' }}>
            <p>
              When you catch a fish, simply take a photo with Tackle. Our advanced AI instantly
              identifies the species with 99% accuracy, even for similar-looking fish.
            </p>
            <p>
              You'll get species information, common names, habitat details, and helpful facts
              about your catch—all in seconds.
            </p>
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flexShrink: 0, width: '48px', height: '48px', background: '#0066cc', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.25rem' }}>
              3
            </div>
            <h2>Ask the AI Captain</h2>
          </div>
          <div style={{ paddingLeft: '4rem' }}>
            <p>
              Have a fishing question? Just ask Tackle's AI Captain. Whether you want to know
              what bait works best for snook, where to find redfish, or how to improve your
              casting technique, you'll get expert advice tailored to your location.
            </p>
            <p>
              The AI Captain has knowledge about hundreds of species, techniques, and locations,
              and it's available 24/7.
            </p>
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flexShrink: 0, width: '48px', height: '48px', background: '#0066cc', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.25rem' }}>
              4
            </div>
            <h2>Access Real-Time Conditions</h2>
          </div>
          <div style={{ paddingLeft: '4rem' }}>
            <p>
              Tackle provides up-to-date information about tides, weather, water conditions, and
              more—all specific to your location. No more guessing about whether conditions are
              right for fishing.
            </p>
            <p>
              We pull data from trusted sources and present it in an easy-to-understand format,
              so you can make informed decisions about when and where to fish.
            </p>
          </div>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flexShrink: 0, width: '48px', height: '48px', background: '#0066cc', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.25rem' }}>
              5
            </div>
            <h2>Learn and Improve</h2>
          </div>
          <div style={{ paddingLeft: '4rem' }}>
            <p>
              Tackle includes comprehensive guides on species, techniques, and locations. Learn
              from expert content designed to help you become a better angler.
            </p>
            <p>
              Whether you're a beginner or experienced angler, Tackle helps you understand fishing
              better and catch more fish.
            </p>
          </div>
        </section>
      </div>

      <section className="primary-cta" style={{ marginTop: '4rem' }}>
        <h2 className="cta-title">Ready to Try Tackle?</h2>
        <p className="cta-copy">
          Download Tackle today and experience the future of fishing assistance.
        </p>
        <PrimaryCTA
          title="Download Tackle for iPhone"
          copy="Get started in seconds and start catching more fish."
          buttonText="default"
          position="end"
          pageType="blog"
          slug="how-it-works"
        />
      </section>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link href="/features">
          View All Features →
        </Link>
        <span style={{ color: '#666', margin: '0 1rem' }}>|</span>
        <Link href="/about">
          Learn About Tackle →
        </Link>
      </div>
    </article>
  );
}


