/**
 * Blog Post: Topwater Fishing Strategies
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import { PrimaryCTA } from '@/components/conversion/PrimaryCTA';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { AuthorSchema } from '@/components/seo/AuthorSchema';
import { LastUpdated } from '@/components/content/LastUpdated';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Topwater Fishing Strategies That Work | Expert Guide',
  description: 'Learn proven topwater techniques for catching more fish. From early morning to late evening, master the art of topwater fishing.',
  alternates: {
    canonical: generateCanonical('/blog/topwater-fishing-strategies'),
  },
};

const breadcrumbs = [
  { name: 'Home', url: '/' },
  { name: 'Blog', url: '/blog' },
  { name: 'Topwater Fishing Strategies', url: '/blog/topwater-fishing-strategies' },
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
          <span>Topwater Fishing Strategies</span>
        </nav>

        <header className="page-header">
          <h1>Topwater Fishing Strategies That Work</h1>
          <div className="last-updated">
            <LastUpdated date="2024-01-05" />
          </div>
        </header>

        <p className="page-intro">
          There's nothing quite like the explosive strike of a fish on a topwater lure.
          This guide covers proven strategies for successful topwater fishing across different
          conditions and species.
        </p>

        <section>
          <h2>Best Times for Topwater</h2>
          <p>
            Topwater fishing is most effective during low-light conditions when fish are more
            likely to be near the surface. Early morning and late evening are prime times,
            though overcast days can extend the bite window.
          </p>
          <p>
            For more detailed timing information, see our guide on{' '}
            <Link href="/how-to/best-time-of-day-to-fish">
              best time of day to fish
            </Link>.
          </p>
        </section>

        <section>
          <h2>Lure Selection</h2>
          <p>
            Different topwater lures work best in different situations:
          </p>
          <ul>
            <li><strong>Walk-the-dog lures:</strong> Great for covering water and triggering reaction strikes</li>
            <li><strong>Poppers:</strong> Effective for creating commotion and drawing fish from a distance</li>
            <li><strong>Prop baits:</strong> Excellent for calm conditions and finicky fish</li>
            <li><strong>Frogs:</strong> Perfect for heavy cover and vegetation</li>
          </ul>
        </section>

        <section>
          <h2>Retrieve Techniques</h2>
          <p>
            The key to topwater success is varying your retrieve until you find what works.
            Start with a steady, rhythmic cadence, then experiment with pauses, speed changes,
            and erratic movements.
          </p>
        </section>

        <section>
          <h2>Target Species</h2>
          <p>
            Many species respond well to topwater lures, including:
          </p>
          <ul>
            <li><Link href="/species/snook">Snook</Link></li>
            <li><Link href="/species/redfish">Redfish</Link></li>
            <li><Link href="/species/largemouth-bass">Largemouth Bass</Link></li>
            <li>Speckled Trout</li>
          </ul>
        </section>

        <PrimaryCTA
          title="Get Topwater Fishing Conditions"
          copy="Use Tackle to find the best days and times for topwater fishing in your area."
          buttonText="default"
          position="end"
          pageType="blog"
          slug="topwater-fishing-strategies"
        />

        <section className="related-content">
          <h2>Related Content</h2>
          <ul>
            <li>
              <Link href="/how-to/best-time-of-day-to-fish">Best Time of Day to Fish</Link>
            </li>
            <li>
              <Link href="/how-to/how-weather-affects-fishing">How Weather Affects Fishing</Link>
            </li>
            <li>
              <Link href="/species/snook">Snook Fishing Guide</Link>
            </li>
          </ul>
        </section>
      </article>
    </>
  );
}

