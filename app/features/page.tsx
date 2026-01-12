/**
 * Features Page
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import styles from './features.module.css';

export const metadata: Metadata = {
  title: 'Features | Tackle - AI Fishing Assistant',
  description: 'Discover all the features of Tackle - AI Fishing Assistant. Get real-time conditions, fish ID, and expert advice.',
  alternates: {
    canonical: generateCanonical('/features'),
  },
};

export default function FeaturesPage() {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <header className="page-header">
          <h1>Tackle Features</h1>
          <p className="page-intro">
            Everything you need to catch more fish, all in one app.
          </p>
        </header>

        <div className={styles.featuresGrid}>
          {/* Feature 1 */}
          <div className={styles.featureCard}>
            <div className={styles.featureImage}>
              <Image
                src="https://images.unsplash.com/photo-1524704796725-9fc3044a58b1?w=800&q=80"
                alt="AI Fish Identification"
                width={400}
                height={300}
                className={styles.image}
              />
            </div>
            <div className={styles.featureContent}>
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
          </div>

          {/* Feature 2 */}
          <div className={styles.featureCard}>
            <div className={styles.featureImage}>
              <Image
                src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80"
                alt="Daily Fishing Score"
                width={400}
                height={300}
                className={styles.image}
              />
            </div>
            <div className={styles.featureContent}>
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
          </div>

          {/* Feature 3 */}
          <div className={styles.featureCard}>
            <div className={styles.featureImage}>
              <Image
                src="https://images.unsplash.com/photo-1534943441045-1974ee2171e7?w=800&q=80"
                alt="AI Captain Chat"
                width={400}
                height={300}
                className={styles.image}
              />
            </div>
            <div className={styles.featureContent}>
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
          </div>

          {/* Feature 4 */}
          <div className={styles.featureCard}>
            <div className={styles.featureImage}>
              <Image
                src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80"
                alt="Real-Time Conditions"
                width={400}
                height={300}
                className={styles.image}
              />
            </div>
            <div className={styles.featureContent}>
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
          </div>

          {/* Feature 5 */}
          <div className={styles.featureCard}>
            <div className={styles.featureImage}>
              <Image
                src="https://images.unsplash.com/photo-1466354424719-343280fe118b?w=800&q=80"
                alt="Fishing Guides & Resources"
                width={400}
                height={300}
                className={styles.image}
              />
            </div>
            <div className={styles.featureContent}>
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
          </div>

          {/* Feature 6 */}
          <div className={styles.featureCard}>
            <div className={styles.featureImage}>
              <Image
                src="https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80"
                alt="Fishing Analytics"
                width={400}
                height={300}
                className={styles.image}
              />
            </div>
            <div className={styles.featureContent}>
              <h2>Track Your Catches</h2>
              <p>
                Log your catches, track patterns, and analyze your fishing success over time.
                See which conditions, locations, and techniques work best for you.
              </p>
              <ul>
                <li>Photo logging with automatic species detection</li>
                <li>Weather and location data for each catch</li>
                <li>Personal statistics and insights</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="cta-section">
          <h2>Ready to Get Started?</h2>
          <p>
            Download Tackle today and start catching more fish with AI-powered assistance.
          </p>
          <Link href="https://apps.apple.com/app/tackle" className="btn-primary" target="_blank">
            Download for iPhone
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}
