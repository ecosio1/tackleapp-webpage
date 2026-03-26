/**
 * Feed content access functions
 * Reads feed items from the content system
 */

import fs from 'fs/promises';
import path from 'path';
import type {
  FeedIndex,
  FeedItem,
  FeedItemIndexEntry,
  FeedSource,
  FeedPaginationOptions,
  PaginatedFeedResult,
} from '../types/feed';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const FEED_INDEX_PATH = path.join(CONTENT_DIR, '_system', 'feedIndex.json');
const FEED_DIR = path.join(CONTENT_DIR, 'feed');

/**
 * Empty feed index for fallback
 */
const EMPTY_FEED_INDEX: FeedIndex = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  totalItems: 0,
  items: [],
};

/**
 * Load feed index from file
 * Returns empty index if file doesn't exist or is invalid
 */
export async function loadFeedIndex(): Promise<FeedIndex> {
  try {
    const content = await fs.readFile(FEED_INDEX_PATH, 'utf-8');
    const index = JSON.parse(content) as FeedIndex;

    // Basic validation
    if (!index.items || !Array.isArray(index.items)) {
      console.warn('[loadFeedIndex] Invalid feed index structure, returning empty');
      return EMPTY_FEED_INDEX;
    }

    return index;
  } catch (error) {
    // File doesn't exist or is invalid
    const fileError = error as NodeJS.ErrnoException;
    if (fileError.code !== 'ENOENT') {
      console.error('[loadFeedIndex] Error loading feed index:', error);
    }
    return EMPTY_FEED_INDEX;
  }
}

/**
 * Get paginated feed items with optional filtering
 */
export async function getPaginatedFeedItems(
  options: FeedPaginationOptions = {}
): Promise<PaginatedFeedResult> {
  const {
    page = 1,
    pageSize = 24,
    source = 'all',
    sortBy = 'publishedAt',
    sortOrder = 'desc',
  } = options;

  const index = await loadFeedIndex();
  let items = [...index.items];

  // Filter by source if specified
  if (source !== 'all') {
    items = items.filter((item) => item.source === source);
  }

  // Sort items
  items.sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'publishedAt') {
      comparison = new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    } else if (sortBy === 'relevanceScore') {
      comparison = b.relevanceScore - a.relevanceScore;
    }

    return sortOrder === 'desc' ? comparison : -comparison;
  });

  // Calculate pagination
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const paginatedItems = items.slice(startIndex, startIndex + pageSize);

  return {
    items: paginatedItems,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}

/**
 * Get feed items filtered by source
 */
export async function getFeedItemsBySource(
  source: FeedSource,
  limit?: number
): Promise<FeedItemIndexEntry[]> {
  const index = await loadFeedIndex();
  let items = index.items.filter((item) => item.source === source);

  if (limit) {
    items = items.slice(0, limit);
  }

  return items;
}

/**
 * Get related feed items based on tags
 * Useful for showing relevant videos in blog post sidebars
 */
export async function getRelatedFeedItems(
  tags: string[],
  limit: number = 4,
  excludeIds: string[] = []
): Promise<FeedItemIndexEntry[]> {
  const index = await loadFeedIndex();

  if (tags.length === 0) {
    // No tags to match, return top items by relevance
    return index.items
      .filter((item) => !excludeIds.includes(item.id))
      .slice(0, limit);
  }

  // Score items by tag overlap
  const normalizedTags = tags.map((t) => t.toLowerCase());
  const scoredItems = index.items
    .filter((item) => !excludeIds.includes(item.id))
    .map((item) => {
      const itemTags = item.tags.map((t) => t.toLowerCase());
      const matchCount = normalizedTags.filter((tag) =>
        itemTags.some((itemTag) => itemTag.includes(tag) || tag.includes(itemTag))
      ).length;

      return {
        item,
        matchScore: matchCount,
      };
    })
    .filter(({ matchScore }) => matchScore > 0)
    .sort((a, b) => {
      // Primary: match score
      if (b.matchScore !== a.matchScore) {
        return b.matchScore - a.matchScore;
      }
      // Secondary: relevance score
      return b.item.relevanceScore - a.item.relevanceScore;
    });

  // If no matches, fall back to top items by relevance
  if (scoredItems.length === 0) {
    return index.items
      .filter((item) => !excludeIds.includes(item.id))
      .slice(0, limit);
  }

  return scoredItems.slice(0, limit).map(({ item }) => item);
}

/**
 * Get feed items for landing page preview
 * Returns a mix of sources, preferring recent high-relevance content
 */
export async function getFeedPreviewItems(limit: number = 6): Promise<FeedItemIndexEntry[]> {
  const index = await loadFeedIndex();

  // Sort by combined relevance and recency
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;

  const scoredItems = index.items.map((item) => {
    const ageInDays = (now - new Date(item.publishedAt).getTime()) / dayInMs;
    const recencyBoost = Math.max(0, 10 - ageInDays); // Boost for items < 10 days old
    const combinedScore = item.relevanceScore + recencyBoost;

    return { item, score: combinedScore };
  });

  // Sort by score and take top items
  scoredItems.sort((a, b) => b.score - a.score);

  return scoredItems.slice(0, limit).map(({ item }) => item);
}

/**
 * Load full feed item by ID
 * Used when you need the complete item data (not just index entry)
 */
export async function getFeedItemById(id: string): Promise<FeedItem | null> {
  // Parse source and file ID from the composite ID
  const [source, ...fileIdParts] = id.split('-');
  const fileId = fileIdParts.join('-');

  if (!source || !fileId) {
    console.warn(`[getFeedItemById] Invalid ID format: ${id}`);
    return null;
  }

  const filePath = path.join(FEED_DIR, source, `${fileId}.json`);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content) as FeedItem;
  } catch (error) {
    const fileError = error as NodeJS.ErrnoException;
    if (fileError.code !== 'ENOENT') {
      console.error(`[getFeedItemById] Error loading feed item ${id}:`, error);
    }
    return null;
  }
}

/**
 * Get feed statistics
 */
export async function getFeedStats(): Promise<{
  total: number;
  bySource: Record<FeedSource, number>;
  lastUpdated: string;
}> {
  const index = await loadFeedIndex();

  const bySource: Record<FeedSource, number> = {
    youtube: 0,
    instagram: 0,
    tiktok: 0,
    rss: 0,
  };

  index.items.forEach((item) => {
    bySource[item.source]++;
  });

  return {
    total: index.totalItems,
    bySource,
    lastUpdated: index.lastUpdated,
  };
}

/**
 * Get all unique tags from feed items
 */
export async function getAllFeedTags(): Promise<string[]> {
  const index = await loadFeedIndex();

  const tagSet = new Set<string>();
  index.items.forEach((item) => {
    item.tags.forEach((tag) => tagSet.add(tag));
  });

  return Array.from(tagSet).sort();
}
