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
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-4 text-sm text-gray-600">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        {' / '}
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        {' / '}
        <span>{categoryName}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{categoryName}</h1>
        <p className="text-lg text-gray-600">{categoryDescription}</p>
        <p className="text-sm text-gray-500 mt-2">{posts.length} {posts.length === 1 ? 'article' : 'articles'}</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article key={post.slug} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="text-sm text-gray-500 mb-2">
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
            <h2 className="text-2xl font-semibold mb-2">
              <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:text-blue-800">
                {post.title}
              </Link>
            </h2>
            <p className="text-gray-600 mb-4">{post.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{post.readTime || 5} min read</span>
              <Link
                href={`/blog/${post.slug}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Read More →
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800">
          ← Back to All Posts
        </Link>
      </div>
    </div>
  );
}


