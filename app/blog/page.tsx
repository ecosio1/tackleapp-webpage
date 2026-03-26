/**
 * Blog Index Page with Pagination
 * Reads blog posts from content index ONLY (never loads post JSON files)
 * This allows the page to scale to thousands of posts efficiently
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import Link from 'next/link';
import { PrimaryCTA } from '@/components/conversion/PrimaryCTA';
import { ContentUpgradeCTA } from '@/components/conversion/ContentUpgradeCTA';
import { ModernBlogCard } from '@/components/blog/ModernBlogCard';
import { CategoryNav } from '@/components/blog/CategoryNav';
import { BlogSearch } from '@/components/blog/BlogSearch';
import { Pagination } from '@/components/blog/Pagination';
import { BreadcrumbSchema, generateBreadcrumbsFromPath } from '@/components/seo/BreadcrumbSchema';
import { getAllBlogCategories } from '@/lib/content/blog';
import { getPaginatedBlogPosts } from '@/lib/content/blog-pagination';
import { getCategoryFallbackImage } from '@/lib/image-fallbacks';

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
      ? 'Fishing Blog | Tips, Guides & Expert Advice | Tackle'
      : `Fishing Blog - Page ${page} | Tips, Guides & Expert Advice`,
    description: 'Read the latest fishing tips, gear reviews, techniques, and expert advice from Tackle Fishing Team. Lure guides, species breakdowns, and more.',
    alternates: {
      canonical,
    },
    openGraph: {
      title: 'Fishing Blog | Tackle',
      description: 'Expert fishing tips, gear reviews, techniques, and species guides from the Tackle Fishing Team.',
      url: canonical,
      siteName: 'Tackle',
      type: 'website',
      locale: 'en_US',
    },
    robots: page === 1
      ? undefined
      : {
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
  
  // Breadcrumbs for SEO
  const breadcrumbs = generateBreadcrumbsFromPath('/blog', {}, 'Blog');

  // Featured post (first post on page 1 only)
  const featuredPost = page === 1 ? blogPosts[0] : null;
  const gridPosts = page === 1 ? blogPosts.slice(1) : blogPosts;

  // CollectionPage JSON-LD for SEO
  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Tackle Fishing Blog',
    description: 'Expert fishing tips, gear reviews, techniques, and species guides.',
    url: generateCanonical('/blog'),
    publisher: {
      '@type': 'Organization',
      name: 'Tackle',
      url: generateCanonical('/'),
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: pagination.totalPosts,
      itemListElement: blogPosts.slice(0, 10).map((post, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: generateCanonical(`/blog/${post.slug}`),
        name: post.title,
      })),
    },
  };

  return (
    <div className="home-main">
      {/* CollectionPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />

      {/* Breadcrumb Schema */}
      <BreadcrumbSchema items={breadcrumbs} />

      {/* Visual Breadcrumbs */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        {' / '}
        <span className="text-gray-900 font-medium">Blog</span>
      </nav>

      <header className="page-header text-center mb-10 py-6">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
          Fishing Blog
        </h1>
        <p className="page-intro text-lg text-gray-600 max-w-2xl mx-auto">
          Expert tips, techniques, gear reviews, and fishing advice from the Tackle Fishing Team.
        </p>
      </header>

      {/* Category Navigation */}
      {categories.length > 0 && (
        <CategoryNav categories={categories} />
      )}

      {/* Featured Hero Post (page 1 only) */}
      {featuredPost && (
        <section className="mb-12">
          <ModernBlogCard
            slug={featuredPost.slug}
            title={featuredPost.title}
            description={featuredPost.description}
            category={featuredPost.category}
            date={featuredPost.publishedAt}
            readTime={featuredPost.readTime}
            author={featuredPost.author}
            image={featuredPost.heroImage || getCategoryFallbackImage(featuredPost.category)}
            featured={true}
          />
        </section>
      )}

      {/* Email Capture */}
      {page === 1 && (
        <div className="mb-12">
          <ContentUpgradeCTA pageType="blog" slug="index" />
        </div>
      )}

      <section className="mb-16">
        <div className="flex items-center justify-between mb-8 gap-4">
          <h2 className="text-3xl font-bold text-gray-900">
            {page === 1 ? 'Latest Posts' : `All Posts (Page ${page})`}
          </h2>
          <div className="flex items-center gap-4">
            {pagination.totalPosts > 0 && (
              <p className="text-sm text-gray-500 font-medium hidden sm:block">
                {pagination.totalPosts} articles
              </p>
            )}
            {/* Search */}
            <BlogSearch posts={blogPosts.map((p) => ({
              slug: p.slug,
              title: p.title,
              description: p.description,
              category: p.category,
              publishedAt: p.publishedAt,
              readTime: p.readTime,
              author: p.author,
              heroImage: p.heroImage || getCategoryFallbackImage(p.category),
            }))} />
          </div>
        </div>

        {/* Post Grid */}
        {gridPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {gridPosts.map((post) => (
              <ModernBlogCard
                key={post.slug}
                slug={post.slug}
                title={post.title}
                description={post.description}
                category={post.category}
                date={post.publishedAt}
                readTime={post.readTime}
                author={post.author}
                image={post.heroImage || getCategoryFallbackImage(post.category)}
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
                  &larr; Go to first page
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


