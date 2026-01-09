/**
 * Publisher - Publishes content to storage
 * WITH SAFEGUARDS: Prevents duplicates, validates fields, atomic index updates
 */

import { GeneratedDoc } from './types';
import { markPublished } from './topicIndex';
import { contentHash, topicKeyExists } from './dedupe';
import { logger } from './logger';
import fs from 'fs/promises';
import path from 'path';

/**
 * Validation errors
 */
export class PublishError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'PublishError';
  }
}

/**
 * Validate document has all required fields before publishing
 */
function validateRequiredFields(doc: GeneratedDoc): void {
  const errors: string[] = [];

  // Required base fields
  if (!doc.id) errors.push('Missing required field: id');
  if (!doc.pageType) errors.push('Missing required field: pageType');
  if (!doc.slug) errors.push('Missing required field: slug');
  if (!doc.title) errors.push('Missing required field: title');
  if (!doc.description) errors.push('Missing required field: description');
  if (!doc.body) errors.push('Missing required field: body');
  if (!doc.primaryKeyword) errors.push('Missing required field: primaryKeyword');
  if (!doc.secondaryKeywords || doc.secondaryKeywords.length === 0) {
    errors.push('Missing required field: secondaryKeywords');
  }
  if (!doc.headings || doc.headings.length === 0) {
    errors.push('Missing required field: headings');
  }
  if (!doc.faqs || doc.faqs.length === 0) {
    errors.push('Missing required field: faqs (minimum 1)');
  }
  if (!doc.sources || doc.sources.length === 0) {
    errors.push('Missing required field: sources (minimum 1)');
  }
  if (!doc.author) errors.push('Missing required field: author');
  if (!doc.dates) errors.push('Missing required field: dates');
  if (!doc.flags) errors.push('Missing required field: flags');

  // Validate dates
  if (doc.dates && (!doc.dates.publishedAt || !doc.dates.updatedAt)) {
    errors.push('Missing required date fields: publishedAt or updatedAt');
  }

  // Validate author
  if (doc.author && !doc.author.name) {
    errors.push('Missing required author field: name');
  }

  // Page-type specific validations
  if (doc.pageType === 'blog') {
    const blogDoc = doc as Extract<GeneratedDoc, { pageType: 'blog' }>;
    if (!blogDoc.categorySlug) {
      errors.push('Blog post missing required field: categorySlug');
    }
  }

  if (doc.pageType === 'location') {
    const locationDoc = doc as Extract<GeneratedDoc, { pageType: 'location' }>;
    if (!locationDoc.stateSlug) errors.push('Location missing required field: stateSlug');
    if (!locationDoc.citySlug) errors.push('Location missing required field: citySlug');
  }

  if (errors.length > 0) {
    throw new PublishError(
      `Document validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`,
      'VALIDATION_ERROR'
    );
  }
}

/**
 * Check if file already exists (duplicate slug check)
 */
async function checkFileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate JSON can be parsed (sanity check before writing)
 */
function validateJSON(data: any): void {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    JSON.parse(jsonString); // Verify it's valid JSON
  } catch (error) {
    throw new PublishError(
      `Invalid JSON structure: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'INVALID_JSON'
    );
  }
}

/**
 * Atomic write: Write to temp file, then rename (prevents corruption)
 */
async function atomicWrite(filePath: string, data: string): Promise<void> {
  const tempPath = `${filePath}.tmp`;
  const dir = path.dirname(filePath);

  // Ensure directory exists
  await fs.mkdir(dir, { recursive: true });

  // Write to temp file first
  await fs.writeFile(tempPath, data, 'utf-8');

  // Validate temp file was written correctly
  const written = await fs.readFile(tempPath, 'utf-8');
  if (written !== data) {
    await fs.unlink(tempPath).catch(() => {}); // Clean up temp file
    throw new PublishError('File write verification failed', 'WRITE_VERIFICATION_ERROR');
  }

  // Atomic rename (replaces existing file atomically)
  await fs.rename(tempPath, filePath);
}

/**
 * Atomic index update: Write to temp file, validate, then rename
 * WITH LOCKING: Prevents concurrent updates from corrupting the index
 */
async function atomicIndexUpdate(
  indexPath: string,
  updateFn: (index: any) => any
): Promise<void> {
  // Acquire lock before index update to prevent concurrent modifications
  const { withIndexLock } = await import('../../lib/content/index-lock');
  
  logger.info('Acquiring index lock...');
  await withIndexLock(async () => {
    logger.info('Index lock acquired, updating index...');
    await atomicIndexUpdateInternal(indexPath, updateFn);
    logger.info('Index update complete, releasing lock...');
  });
  logger.info('Index lock released');
}

/**
 * Internal atomic index update (called within lock)
 */
async function atomicIndexUpdateInternal(
  indexPath: string,
  updateFn: (index: any) => any
): Promise<void> {
  const tempPath = `${indexPath}.tmp`;
  const dir = path.dirname(indexPath);

  // Ensure directory exists
  await fs.mkdir(dir, { recursive: true });

  // Load current index (with recovery if corrupted)
  let index: any;
  try {
    // Use the recovery-enabled loadContentIndex
    const { loadContentIndex } = await import('../../lib/content/index');
    index = await loadContentIndex();
  } catch (error) {
    // If recovery also fails, create default structure
    logger.warn(`Index load and recovery failed, creating new index: ${error instanceof Error ? error.message : 'Unknown error'}`);
    index = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      species: [],
      howTo: [],
      locations: [],
      blogPosts: [],
    };
  }

  // Apply update
  const updatedIndex = updateFn(index);

  // Validate updated index structure
  if (!updatedIndex || typeof updatedIndex !== 'object') {
    throw new PublishError('Index update function returned invalid data', 'INVALID_INDEX_UPDATE');
  }

  // Validate JSON
  const jsonString = JSON.stringify(updatedIndex, null, 2);
  JSON.parse(jsonString); // Verify it's valid JSON

  // Write to temp file
  await fs.writeFile(tempPath, jsonString, 'utf-8');

  // Verify temp file
  const written = await fs.readFile(tempPath, 'utf-8');
  if (written !== jsonString) {
    await fs.unlink(tempPath).catch(() => {}); // Clean up
    throw new PublishError('Index write verification failed', 'INDEX_WRITE_VERIFICATION_ERROR');
  }

  // Atomic rename
  await fs.rename(tempPath, indexPath);
}

/**
 * Publish document to storage with safeguards
 */
export async function publishDoc(doc: GeneratedDoc): Promise<{ routePath: string; slug: string }> {
  const startTime = Date.now();
  logger.info(`Publishing ${doc.pageType}:${doc.slug}`);

  // SAFEGUARD 1: Validate required fields BEFORE any file operations
  logger.info('Validating required fields...');
  validateRequiredFields(doc);

  // SAFEGUARD 1.5: Run quality gate (fast, automated pre-publish checks)
  logger.info('Running quality gate...');
  const { runQualityGate } = await import('./quality-gate');
  const qualityGate = runQualityGate(doc);
  
  if (qualityGate.blocked) {
    throw new PublishError(
      `Quality gate BLOCKED publishing:\n${qualityGate.errors.map(e => `  - ${e}`).join('\n')}`,
      'QUALITY_GATE_FAILED'
    );
  }
  
  if (qualityGate.warnings.length > 0) {
    logger.warn('Quality gate warnings:', qualityGate.warnings);
  }
  
  logger.info('✅ Quality gate passed');

  // IDEMPOTENCY CHECK: Determine publish state before proceeding
  const filePath = getFilePath(doc);
  const topicKey = generateTopicKey(doc);
  
  // Check current state
  const fileExists = await checkFileExists(filePath);
  const { loadContentIndex } = await import('../../lib/content/index');
  const contentIndex = await loadContentIndex();
  const { getRecord } = await import('./topicIndex');
  const topicRecord = await getRecord(topicKey);
  
  // Check if slug exists in content index
  let slugInIndex = false;
  let indexEntry: any = null;
  
  switch (doc.pageType) {
    case 'blog':
      indexEntry = contentIndex.blogPosts.find((b: any) => b.slug === doc.slug);
      slugInIndex = !!indexEntry;
      break;
    case 'species':
      indexEntry = contentIndex.species.find((s: any) => s.slug === doc.slug);
      slugInIndex = !!indexEntry;
      break;
    case 'how-to':
      indexEntry = contentIndex.howTo.find((h: any) => h.slug === doc.slug);
      slugInIndex = !!indexEntry;
      break;
    case 'location':
      indexEntry = contentIndex.locations.find((l: any) => l.slug === doc.slug);
      slugInIndex = !!indexEntry;
      break;
  }
  
  const topicKeyPublished = topicRecord?.status === 'published' && topicRecord?.slug === doc.slug;
  
  // IDEMPOTENCY: Check if already fully published
  if (fileExists && slugInIndex && topicKeyPublished) {
    logger.info(`✅ Post already fully published: ${doc.slug} (idempotent skip)`);
    logger.info(`   - File exists: ${filePath}`);
    logger.info(`   - In content index: ${doc.pageType}`);
    logger.info(`   - Topic key published: ${topicKey}`);
    
    // Return success without re-publishing
    const routePath = getRoutePath(doc);
    return { routePath, slug: doc.slug };
  }
  
  // IDEMPOTENCY: Check for conflicts (different topicKey with same slug)
  if (fileExists && topicRecord && topicRecord.topicKey !== topicKey) {
    throw new PublishError(
      `Conflict: File exists with slug "${doc.slug}" but belongs to different topicKey "${topicRecord.topicKey}" (expected "${topicKey}"). Cannot overwrite.`,
      'SLUG_TOPICKEY_CONFLICT'
    );
  }
  
  if (slugInIndex && topicRecord && topicRecord.topicKey !== topicKey) {
    throw new PublishError(
      `Conflict: Slug "${doc.slug}" exists in content index but belongs to different topicKey "${topicRecord.topicKey}" (expected "${topicKey}"). Cannot overwrite.`,
      'SLUG_TOPICKEY_CONFLICT'
    );
  }
  
  // IDEMPOTENCY: If file exists but not fully published, we'll complete the publish
  if (fileExists && (!slugInIndex || !topicKeyPublished)) {
    logger.info(`⚠️  Post partially published: ${doc.slug} (completing publish)`);
    logger.info(`   - File exists: ${filePath}`);
    logger.info(`   - In content index: ${slugInIndex}`);
    logger.info(`   - Topic key published: ${topicKeyPublished}`);
    logger.info(`   - Completing missing steps...`);
  }
  
  // SAFEGUARD 2: Prevent overwriting finished posts (unless completing partial publish)
  // If file exists and is fully published, we already returned above
  // If file exists but not fully published, we'll complete it below
  // Only throw error if file exists with different topicKey (handled above)
  
  // SAFEGUARD 3: Prevent republishing same topicKey (unless completing partial publish)
  // If topicKey is published with same slug, we already returned above
  // If topicKey is published with different slug, that's a conflict (handled above)

  // SAFEGUARD 4: Validate JSON structure before writing
  logger.info('Validating JSON structure...');
  validateJSON(doc);

  // Track what we've written (for rollback on failure)
  let fileWritten = false;
  let topicIndexUpdated = false;
  let contentIndexUpdated = false;

  try {
    // IDEMPOTENCY: Only write file if it doesn't exist
    if (!fileExists) {
      // SAFEGUARD 5: Atomic file write (prevents corruption)
      logger.info(`Writing to: ${filePath}`);
      await atomicWrite(filePath, JSON.stringify(doc, null, 2));
      fileWritten = true;
      logger.info(`✅ File written successfully`);
    } else {
      logger.info(`⏭️  File already exists, skipping write: ${filePath}`);
      // Verify existing file is valid (sanity check)
      const { loadContentDoc } = await import('../../lib/content/index');
      try {
        const existingDoc = await loadContentDoc(filePath);
        if (!existingDoc || existingDoc.slug !== doc.slug) {
          throw new PublishError(
            `Existing file at ${filePath} has invalid or mismatched content`,
            'EXISTING_FILE_INVALID'
          );
        }
        logger.info(`✅ Existing file verified: ${filePath}`);
      } catch (error) {
        throw new PublishError(
          `Failed to verify existing file: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'EXISTING_FILE_VERIFICATION_FAILED'
        );
      }
    }

    // IDEMPOTENCY: Only update topic index if not already published
    if (!topicKeyPublished) {
      const hash = contentHash(doc.body);
      const sourcesUsed = doc.sources.map((s) => s.url);
      logger.info('Updating topic index...');
      await markPublished(topicKey, doc.slug, hash, sourcesUsed);
      topicIndexUpdated = true;
      logger.info('✅ Topic index updated');
    } else {
      logger.info(`⏭️  Topic key already published, skipping update: ${topicKey}`);
    }

    // SAFEGUARD 6: Atomic content index update (with backup)
    logger.info('Creating index backup...');
    const { backupContentIndex } = await import('../../lib/content/index-recovery');
    await backupContentIndex();
    
    logger.info('Updating content index...');
    
    // Import validateIndexEntry before using it in the callback (callback cannot be async)
    const { validateIndexEntry } = await import('../../lib/content/index-entry-validator');
    
    // IDEMPOTENCY: Only update content index if slug not already in index
    if (!slugInIndex) {
      await atomicIndexUpdate(
        path.join(process.cwd(), 'content', '_system', 'contentIndex.json'),
        (index) => {
          const entry = {
            slug: doc.slug,
            category: 'categorySlug' in doc ? doc.categorySlug : 'category' in doc ? doc.category : undefined,
            keywords: [doc.primaryKeyword, ...doc.secondaryKeywords],
            tags: 'tags' in doc ? doc.tags : undefined,
          };

          switch (doc.pageType) {
            case 'species':
              // IDEMPOTENCY: Check for duplicate slug (should not happen, but safe check)
              if (index.species.some((s: any) => s.slug === doc.slug)) {
                // Already in index - skip (idempotent)
                logger.info(`⏭️  Slug already in species index, skipping: ${doc.slug}`);
                return index;
              }
              index.species.push(entry);
              break;
            case 'how-to':
              if (index.howTo.some((h: any) => h.slug === doc.slug)) {
                // Already in index - skip (idempotent)
                logger.info(`⏭️  Slug already in how-to index, skipping: ${doc.slug}`);
                return index;
              }
              index.howTo.push(entry);
              break;
            case 'location':
              const locationEntry = {
                ...entry,
                state: 'stateSlug' in doc ? doc.stateSlug : undefined,
                city: 'citySlug' in doc ? doc.citySlug : undefined,
              };
              if (index.locations.some((l: any) => l.slug === doc.slug)) {
                // Already in index - skip (idempotent)
                logger.info(`⏭️  Slug already in locations index, skipping: ${doc.slug}`);
                return index;
              }
              index.locations.push(locationEntry);
              break;
            case 'blog':
              if (index.blogPosts.some((b: any) => b.slug === doc.slug)) {
                // Already in index - skip (idempotent)
                logger.info(`⏭️  Slug already in blog index, skipping: ${doc.slug}`);
                return index;
              }
              const blogDoc = doc as Extract<GeneratedDoc, { pageType: 'blog' }>;
              const wordCount = blogDoc.body.split(/\s+/).length;
              
              // Build index entry with ONLY listing data (no body, FAQs, sources, etc.)
              const blogEntry = {
                slug: blogDoc.slug,
                title: blogDoc.title,
                description: blogDoc.description,
                category: blogDoc.categorySlug,
                publishedAt: blogDoc.dates.publishedAt,
                updatedAt: blogDoc.dates.updatedAt,
                wordCount: wordCount,
                author: blogDoc.author.name,
                flags: {
                  draft: blogDoc.flags.draft || false,
                  noindex: blogDoc.flags.noindex || false,
                },
                // Optional fields (limited arrays)
                heroImage: blogDoc.heroImage,
                featuredImage: blogDoc.featuredImage,
                // Limit keywords to first 10 (for listing/search)
                keywords: [blogDoc.primaryKeyword, ...blogDoc.secondaryKeywords].slice(0, 10),
                // Limit tags to first 5 (for listing/filtering)
                tags: blogDoc.tags ? blogDoc.tags.slice(0, 5) : undefined,
              };
              
              // Validate index entry (ensures no heavy data) - imported before callback
              validateIndexEntry(blogEntry);
              
              index.blogPosts.push(blogEntry);
              break;
          }

          index.lastUpdated = new Date().toISOString();
          return index;
        }
      );
      contentIndexUpdated = true;
      logger.info('✅ Content index updated');
    } else {
      logger.info(`⏭️  Slug already in content index, skipping update: ${doc.slug}`);
    }

    // Generate automatic internal link suggestions (after publishing)
    try {
      const { generateAutoLinks } = await import('./auto-linking');
      const autoLinks = await generateAutoLinks(doc);
      logger.info(`Generated ${Object.values(autoLinks).flat().length} auto-link suggestions`);
      // Note: These suggestions are logged but not stored in the document yet
      // They can be used for future enhancements or displayed separately
    } catch (error) {
      logger.warn('Auto-linking failed, continuing without it:', error);
      // Don't fail the publish if auto-linking fails
    }

    // SAFEGUARD 7: On-demand revalidation (so posts appear immediately)
    try {
      const { revalidateContent } = await import('../../lib/content/revalidation');
      
      if (doc.pageType === 'blog') {
        const blogDoc = doc as Extract<GeneratedDoc, { pageType: 'blog' }>;
        const { revalidateBlogPost } = await import('../../lib/content/revalidation');
        await revalidateBlogPost(blogDoc.slug, blogDoc.categorySlug);
      } else {
        await revalidateContent(doc.pageType, doc.slug);
      }
      
      logger.info('✅ On-demand revalidation triggered');
    } catch (error) {
      logger.warn('On-demand revalidation failed (non-blocking):', error);
      // Don't fail the publish if revalidation fails
    }

    // Determine route path
    const routePath = getRoutePath(doc);

    logger.info(`✅ Successfully published: ${routePath}`);
    
    // Record successful publish
    const durationMs = Date.now() - startTime;
    try {
      const { recordPublishAttempt } = await import('./metrics');
      await recordPublishAttempt(
        doc.slug,
        doc.pageType,
        'success',
        durationMs
      );
    } catch (metricsError) {
      logger.warn('Failed to record metrics (non-blocking):', metricsError);
    }
    
    return { routePath, slug: doc.slug };
  } catch (error) {
    // Record failed publish
    const durationMs = Date.now() - startTime;
    let failureReason: string | undefined;
    let failureCode: string | undefined;
    
    if (error instanceof PublishError) {
      failureReason = error.message;
      failureCode = error.code;
    } else if (error instanceof Error) {
      failureReason = error.message;
      failureCode = 'UNKNOWN_ERROR';
    } else {
      failureReason = String(error);
      failureCode = 'UNKNOWN_ERROR';
    }
    
    try {
      const { recordPublishAttempt } = await import('./metrics');
      await recordPublishAttempt(
        doc.slug,
        doc.pageType,
        'failure',
        durationMs,
        failureReason,
        failureCode
      );
    } catch (metricsError) {
      logger.warn('Failed to record metrics (non-blocking):', metricsError);
    }
    
    // ROLLBACK: Clean up on failure (only rollback what we wrote in this attempt)
    logger.error('Publish failed, rolling back...', error);

    // Only rollback file if we wrote it in this attempt (idempotency: don't delete existing files)
    if (fileWritten) {
      try {
        await fs.unlink(filePath);
        logger.info(`Rolled back: Deleted ${filePath}`);
      } catch (rollbackError) {
        logger.error(`Failed to rollback file: ${rollbackError}`);
      }
    }

    // Note: Topic index and content index updates are atomic and idempotent
    // - If they failed, they didn't write anything, so no rollback needed
    // - If they succeeded but we're here, that means a later step failed
    // - For idempotency, we don't rollback index updates (they're safe to keep)

    // Re-throw the original error
    if (error instanceof PublishError) {
      throw error;
    }
    throw new PublishError(
      `Publish failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'PUBLISH_FAILED'
    );
  }
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
