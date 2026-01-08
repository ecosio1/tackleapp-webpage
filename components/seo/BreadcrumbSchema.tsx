/**
 * Breadcrumb Schema Component
 * Adds BreadcrumbList JSON-LD schema
 */

import { absoluteUrl } from '@/lib/seo/utils';

interface BreadcrumbItem {
  name: string;
  item?: string;
  url?: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
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


