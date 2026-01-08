/**
 * FAQ Schema Component
 * Adds FAQPage JSON-LD schema
 */

interface Faq {
  question: string;
  answer: string;
}

interface FaqSchemaProps {
  faqs: Faq[];
}

export function FaqSchema({ faqs }: FaqSchemaProps) {
  if (faqs.length === 0) return null;

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}



