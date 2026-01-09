/**
 * Breadcrumb Schema Component
 * Adds BreadcrumbList JSON-LD schema
 */

import { absoluteUrl } from '@/lib/seo/utils';

export interface BreadcrumbItem {
  name: string;
  item?: string; // Absolute URL (preferred)
  url?: string; // Relative path (will be converted to absolute)
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

/**
 * Generate breadcrumbs dynamically from URL path
 * Example: "/blog/my-post" -> [{ name: 'Home', url: '/' }, { name: 'Blog', url: '/blog' }, { name: 'My Post', url: '/blog/my-post' }]
 * 
 * @param path - URL path (e.g., "/blog/my-post" or "/species/redfish")
 * @param segmentNames - Optional mapping of URL segments to display names (e.g., { "blog": "Blog", "species": "Species" })
 * @param lastSegmentName - Optional custom name for the last segment (overrides auto-generated name)
 * @returns Array of breadcrumb items
 */
export function generateBreadcrumbsFromPath(
  path: string,
  segmentNames?: Record<string, string>,
  lastSegmentName?: string
): BreadcrumbItem[] {
  const segments = path.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { name: 'Home', url: '/' },
  ];

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Use custom name for last segment if provided, otherwise generate from segment
    let name: string;
    if (index === segments.length - 1 && lastSegmentName) {
      name = lastSegmentName;
    } else {
      name = segmentNames?.[segment] || segment
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    breadcrumbs.push({
      name,
      url: currentPath,
    });
  });

  return breadcrumbs;
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item || absoluteUrl(item.url || '/'),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}


