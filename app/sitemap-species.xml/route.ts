/**
 * Species Pages Sitemap
 */

import { NextResponse } from 'next/server';
import { absoluteUrl, xmlEscape, getLastmodDate } from '@/lib/seo/utils';
import { getAllSpeciesDocs } from '@/lib/content/index';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // Revalidate daily

export async function GET() {
  try {
    const species = await getAllSpeciesDocs();
    
    const urls = species.map((doc) => {
      const path = `/species/${doc.slug}`;
      return `  <url>
    <loc>${xmlEscape(absoluteUrl(path))}</loc>
    <lastmod>${getLastmodDate(doc)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }).join('\n');
    
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
  } catch (error) {
    console.error('[sitemap-species.xml] Error generating species sitemap:', error);
    // Return minimal valid sitemap even on error
    const now = new Date().toISOString();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${xmlEscape(absoluteUrl('/species'))}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`;
    
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  }
}



