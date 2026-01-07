/**
 * Last Updated Component
 * Displays last updated date and author
 */

interface LastUpdatedProps {
  date: string;
  author: string;
  className?: string;
}

export function LastUpdated({ date, author, className = '' }: LastUpdatedProps) {
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'recently';
    }
  };

  return (
    <div className={`last-updated ${className}`}>
      <p className="last-updated-text">
        Last updated: {formatDate(date)} by {author}
      </p>
    </div>
  );
}


