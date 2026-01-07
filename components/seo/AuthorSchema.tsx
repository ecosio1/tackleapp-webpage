/**
 * Author Schema Component
 * Adds author JSON-LD schema for E-E-A-T
 */

interface Author {
  name: string;
  url?: string;
}

interface AuthorSchemaProps {
  author: Author;
  url?: string;
}

export function AuthorSchema({ author, url }: AuthorSchemaProps) {
  const authorUrl = url || author.url || '/authors/tackle-fishing-team';
  
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    url: `https://tackleapp.ai${authorUrl}`,
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

