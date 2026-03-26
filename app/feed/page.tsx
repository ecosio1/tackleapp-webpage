/**
 * Feed Page - Multi-source content aggregator
 * Displays fishing videos and articles from YouTube, Instagram, TikTok, and RSS
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { generateCanonical } from '@/lib/seo/canonical';
import { FeedGrid } from '@/components/feed/FeedGrid';
import { Pagination } from '@/components/blog/Pagination';
import { getPaginatedFeedItems, getFeedStats } from '@/lib/content/feed';
import type { FeedSource } from '@/lib/types/feed';
import { getSourceDisplayName } from '@/lib/types/feed';

interface FeedPageProps {
  searchParams: Promise<{ page?: string; source?: string }>;
}

export async function generateMetadata({ searchParams }: FeedPageProps): Promise<Metadata> {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const source = params.source as FeedSource | undefined;

  const sourceLabel = source ? getSourceDisplayName(source) : 'All Sources';
  const pageLabel = page > 1 ? ` - Page ${page}` : '';

  const canonical =
    page === 1 && !source
      ? generateCanonical('/feed')
      : generateCanonical(`/feed?${new URLSearchParams({ ...(source && { source }), ...(page > 1 && { page: String(page) }) }).toString()}`);

  return {
    title: `Fishing Videos & News Feed${source ? ` - ${sourceLabel}` : ''}${pageLabel}`,
    description:
      'Watch the latest fishing videos from top creators on YouTube, Instagram, and TikTok, plus fishing news and articles from trusted sources.',
    alternates: {
      canonical,
    },
    robots:
      page === 1 && !source
        ? undefined
        : {
            index: true,
            follow: true,
          },
  };
}

/**
 * Source filter tabs
 */
function SourceTabs({
  currentSource,
  stats,
}: {
  currentSource: FeedSource | 'all';
  stats: { bySource: Record<FeedSource, number> };
}) {
  const sources: Array<{ key: FeedSource | 'all'; label: string; count: number }> = [
    { key: 'all', label: 'All', count: Object.values(stats.bySource).reduce((a, b) => a + b, 0) },
    { key: 'youtube', label: 'YouTube', count: stats.bySource.youtube },
    { key: 'instagram', label: 'Instagram', count: stats.bySource.instagram },
    { key: 'tiktok', label: 'TikTok', count: stats.bySource.tiktok },
    { key: 'rss', label: 'News', count: stats.bySource.rss },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {sources.map(({ key, label, count }) => {
        const isActive = currentSource === key;
        const href = key === 'all' ? '/feed' : `/feed?source=${key}`;

        return (
          <Link
            key={key}
            href={href}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label}
            {count > 0 && (
              <span className={`ml-1.5 ${isActive ? 'text-blue-200' : 'text-gray-500'}`}>
                ({count})
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const sourceParam = params.source as FeedSource | undefined;
  const source: FeedSource | 'all' = sourceParam || 'all';

  // Get paginated feed items
  const { items, pagination } = await getPaginatedFeedItems({
    page,
    pageSize: 24,
    source,
    sortBy: 'publishedAt',
    sortOrder: 'desc',
  });

  // Get stats for filter tabs
  const stats = await getFeedStats();

  // Handle empty state
  if (items.length === 0 && page === 1) {
    return (
      <div>
        <header className="page-header text-center mb-12 py-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
            Fishing Videos & News
          </h1>
          <p className="page-intro text-lg text-gray-600 max-w-2xl mx-auto">
            The latest fishing content from top creators and trusted news sources.
          </p>
        </header>

        <SourceTabs currentSource={source} stats={stats} />

        <div className="text-center py-16 px-4">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">📺</div>
            <p className="text-xl text-gray-700 mb-2 font-semibold">No content available yet</p>
            <p className="text-gray-600">
              {source !== 'all'
                ? `No ${getSourceDisplayName(source)} content available. Try checking another source.`
                : 'Check back soon for fresh fishing videos and articles!'}
            </p>
            {source !== 'all' && (
              <Link
                href="/feed"
                className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                View all content
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Build pagination base path with source filter
  const paginationBasePath = source !== 'all' ? `/feed?source=${source}` : '/feed';

  return (
    <div>
      <header className="page-header text-center mb-12 py-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-4">
          Fishing Videos & News
        </h1>
        <p className="page-intro text-lg text-gray-600 max-w-2xl mx-auto">
          The latest fishing content from top creators and trusted news sources.
        </p>
      </header>

      <SourceTabs currentSource={source} stats={stats} />

      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {source === 'all' ? 'Latest Content' : getSourceDisplayName(source)}
            {page > 1 && ` (Page ${page})`}
          </h2>
          {pagination.totalItems > 0 && (
            <p className="text-sm text-gray-500 font-medium">
              Showing {(page - 1) * pagination.pageSize + 1}-
              {Math.min(page * pagination.pageSize, pagination.totalItems)} of{' '}
              {pagination.totalItems} items
            </p>
          )}
        </div>

        <FeedGrid items={items} columns={4} />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            basePath={paginationBasePath}
          />
        )}
      </section>

      {/* Attribution notice */}
      <div className="text-center py-8 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Content is aggregated from publicly available sources. All videos and articles link to
          their original sources. Video thumbnails and metadata are provided by the respective
          platforms.
        </p>
      </div>
    </div>
  );
}
