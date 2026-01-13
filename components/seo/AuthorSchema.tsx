/**
 * Author Schema Component
 * Adds author JSON-LD schema for E-E-A-T
 */

import { absoluteUrl } from '@/lib/seo/utils';

interface Author {
  name: string;
  url?: string;
}

interface AuthorSchemaProps {
  author?: Author;
  name?: string;
  url?: string;
}

export function AuthorSchema({ author, name, url }: AuthorSchemaProps) {
  const authorName = author?.name || name || 'Tackle Fishing Team';
  const authorUrl = url || author?.url || '/authors/tackle-fishing-team';
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: authorName,
    url: absoluteUrl(authorUrl),
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

