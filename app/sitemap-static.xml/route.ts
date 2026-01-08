/**
 * Static Pages Sitemap
 */

import { NextResponse } from 'next/server';
import { absoluteUrl, xmlEscape, formatSitemapDate } from '@/lib/seo/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // Revalidate daily

export async function GET() {
  const now = formatSitemapDate(new Date());
  
  const staticPages = [
    { path: '/', priority: '1.0', changefreq: 'weekly' },
    { path: '/download', priority: '0.9', changefreq: 'monthly' },
    { path: '/features', priority: '0.8', changefreq: 'monthly' },
    { path: '/how-it-works', priority: '0.8', changefreq: 'monthly' },
    { path: '/pricing', priority: '0.8', changefreq: 'monthly' },
    { path: '/about', priority: '0.7', changefreq: 'monthly' },
    { path: '/contact', priority: '0.7', changefreq: 'monthly' },
    { path: '/species', priority: '0.8', changefreq: 'weekly' },
    { path: '/how-to', priority: '0.8', changefreq: 'weekly' },
    { path: '/locations', priority: '0.8', changefreq: 'weekly' },
    { path: '/blog', priority: '0.8', changefreq: 'daily' },
  ];
  
  const urls = staticPages.map((page) => `  <url>
    <loc>${xmlEscape(absoluteUrl(page.path))}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n');
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
  
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}



