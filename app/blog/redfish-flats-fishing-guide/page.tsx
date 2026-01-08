/**
 * Blog Post: Redfish Flats Fishing Guide
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import { PrimaryCTA } from '@/components/conversion/PrimaryCTA';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { AuthorSchema } from '@/components/seo/AuthorSchema';
import { LastUpdated } from '@/components/content/LastUpdated';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Redfish Flats Fishing: Complete Guide | Expert Tips',
  description: 'Master the art of sight-fishing for redfish on the flats. Learn techniques, tackle, and strategies from experienced anglers.',
  alternates: {
    canonical: generateCanonical('/blog/redfish-flats-fishing-guide'),
  },
};

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Blog', url: '/blog' },
  { name: 'Redfish Flats Fishing Guide', url: '/blog/redfish-flats-fishing-guide' },
];

export default function BlogPostPage() {
  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <AuthorSchema
        name="Tackle Fishing Team"
        url="/authors/tackle-fishing-team"
      />

      <article>
        <nav style={{ marginBottom: '1rem', fontSize: '0.875rem', color: '#666' }}>
          <Link href="/">Home</Link>
          {' / '}
          <Link href="/blog">Blog</Link>
          {' / '}
          <span>Redfish Flats Fishing Guide</span>
        </nav>

        <header className="page-header">
          <h1>Redfish Flats Fishing: Complete Guide</h1>
          <div className="last-updated">
            <LastUpdated date="2024-01-10" />
          </div>
        </header>

        <p className="page-intro">
          Sight-fishing for redfish on the flats is one of the most exciting and rewarding
          forms of inshore fishing. This guide covers everything you need to know to successfully
          target redfish in shallow water.
        </p>

        <section>
          <h2>Understanding Flats Fishing</h2>
          <p>
            Flats fishing involves targeting fish in shallow water, typically 1-4 feet deep.
            Redfish are well-suited to this environment, where they feed on crabs, shrimp, and
            small baitfish. The key to success is spotting fish before they spot you.
          </p>
        </section>

        <section>
          <h2>Essential Equipment</h2>
          <p>
            For flats fishing, you'll need:
          </p>
          <ul>
            <li>Light to medium spinning or fly rod (7-8 feet)</li>
            <li>Quality polarized sunglasses (essential for spotting fish)</li>
            <li>Light line (10-15 lb test)</li>
            <li>Shallow draft boat or kayak (or wade fishing gear)</li>
          </ul>
        </section>

        <section>
          <h2>Spotting Redfish</h2>
          <p>
            Redfish on the flats are often visible by their "tailing" behavior—when they feed
            with their heads down, their tails break the surface. Look for:
          </p>
          <ul>
            <li>Tail tips breaking the water</li>
            <li>Mud clouds from feeding activity</li>
            <li>Shadows or dark shapes moving in shallow water</li>
            <li>V-wakes from cruising fish</li>
          </ul>

          <p>
            For more information about redfish behavior and habitat, check out our{' '}
            <Link href="/species/redfish">complete redfish guide</Link>.
          </p>
        </section>

        <section>
          <h2>Best Techniques</h2>
          <p>
            When you spot a redfish, approach quietly and make a well-placed cast ahead of the
            fish's path. Soft plastics, topwater lures, and flies all work well, depending on
            conditions and fish behavior.
          </p>
        </section>

        <PrimaryCTA
          title="Get Redfish Fishing Conditions"
          copy="Use Tackle to get daily fishing scores and conditions for redfish fishing in your area."
          buttonText="default"
          position="end"
          pageType="blog"
          slug="redfish-flats-fishing-guide"
        />

        <section className="related-content">
          <h2>Related Content</h2>
          <ul>
            <li>
              <Link href="/species/redfish">Complete Redfish Guide</Link>
            </li>
            <li>
              <Link href="/how-to/best-fishing-times">Best Fishing Times</Link>
            </li>
            <li>
              <Link href="/locations/fl/tampa">Fishing in Tampa</Link>
            </li>
          </ul>
        </section>
      </article>
    </>
  );
}

