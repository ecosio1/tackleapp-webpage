/**
 * Blog Posts Sitemap
 */

import { NextResponse } from 'next/server';
import { absoluteUrl, xmlEscape, getLastmodDate } from '@/lib/seo/utils';
import { getAllBlogPostDocs, getAllCategorySlugs } from '@/lib/content/index';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate hourly

export async function GET() {
  const posts = await getAllBlogPostDocs();
  const categories = await getAllCategorySlugs();
  
  // Add category pages
  const categoryUrls = categories.map((cat) => ({
    path: `/blog/category/${cat}`,
    lastmod: new Date().toISOString(),
  }));
  
  // Build URLs
  const postUrls = posts.map((post) => {
    const path = `/blog/${post.slug}`;
    return {
      path,
      lastmod: getLastmodDate(post),
    };
  });
  
  const allUrls = [...postUrls, ...categoryUrls];
  
  const urls = allUrls.map((url) => `  <url>
    <loc>${xmlEscape(absoluteUrl(url.path))}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n');
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}


