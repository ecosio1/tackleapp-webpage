/**
 * Dynamic Blog Post Page with Modern Design
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { generateCanonical } from '@/lib/seo/canonical';
import { BreadcrumbSchema, generateBreadcrumbsFromPath } from '@/components/seo/BreadcrumbSchema';
import { AuthorSchema } from '@/components/seo/AuthorSchema';
import { FaqSchema } from '@/components/seo/FaqSchema';
import { ArticleSchema } from '@/components/seo/ArticleSchema';
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
import { TableOfContents } from '@/components/blog/TableOfContents';
import { ReadingProgress } from '@/components/blog/ReadingProgress';
import { SocialShare } from '@/components/blog/SocialShare';
import { ScrollToTop } from '@/components/blog/ScrollToTop';
import { BlogImage } from '@/components/blog/BlogImage';
import Image from 'next/image';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate static params for all blog posts
 * This enables static generation at build time
 */
export async function generateStaticParams() {
  try {
    const slugs = await getAllPostSlugs();
    
    // Return all published blog post slugs
    return slugs.map((slug) => ({
      slug,
    }));
  } catch (error) {
    // If slugs fail to load, return empty array (no static params)
    // This prevents build failures when content index is empty or invalid
    console.error('Failed to load blog post slugs for static params:', error);
    return [];
  }
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

  const canonicalUrl = generateCanonical(`/blog/${slug}`);
  const ogImage = post.featuredImage || post.heroImage;
  
  return {
    title: post.title, // Removed brand suffix for better keyword prominence
    description: post.description,
    keywords: [post.primaryKeyword, ...post.secondaryKeywords].join(', '),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: canonicalUrl,
      siteName: 'Tackle',
      locale: 'en_US',
      publishedTime: post.dates.publishedAt,
      modifiedTime: post.dates.updatedAt,
      authors: [post.author.name],
      images: ogImage ? [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: ogImage ? [ogImage] : undefined,
      creator: '@tackleapp', // Update with your actual Twitter handle
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Get related posts (may be empty array if no related posts exist)
  let relatedPosts: Awaited<ReturnType<typeof getRelatedBlogPosts>> = [];
  try {
    relatedPosts = await getRelatedBlogPosts(slug, 3);
  } catch (error) {
    console.warn(`[BlogPostPage] Failed to load related posts for ${slug}:`, error);
  }
  
  // Get automatic internal link suggestions (may be empty array)
  let autoLinks: Awaited<ReturnType<typeof getAutoLinksForBlog>> = [];
  try {
    autoLinks = await getAutoLinksForBlog(slug);
  } catch (error) {
    console.warn(`[BlogPostPage] Failed to load auto links for ${slug}:`, error);
  }

  // Generate breadcrumbs dynamically from URL path
  // Uses post title for the last breadcrumb (dynamic from JSON)
  const breadcrumbs = generateBreadcrumbsFromPath(
    `/blog/${slug}`,
    { blog: 'Blog' },
    post.title // Last segment uses post title from JSON
  );

  const canonicalUrl = generateCanonical(`/blog/${slug}`);

  // Helper function to generate heading IDs from text
  const generateHeadingId = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  // Custom markdown components with heading IDs and enhanced styling
  const markdownComponents = {
    h2: ({ children, ...props }: any) => {
      const text = children?.toString() || '';
      const id = generateHeadingId(text);
      return (
        <h2
          id={id}
          className="text-3xl font-bold mt-12 mb-6 text-gray-900 border-b border-gray-200 pb-3"
          {...props}
        >
          {children}
        </h2>
      );
    },
    h3: ({ children, ...props }: any) => {
      const text = children?.toString() || '';
      const id = generateHeadingId(text);
      return (
        <h3
          id={id}
          className="text-2xl font-semibold mt-8 mb-4 text-gray-900"
          {...props}
        >
          {children}
        </h3>
      );
    },
    p: ({ children, ...props }: any) => {
      return (
        <p className="text-lg leading-relaxed text-gray-700 mb-6" {...props}>
          {children}
        </p>
      );
    },
    ul: ({ children, ...props }: any) => {
      return (
        <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700" {...props}>
          {children}
        </ul>
      );
    },
    ol: ({ children, ...props }: any) => {
      return (
        <ol className="list-decimal list-inside space-y-2 mb-6 text-gray-700" {...props}>
          {children}
        </ol>
      );
    },
    blockquote: ({ children, ...props }: any) => {
      return (
        <blockquote
          className="border-l-4 border-blue-500 pl-6 py-2 my-6 italic text-gray-600 bg-blue-50 rounded-r-lg"
          {...props}
        >
          {children}
        </blockquote>
      );
    },
    strong: ({ children, ...props }: any) => {
      return (
        <strong className="font-bold text-gray-900" {...props}>
          {children}
        </strong>
      );
    },
    a: ({ children, href, ...props }: any) => {
      return (
        <a
          href={href}
          className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
          {...props}
        >
          {children}
        </a>
      );
    },
  };

  return (
    <>
      {/* Reading Progress Bar */}
      <ReadingProgress />

      {/* Article Schema - Required for blog posts - Dynamically pulls from JSON */}
      <ArticleSchema
        headline={post.title}
        description={post.description}
        author={post.author}
        datePublished={post.dates.publishedAt}
        dateModified={post.dates.updatedAt}
        image={post.featuredImage || post.heroImage}
        url={canonicalUrl}
      />
      
      {/* Breadcrumb Schema - Dynamic from URL path */}
      <BreadcrumbSchema items={breadcrumbs} />
      
      {/* Author Schema - For E-E-A-T */}
      <AuthorSchema
        name={post.author.name}
        url={post.author.url || '/authors/tackle-fishing-team'}
      />
      
      {/* FAQ Schema - If FAQs exist */}
      {post.faqs && Array.isArray(post.faqs) && post.faqs.length > 0 && <FaqSchema faqs={post.faqs} />}

      <article className="max-w-3xl mx-auto px-6 py-12">
        <nav className="mb-6 text-sm text-gray-600">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          {' / '}
          <Link href="/blog" className="hover:text-blue-600">Blog</Link>
          {' / '}
          <span>{post.title}</span>
        </nav>

        <header className="mb-12" style={{ maxWidth: '720px', margin: '0 auto 3rem' }}>
          <div className="mb-4">
            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
              {post.categorySlug.replace('-', ' ')}
            </span>
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: '700', lineHeight: '1.15', letterSpacing: '-0.03em', color: '#0f172a', marginBottom: '1.5rem' }}>
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-sm" style={{ color: 'rgba(15, 23, 42, 0.7)', marginBottom: '1rem' }}>
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

        {/* Hero Image - Full Width, Prominent */}
        {(post.featuredImage || post.heroImage) && (
          <div className="mb-12 -mx-6" style={{ maxWidth: 'calc(100% + 3rem)' }}>
            <div className="relative w-full overflow-hidden" style={{ height: 'clamp(300px, 50vw, 600px)' }}>
              <Image
                src={post.featuredImage || post.heroImage!}
                alt={`${post.title} - ${post.description.substring(0, 100)}`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
              {/* Gradient overlay for better readability if text is added */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        )}

        {/* Social Share Buttons */}
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <SocialShare title={post.title} url={canonicalUrl} />
        </div>

        {/* Table of Contents */}
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <TableOfContents content={post.body} minHeadings={3} />
        </div>

        {/* Main Content - Render Markdown with structured CTAs */}
        <div className="blog-content mb-12 prose prose-lg max-w-none"
             style={{
               maxWidth: '720px',
               margin: '0 auto',
               fontSize: '1.125rem',
               lineHeight: '1.8'
             }}>
          {(() => {
            // Get structured CTAs from document (or fallback to default positions)
            const ctas = (post.ctas && Array.isArray(post.ctas)) ? post.ctas : [];
            const topCTAs = ctas.filter((cta: any) => cta.position === 'top');
            const endCTAs = ctas.filter((cta: any) => cta.position === 'end');
            const inlineCTAs = ctas.filter((cta: any) => cta.position === 'inline');

            // Split markdown if we have top CTAs
            const [firstPart, restPart] = topCTAs.length > 0 
              ? splitMarkdownAfterFirstSection(post.body)
              : [post.body, ''];

            return (
              <>
                <ReactMarkdown components={markdownComponents}>{firstPart}</ReactMarkdown>

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
                {restPart && <ReactMarkdown components={markdownComponents}>{restPart}</ReactMarkdown>}
              </>
            );
          })()}
        </div>

        {/* Sources Section */}
        {post.sources && Array.isArray(post.sources) && post.sources.length > 0 && (
          <div className="mb-8">
            <SourcesSection sources={post.sources} />
          </div>
        )}

        {/* FAQs Section */}
        {post.faqs && Array.isArray(post.faqs) && post.faqs.length > 0 && (
          <section className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {post.faqs.map((faq: any, index: number) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* End CTAs (near the end) - Always show at least one */}
        {(() => {
          const ctas = (post.ctas && Array.isArray(post.ctas)) ? post.ctas : [];
          const endCTAs = ctas.filter((cta: any) => cta.position === 'end');
          
          // Always show at least one end CTA (required for conversion)
          if (endCTAs.length === 0) {
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
          
          return (
            <div className="mt-12">
              {endCTAs.map((cta: any, index: number) => (
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
          );
        })()}

        {/* Regulations Block - Separate from content */}
        <RegulationsBlock
          pageType="blog"
          slug={slug}
          className="mt-8"
        />

        {/* Internal Links - Species, Locations, Techniques */}
        {autoLinks && Array.isArray(autoLinks) && autoLinks.length > 0 && (
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

        {/* Related Articles - With Images */}
        {relatedPosts.length > 0 && (
          <section className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className="group block overflow-hidden rounded-lg border border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all"
                >
                  {relatedPost.heroImage && (
                    <div className="relative w-full h-48 overflow-hidden">
                      <Image
                        src={relatedPost.heroImage}
                        alt={`${relatedPost.title} - ${relatedPost.description.substring(0, 80)}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {relatedPost.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{relatedPost.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* Scroll to Top Button */}
      <ScrollToTop />
    </>
  );
}
