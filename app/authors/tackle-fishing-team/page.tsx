/**
 * Author Page - Tackle Fishing Team
 * Used for E-E-A-T signals and author schema
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { generateCanonical } from '@/lib/seo/canonical';

export const metadata: Metadata = {
  title: 'Tackle Fishing Team - About Our Authors',
  description: 'Learn about the Tackle Fishing Team, our experience, and our approach to creating helpful fishing content.',
  alternates: {
    canonical: generateCanonical('/authors/tackle-fishing-team'),
  },
};

export default function AuthorPage() {
  return (
    <div className="author-page">
      <article className="author-content">
        <h1>Tackle Fishing Team</h1>
        
        <section className="author-bio">
          <h2>About</h2>
          <p>
            The Tackle Fishing Team is a collective of anglers, data scientists, and fishing enthusiasts dedicated to making fishing more accessible and successful for everyone.
          </p>
          <p>
            Built by anglers using data-driven fishing insights and real-world experience, our team combines decades of combined fishing knowledge with modern technology to help you catch more fish.
          </p>
        </section>

        <section className="author-experience">
          <h2>Experience</h2>
          <p>
            Our team combines:
          </p>
          <ul>
            <li>
              <strong>Fishing Experience:</strong> Decades of combined fishing experience in Florida and beyond, from inshore flats to offshore waters
            </li>
            <li>
              <strong>Data-Driven Insights:</strong> Weather, tide, and fishing pattern analysis from trusted sources
            </li>
            <li>
              <strong>Real-World Testing:</strong> Continuous testing and feedback from anglers using Tackle
            </li>
            <li>
              <strong>Community Learning:</strong> Continuous learning from the fishing community and angler feedback
            </li>
          </ul>
        </section>

        <section className="author-approach">
          <h2>Our Approach</h2>
          <p>
            We believe in:
          </p>
          <ul>
            <li>
              <strong>Transparency:</strong> Clear about data sources and how AI is used to organize information
            </li>
            <li>
              <strong>Accuracy:</strong> Fact-checked information with proper citations to reputable sources
            </li>
            <li>
              <strong>Helpfulness:</strong> Focused on solving real angler problems, not generating clicks
            </li>
            <li>
              <strong>Education:</strong> Empowering anglers with knowledge and tools, not hype or false promises
            </li>
            <li>
              <strong>Respect:</strong> For the environment, fishing regulations, and the angling community
            </li>
          </ul>
        </section>

        <section className="author-content-process">
          <h2>How We Create Content</h2>
          <p>
            All content published by Tackle Fishing Team follows strict editorial standards:
          </p>
          <ul>
            <li>
              <strong>Fact-Based:</strong> All information is sourced from reputable sources (NOAA, FWC, scientific databases)
            </li>
            <li>
              <strong>Original Explanations:</strong> We extract facts and create original explanations—never copy content verbatim
            </li>
            <li>
              <strong>Quality Gates:</strong> All content must pass quality checks for word count, structure, and accuracy
            </li>
            <li>
              <strong>Regular Updates:</strong> Content is reviewed and updated regularly to ensure accuracy
            </li>
            <li>
              <strong>Source Attribution:</strong> All sources are cited on every page
            </li>
          </ul>
        </section>

        <section className="author-disclaimer">
          <h2>Disclaimer</h2>
          <div className="disclaimer-box">
            <p>
              Content published by Tackle Fishing Team is for educational purposes only. We are not a regulatory authority and do not provide legal or regulatory advice.
            </p>
            <p>
              Always verify fishing regulations with official state sources. Fishing conditions are estimates based on available data—actual conditions may vary.
            </p>
            <p>
              No guarantees are made about fishing success. Fishing results depend on many factors including skill, conditions, equipment, and luck.
            </p>
          </div>
        </section>

        <section className="author-contact">
          <h2>Contact</h2>
          <p>
            Questions or feedback? <Link href="/contact">Contact us</Link>.
          </p>
          <p>
            Want to learn more? <Link href="/about">Learn about Tackle</Link>.
          </p>
        </section>
      </article>
    </div>
  );
}


