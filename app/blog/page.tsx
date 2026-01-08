/**
 * Blog Index Page
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import Link from 'next/link';
import { PrimaryCTA } from '@/components/conversion/PrimaryCTA';
import { ModernBlogCard } from '@/components/blog/ModernBlogCard';

export const metadata: Metadata = {
  title: 'Fishing Blog | Tips, Guides & Expert Advice',
  description: 'Read the latest fishing tips, gear reviews, techniques, and expert advice from Tackle Fishing Team.',
  alternates: {
    canonical: generateCanonical('/blog'),
  },
};

const blogPosts = [
  {
    slug: 'best-lures-for-snook-in-florida',
    title: 'Best Lures for Snook in Florida',
    description: 'Discover the most effective lures and techniques for catching snook in Florida waters.',
    category: 'fishing-tips',
    date: '2024-01-15',
  },
  {
    slug: 'redfish-flats-fishing-guide',
    title: 'Redfish Flats Fishing: Complete Guide',
    description: 'Master the art of sight-fishing for redfish on the flats with this comprehensive guide.',
    category: 'fishing-tips',
    date: '2024-01-10',
  },
  {
    slug: 'topwater-fishing-strategies',
    title: 'Topwater Fishing Strategies That Work',
    description: 'Learn proven topwater techniques for catching more fish, from early morning to late evening.',
    category: 'techniques',
    date: '2024-01-05',
  },
];

const categories = [
  { slug: 'fishing-tips', name: 'Fishing Tips' },
  { slug: 'techniques', name: 'Techniques' },
  { slug: 'gear-reviews', name: 'Gear Reviews' },
  { slug: 'conditions', name: 'Fishing Conditions' },
];

export default function BlogIndexPage() {
  return (
    <div className="home-main">
      <header className="page-header" style={{ textAlign: 'center' }}>
        <h1>Fishing Blog</h1>
        <p className="page-intro">
          Expert tips, techniques, gear reviews, and fishing advice from the Tackle Fishing Team.
        </p>
      </header>

      <section style={{ marginBottom: '3rem' }}>
        <h2>Categories</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/blog/category/${cat.slug}`}
              style={{
                padding: '0.5rem 1rem',
                background: '#f5f5f5',
                borderRadius: '8px',
                display: 'inline-block'
              }}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Latest Posts</h2>
        
        {/* Featured Post */}
        {blogPosts.length > 0 && (
          <div className="mb-8">
            <ModernBlogCard
              {...blogPosts[0]}
              featured={true}
              image="/images/blog/featured.jpg"
            />
          </div>
        )}
        
        {/* Regular Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.slice(1).map((post) => (
            <ModernBlogCard
              key={post.slug}
              {...post}
              image="/images/blog/default.jpg"
            />
          ))}
        </div>
      </section>

      <PrimaryCTA
        title="Get Personalized Fishing Advice"
        copy="Download Tackle for iPhone and get real-time conditions, AI fish ID, and expert advice tailored to your location."
        buttonText="default"
        position="mid"
        pageType="blog"
        slug="index"
      />
    </div>
  );
}


