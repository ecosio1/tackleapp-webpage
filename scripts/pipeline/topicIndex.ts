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
 */
export async function saveTopicIndex(index: TopicIndexRecord[]): Promise<void> {
  await ensureDirectory();
  await fs.writeFile(TOPIC_INDEX_PATH, JSON.stringify(index, null, 2), 'utf-8');
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


