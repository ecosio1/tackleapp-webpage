/**
 * SEO utility functions
 */

/**
 * Get absolute URL from path
 */
export function absoluteUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tackleapp.ai';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Escape XML/HTML special characters
 */
export function xmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Format date for sitemap (W3C datetime format)
 */
export function formatSitemapDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString();
}

/**
 * Get lastmod date from content document
 */
export function getLastmodDate(doc: { dates: { updatedAt?: string; publishedAt: string } }): string {
  return formatSitemapDate(doc.dates.updatedAt || doc.dates.publishedAt);
}


