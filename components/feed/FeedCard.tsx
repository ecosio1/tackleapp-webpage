'use client';

import Image from 'next/image';
import { Play, ExternalLink } from 'lucide-react';
import type { FeedItemIndexEntry, FeedSource } from '../../lib/types/feed';
import { getSourceDisplayName, isVideoType } from '../../lib/types/feed';

interface FeedCardProps {
  item: FeedItemIndexEntry;
  variant?: 'default' | 'compact';
}

/**
 * Source badge colors (Tailwind classes)
 */
const sourceColors: Record<FeedSource, { bg: string; text: string }> = {
  youtube: { bg: 'bg-red-600', text: 'text-white' },
  instagram: { bg: 'bg-gradient-to-r from-purple-500 to-pink-500', text: 'text-white' },
  tiktok: { bg: 'bg-black', text: 'text-white' },
  rss: { bg: 'bg-blue-600', text: 'text-white' },
};

/**
 * Source icons (simple text-based for now)
 */
function SourceIcon({ source }: { source: FeedSource }) {
  const icons: Record<FeedSource, string> = {
    youtube: '▶',
    instagram: '📷',
    tiktok: '♪',
    rss: '📰',
  };
  return <span className="mr-1">{icons[source]}</span>;
}

/**
 * Default card variant - grid layout with thumbnail
 */
function DefaultCard({ item }: { item: FeedItemIndexEntry }) {
  const { bg, text } = sourceColors[item.source];
  const isVideo = isVideoType(item.type);

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <a
        href={item.originalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        {/* Thumbnail */}
        <div className="relative h-40 w-full overflow-hidden bg-gray-200">
          {item.thumbnailUrl && !item.thumbnailUrl.includes('placeholder') ? (
            <Image
              src={item.thumbnailUrl}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <span className="text-4xl text-gray-400">
                {item.source === 'rss' ? '📰' : '🎬'}
              </span>
            </div>
          )}

          {/* Play button overlay for videos */}
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-lg">
                <Play className="h-6 w-6 text-gray-900 ml-1" fill="currentColor" />
              </div>
            </div>
          )}

          {/* Source badge */}
          <div className="absolute top-2 left-2">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${bg} ${text}`}>
              <SourceIcon source={item.source} />
              {getSourceDisplayName(item.source)}
            </span>
          </div>

          {/* External link indicator */}
          <div className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 shadow">
              <ExternalLink className="h-3 w-3 text-gray-700" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-grow p-4">
          <h3 className="mb-2 text-sm font-bold text-gray-900 line-clamp-2 leading-tight transition-colors group-hover:text-blue-600">
            {item.title}
          </h3>

          <div className="mt-auto flex items-center justify-between text-xs text-gray-500">
            <span className="truncate max-w-[60%]">@{item.creatorHandle}</span>
            <time dateTime={item.publishedAt}>
              {new Date(item.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </time>
          </div>
        </div>
      </a>
    </article>
  );
}

/**
 * Compact card variant - horizontal layout for sidebars
 */
function CompactCard({ item }: { item: FeedItemIndexEntry }) {
  const { bg, text } = sourceColors[item.source];
  const isVideo = isVideoType(item.type);

  return (
    <article className="group">
      <a
        href={item.originalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
      >
        {/* Thumbnail */}
        <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-200">
          {item.thumbnailUrl && !item.thumbnailUrl.includes('placeholder') ? (
            <Image
              src={item.thumbnailUrl}
              alt={item.title}
              fill
              sizes="96px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100">
              <span className="text-xl text-gray-400">
                {item.source === 'rss' ? '📰' : '🎬'}
              </span>
            </div>
          )}

          {/* Play indicator for videos */}
          {isVideo && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60">
                <Play className="h-3 w-3 text-white ml-0.5" fill="currentColor" />
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col min-w-0 flex-1">
          <h4 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600">
            {item.title}
          </h4>
          <div className="mt-auto flex items-center gap-2 text-[10px] text-gray-500">
            <span className={`inline-flex items-center rounded px-1 py-0.5 ${bg} ${text}`}>
              {getSourceDisplayName(item.source)}
            </span>
            <span className="truncate">@{item.creatorHandle}</span>
          </div>
        </div>
      </a>
    </article>
  );
}

/**
 * FeedCard component - displays a single feed item
 */
export function FeedCard({ item, variant = 'default' }: FeedCardProps) {
  if (variant === 'compact') {
    return <CompactCard item={item} />;
  }
  return <DefaultCard item={item} />;
}
