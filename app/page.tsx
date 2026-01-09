/**
 * Home Page - Landing Page
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import Link from 'next/link';
import Image from 'next/image';
import styles from './landing.module.css';

export const metadata: Metadata = {
  title: 'Tackle - AI Fishing Assistant | Never Fish Blind Again',
  description: 'Get real-time fishing conditions, AI fish identification, and expert advice. Download Tackle for iPhone and catch more fish.',
  alternates: {
    canonical: generateCanonical('/'),
  },
};

export default function HomePage() {
  return (
    <div className={styles.body}>
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <div className={styles.logo}>
            <Image src="/logo.png" alt="Tackle Logo" className={styles.logoImg} width={40} height={40} />
            <span className={styles.logoText}>tackle.</span>
          </div>
          <div className={styles.navRight}>
            <Link href="https://apps.apple.com/app/tackle" className={styles.btn3d} target="_blank">
              Download on App Store
            </Link>
          </div>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.interactiveDemo}>
            <div className={styles.phone3d}>
              <div className={styles.phoneContainer}>
                <div className={styles.phoneFace}>
                  <div className={styles.phoneScreen}>
                    <div className={styles.videoCarousel}>
                      <div className={styles.carouselContainer}>
                        <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
                          <source src="/weather-video.mp4" type="video/mp4" />
                        </video>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.heroContentArea}>
            <h1>
              Turn Your Phone Into The Ultimate <span className={styles.glitch}>Fishing</span> Tool
            </h1>
            <p>AI-powered fish identification, real-time conditions, and expert advice. Never fish blind again.</p>

            <div className={styles.heroFeaturesGrid}>
              <div className={styles.heroFeature}>
                <h3>
                  <svg className={styles.heroIcon} viewBox="0 0 24 24">
                    <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                    <path d="M22 10a3 3 0 0 0-3-3v.5a2.5 2.5 0 0 1-2.4 2.48" />
                    <path d="m7 13 4.93 2.93a2 2 0 0 0 2.07 0L19 13" />
                  </svg>
                  99% Accurate Fish ID
                </h3>
                <p>Snap a photo, know your catch instantly with advanced AI</p>
              </div>
              <div className={styles.heroFeature}>
                <h3>
                  <svg className={styles.heroIcon} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12,6 12,12 16,14" />
                  </svg>
                  Daily Fishing Score
                </h3>
                <p>Get 0-100% fishing conditions based on weather, tides & moon phases</p>
              </div>
              <div className={styles.heroFeature}>
                <h3>
                  <svg className={styles.heroIcon} viewBox="0 0 24 24">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  7-Day Forecasts
                </h3>
                <p>Plan your fishing trips with confidence using detailed predictions</p>
              </div>
              <div className={styles.heroFeature}>
                <h3>
                  <svg className={styles.heroIcon} viewBox="0 0 24 24">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    <path d="M9 10h6" />
                    <path d="M9 14h3" />
                  </svg>
                  AI Captain Chat
                </h3>
                <p>Ask &quot;What bait should I use?&quot; - get expert advice 24/7</p>
              </div>
            </div>

            <div className={styles.ctaButtons}>
              <Link href="https://apps.apple.com/app/tackle" className={styles.btn3d} target="_blank">
                Download on App Store
              </Link>
              <Link href="#" className={`${styles.btn3d} ${styles.secondary}`}>
                Coming to Android
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
