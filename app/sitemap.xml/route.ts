/**
 * Sitemap Index - Lists all sub-sitemaps
 */

import { NextResponse } from 'next/server';
import { absoluteUrl, xmlEscape } from '@/lib/seo/utils';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tackleapp.ai';
  const now = new Date().toISOString();
  
  const sitemaps = [
    { loc: absoluteUrl('/sitemap-static.xml'), lastmod: now },
    { loc: absoluteUrl('/sitemap-blog.xml'), lastmod: now },
    { loc: absoluteUrl('/sitemap-species.xml'), lastmod: now },
    { loc: absoluteUrl('/sitemap-how-to.xml'), lastmod: now },
    { loc: absoluteUrl('/sitemap-locations.xml'), lastmod: now },
  ];
  
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps.map((s) => `  <sitemap>
    <loc>${xmlEscape(s.loc)}</loc>
    <lastmod>${s.lastmod}</lastmod>
  </sitemap>`).join('\n')}
</sitemapindex>`;
  
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}



