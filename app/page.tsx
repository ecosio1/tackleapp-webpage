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
          <div className={styles.navLinks}>
            <Link href="/features">Features</Link>
            <Link href="/how-it-works">How It Works</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
          </div>
          <div className={styles.navRight}>
            <Link href="https://apps.apple.com/app/tackle" className={styles.btnPrimary} target="_blank">
              Download App
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Your AI-Powered<br />Fishing Assistant
            </h1>
            <p className={styles.heroDescription}>
              Get real-time conditions, instant fish ID, and expert advice—all in your pocket. Never fish blind again.
            </p>
            <div className={styles.heroButtons}>
              <Link href="https://apps.apple.com/app/tackle" className={styles.btnPrimary} target="_blank">
                Download for iPhone
              </Link>
              <Link href="/features" className={styles.btnSecondary}>
                Explore Features
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <Image
              src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80"
              alt="Person fishing at sunset"
              width={600}
              height={800}
              className={styles.heroImg}
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.features}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Everything you need to catch more fish</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureImage}>
                <Image
                  src="https://images.unsplash.com/photo-1508888123416-6b4d1c1186d3?w=800&q=80"
                  alt="Fish identification"
                  width={400}
                  height={300}
                  className={styles.cardImg}
                />
              </div>
              <div className={styles.featureContent}>
                <h3>99% Accurate Fish ID</h3>
                <p>Snap a photo and instantly identify any fish with advanced AI. Know your catch in seconds.</p>
              </div>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureImage}>
                <Image
                  src="https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80"
                  alt="Weather and conditions"
                  width={400}
                  height={300}
                  className={styles.cardImg}
                />
              </div>
              <div className={styles.featureContent}>
                <h3>Real-Time Conditions</h3>
                <p>Daily fishing scores based on weather, tides, and moon phases. Plan your perfect trip.</p>
              </div>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureImage}>
                <Image
                  src="https://images.unsplash.com/photo-1534943441045-1974ee2171e7?w=800&q=80"
                  alt="AI Assistant"
                  width={400}
                  height={300}
                  className={styles.cardImg}
                />
              </div>
              <div className={styles.featureContent}>
                <h3>AI Captain Chat</h3>
                <p>Get expert advice 24/7. Ask about bait, locations, techniques—your personal fishing guide.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>Ready to catch more fish?</h2>
          <p className={styles.ctaDescription}>
            Join thousands of anglers using Tackle to improve their fishing success.
          </p>
          <Link href="https://apps.apple.com/app/tackle" className={styles.btnPrimary} target="_blank">
            Download for iPhone
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerLinks}>
            <Link href="/features">Features</Link>
            <Link href="/about">About</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
          <p className={styles.footerCopy}>&copy; 2026 Tackle. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
