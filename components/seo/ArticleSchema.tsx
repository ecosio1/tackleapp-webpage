/**
 * Article Schema Component
 * Adds Article JSON-LD schema for blog posts, species pages, and other article-type content
 * Dynamically pulls data from JSON content files
 */

import { absoluteUrl } from '@/lib/seo/utils';

interface Author {
  name: string;
  url?: string;
}

interface ArticleSchemaProps {
  headline: string;
  description: string;
  author: Author;
  datePublished: string; // ISO 8601
  dateModified: string; // ISO 8601
  image?: string | string[]; // Can be a single image or array of images
  url: string;
  publisher?: {
    name?: string;
    logo?: string;
  };
}

export function ArticleSchema({
  headline,
  description,
  author,
  datePublished,
  dateModified,
  image,
  url,
  publisher,
}: ArticleSchemaProps) {
  // Handle image: can be string or array
  const imageUrl = Array.isArray(image) ? image[0] : image;
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    description,
    author: {
      '@type': 'Person',
      name: author.name,
      ...(author.url && { url: absoluteUrl(author.url) }),
    },
    datePublished,
    dateModified,
    ...(imageUrl && { image: absoluteUrl(imageUrl) }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': absoluteUrl(url),
    },
    publisher: {
      '@type': 'Organization',
      name: publisher?.name || 'Tackle',
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl(publisher?.logo || '/logo.png'),
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
