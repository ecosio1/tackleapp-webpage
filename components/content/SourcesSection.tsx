/**
 * Sources Section Component
 * Displays "Sources Consulted" section
 */

import { Source } from '@/scripts/pipeline/types';

interface SourcesSectionProps {
  sources: Source[];
  className?: string;
}

export function SourcesSection({ sources, className = '' }: SourcesSectionProps) {
  if (sources.length === 0) {
    return null;
  }
  
  // Format retrieved date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return 'recently';
    }
  };
  
  return (
    <section className={`sources-section ${className}`}>
      <h2>Sources Consulted</h2>
      <p className="sources-intro">
        The following sources were consulted in creating this guide:
      </p>
      <ul className="sources-list">
        {sources.map((source, index) => (
          <li key={index} className="source-item">
            <strong>{source.label}</strong>
            {source.publisher && ` (${source.publisher})`}
            {source.url && (
              <>
                {' – '}
                <a
                  href={source.url}
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="source-link"
                >
                  {new URL(source.url).hostname}
                </a>
              </>
            )}
            {source.retrievedAt && (
              <> (retrieved {formatDate(source.retrievedAt)})</>
            )}
            {source.notes && (
              <span className="source-notes"> – {source.notes}</span>
            )}
          </li>
        ))}
      </ul>
      <p className="sources-disclaimer">
        <em>
          Note: Information is summarized and explained in our own words. Always verify current regulations with official sources.
        </em>
      </p>
    </section>
  );
}



