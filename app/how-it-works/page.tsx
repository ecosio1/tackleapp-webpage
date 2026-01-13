/**
 * How It Works Page
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import styles from './how-it-works.module.css';

export const metadata: Metadata = {
  title: 'How It Works | Tackle - AI Fishing Assistant',
  description: 'Learn how Tackle uses AI and real-time data to help you catch more fish. See how our fishing assistant works.',
  alternates: {
    canonical: generateCanonical('/how-it-works'),
  },
};

export default function HowItWorksPage() {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <header className="page-header">
          <h1>How Tackle Works</h1>
          <p className="page-intro">
            See how Tackle combines AI, real-time data, and expert knowledge to help you catch more fish.
          </p>
        </header>

        {/* Step 1 */}
        <section className={styles.step}>
          <div className={styles.stepContent}>
            <div className={styles.stepNumber}>01</div>
            <div className={styles.stepText}>
              <h2>Get Your Daily Fishing Score</h2>
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
          </div>
          <div className={styles.stepImage}>
            <Image
              src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1000&q=80"
              alt="Fishing conditions and weather"
              width={600}
              height={450}
              className={styles.image}
            />
          </div>
        </section>

        {/* Step 2 */}
        <section className={`${styles.step} ${styles.stepReverse}`}>
          <div className={styles.stepImage}>
            <Image
              src="https://images.unsplash.com/photo-1524704796725-9fc3044a58b1?w=1000&q=80"
              alt="Fish identification"
              width={600}
              height={450}
              className={styles.image}
            />
          </div>
          <div className={styles.stepContent}>
            <div className={styles.stepNumber}>02</div>
            <div className={styles.stepText}>
              <h2>Identify Fish Instantly</h2>
              <p>
                When you catch a fish, simply take a photo with Tackle. Our advanced AI instantly
                identifies the species with 99% accuracy, even for similar-looking fish.
              </p>
              <p>
                You'll get species information, common names, habitat details, and helpful facts
                about your catch—all in seconds.
              </p>
            </div>
          </div>
        </section>

        {/* Step 3 */}
        <section className={styles.step}>
          <div className={styles.stepContent}>
            <div className={styles.stepNumber}>03</div>
            <div className={styles.stepText}>
              <h2>Ask the AI Captain</h2>
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
          </div>
          <div className={styles.stepImage}>
            <Image
              src="https://images.unsplash.com/photo-1534943441045-1974ee2171e7?w=1000&q=80"
              alt="Person fishing with mobile app"
              width={600}
              height={450}
              className={styles.image}
            />
          </div>
        </section>

        {/* Step 4 */}
        <section className={`${styles.step} ${styles.stepReverse}`}>
          <div className={styles.stepImage}>
            <Image
              src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1000&q=80"
              alt="Real-time fishing conditions"
              width={600}
              height={450}
              className={styles.image}
            />
          </div>
          <div className={styles.stepContent}>
            <div className={styles.stepNumber}>04</div>
            <div className={styles.stepText}>
              <h2>Access Real-Time Conditions</h2>
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
          </div>
        </section>

        {/* Step 5 */}
        <section className={styles.step}>
          <div className={styles.stepContent}>
            <div className={styles.stepNumber}>05</div>
            <div className={styles.stepText}>
              <h2>Learn and Improve</h2>
              <p>
                Tackle includes comprehensive guides on species, techniques, and locations. Learn
                from expert content designed to help you become a better angler.
              </p>
              <p>
                Whether you're a beginner or experienced angler, Tackle helps you understand fishing
                better and catch more fish.
              </p>
            </div>
          </div>
          <div className={styles.stepImage}>
            <Image
              src="https://images.unsplash.com/photo-1466354424719-343280fe118b?w=1000&q=80"
              alt="Fishing education and learning"
              width={600}
              height={450}
              className={styles.image}
            />
          </div>
        </section>

        <div className="cta-section">
          <h2>Ready to Try Tackle?</h2>
          <p>
            Download Tackle today and experience the future of fishing assistance.
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
