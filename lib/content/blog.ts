/**
 * Blog content access functions
 * Reads blog posts from the content system
 */

import { loadContentDoc, loadContentIndex, BlogPostIndexEntry } from './index';
import { BlogPostDoc } from '@/scripts/pipeline/types';
import fs from 'fs/promises';
import path from 'path';

/**
 * Blog post data for display
 */
export interface BlogPostDisplay {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  heroImage?: string;
  readTime?: number;
  author?: string;
}

/**
 * Blog category with post count
 */
export interface BlogCategory {
  slug: string;
  name: string;
  count: number;
}

/**
 * Load all blog posts from content index ONLY (no file reads)
 * Filters out drafts and noindex posts
 * Sorts by publishedAt (newest first)
 */
export async function loadAllBlogPosts(): Promise<BlogPostDisplay[]> {
  const index = await loadContentIndex();
  
  return index.blogPosts
    .filter((entry) => {
      // Only include published posts
      if (entry.flags?.draft || entry.flags?.noindex) {
        return false;
      }
      
      // Quarantine check: exclude posts with invalid structure in index
      // If a post is in the index but has missing required fields, exclude it
      if (!entry.slug || !entry.title || !entry.description || !entry.category) {
        // Log quarantine (but don't spam - only log once per session)
        console.warn(
          `[CONTENT_QUARANTINE] ${new Date().toISOString()} - Excluding invalid post from listing\n` +
          `  slug="${entry.slug || 'missing'}"\n` +
          `  reason="Missing required fields in index entry"`
        );
        return false;
      }
      
      return true;
    })
    .map((entry) => {
      // Calculate read time from wordCount (if available) or estimate
      const wordCount = entry.wordCount || 0;
      const readTime = wordCount > 0 
        ? Math.ceil(wordCount / 200) 
        : Math.ceil((entry.description?.split(/\s+/).length || 0) * 10 / 200); // Estimate from description
      
      return {
        slug: entry.slug,
        title: entry.title,
        description: entry.description,
        category: entry.category,
        publishedAt: entry.publishedAt,
        heroImage: entry.featuredImage || entry.heroImage,
        readTime: readTime || 5, // Default to 5 min if can't calculate
        author: entry.author || 'Tackle Fishing Team',
      };
    })
    .sort((a, b) => {
      // Sort by publishedAt (newest first)
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
}

/**
 * Get all blog categories with post counts
 * Reads from index only (no file reads)
 * Returns empty array if no categories exist (prevents crashes)
 */
export async function getAllBlogCategories(): Promise<BlogCategory[]> {
  try {
    const posts = await loadAllBlogPosts(); // Already reads from index only
    
    // If no posts, return empty array
    if (posts.length === 0) {
      return [];
    }
    
    // Count posts by category
    const categoryMap = new Map<string, number>();
    
    posts.forEach((post) => {
      if (post.category) {
        const count = categoryMap.get(post.category) || 0;
        categoryMap.set(post.category, count + 1);
      }
    });
    
    // Convert to array and format
    return Array.from(categoryMap.entries())
      .filter(([slug, count]) => count > 0) // Only include categories with posts
      .map(([slug, count]) => ({
        slug,
        name: formatCategoryName(slug),
        count,
      }))
      .sort((a, b) => b.count - a.count); // Sort by count (most posts first)
  } catch (error) {
    console.error('[getAllBlogCategories] Failed to load categories:', error);
    return []; // Return empty array instead of crashing
  }
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
 * Get blog post by slug
 * Loads the full post file directly (not from index, since index doesn't have body)
 * Logs all failures with slug, file path, and error reason
 */
export async function getBlogPostBySlug(slug: string): Promise<BlogPostDoc | null> {
  // Load file directly (index doesn't contain body, so we need the file)
  const filePath = path.join(process.cwd(), 'content', 'blog', `${slug}.json`);
  
  try {
    // Check if file exists
    await fs.access(filePath);
  } catch (error) {
    // File doesn't exist or cannot be accessed
    const { logContentLoadError } = await import('./logger');
    const fileError = error as NodeJS.ErrnoException;
    
    if (fileError.code === 'ENOENT') {
      logContentLoadError({
        slug,
        filePath,
        reason: 'File not found',
        error: fileError,
      });
    } else {
      logContentLoadError({
        slug,
        filePath,
        reason: 'Cannot access file',
        error: fileError,
      });
    }
    
    return null;
  }
  
  // Load the file
  const doc = await loadContentDoc(filePath);
  
  if (!doc) {
    // loadContentDoc already logged the error
    return null;
  }
  
  // Runtime schema validation - protects renderer from bad JSON
  const { validateAndQuarantine } = await import('./schema-validator');
  const validatedDoc = validateAndQuarantine(doc, slug, filePath, 'blog');
  
  if (!validatedDoc) {
    // Document is quarantined (invalid schema) - already logged
    return null;
  }
  
  // Additional slug validation
  if (validatedDoc.slug !== slug) {
    const { logContentValidationError } = await import('./logger');
    logContentValidationError({
      slug,
      filePath,
      reason: 'Slug mismatch',
      validationErrors: [`Expected slug="${slug}", got "${validatedDoc.slug}"`],
    });
    return null;
  }
  
  // Filter out drafts and noindex (these are valid states, not errors)
  if (validatedDoc.flags.draft || validatedDoc.flags.noindex) {
    // Don't log this as an error - it's expected behavior
    return null;
  }
  
  return validatedDoc as BlogPostDoc;
}

/**
 * Get posts by category
 */
export async function getPostsByCategory(categorySlug: string): Promise<BlogPostDisplay[]> {
  const posts = await loadAllBlogPosts();
  return posts.filter((post) => post.category === categorySlug);
}

/**
 * Get related blog posts (excludes current post)
 * Returns empty array if no related posts exist (prevents crashes)
 */
export async function getRelatedBlogPosts(currentSlug: string, limit: number = 3): Promise<BlogPostDisplay[]> {
  try {
    const posts = await loadAllBlogPosts();
    return posts
      .filter((post) => post && post.slug && post.slug !== currentSlug)
      .slice(0, limit);
  } catch (error) {
    console.error('[getRelatedBlogPosts] Failed to load related posts:', error);
    return []; // Return empty array instead of crashing
  }
}
