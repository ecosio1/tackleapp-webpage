/**
 * Blog pagination utilities
 * All operations use index only (no file reads)
 */

import { loadContentIndex, BlogPostIndexEntry } from './index';
import { BlogPostDisplay } from './blog';

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  category?: string;
  sortBy?: 'publishedAt' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedBlogPosts {
  posts: BlogPostDisplay[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalPosts: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Get paginated blog posts from index only
 * Never reads post JSON files
 */
export async function getPaginatedBlogPosts(
  options: PaginationOptions = {}
): Promise<PaginatedBlogPosts> {
  const {
    page = 1,
    pageSize = 24, // Default: 24 posts per page (20-30 range)
    category,
    sortBy = 'publishedAt',
    sortOrder = 'desc',
  } = options;

  // Load index only (1 file read regardless of post count)
  const index = await loadContentIndex();

  // Filter posts from index
  let posts = index.blogPosts.filter((entry) => {
    // Filter out drafts and noindex
    if (entry.flags?.draft || entry.flags?.noindex) {
      return false;
    }
    // Filter by category if specified
    if (category && entry.category !== category) {
      return false;
    }
    return true;
  });

  // Sort posts
  posts.sort((a, b) => {
    let comparison = 0;

    if (sortBy === 'publishedAt') {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      comparison = dateA - dateB;
    } else if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title);
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });

  // Calculate pagination
  const totalPosts = posts.length;
  const totalPages = Math.ceil(totalPosts / pageSize);
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  // Get page slice
  const pagePosts = posts.slice(startIndex, endIndex);

  // Convert to display format
  const displayPosts: BlogPostDisplay[] = pagePosts.map((entry) => {
    const wordCount = entry.wordCount || 0;
    const readTime = wordCount > 0
      ? Math.ceil(wordCount / 200)
      : Math.ceil((entry.description?.split(/\s+/).length || 0) * 10 / 200);

    return {
      slug: entry.slug,
      title: entry.title,
      description: entry.description,
      category: entry.category,
      publishedAt: entry.publishedAt,
      heroImage: entry.featuredImage || entry.heroImage,
      readTime: readTime || 5,
      author: entry.author || 'Tackle Fishing Team',
    };
  });

  return {
    posts: displayPosts,
    pagination: {
      currentPage,
      pageSize,
      totalPages,
      totalPosts,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    },
  };
}

/**
 * Get total post count from index (no file reads)
 */
export async function getTotalBlogPostCount(category?: string): Promise<number> {
  const index = await loadContentIndex();

  let count = index.blogPosts.filter((entry) => {
    if (entry.flags?.draft || entry.flags?.noindex) {
      return false;
    }
    if (category && entry.category !== category) {
      return false;
    }
    return true;
  }).length;

  return count;
}
