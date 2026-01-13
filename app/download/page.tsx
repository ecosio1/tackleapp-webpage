/**
 * Download Page - Optimized for iOS App Store conversions
 */

import { Metadata } from 'next';
import { generateAppStoreUrl, generateQRCodeUrl } from '@/lib/conversion/utils';
import { AppStorePreviewModule } from '@/components/conversion/AppStorePreviewModule';
import { SocialProofModule } from '@/components/conversion/SocialProofModule';
import { RegulationsOutboundLinkBlock } from '@/components/conversion/RegulationsOutboundLinkBlock';
import { DownloadButton } from '@/components/conversion/DownloadButton';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Download Tackle - AI Fishing Assistant for iPhone',
  description: 'Download Tackle, the AI-powered fishing assistant. Get real-time conditions, fish ID, and expert advice. Available on iPhone.',
  alternates: {
    canonical: 'https://tackleapp.ai/download',
  },
};

export default function DownloadPage() {
  const appStoreUrl = generateAppStoreUrl({
    pageType: 'blog',
    slug: 'download',
  });

  return (
    <div className="download-page">
      {/* Hero Section */}
      <section className="download-hero">
        <h1 className="download-title">Tackle — AI Fishing Assistant</h1>
        <p className="download-subtitle">
          Never fish blind again. Get real-time conditions, AI fish ID, and expert advice.
        </p>

        {/* Smart Download Button */}
        <DownloadButton appStoreUrl={appStoreUrl} />
      </section>

      {/* Value Props */}
      <section className="download-value-props">
        <h2 className="section-title">Why Anglers Love Tackle</h2>
        <ul className="value-list">
          <li className="value-item">
            <strong>99% Accurate Fish ID</strong> — Snap a photo, know your catch instantly
          </li>
          <li className="value-item">
            <strong>Daily Fishing Score</strong> — Get 0-100% conditions based on weather, tides & moon
          </li>
          <li className="value-item">
            <strong>AI Captain Chat</strong> — Ask "What bait should I use?" Get expert advice 24/7
          </li>
        </ul>
      </section>

      {/* App Screenshots */}
      <AppStorePreviewModule className="download-screenshots" />

      {/* How It Works */}
      <section className="download-how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-grid">
          <div className="step-item">
            <div className="step-number">1</div>
            <h3 className="step-title">Check Conditions</h3>
            <p className="step-copy">
              Get your daily fishing score and 7-day forecast based on weather, tides, and moon phases.
            </p>
          </div>
          <div className="step-item">
            <div className="step-number">2</div>
            <h3 className="step-title">Identify Fish</h3>
            <p className="step-copy">
              Snap a photo of any fish and get instant identification with size limits and fun facts.
            </p>
          </div>
          <div className="step-item">
            <div className="step-number">3</div>
            <h3 className="step-title">Get Advice</h3>
            <p className="step-copy">
              Ask the AI Captain anything. Get personalized recommendations for your location and target species.
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <SocialProofModule className="download-social-proof" />

      {/* FAQ */}
      <section className="download-faq">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-list">
          <div className="faq-item">
            <h3 className="faq-question">Is Tackle free to download?</h3>
            <p className="faq-answer">
              Yes, Tackle is free to download. Some premium features may be available as in-app purchases.
            </p>
          </div>
          <div className="faq-item">
            <h3 className="faq-question">What permissions does Tackle need?</h3>
            <p className="faq-answer">
              Tackle requests location permission to provide location-specific conditions and forecasts. Camera permission is needed for fish identification. All permissions are optional.
            </p>
          </div>
          <div className="faq-item">
            <h3 className="faq-question">Does Tackle work offline?</h3>
            <p className="faq-answer">
              Yes, core features like fish identification and catch logging work offline. Conditions and forecasts require internet connection.
            </p>
          </div>
          <div className="faq-item">
            <h3 className="faq-question">Is Tackle available for Android?</h3>
            <p className="faq-answer">
              Tackle is currently available for iPhone. Android version coming soon.
            </p>
          </div>
        </div>
      </section>

      {/* Regulations Notice */}
      <RegulationsOutboundLinkBlock
        stateCode="FL"
        pageType="blog"
        slug="download"
        className="download-regulations"
      />

      {/* Footer Links */}
      <footer className="download-footer">
        <nav className="footer-links">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/contact">Contact</a>
        </nav>
      </footer>
    </div>
  );
}


