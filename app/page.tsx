/**
 * Home Page
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import Link from 'next/link';
import { PrimaryCTA } from '@/components/conversion/PrimaryCTA';

export const metadata: Metadata = {
  title: 'Tackle - AI Fishing Assistant | Never Fish Blind Again',
  description: 'Get real-time fishing conditions, AI fish identification, and expert advice. Download Tackle for iPhone and catch more fish.',
  alternates: {
    canonical: generateCanonical('/'),
  },
};

export default function HomePage() {
  return (
    <div className="home-page">
      <header className="site-header">
        <nav className="main-nav">
          <Link href="/" className="logo">Tackle</Link>
          <div className="nav-links">
            <Link href="/how-to">How-To Guides</Link>
            <Link href="/species">Species</Link>
            <Link href="/locations">Locations</Link>
            <Link href="/blog">Blog</Link>
            <Link href="/download" className="cta-link">Download</Link>
          </div>
        </nav>
      </header>

      <main className="home-main">
        <section className="hero">
          <h1>Tackle — AI Fishing Assistant</h1>
          <p className="hero-subtitle">
            Never fish blind again. Get real-time conditions, AI fish ID, and expert advice.
          </p>
          <PrimaryCTA
            title="Get Started"
            copy="Download Tackle for iPhone and start catching more fish today."
            buttonText="default"
            position="above_fold"
            pageType="blog"
            slug="home"
            className="my-8"
          />
        </section>

        <section className="features">
          <h2>Why Anglers Love Tackle</h2>
          <div className="features-grid">
            <div className="feature-item">
              <h3>99% Accurate Fish ID</h3>
              <p>Snap a photo, know your catch instantly</p>
            </div>
            <div className="feature-item">
              <h3>Daily Fishing Score</h3>
              <p>Get 0-100% conditions based on weather, tides & moon</p>
            </div>
            <div className="feature-item">
              <h3>AI Captain Chat</h3>
              <p>Ask "What bait should I use?" Get expert advice 24/7</p>
            </div>
          </div>
        </section>

        <section className="content-preview">
          <h2>Explore Our Guides</h2>
          <div className="preview-grid">
            <div className="preview-card">
              <h3><Link href="/how-to/best-fishing-times">Best Fishing Times</Link></h3>
              <p>Learn when to fish for maximum success</p>
            </div>
            <div className="preview-card">
              <h3><Link href="/species/snook">Snook Fishing Guide</Link></h3>
              <p>Complete guide to catching snook</p>
            </div>
            <div className="preview-card">
              <h3><Link href="/locations/fl/naples">Fishing in Naples</Link></h3>
              <p>Discover the best spots in Naples, Florida</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <nav className="footer-nav">
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
        <p>&copy; 2024 Tackle. All rights reserved.</p>
      </footer>
    </div>
  );
}


