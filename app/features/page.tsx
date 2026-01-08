/**
 * Features Page
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import { PrimaryCTA } from '@/components/conversion/PrimaryCTA';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Features | Tackle - AI Fishing Assistant',
  description: 'Discover all the features of Tackle - AI Fishing Assistant. Get real-time conditions, fish ID, and expert advice.',
  alternates: {
    canonical: generateCanonical('/features'),
  },
};

export default function FeaturesPage() {
  return (
    <article style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <header className="page-header" style={{ textAlign: 'center' }}>
        <h1>Tackle Features</h1>
        <p className="page-intro">
          Everything you need to catch more fish, all in one app.
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        <section style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
          <div style={{ flexShrink: 0, width: '64px', height: '64px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '2rem' }}>🎣</span>
          </div>
          <div>
            <h2>99% Accurate Fish ID</h2>
            <p>
              Snap a photo of any fish and get instant identification powered by advanced AI.
              Tackle can identify hundreds of fish species with remarkable accuracy, helping
              you learn about your catch and comply with regulations.
            </p>
            <ul>
              <li>Works offline for common species</li>
              <li>Provides species information and facts</li>
              <li>Helps with size and bag limit awareness</li>
            </ul>
          </div>
        </section>

        <section style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
          <div style={{ flexShrink: 0, width: '64px', height: '64px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '2rem' }}>📊</span>
          </div>
          <div>
            <h2>Daily Fishing Score</h2>
            <p>
              Get a 0-100% fishing score for your location every day. Our algorithm analyzes
              weather conditions, tides, moon phases, and seasonal patterns to give you a
              personalized forecast.
            </p>
            <ul>
              <li>Updated daily with current conditions</li>
              <li>Considers multiple environmental factors</li>
              <li>Helps you plan the best fishing days</li>
            </ul>
          </div>
        </section>

        <section style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
          <div style={{ flexShrink: 0, width: '64px', height: '64px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '2rem' }}>🤖</span>
          </div>
          <div>
            <h2>AI Captain Chat</h2>
            <p>
              Ask Tackle's AI Captain any fishing question and get expert advice 24/7.
              Whether you want to know what bait to use, where to fish, or how to improve
              your technique, the AI Captain has answers.
            </p>
            <ul>
              <li>Ask questions in natural language</li>
              <li>Get location-specific advice</li>
              <li>Learn techniques and strategies</li>
            </ul>
          </div>
        </section>

        <section style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
          <div style={{ flexShrink: 0, width: '64px', height: '64px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '2rem' }}>🌊</span>
          </div>
          <div>
            <h2>Real-Time Conditions</h2>
            <p>
              Access up-to-date information about tides, weather, water temperature, and more.
              All tailored to your exact location for the most relevant fishing conditions.
            </p>
            <ul>
              <li>Current tide charts and predictions</li>
              <li>Weather forecasts and conditions</li>
              <li>Water temperature and clarity data</li>
            </ul>
          </div>
        </section>

        <section style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem' }}>
          <div style={{ flexShrink: 0, width: '64px', height: '64px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '2rem' }}>📚</span>
          </div>
          <div>
            <h2>Fishing Guides & Resources</h2>
            <p>
              Access comprehensive guides on species, techniques, locations, and more.
              Learn from expert content designed to help you become a better angler.
            </p>
            <ul>
              <li>Species identification guides</li>
              <li>How-to guides and techniques</li>
              <li>Location-specific fishing information</li>
            </ul>
          </div>
        </section>
      </div>

      <section className="primary-cta" style={{ marginTop: '4rem' }}>
        <h2 className="cta-title">Ready to Get Started?</h2>
        <p className="cta-copy">
          Download Tackle today and start catching more fish with AI-powered assistance.
        </p>
        <PrimaryCTA
          title="Download Tackle for iPhone"
          copy="Get all these features and more in the Tackle app."
          buttonText="default"
          position="end"
          pageType="blog"
          slug="features"
        />
      </section>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link href="/how-it-works">
          Learn how Tackle works →
        </Link>
      </div>
    </article>
  );
}


