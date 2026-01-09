/**
 * Dynamic Blog Post Page with Modern Design
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateCanonical } from '@/lib/seo/canonical';
import { PrimaryCTA } from '@/components/conversion/PrimaryCTA';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { AuthorSchema } from '@/components/seo/AuthorSchema';
import { FaqSchema } from '@/components/seo/FaqSchema';
import { LastUpdated } from '@/components/content/LastUpdated';
import { SourcesSection } from '@/components/content/SourcesSection';
import Link from 'next/link';
import { loadBlogPost, loadBlogIndex, getRelatedBlogPosts, BlogPost } from '@/lib/content/blog';
import ReactMarkdown from 'react-markdown';

// Load blog post from JSON file (Single Source of Truth)
function getBlogPost(slug: string): BlogPost | null {
  return loadBlogPost(slug);
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate static params for all blog posts
 * This enables static generation at build time
 */
export function generateStaticParams() {
  const index = loadBlogIndex();

  // Return all published blog post slugs
  return index.posts
    .filter((post) => post.status === 'published')
    .map((post) => ({
      slug: post.slug,
    }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: 'Blog Post Not Found',
    };
  }

  return {
    title: `${post.title} | Tackle Fishing Blog`,
    description: post.description,
    keywords: [post.primaryKeyword, ...post.secondaryKeywords].join(', '),
    alternates: {
      canonical: generateCanonical(`/blog/${slug}`),
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      images: post.heroImage ? [post.heroImage] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  // Get related posts
  const relatedPosts = getRelatedBlogPosts(slug, 3);

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${slug}` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <AuthorSchema
        name={post.author.name}
        url={post.author.url || '/authors/tackle-fishing-team'}
      />
      {post.faqs.length > 0 && <FaqSchema items={post.faqs} />}

      <article className="max-w-4xl mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          {' / '}
          <Link href="/blog" className="hover:text-blue-600">Blog</Link>
          {' / '}
          <span>{post.title}</span>
        </nav>

        <header className="mb-8">
          <div className="mb-4">
            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
              {post.category}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <span>•</span>
            <span>{post.readingTimeMinutes || 5} min read</span>
            <span>•</span>
            <span>By {post.author.name}</span>
          </div>
          <div className="mt-4">
            <LastUpdated date={post.updatedAt} />
          </div>
        </header>

        {/* Hero Image */}
        {post.heroImage && (
          <div className="mb-8">
            <img
              src={post.heroImage}
              alt={post.title}
              className="w-full rounded-lg"
            />
          </div>
        )}

        {/* Main Content - Render Markdown */}
        <div className="prose prose-lg max-w-none mb-8">
          <ReactMarkdown>{post.body}</ReactMarkdown>
        </div>

        {/* Sources Section */}
        {post.sources.length > 0 && (
          <div className="mb-8">
            <SourcesSection sources={post.sources} />
          </div>
        )}

        {/* FAQs Section */}
        {post.faqs.length > 0 && (
          <section className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {post.faqs.map((faq, index) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <div className="mt-12">
          <PrimaryCTA
            title="Get Personalized Fishing Advice"
            copy="Download Tackle for iPhone and get real-time conditions, AI fish ID, and expert advice tailored to your location."
            buttonText="default"
            position="end"
            pageType="blog"
            slug={slug}
          />
        </div>

        {/* Related Content */}
        {relatedPosts.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{relatedPost.title}</h3>
                  <p className="text-sm text-gray-600">{relatedPost.excerpt || relatedPost.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
