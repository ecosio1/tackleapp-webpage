/**
 * Blog Index Page
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import Link from 'next/link';
import { PrimaryCTA } from '@/components/conversion/PrimaryCTA';
import { ModernBlogCard } from '@/components/blog/ModernBlogCard';
import { loadAllBlogPosts, getAllBlogCategories } from '@/lib/content/blog';

export const metadata: Metadata = {
  title: 'Fishing Blog | Tips, Guides & Expert Advice',
  description: 'Read the latest fishing tips, gear reviews, techniques, and expert advice from Tackle Fishing Team.',
  alternates: {
    canonical: generateCanonical('/blog'),
  },
};

export default function BlogIndexPage() {
  // Load blog posts from JSON files (Single Source of Truth)
  const blogPosts = loadAllBlogPosts();
  const categories = getAllBlogCategories();
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
              {cat.name} ({cat.count})
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
              slug={blogPosts[0].slug}
              title={blogPosts[0].title}
              description={blogPosts[0].description}
              category={blogPosts[0].category}
              date={blogPosts[0].publishedAt}
              featured={true}
              image={blogPosts[0].heroImage || '/images/blog/featured.jpg'}
            />
          </div>
        )}

        {/* Regular Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.slice(1).map((post) => (
            <ModernBlogCard
              key={post.slug}
              slug={post.slug}
              title={post.title}
              description={post.description}
              category={post.category}
              date={post.publishedAt}
              image={post.heroImage || '/images/blog/default.jpg'}
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


