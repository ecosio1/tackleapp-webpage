/**
 * Location Pages Sitemap
 */

import { NextResponse } from 'next/server';
import { absoluteUrl, xmlEscape, getLastmodDate } from '@/lib/seo/utils';
import { getAllLocationDocs } from '@/lib/content/index';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate hourly (locations may update more frequently)

export async function GET() {
  const locations = await getAllLocationDocs();
  
  const urls = locations.map((doc) => {
    const locationDoc = doc as Extract<typeof doc, { pageType: 'location' }>;
    const path = `/locations/${locationDoc.stateSlug}/${locationDoc.citySlug}`;
    return `  <url>
    <loc>${xmlEscape(absoluteUrl(path))}</loc>
    <lastmod>${getLastmodDate(doc)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }).join('\n');
  
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


