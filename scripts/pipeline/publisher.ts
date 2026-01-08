/**
 * Publisher - Publishes content to storage
 */

import { GeneratedDoc } from './types';
import { markPublished } from './topicIndex';
import { updateContentIndex } from './internalLinks';
import { contentHash } from './dedupe';
import { logger } from './logger';
import fs from 'fs/promises';
import path from 'path';

/**
 * Publish document to storage
 */
export async function publishDoc(doc: GeneratedDoc): Promise<{ routePath: string; slug: string }> {
  logger.info(`Publishing ${doc.pageType}:${doc.slug}`);
  
  // Determine file path based on page type
  const filePath = getFilePath(doc);
  
  // Ensure directory exists
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  
  // Write JSON file
  await fs.writeFile(filePath, JSON.stringify(doc, null, 2), 'utf-8');
  logger.info(`Written to: ${filePath}`);
  
  // Update topic index
  const hash = contentHash(doc.body);
  const sourcesUsed = doc.sources.map((s) => s.url);
  const topicKey = generateTopicKey(doc);
  
  await markPublished(topicKey, doc.slug, hash, sourcesUsed);
  
  // Update content index
  await updateContentIndex({
    pageType: doc.pageType,
    slug: doc.slug,
    keywords: [doc.primaryKeyword, ...doc.secondaryKeywords],
    tags: 'tags' in doc ? doc.tags : undefined,
    category: 'categorySlug' in doc ? doc.categorySlug : 'category' in doc ? doc.category : undefined,
    state: 'stateSlug' in doc ? doc.stateSlug : undefined,
    city: 'citySlug' in doc ? doc.citySlug : undefined,
  });
  
  // Determine route path
  const routePath = getRoutePath(doc);
  
  return { routePath, slug: doc.slug };
}

/**
 * Get file path for document
 */
function getFilePath(doc: GeneratedDoc): string {
  const baseDir = path.join(process.cwd(), 'content');
  
  switch (doc.pageType) {
    case 'blog':
      return path.join(baseDir, 'blog', `${doc.slug}.json`);
    case 'species':
      return path.join(baseDir, 'species', `${doc.slug}.json`);
    case 'how-to':
      return path.join(baseDir, 'how-to', `${doc.slug}.json`);
    case 'location':
      const locationDoc = doc as Extract<GeneratedDoc, { pageType: 'location' }>;
      return path.join(baseDir, 'locations', locationDoc.stateSlug, `${locationDoc.citySlug}.json`);
    default:
      throw new Error(`Unknown page type: ${(doc as any).pageType}`);
  }
}

/**
 * Get route path for document
 */
function getRoutePath(doc: GeneratedDoc): string {
  switch (doc.pageType) {
    case 'blog':
      return `/blog/${doc.slug}`;
    case 'species':
      return `/species/${doc.slug}`;
    case 'how-to':
      return `/how-to/${doc.slug}`;
    case 'location':
      const locationDoc = doc as Extract<GeneratedDoc, { pageType: 'location' }>;
      return `/locations/${locationDoc.stateSlug}/${locationDoc.citySlug}`;
    default:
      throw new Error(`Unknown page type: ${(doc as any).pageType}`);
  }
}

/**
 * Generate topic key from document
 */
function generateTopicKey(doc: GeneratedDoc): string {
  switch (doc.pageType) {
    case 'species':
      return `species::${doc.slug}::global`;
    case 'how-to':
      return `howto::${doc.slug}`;
    case 'location':
      const locationDoc = doc as Extract<GeneratedDoc, { pageType: 'location' }>;
      return `location::${locationDoc.stateSlug}::${locationDoc.citySlug}`;
    case 'blog':
      return `blog::${doc.slug}`;
    default:
      throw new Error(`Unknown page type: ${(doc as any).pageType}`);
  }
}



