/**
 * Terms of Service Page
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import { LastUpdated } from '@/components/content/LastUpdated';

export const metadata: Metadata = {
  title: 'Terms of Service | Tackle - AI Fishing Assistant',
  description: 'Terms of service for Tackle - AI Fishing Assistant. Read our terms and conditions.',
  alternates: {
    canonical: generateCanonical('/terms'),
  },
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
        <LastUpdated date="2024-01-01" />
      </header>

      <div className="prose max-w-none">
        <section className="mb-8">
          <p className="text-lg text-gray-700 mb-6">
            Please read these Terms of Service carefully before using Tackle. By using our app 
            or website, you agree to be bound by these terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
          <p className="mb-4">
            By downloading, installing, or using Tackle, you agree to comply with and be bound 
            by these Terms of Service. If you do not agree to these terms, please do not use the app.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Use of the Service</h2>
          <h3 className="text-xl font-semibold mt-4 mb-2">Eligibility</h3>
          <p className="mb-4">
            You must be at least 13 years old to use Tackle. If you are under 18, you must have 
            parental consent to use the app.
          </p>

          <h3 className="text-xl font-semibold mt-4 mb-2">Permitted Use</h3>
          <p className="mb-4">
            You may use Tackle for personal, non-commercial purposes. You agree not to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Use the app for any illegal purpose</li>
            <li>Attempt to reverse engineer or extract source code</li>
            <li>Interfere with or disrupt the service</li>
            <li>Use automated systems to access the service</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Fishing Information Disclaimer</h2>
          <p className="mb-4">
            Tackle provides fishing forecasts, conditions, and advice based on available data 
            and algorithms. This information is for informational purposes only and should not 
            be considered a guarantee of fishing success or safety.
          </p>
          <p className="mb-4">
            <strong>Important:</strong> Always check local fishing regulations and obtain 
            necessary licenses before fishing. Regulations vary by location and change frequently. 
            Tackle is not responsible for violations of fishing regulations.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Intellectual Property</h2>
          <p className="mb-4">
            All content, features, and functionality of Tackle are owned by us and are protected 
            by copyright, trademark, and other intellectual property laws. You may not copy, 
            modify, or distribute any part of the app without our written permission.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
          <p className="mb-4">
            Tackle is provided "as is" without warranties of any kind. We are not liable for 
            any damages arising from your use of the app, including but not limited to:
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li>Inaccurate fishing forecasts or conditions</li>
            <li>Misidentification of fish species</li>
            <li>Loss of data or device malfunction</li>
            <li>Personal injury or property damage</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Changes to Terms</h2>
          <p className="mb-4">
            We reserve the right to modify these Terms of Service at any time. We will notify 
            users of material changes by updating the "Last Updated" date. Continued use of 
            the app after changes constitutes acceptance of the new terms.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <p className="mb-4">
            If you have questions about these Terms of Service, please contact us at{' '}
            <a href="/contact" className="text-blue-600 hover:text-blue-800">our contact page</a>.
          </p>
        </section>
      </div>
    </div>
  );
}


