/**
 * Privacy Policy Page
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import { LastUpdated } from '@/components/content/LastUpdated';

export const metadata: Metadata = {
  title: 'Privacy Policy | Tackle - AI Fishing Assistant',
  description: 'Privacy policy for Tackle - AI Fishing Assistant. Learn how we collect, use, and protect your data.',
  alternates: {
    canonical: generateCanonical('/privacy'),
  },
};

export default function PrivacyPage() {
  return (
    <article>
      <header className="page-header">
        <h1>Privacy Policy</h1>
        <LastUpdated date="2024-01-01" />
      </header>

      <p className="page-intro">
        Your privacy is important to us. This Privacy Policy explains how Tackle collects,
        uses, and protects your information when you use our mobile application and website.
      </p>

      <section>
        <h2>Information We Collect</h2>
        <h3>Location Data</h3>
        <p>
          Tackle uses your location to provide personalized fishing conditions and forecasts.
          Location data is stored locally on your device and used to generate location-specific
          fishing advice. We do not share your precise location with third parties.
        </p>

        <h3>Photos</h3>
        <p>
          Photos you take for fish identification are processed on-device or through secure
          cloud services. Photos are not stored permanently unless you choose to save them
          in the app.
        </p>

        <h3>Usage Data</h3>
        <p>
          We may collect anonymous usage data to improve the app, such as which features are
          used most frequently. This data is aggregated and does not identify individual users.
        </p>
      </section>

      <section>
        <h2>How We Use Your Information</h2>
        <ul>
          <li>To provide personalized fishing forecasts and conditions</li>
          <li>To identify fish species from photos</li>
          <li>To improve app functionality and user experience</li>
          <li>To respond to support requests</li>
        </ul>
      </section>

      <section>
        <h2>Data Security</h2>
        <p>
          We implement appropriate security measures to protect your information. However,
          no method of transmission over the internet is 100% secure, and we cannot guarantee
          absolute security.
        </p>
      </section>

      <section>
        <h2>Third-Party Services</h2>
        <p>
          Tackle may use third-party services for analytics, crash reporting, and other
          functionality. These services have their own privacy policies governing data collection.
        </p>
      </section>

      <section>
        <h2>Your Rights</h2>
        <p>
          You have the right to:
        </p>
        <ul>
          <li>Access your personal data</li>
          <li>Request deletion of your data</li>
          <li>Opt out of certain data collection</li>
          <li>Request a copy of your data</li>
        </ul>
      </section>

      <section>
        <h2>Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any
          material changes by posting the new policy on this page and updating the "Last Updated" date.
        </p>
      </section>

      <section>
        <h2>Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at{' '}
          <a href="/contact">our contact page</a>.
        </p>
      </section>
    </article>
  );
}


