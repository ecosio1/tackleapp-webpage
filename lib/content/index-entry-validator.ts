/**
 * Index Entry Validator
 * Ensures index entries contain only minimal listing data
 * Prevents heavy data (body, FAQs, sources, long arrays) from being added
 */

import { BlogPostIndexEntry } from './index';

const MAX_KEYWORDS_IN_INDEX = 10; // Limit keywords array
const MAX_TAGS_IN_INDEX = 5; // Limit tags array

/**
 * Validate that an index entry contains only minimal listing data
 * Throws error if heavy data is detected
 */
export function validateIndexEntry(entry: BlogPostIndexEntry): void {
  const errors: string[] = [];

  // Check for forbidden fields (should not exist)
  const forbiddenFields = ['body', 'faqs', 'sources', 'related', 'headings', 'vibeTest', 'alternativeRecommendations'];
  for (const field of forbiddenFields) {
    if (field in entry) {
      errors.push(`Forbidden field "${field}" found in index entry. Index should only contain listing data.`);
    }
  }

  // Check for long arrays
  if (entry.keywords && entry.keywords.length > MAX_KEYWORDS_IN_INDEX) {
    errors.push(
      `Keywords array too long (${entry.keywords.length} items, max ${MAX_KEYWORDS_IN_INDEX}). ` +
      `Index should only contain essential keywords for listing.`
    );
  }

  if (entry.tags && entry.tags.length > MAX_TAGS_IN_INDEX) {
    errors.push(
      `Tags array too long (${entry.tags.length} items, max ${MAX_TAGS_IN_INDEX}). ` +
      `Index should only contain essential tags for listing.`
    );
  }

  // Check required fields exist
  if (!entry.slug) errors.push('Missing required field: slug');
  if (!entry.title) errors.push('Missing required field: title');
  if (!entry.description) errors.push('Missing required field: description');
  if (!entry.category) errors.push('Missing required field: category');
  if (!entry.publishedAt) errors.push('Missing required field: publishedAt');

  if (errors.length > 0) {
    throw new Error(
      `Invalid index entry for slug="${entry.slug}":\n${errors.map(e => `  - ${e}`).join('\n')}`
    );
  }
}

/**
 * Sanitize index entry to ensure it only contains allowed fields
 * Truncates long arrays to maximum allowed length
 */
export function sanitizeIndexEntry(entry: any): BlogPostIndexEntry {
  // Extract only allowed fields
  const sanitized: BlogPostIndexEntry = {
    slug: entry.slug,
    title: entry.title,
    description: entry.description,
    category: entry.category,
    publishedAt: entry.publishedAt,
    updatedAt: entry.updatedAt,
    wordCount: entry.wordCount,
    author: entry.author,
    flags: entry.flags ? {
      draft: entry.flags.draft || false,
      noindex: entry.flags.noindex || false,
    } : undefined,
  };

  // Add optional fields (with limits)
  if (entry.heroImage) {
    sanitized.heroImage = entry.heroImage;
  }
  if (entry.featuredImage) {
    sanitized.featuredImage = entry.featuredImage;
  }

  // Limit keywords array
  if (entry.keywords && Array.isArray(entry.keywords)) {
    sanitized.keywords = entry.keywords.slice(0, MAX_KEYWORDS_IN_INDEX);
  }

  // Limit tags array
  if (entry.tags && Array.isArray(entry.tags)) {
    sanitized.tags = entry.tags.slice(0, MAX_TAGS_IN_INDEX);
  }

  return sanitized;
}
