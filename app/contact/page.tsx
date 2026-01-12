/**
 * Contact Page
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import Image from 'next/image';
import styles from './contact.module.css';

export const metadata: Metadata = {
  title: 'Contact Us | Tackle - AI Fishing Assistant',
  description: 'Get in touch with the Tackle team. We would love to hear from you.',
  alternates: {
    canonical: generateCanonical('/contact'),
  },
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <div className={styles.container}>
        <header className="page-header">
          <h1>Contact Us</h1>
          <p className="page-intro">
            We would love to hear from you! Whether you have questions, feedback, or suggestions,
            we are here to help.
          </p>
        </header>

        <div className={styles.heroImage}>
          <Image
            src="https://images.unsplash.com/photo-1484156818044-c040be3be5d1?w=1200&q=80"
            alt="Contact Tackle Team"
            width={1200}
            height={400}
            className={styles.image}
          />
        </div>

        <article>
          <section>
            <h2>Get in Touch</h2>
            <p>
              For general inquiries, support, or feedback about Tackle, please reach out to us:
            </p>
            <ul>
              <li>Email: support@tackle.app (placeholder)</li>
              <li>Response time: We typically respond within 24-48 hours</li>
            </ul>
          </section>

          <section>
            <h2>Report an Issue</h2>
            <p>
              If you've found a bug or have a technical issue with the Tackle app, please include:
            </p>
            <ul>
              <li>Device type and iOS version</li>
              <li>Steps to reproduce the issue</li>
              <li>Screenshots if applicable</li>
            </ul>
          </section>

          <section>
            <h2>Content Feedback</h2>
            <p>
              Have suggestions for our fishing guides or blog content? We're always looking to improve
              and add value for anglers. Let us know what topics you'd like to see covered.
            </p>
          </section>

          <div className="cta-section">
            <h2>Download Tackle</h2>
            <p>
              Haven't tried Tackle yet? Download the app and start getting personalized fishing advice
              for your location.
            </p>
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

