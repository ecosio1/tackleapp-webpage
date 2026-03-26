'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { FeedCard } from './FeedCard';
import type { FeedItemIndexEntry } from '../../lib/types/feed';

interface FeedSidebarProps {
  items: FeedItemIndexEntry[];
  title?: string;
  maxItems?: number;
  showViewAll?: boolean;
}

/**
 * FeedSidebar component - compact vertical list for blog post sidebars
 */
export function FeedSidebar({
  items,
  title = 'Related Videos',
  maxItems = 4,
  showViewAll = true,
}: FeedSidebarProps) {
  const displayItems = items.slice(0, maxItems);

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <aside className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        {showViewAll && (
          <Link
            href="/feed"
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      <div className="space-y-2">
        {displayItems.map((item) => (
          <FeedCard key={item.id} item={item} variant="compact" />
        ))}
      </div>
    </aside>
  );
}
