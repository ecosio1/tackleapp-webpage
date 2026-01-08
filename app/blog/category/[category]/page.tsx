/**
 * Blog Category Page
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const categories: Record<string, { name: string; description: string }> = {
  'fishing-tips': {
    name: 'Fishing Tips',
    description: 'Expert tips and advice to help you catch more fish.',
  },
  'techniques': {
    name: 'Techniques',
    description: 'Learn proven fishing techniques and strategies.',
  },
  'gear-reviews': {
    name: 'Gear Reviews',
    description: 'Honest reviews of fishing gear and equipment.',
  },
  'conditions': {
    name: 'Fishing Conditions',
    description: 'Understanding weather, tides, and fishing conditions.',
  },
};

const categoryPosts: Record<string, Array<{ slug: string; title: string; date: string }>> = {
  'fishing-tips': [
    { slug: 'best-lures-for-snook-in-florida', title: 'Best Lures for Snook in Florida', date: '2024-01-15' },
    { slug: 'redfish-flats-fishing-guide', title: 'Redfish Flats Fishing: Complete Guide', date: '2024-01-10' },
  ],
  'techniques': [
    { slug: 'topwater-fishing-strategies', title: 'Topwater Fishing Strategies That Work', date: '2024-01-05' },
  ],
  'gear-reviews': [],
  'conditions': [],
};

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryInfo = categories[category];

  if (!categoryInfo) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: `${categoryInfo.name} | Tackle Fishing Blog`,
    description: categoryInfo.description,
    alternates: {
      canonical: generateCanonical(`/blog/category/${category}`),
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryInfo = categories[category];

  if (!categoryInfo) {
    notFound();
  }

  const posts = categoryPosts[category] || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <nav className="mb-4 text-sm text-gray-600">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        {' / '}
        <Link href="/blog" className="hover:text-blue-600">Blog</Link>
        {' / '}
        <span>{categoryInfo.name}</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{categoryInfo.name}</h1>
        <p className="text-lg text-gray-600">{categoryInfo.description}</p>
      </header>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <article key={post.slug} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-sm text-gray-500 mb-2">
                {new Date(post.date).toLocaleDateString('en-US', {
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
              <Link
                href={`/blog/${post.slug}`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Read More →
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No posts in this category yet. Check back soon!</p>
      )}

      <div className="mt-8">
        <Link href="/blog" className="text-blue-600 hover:text-blue-800">
          ← Back to All Posts
        </Link>
      </div>
    </div>
  );
}


