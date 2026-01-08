/**
 * Dynamic Blog Post Page with Modern Design
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateCanonical } from '@/lib/seo/canonical';
import { PrimaryCTA } from '@/components/conversion/PrimaryCTA';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { AuthorSchema } from '@/components/seo/AuthorSchema';
import { LastUpdated } from '@/components/content/LastUpdated';
import { ImageBox, ImageGrid, QuoteBox } from '@/components/blog/ImageBox';
import { StatGrid } from '@/components/blog/StatBox';
import { HighlightBox, ComparisonTable } from '@/components/blog/HighlightBox';
import Link from 'next/link';

// This would come from your content pipeline
async function getBlogPost(slug: string) {
  // In production, this would fetch from your content system
  // For now, return example data
  return null;
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  
  if (!post) {
    return {
      title: 'Blog Post Not Found',
    };
  }

  return {
    title: `${post.title} | Tackle Fishing Blog`,
    description: post.description,
    alternates: {
      canonical: generateCanonical(`/blog/${slug}`),
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${slug}` },
  ];

  return (
    <>
      <BreadcrumbSchema items={breadcrumbs} />
      <AuthorSchema
        name="Tackle Fishing Team"
        url="/authors/tackle-fishing-team"
      />

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
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <span>•</span>
            <span>{post.readTime || 5} min read</span>
            <span>•</span>
            <span>By {post.author || 'Tackle Fishing Team'}</span>
          </div>
          <div className="mt-4">
            <LastUpdated date={post.updatedAt || post.date} />
          </div>
        </header>

        {/* Hero Image */}
        {post.heroImage && (
          <ImageBox
            src={post.heroImage}
            alt={post.title}
            position="full"
            caption={post.heroCaption}
          />
        )}

        {/* Intro */}
        <div className="prose prose-lg max-w-none mb-8">
          <p className="text-xl text-gray-700 leading-relaxed">{post.description}</p>
        </div>

        {/* Stats Grid Example */}
        {post.stats && (
          <StatGrid stats={post.stats} columns={3} />
        )}

        {/* Main Content */}
        <div className="prose prose-lg max-w-none">
          {/* Example: Image with text */}
          <ImageBox
            src="/images/example-fishing.jpg"
            alt="Fishing example"
            position="right"
            caption="Example fishing technique"
          >
            <p className="text-sm">This technique works best in shallow water during incoming tides.</p>
          </ImageBox>

          {/* Example: Highlight Box */}
          <HighlightBox type="tip" title="Pro Tip">
            Early morning and late evening are prime times for topwater fishing. 
            The low light conditions make fish less wary and more likely to strike.
          </HighlightBox>

          {/* Example: Quote Box */}
          <QuoteBox
            quote="The best time to fish is when you can. But if you want to maximize your success, 
            pay attention to the tides and weather patterns."
            author="Captain John Smith, 30+ Years Experience"
            image="/images/captain.jpg"
          />

          {/* Example: Comparison Table */}
          {post.comparison && (
            <ComparisonTable
              items={post.comparison.items}
              columns={post.comparison.columns}
            />
          )}

          {/* Example: Image Grid */}
          {post.imageGrid && (
            <ImageGrid images={post.imageGrid} columns={3} />
          )}

          {/* More content sections would go here */}
        </div>

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
        {post.related && post.related.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-6">Related Content</h2>
            <ul className="space-y-2">
              {post.related.map((item: any, index: number) => (
                <li key={index}>
                  <Link 
                    href={item.slug} 
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  );
}
