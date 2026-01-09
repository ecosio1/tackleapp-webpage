/**
 * Blog Index Page with Pagination
 * Reads blog posts from content index ONLY (never loads post JSON files)
 * This allows the page to scale to thousands of posts efficiently
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import Link from 'next/link';
import { PrimaryCTA } from '@/components/conversion/PrimaryCTA';
import { ModernBlogCard } from '@/components/blog/ModernBlogCard';
import { Pagination } from '@/components/blog/Pagination';
import { getAllBlogCategories } from '@/lib/content/blog';
import { getPaginatedBlogPosts } from '@/lib/content/blog-pagination';

interface BlogIndexPageProps {
  searchParams: Promise<{ page?: string }>;
}

export async function generateMetadata({ searchParams }: BlogIndexPageProps): Promise<Metadata> {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  
  // Canonical URL: page 1 = /blog, page 2+ = /blog?page=2
  const canonical = page === 1 
    ? generateCanonical('/blog')
    : generateCanonical(`/blog?page=${page}`);

  return {
    title: page === 1 
      ? 'Fishing Blog | Tips, Guides & Expert Advice'
      : `Fishing Blog - Page ${page} | Tips, Guides & Expert Advice`,
    description: 'Read the latest fishing tips, gear reviews, techniques, and expert advice from Tackle Fishing Team.',
    alternates: {
      canonical,
    },
    robots: page === 1 
      ? undefined 
      : {
          // Allow indexing of paginated pages
          index: true,
          follow: true,
        },
  };
}

export default async function BlogIndexPage({ searchParams }: BlogIndexPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  
  // Get paginated posts from index ONLY (no file reads)
  const { posts: blogPosts, pagination } = await getPaginatedBlogPosts({
    page,
    pageSize: 24, // 20-30 range, using 24
    sortBy: 'publishedAt',
    sortOrder: 'desc', // Newest first (stable sorting)
  });
  
  const categories = await getAllBlogCategories();
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold">
            {page === 1 ? 'Latest Posts' : `All Posts (Page ${page})`}
          </h2>
          {pagination.totalPosts > 0 && (
            <p className="text-sm text-gray-600">
              Showing {((page - 1) * pagination.pageSize) + 1}-{Math.min(page * pagination.pageSize, pagination.totalPosts)} of {pagination.totalPosts} posts
            </p>
          )}
        </div>

        {/* Featured Post (only on page 1) */}
        {page === 1 && blogPosts.length > 0 && (
          <div className="mb-8">
            <ModernBlogCard
              slug={blogPosts[0].slug}
              title={blogPosts[0].title}
              description={blogPosts[0].description}
              category={blogPosts[0].category}
              date={blogPosts[0].publishedAt}
              readTime={blogPosts[0].readTime}
              author={blogPosts[0].author}
              featured={true}
              image={blogPosts[0].heroImage || '/images/blog/featured.jpg'}
            />
          </div>
        )}

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(page === 1 ? blogPosts.slice(1) : blogPosts).map((post) => (
            <ModernBlogCard
              key={post.slug}
              slug={post.slug}
              title={post.title}
              description={post.description}
              category={post.category}
              date={post.publishedAt}
              readTime={post.readTime}
              author={post.author}
              image={post.heroImage || '/images/blog/default.jpg'}
            />
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            basePath="/blog"
          />
        )}
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


