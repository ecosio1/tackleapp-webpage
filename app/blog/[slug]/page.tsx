/**
 * Dynamic Blog Post Page with Modern Design
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateCanonical } from '@/lib/seo/canonical';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { AuthorSchema } from '@/components/seo/AuthorSchema';
import { FaqSchema } from '@/components/seo/FaqSchema';
import { LastUpdated } from '@/components/content/LastUpdated';
import { SourcesSection } from '@/components/content/SourcesSection';
import Link from 'next/link';
import { getBlogPostBySlug, getRelatedBlogPosts } from '@/lib/content/blog';
import { getAllPostSlugs } from '@/lib/content/index';
import { getAutoLinksForBlog } from '@/lib/content/auto-links';
import { AppCTA } from '@/components/blog/AppCTA';
import { RegulationsBlock } from '@/components/blog/RegulationsBlock';
import { splitMarkdownAfterFirstSection } from '@/lib/blog-utils';
import ReactMarkdown from 'react-markdown';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate static params for all blog posts
 * This enables static generation at build time
 */
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  
  // Return all published blog post slugs
  return slugs.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    // Error already logged in getBlogPostBySlug
    // Return minimal metadata for 404 page
    return {
      title: 'Blog Post Not Found',
      robots: {
        index: false,
        follow: false,
      },
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
      publishedTime: post.dates.publishedAt,
      modifiedTime: post.dates.updatedAt,
      authors: [post.author.name],
      images: post.featuredImage || post.heroImage ? [post.featuredImage || post.heroImage!] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Get related posts
  const relatedPosts = await getRelatedBlogPosts(slug, 3);
  
  // Get automatic internal link suggestions
  const autoLinks = await getAutoLinksForBlog(slug);

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
              {post.categorySlug.replace('-', ' ')}
            </span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <time dateTime={post.dates.publishedAt}>
              {new Date(post.dates.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <span>•</span>
            <span>{Math.ceil(post.body.split(/\s+/).length / 200)} min read</span>
            <span>•</span>
            <span>By {post.author.name}</span>
          </div>
          <div className="mt-4">
            <LastUpdated date={post.dates.updatedAt} />
          </div>
        </header>

        {/* Hero Image */}
        {(post.featuredImage || post.heroImage) && (
          <div className="mb-8">
            <img
              src={post.featuredImage || post.heroImage!}
              alt={post.title}
              className="w-full rounded-lg"
            />
          </div>
        )}

        {/* Main Content - Render Markdown with structured CTAs */}
        <div className="prose prose-lg max-w-none mb-8">
          {(() => {
            // Get structured CTAs from document (or fallback to default positions)
            const ctas = post.ctas || [];
            const topCTAs = ctas.filter(cta => cta.position === 'top');
            const endCTAs = ctas.filter(cta => cta.position === 'end');
            const inlineCTAs = ctas.filter(cta => cta.position === 'inline');

            // Split markdown if we have top CTAs
            const [firstPart, restPart] = topCTAs.length > 0 
              ? splitMarkdownAfterFirstSection(post.body)
              : [post.body, ''];

            return (
              <>
                <ReactMarkdown>{firstPart}</ReactMarkdown>
                
                {/* Top CTAs (after first section) */}
                {topCTAs.length > 0 && (
                  <div className="my-12">
                    {topCTAs.map((cta, index) => (
                      <AppCTA
                        key={`top-${index}`}
                        position="top"
                        pageType="blog"
                        slug={slug}
                        location={cta.location || post.related?.locationSlugs?.[0]}
                        cta={cta}
                      />
                    ))}
                  </div>
                )}
                
                {/* Rest of content */}
                {restPart && <ReactMarkdown>{restPart}</ReactMarkdown>}
              </>
            );
          })()}
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

        {/* End CTAs (near the end) */}
        {(() => {
          const ctas = post.ctas || [];
          const endCTAs = ctas.filter(cta => cta.position === 'end');
          
          // Fallback to default if no structured CTAs
          if (endCTAs.length === 0 && (!post.ctas || post.ctas.length === 0)) {
            return (
              <div className="mt-12">
                <AppCTA
                  position="end"
                  pageType="blog"
                  slug={slug}
                  location={post.related?.locationSlugs?.[0]}
                />
              </div>
            );
          }
          
          return endCTAs.length > 0 ? (
            <div className="mt-12">
              {endCTAs.map((cta, index) => (
                <AppCTA
                  key={`end-${index}`}
                  position="end"
                  pageType="blog"
                  slug={slug}
                  location={cta.location || post.related?.locationSlugs?.[0]}
                  cta={cta}
                />
              ))}
            </div>
          ) : null;
        })()}

        {/* Regulations Block - Separate from content */}
        <RegulationsBlock
          pageType="blog"
          slug={slug}
          className="mt-8"
        />

        {/* Internal Links - Species, Locations, Techniques */}
        {autoLinks.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-6">Related Content</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {autoLinks.map((link) => (
                <Link
                  key={link.slug}
                  href={link.url}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                      {link.type === 'species' ? 'Species' : link.type === 'location' ? 'Location' : link.type === 'how-to' ? 'Technique' : 'Article'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{link.title}</h3>
                  {link.reason && (
                    <p className="text-sm text-gray-600">{link.reason}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related Articles */}
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
                  <p className="text-sm text-gray-600">{relatedPost.description}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
