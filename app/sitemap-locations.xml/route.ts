/**
 * Location Pages Sitemap
 */

import { NextResponse } from 'next/server';
import { absoluteUrl, xmlEscape, getLastmodDate } from '@/lib/seo/utils';
import { getAllLocationDocs } from '@/lib/content/index';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate hourly (locations may update more frequently)

export async function GET() {
  try {
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
  } catch (error) {
    console.error('[sitemap-locations.xml] Error generating locations sitemap:', error);
    // Return minimal valid sitemap even on error
    const now = new Date().toISOString();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${xmlEscape(absoluteUrl('/locations'))}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
    
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  }
}



