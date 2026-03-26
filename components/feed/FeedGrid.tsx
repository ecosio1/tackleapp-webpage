'use client';

import { FeedCard } from './FeedCard';
import type { FeedItemIndexEntry } from '../../lib/types/feed';

interface FeedGridProps {
  items: FeedItemIndexEntry[];
  columns?: 2 | 3 | 4;
  className?: string;
}

/**
 * FeedGrid component - responsive grid layout for feed items
 */
export function FeedGrid({ items, columns = 4, className = '' }: FeedGridProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
        <p className="text-gray-600">No content available at this time.</p>
        <p className="mt-2 text-sm text-gray-500">Check back later for fresh fishing content!</p>
      </div>
    );
  }

  // Build responsive grid classes based on target columns
  const gridClasses: Record<number, string> = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-6 ${className}`}>
      {items.map((item) => (
        <FeedCard key={item.id} item={item} />
      ))}
    </div>
  );
}
