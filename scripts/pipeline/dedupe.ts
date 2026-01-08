/**
 * Deduplication - Prevents duplicate content
 */

import { TopicIndexRecord } from './types';
import { loadTopicIndex } from './topicIndex';
import { logger } from './logger';
import crypto from 'crypto';

/**
 * Normalize text for hashing
 */
export function normalizeTextForHash(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .trim();
}

/**
 * Generate content hash (SHA-256)
 */
export function contentHash(text: string): string {
  const normalized = normalizeTextForHash(text);
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

/**
 * Simple token-based similarity check
 */
export function calculateSimilarity(text1: string, text2: string): number {
  const tokens1 = new Set(normalizeTextForHash(text1).split(/\s+/));
  const tokens2 = new Set(normalizeTextForHash(text2).split(/\s+/));
  
  const intersection = new Set([...tokens1].filter((x) => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);
  
  // Jaccard similarity
  return intersection.size / union.size;
}

/**
 * Check if content is near duplicate
 */
export async function isNearDuplicate(
  newText: string,
  threshold: number = 0.85
): Promise<{ isDuplicate: boolean; similarTopicKey?: string; similarity?: number }> {
  const index = await loadTopicIndex();
  const newHash = contentHash(newText);
  
  // Check against existing content hashes
  for (const record of index) {
    if (record.contentHash === newHash) {
      // Exact duplicate
      return {
        isDuplicate: true,
        similarTopicKey: record.topicKey,
        similarity: 1.0,
      };
    }
    
    // Check similarity (if we have content to compare)
    // Note: In production, you'd store embeddings for better similarity
    const similarity = calculateSimilarity(newText, record.contentHash); // Simplified
    if (similarity > threshold) {
      return {
        isDuplicate: true,
        similarTopicKey: record.topicKey,
        similarity,
      };
    }
  }
  
  return { isDuplicate: false };
}

/**
 * Check if topic key already exists
 */
export async function topicKeyExists(topicKey: string): Promise<boolean> {
  const index = await loadTopicIndex();
  return index.some((record) => record.topicKey === topicKey && record.status === 'published');
}

/**
 * Resolve slug collision
 */
export async function resolveSlugCollision(
  desiredSlug: string,
  pageType: string
): Promise<string> {
  // Check if slug exists in topic index
  const index = await loadTopicIndex();
  const existing = index.find(
    (r) => r.slug === desiredSlug && r.pageType === pageType && r.status === 'published'
  );
  
  if (!existing) {
    return desiredSlug; // No collision
  }
  
  // Collision detected - append suffix
  logger.warn(`Slug collision detected: ${desiredSlug}, appending suffix`);
  
  let counter = 2;
  let newSlug = `${desiredSlug}-${counter}`;
  
  while (index.some((r) => r.slug === newSlug && r.status === 'published')) {
    counter++;
    newSlug = `${desiredSlug}-${counter}`;
  }
  
  return newSlug;
}



