/**
 * Generic JSON-LD Component
 * Reusable component for rendering JSON-LD schema markup
 */

interface JsonLdProps {
  data: Record<string, any>;
  id?: string;
}

/**
 * Generic JSON-LD schema renderer
 * Safely renders JSON-LD script tag with proper escaping
 */
export function JsonLd({ data, id }: JsonLdProps) {
  const jsonString = JSON.stringify(data, null, 0);

  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  );
}
