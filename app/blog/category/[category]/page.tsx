/**
 * Blog Category Page - Fully Dynamic
 * Reads from content index ONLY (never loads post JSON files)
 * This allows the page to scale to thousands of posts efficiently
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostsByCategory, getAllBlogCategories } from '@/lib/content/blog';
import { ModernBlogCard } from '@/components/blog/ModernBlogCard';

// Helper function to format category slug to display name
function formatCategoryName(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to generate category descriptions
function getCategoryDescription(slug: string): string {
  const descriptions: Record<string, string> = {
    'fishing-tips': 'Expert tips and advice to help you catch more fish.',
    'techniques': 'Learn proven fishing techniques and strategies.',
    'gear-reviews': 'Honest reviews of fishing gear and equipment.',
    'conditions': 'Understanding weather, tides, and fishing conditions.',
    'species': 'Complete guides to targeting specific fish species.',
    'locations': 'Fishing guides for top locations around the world.',
  };

  return descriptions[slug] || `Browse all ${formatCategoryName(slug)} articles.`;
}

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

/**
 * Generate static params for all blog categories
 * This enables static generation at build time
 */
export async function generateStaticParams() {
  try {
    const categories = await getAllBlogCategories();
    // Only generate params for categories that have posts
    return categories
      .filter((cat) => cat.count > 0)
      .map((category) => ({
        category: category.slug,
      }));
  } catch (error) {
    // If categories fail to load, return empty array (no static params)
    console.error('Failed to load blog categories for static params:', error);
    return [];
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;

  // Load posts to verify category exists
  const posts = await getPostsByCategory(category);

  if (posts.length === 0) {
    return {
      title: 'Category Not Found',
    };
  }

  const categoryName = formatCategoryName(category);
  const categoryDescription = getCategoryDescription(category);

  return {
    title: `${categoryName} | Tackle Fishing Blog`,
    description: categoryDescription,
    alternates: {
      canonical: generateCanonical(`/blog/category/${category}`),
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  // Load posts from index ONLY (no file reads - scales to 1000+ posts)
  const posts = await getPostsByCategory(category);

  // Show 404 if category has no posts
  if (posts.length === 0) {
    notFound();
  }

  const categoryName = formatCategoryName(category);
  const categoryDescription = getCategoryDescription(category);

  return (
    <div className="home-main">
      <header className="page-header text-center mb-12 py-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
          {categoryName}
        </h1>
        <p className="page-intro text-lg text-gray-600 max-w-2xl mx-auto">
          {categoryDescription}
        </p>
      </header>

      <section className="mb-8">
        <Link
          href="/blog"
          className="inline-block px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg text-blue-800 font-medium transition-all duration-200 hover:shadow-md"
        >
          ← All Categories
        </Link>
      </section>

      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Latest Posts
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            {posts.length} {posts.length === 1 ? 'article' : 'articles'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {posts.map((post) => (
            <ModernBlogCard
              key={post.slug}
              slug={post.slug}
              title={post.title}
              description={post.description}
              category={post.category}
              date={post.publishedAt}
              readTime={post.readTime}
              author={post.author}
              image={post.heroImage || 'https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=1200&h=600&fit=crop'}
            />
          ))}
        </div>
      </section>
    </div>
  );
}


