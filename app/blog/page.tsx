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
  
  // Handle empty state gracefully
  if (blogPosts.length === 0) {
    return (
      <div className="home-main">
        <header className="page-header text-center mb-12 py-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
            Fishing Blog
          </h1>
          <p className="page-intro text-lg text-gray-600 max-w-2xl mx-auto">
            Expert tips, techniques, gear reviews, and fishing advice from the Tackle Fishing Team.
          </p>
        </header>
        <div className="text-center py-16 px-4">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🎣</div>
            <p className="text-xl text-gray-700 mb-2 font-semibold">
              No blog posts available yet
            </p>
            <p className="text-gray-600">
              Check back soon for new fishing tips, guides, and expert advice!
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="home-main">
      <header className="page-header text-center mb-12 py-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
          Fishing Blog
        </h1>
        <p className="page-intro text-lg text-gray-600 max-w-2xl mx-auto">
          Expert tips, techniques, gear reviews, and fishing advice from the Tackle Fishing Team.
        </p>
      </header>

      {categories.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Browse by Category</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/blog/category/${cat.slug}`}
                className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg text-blue-800 font-medium transition-all duration-200 hover:shadow-md"
              >
                {cat.name} <span className="text-blue-600">({cat.count})</span>
              </Link>
            ))}
          </div>
        </section>
      )}

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
          <div className="mb-12">
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-semibold rounded-full">
                ⭐ Featured Post
              </span>
            </div>
            <ModernBlogCard
              slug={blogPosts[0].slug}
              title={blogPosts[0].title}
              description={blogPosts[0].description}
              category={blogPosts[0].category}
              date={blogPosts[0].publishedAt}
              readTime={blogPosts[0].readTime}
              author={blogPosts[0].author}
              featured={true}
              image={blogPosts[0].heroImage || 'https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=1200&h=600&fit=crop'}
            />
          </div>
        )}

        {/* Posts Grid */}
        {blogPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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
              image={post.heroImage || 'https://images.unsplash.com/photo-1592329347327-27c7e288b5f6?w=800&h=600&fit=crop'}
            />
          ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4">
            <div className="max-w-md mx-auto">
              <p className="text-lg text-gray-600 mb-4">
                No posts found on this page.
              </p>
              {page > 1 && (
                <Link
                  href="/blog"
                  className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                >
                  ← Go to first page
                </Link>
              )}
            </div>
          </div>
        )}

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


