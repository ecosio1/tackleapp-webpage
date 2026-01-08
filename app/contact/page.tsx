/**
 * Contact Page
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us | Tackle - AI Fishing Assistant',
  description: 'Get in touch with the Tackle team. We would love to hear from you.',
  alternates: {
    canonical: generateCanonical('/contact'),
  },
};

export default function ContactPage() {
  return (
    <article>
      <header className="page-header">
        <h1>Contact Us</h1>
      </header>

      <p className="page-intro">
        We would love to hear from you! Whether you have questions, feedback, or suggestions,
        we are here to help.
      </p>

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

      <section className="primary-cta">
        <h2 className="cta-title">Download Tackle</h2>
        <p className="cta-copy">
          Haven't tried Tackle yet? Download the app and start getting personalized fishing advice
          for your location.
        </p>
        <Link href="/download" className="cta-button">
          Download Tackle for iPhone
        </Link>
      </section>
    </article>
  );
}

