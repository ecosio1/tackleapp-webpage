/**
 * Blog Content Loader
 *
 * Single source of truth for blog content.
 * All blog posts are stored as JSON files in content/blog/
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const CONTENT_DIR = join(process.cwd(), 'content');
const BLOG_DIR = join(CONTENT_DIR, 'blog');
const BLOG_INDEX_PATH = join(CONTENT_DIR, '_system', 'blogIndex.json');

// ============================================================================
// Types
// ============================================================================

export interface BlogPost {
  // Core Metadata
  id: string;
  slug: string;
  status: 'published' | 'draft' | 'archived';

  // Content
  title: string;
  description: string;
  body: string;
  excerpt?: string;

  // SEO
  primaryKeyword: string;
  secondaryKeywords: string[];
  heroImage?: string;

  // Organization
  category: string;
  tags?: string[];

  // Author & Dates
  author: {
    name: string;
    url?: string;
  };
  publishedAt: string;
  updatedAt: string;

  // Structure
  headings: Array<{
    level: 1 | 2 | 3;
    text: string;
    id?: string;
  }>;

  // FAQs
  faqs: Array<{
    question: string;
    answer: string;
  }>;

  // Sources
  sources: Array<{
    label: string;
    url: string;
    retrievedAt: string;
  }>;

  // Related Content
  related: {
    speciesSlugs?: string[];
    howToSlugs?: string[];
    locationSlugs?: string[];
    postSlugs?: string[];
  };

  // Advanced Features
  vibeTest?: {
    primaryScore: {
      name: string;
      value: number;
      explanation: string;
      factors: string[];
      lastUpdated: string;
    };
    uniqueInsights: string[];
    realWorldNotes: string[];
  };

  embeddedTools?: Array<{
    name: string;
    type: string;
    componentPath: string;
  }>;

  alternativeRecommendations?: Array<{
    title: string;
    slug: string;
    reason: string;
    relevanceScore: number;
  }>;

  // Metadata
  contentHash?: string;
  wordCount?: number;
  readingTimeMinutes?: number;
}

export interface BlogIndex {
  version: string;
  lastUpdated: string;
  totalPosts: number;
  posts: Array<{
    slug: string;
    title: string;
    category: string;
    publishedAt: string;
    status: 'published' | 'draft' | 'archived';
    filePath: string;
  }>;
}

// ============================================================================
// Content Loaders
// ============================================================================

/**
 * Load blog index
 */
export function loadBlogIndex(): BlogIndex {
  if (!existsSync(BLOG_INDEX_PATH)) {
    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      totalPosts: 0,
      posts: [],
    };
  }

  const content = readFileSync(BLOG_INDEX_PATH, 'utf-8');
  return JSON.parse(content);
}

/**
 * Load a single blog post by slug
 */
export function loadBlogPost(slug: string): BlogPost | null {
  const filePath = join(BLOG_DIR, `${slug}.json`);

  if (!existsSync(filePath)) {
    return null;
  }

  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Load all published blog posts
 */
export function loadAllBlogPosts(): BlogPost[] {
  const index = loadBlogIndex();

  return index.posts
    .filter((post) => post.status === 'published')
    .map((post) => loadBlogPost(post.slug))
    .filter((post): post is BlogPost => post !== null);
}

/**
 * Load blog posts by category
 */
export function loadBlogPostsByCategory(category: string): BlogPost[] {
  const allPosts = loadAllBlogPosts();
  return allPosts.filter((post) => post.category === category);
}

/**
 * Load featured blog posts (for homepage, etc.)
 */
export function loadFeaturedBlogPosts(limit: number = 3): BlogPost[] {
  const allPosts = loadAllBlogPosts();

  // Sort by publishedAt descending
  const sorted = allPosts.sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  return sorted.slice(0, limit);
}

/**
 * Get all blog categories
 */
export function getAllBlogCategories(): Array<{ slug: string; name: string; count: number }> {
  const allPosts = loadAllBlogPosts();
  const categoryCounts = new Map<string, number>();

  allPosts.forEach((post) => {
    const count = categoryCounts.get(post.category) || 0;
    categoryCounts.set(post.category, count + 1);
  });

  return Array.from(categoryCounts.entries()).map(([slug, count]) => ({
    slug,
    name: formatCategoryName(slug),
    count,
  }));
}

/**
 * Format category slug to display name
 */
function formatCategoryName(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get related blog posts
 */
export function getRelatedBlogPosts(currentSlug: string, limit: number = 3): BlogPost[] {
  const currentPost = loadBlogPost(currentSlug);
  if (!currentPost) return [];

  const allPosts = loadAllBlogPosts().filter((post) => post.slug !== currentSlug);

  // Score posts by relevance
  const scored = allPosts.map((post) => {
    let score = 0;

    // Same category: +10 points
    if (post.category === currentPost.category) {
      score += 10;
    }

    // Shared tags: +5 points per tag
    const currentTags = currentPost.tags || [];
    const postTags = post.tags || [];
    const sharedTags = currentTags.filter((tag) => postTags.includes(tag));
    score += sharedTags.length * 5;

    // Shared keywords: +3 points per keyword
    const currentKeywords = [
      currentPost.primaryKeyword,
      ...currentPost.secondaryKeywords,
    ];
    const postKeywords = [post.primaryKeyword, ...post.secondaryKeywords];
    const sharedKeywords = currentKeywords.filter((kw) =>
      postKeywords.some((pkw) => pkw.includes(kw) || kw.includes(pkw))
    );
    score += sharedKeywords.length * 3;

    // Listed in related: +20 points
    if (currentPost.related.postSlugs?.includes(post.slug)) {
      score += 20;
    }

    return { post, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((item) => item.post);
}

/**
 * Search blog posts
 */
export function searchBlogPosts(query: string): BlogPost[] {
  const allPosts = loadAllBlogPosts();
  const lowerQuery = query.toLowerCase();

  return allPosts.filter((post) => {
    return (
      post.title.toLowerCase().includes(lowerQuery) ||
      post.description.toLowerCase().includes(lowerQuery) ||
      post.body.toLowerCase().includes(lowerQuery) ||
      post.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  });
}

/**
 * Calculate reading time from word count
 */
export function calculateReadingTime(wordCount: number): number {
  // Average reading speed: 200 words per minute
  return Math.ceil(wordCount / 200);
}

/**
 * Count words in markdown/HTML content
 */
export function countWords(content: string): number {
  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, '');

  // Remove markdown syntax
  const cleaned = text
    .replace(/[#*_`~\[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned.split(' ').filter((word) => word.length > 0).length;
}
