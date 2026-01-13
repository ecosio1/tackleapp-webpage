/**
 * About Page - E-E-A-T signals and transparency
 */

import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { generateCanonical } from '@/lib/seo/canonical';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import styles from './about.module.css';

export const metadata: Metadata = {
  title: 'About Tackle - AI Fishing Assistant',
  description: 'Learn about Tackle, how we generate fishing insights, and our mission to help anglers catch more fish.',
  alternates: {
    canonical: generateCanonical('/about'),
  },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <header className="page-header">
          <h1>About Tackle</h1>
          <p className="page-intro">
            We're building the most helpful fishing assistant for anglers of all levels.
          </p>
        </header>

        <div className={styles.heroImage}>
          <Image
            src="https://images.unsplash.com/photo-1445363284150-a25e06aa2f92?w=1200&q=80"
            alt="Fishing on the water"
            width={1200}
            height={400}
            className={styles.image}
          />
        </div>

        <article>
          <section>
            <h2>Our Mission</h2>
            <p>
              Tackle is an AI-powered fishing assistant designed to help anglers of all levels catch more fish and enjoy their time on the water. We combine real-time weather data, tide information, and fishing insights to provide personalized recommendations for your location and target species.
            </p>
            <p>
              Our goal is to make fishing more accessible, successful, and enjoyable by providing accurate conditions, expert advice, and helpful tools—all in one app.
            </p>
          </section>

          <section>
            <h2>How We Generate Fishing Insights</h2>
            <p>
              Tackle uses multiple data sources to provide accurate fishing conditions and advice:
            </p>
            <ul>
              <li>
                <strong>Weather Data:</strong> Real-time weather conditions from NOAA and other trusted sources help us predict fishing conditions based on barometric pressure, wind, and temperature.
              </li>
              <li>
                <strong>Tide Information:</strong> Tide predictions and solunar data from NOAA help determine optimal fishing times for your location.
              </li>
              <li>
                <strong>Seasonal Patterns:</strong> Historical data and angler-reported patterns inform our understanding of when and where fish are most active.
              </li>
              <li>
                <strong>AI Summarization:</strong> Our AI helps organize and present information clearly, but all insights are based on real data and fishing knowledge. We never generate facts—only organize and explain them.
              </li>
              <li>
                <strong>Angler Feedback:</strong> Real-world experience from anglers and the fishing community informs our recommendations and helps us improve.
              </li>
            </ul>
          </section>

          <section>
            <h2>Data & AI Transparency</h2>
            <p>
              Tackle aggregates data from public, trusted sources:
            </p>
            <ul>
              <li>Weather and tide data from NOAA and other public sources</li>
              <li>Species information from scientific databases (FishBase, NOAA Fisheries)</li>
              <li>Fishing patterns from aggregated angler data and historical records</li>
              <li>AI is used to organize and present information, not to generate facts</li>
            </ul>
          </section>

          <section>
            <h2>Our Approach</h2>
            <p>
              We believe in:
            </p>
            <ul>
              <li><strong>Transparency:</strong> Clear about data sources and how AI is used</li>
              <li><strong>Accuracy:</strong> Fact-checked information with proper citations</li>
              <li><strong>Helpfulness:</strong> Focused on solving real angler problems</li>
              <li><strong>Education:</strong> Empowering anglers with knowledge, not hype</li>
              <li><strong>Respect:</strong> For the environment, regulations, and the fishing community</li>
            </ul>
          </section>

          <div className="cta-section">
            <h2>Ready to try Tackle?</h2>
            <p>Join thousands of anglers using Tackle to catch more fish.</p>
            <Link href="https://apps.apple.com/app/tackle" className="btn-primary" target="_blank">
              Download for iPhone
            </Link>
          </div>
        </article>
      </div>
      <Footer />
    </>
  );
}
