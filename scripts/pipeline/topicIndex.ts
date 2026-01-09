/**
 * Topic Index - Persistent storage for topic tracking
 */

import { TopicIndexRecord, TopicKey } from './types';
import { logger } from './logger';
import fs from 'fs/promises';
import path from 'path';

const TOPIC_INDEX_PATH = path.join(process.cwd(), 'content', '_system', 'topicIndex.json');

/**
 * Ensure directory exists
 */
async function ensureDirectory(): Promise<void> {
  const dir = path.dirname(TOPIC_INDEX_PATH);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

/**
 * Load topic index from file
 */
export async function loadTopicIndex(): Promise<TopicIndexRecord[]> {
  try {
    await ensureDirectory();
    const data = await fs.readFile(TOPIC_INDEX_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist, return empty array
    logger.info('Topic index not found, creating new one');
    return [];
  }
}

/**
 * Save topic index to file
 * ATOMIC WRITE: temp file → verify → rename (prevents corruption if process killed mid-write)
 */
export async function saveTopicIndex(index: TopicIndexRecord[]): Promise<void> {
  await ensureDirectory();
  
  // Atomic write: temp file → verify → rename
  const tempPath = `${TOPIC_INDEX_PATH}.tmp`;
  const jsonString = JSON.stringify(index, null, 2);
  
  // Validate JSON before writing
  JSON.parse(jsonString); // Verify it's valid JSON
  
  // Write to temp file first
  await fs.writeFile(tempPath, jsonString, 'utf-8');
  
  // Verify temp file was written correctly
  const written = await fs.readFile(tempPath, 'utf-8');
  if (written !== jsonString) {
    await fs.unlink(tempPath).catch(() => {}); // Clean up temp file
    throw new Error('Topic index write verification failed - written data does not match');
  }
  
  // Atomic rename (prevents corruption if process crashes)
  await fs.rename(tempPath, TOPIC_INDEX_PATH);
  
  logger.info(`Saved topic index with ${index.length} records`);
}

/**
 * Get record by topic key
 */
export async function getRecord(topicKey: TopicKey): Promise<TopicIndexRecord | null> {
  const index = await loadTopicIndex();
  return index.find((r) => r.topicKey === topicKey) || null;
}

/**
 * Upsert record
 */
export async function upsertRecord(record: TopicIndexRecord): Promise<void> {
  const index = await loadTopicIndex();
  const existingIndex = index.findIndex((r) => r.topicKey === record.topicKey);
  
  if (existingIndex >= 0) {
    // Update existing
    index[existingIndex] = {
      ...index[existingIndex],
      ...record,
      lastUpdatedAt: new Date().toISOString(),
    };
  } else {
    // Add new
    index.push({
      ...record,
      lastUpdatedAt: new Date().toISOString(),
    });
  }
  
  await saveTopicIndex(index);
}

/**
 * Mark topic as published
 */
export async function markPublished(
  topicKey: TopicKey,
  slug: string,
  contentHash: string,
  sourcesUsed: string[]
): Promise<void> {
  const record = await getRecord(topicKey);
  
  if (record) {
    await upsertRecord({
      ...record,
      slug,
      status: 'published',
      contentHash,
      sourcesUsed,
      lastPublishedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      lastError: undefined,
    });
  } else {
    // Create new record
    const index = await loadTopicIndex();
    const pageType = topicKey.split('::')[0] as TopicIndexRecord['pageType'];
    
    await upsertRecord({
      topicKey,
      pageType,
      slug,
      status: 'published',
      contentHash,
      sourcesUsed,
      lastPublishedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
    });
  }
  
  logger.info(`Marked topic as published: ${topicKey} -> ${slug}`);
}

/**
 * Mark topic as failed
 */
export async function markFailed(topicKey: TopicKey, error: string): Promise<void> {
  const record = await getRecord(topicKey);
  const index = await loadTopicIndex();
  const pageType = topicKey.split('::')[0] as TopicIndexRecord['pageType'];
  
  await upsertRecord({
    topicKey,
    pageType,
    slug: record?.slug || '',
    status: 'failed',
    contentHash: record?.contentHash || '',
    sourcesUsed: record?.sourcesUsed || [],
    lastUpdatedAt: new Date().toISOString(),
    lastError: error,
    attempts: (record?.attempts || 0) + 1,
  });
  
  logger.warn(`Marked topic as failed: ${topicKey} - ${error}`);
}

/**
 * Get all published topics
 */
export async function getAllPublishedTopics(): Promise<TopicIndexRecord[]> {
  const index = await loadTopicIndex();
  return index.filter((r) => r.status === 'published');
}



