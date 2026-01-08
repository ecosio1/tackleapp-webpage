/**
 * About Page - E-E-A-T signals and transparency
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { generateCanonical } from '@/lib/seo/canonical';

export const metadata: Metadata = {
  title: 'About Tackle - AI Fishing Assistant',
  description: 'Learn about Tackle, how we generate fishing insights, and our mission to help anglers catch more fish.',
  alternates: {
    canonical: generateCanonical('/about'),
  },
};

export default function AboutPage() {
  return (
    <div className="about-page">
      <article className="about-content">
        <h1>About Tackle</h1>
        
        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            Tackle is an AI-powered fishing assistant designed to help anglers of all levels catch more fish and enjoy their time on the water. We combine real-time weather data, tide information, and fishing insights to provide personalized recommendations for your location and target species.
          </p>
          <p>
            Our goal is to make fishing more accessible, successful, and enjoyable by providing accurate conditions, expert advice, and helpful tools—all in one app.
          </p>
        </section>

        <section className="about-section">
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
              <strong>Angler Feedback:</strong> Real-world experience from Florida anglers and the fishing community informs our recommendations and helps us improve.
            </li>
          </ul>
        </section>

        <section className="about-section">
          <h2>What Tackle Is (and Isn't)</h2>
          
          <div className="is-not-grid">
            <div className="is-column">
              <h3>What Tackle Is:</h3>
              <ul>
                <li>✅ An educational fishing tool</li>
                <li>✅ A conditions and forecast assistant</li>
                <li>✅ A fish identification aid</li>
                <li>✅ A catch logging and tracking system</li>
                <li>✅ A source of fishing tips and techniques</li>
                <li>✅ A helpful companion for anglers of all levels</li>
              </ul>
            </div>
            
            <div className="not-column">
              <h3>What Tackle Isn't:</h3>
              <ul>
                <li>❌ An official regulations source (always verify with state agencies)</li>
                <li>❌ A guaranteed catch tool (fishing success varies)</li>
                <li>❌ Legal or regulatory advice</li>
                <li>❌ A replacement for local knowledge and experience</li>
                <li>❌ A source of copied content (we create original explanations)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Data & AI Transparency</h2>
          
          <h3>How We Use Data</h3>
          <p>
            Tackle aggregates data from public, trusted sources:
          </p>
          <ul>
            <li>Weather and tide data from NOAA and other public sources</li>
            <li>Species information from scientific databases (FishBase, NOAA Fisheries)</li>
            <li>Fishing patterns from aggregated angler data and historical records</li>
            <li>AI is used to organize and present information, not to generate facts</li>
          </ul>
          
          <h3>Source Attribution</h3>
          <p>
            We believe in transparency:
          </p>
          <ul>
            <li>All factual claims are sourced from reputable sources</li>
            <li>Sources are cited on every page</li>
            <li>We never copy content verbatim from sources—we extract facts and create original explanations</li>
            <li>Sources are listed in a "Sources Consulted" section on every page</li>
          </ul>
          
          <h3>Update Frequency</h3>
          <ul>
            <li><strong>Conditions:</strong> Updated daily with real-time weather and tide data</li>
            <li><strong>Species Pages:</strong> Reviewed every 6-12 months for accuracy</li>
            <li><strong>Location Pages:</strong> Reviewed every 3-6 months for seasonal updates</li>
            <li><strong>Blog Posts:</strong> Updated as needed, with top performers refreshed quarterly</li>
          </ul>
        </section>

        <section className="about-section">
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

        <section className="about-section">
          <h2>Contact & Feedback</h2>
          <p>
            Have questions or feedback? We'd love to hear from you.
          </p>
          <ul>
            <li><Link href="/contact">Contact us</Link> with questions or suggestions</li>
            <li><Link href="/how-it-works">Learn how Tackle works</Link></li>
            <li>Report issues or suggest improvements</li>
          </ul>
        </section>

        <section className="about-section disclaimers">
          <h2>Important Disclaimers</h2>
          <div className="disclaimer-box">
            <p>
              <strong>Regulations:</strong> Tackle provides educational information only. Always verify fishing regulations with official state sources. Regulations change frequently and vary by location.
            </p>
            <p>
              <strong>Conditions:</strong> Fishing conditions are estimates based on available data. Actual conditions may vary. Fishing success depends on many factors beyond conditions.
            </p>
            <p>
              <strong>No Guarantees:</strong> No guarantees are made about fishing success. Fishing results vary based on many factors including skill, conditions, and luck.
            </p>
            <p>
              <strong>AI Usage:</strong> AI is used to organize and present information. All facts are sourced from real data. We do not generate fictional information.
            </p>
          </div>
        </section>
      </article>
    </div>
  );
}



