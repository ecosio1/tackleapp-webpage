/**
 * Rebuild index from files - First-class maintenance operation
 * Scans content files, validates them, and rebuilds a clean index
 */

import fs from 'fs/promises';
import path from 'path';
import { ContentIndex, BlogPostIndexEntry } from './index';
import { loadContentDoc } from './index';
import { validateAndQuarantine } from './schema-validator';
import { logContentLoadError, logContentValidationError } from './logger';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const CONTENT_INDEX_PATH = path.join(process.cwd(), 'content', '_system', 'contentIndex.json');

export interface RebuildStats {
  totalFiles: number;
  validPosts: number;
  invalidPosts: number;
  quarantinedPosts: number;
  draftPosts: number;
  errors: Array<{
    slug: string;
    filePath: string;
    reason: string;
    errors?: string[];
  }>;
}

/**
 * Rebuild index from blog files with comprehensive validation and logging
 */
export async function rebuildIndexFromFiles(): Promise<{
  index: ContentIndex;
  stats: RebuildStats;
}> {
  const stats: RebuildStats = {
    totalFiles: 0,
    validPosts: 0,
    invalidPosts: 0,
    quarantinedPosts: 0,
    draftPosts: 0,
    errors: [],
  };

  const index: ContentIndex = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    species: [],
    howTo: [],
    locations: [],
    blogPosts: [],
  };

  try {
    // Rebuild blog posts index
    const blogDir = path.join(CONTENT_DIR, 'blog');
    
    try {
      const files = await fs.readdir(blogDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      stats.totalFiles = jsonFiles.length;
      
      console.log(`\n📁 Found ${jsonFiles.length} blog post files to scan\n`);

      for (const file of jsonFiles) {
        const slug = file.replace('.json', '');
        const filePath = path.join(blogDir, file);
        
        try {
          // Load document
          const doc = await loadContentDoc(filePath);
          
          if (!doc) {
            // loadContentDoc already logged the error
            stats.invalidPosts++;
            stats.errors.push({
              slug,
              filePath,
              reason: 'Failed to load document (see logs for details)',
            });
            continue;
          }

          // Validate schema
          const validatedDoc = validateAndQuarantine(doc, slug, filePath, 'blog');
          
          if (!validatedDoc) {
            // Document is quarantined (invalid schema)
            stats.quarantinedPosts++;
            stats.errors.push({
              slug,
              filePath,
              reason: 'Schema validation failed (quarantined)',
            });
            continue;
          }

          // Check if draft or noindex
          if (validatedDoc.flags.draft || validatedDoc.flags.noindex) {
            stats.draftPosts++;
            // Only log in verbose mode (console output handled by command)
            continue;
          }

          // Build index entry with ONLY listing data (no body, FAQs, sources, etc.)
          const wordCount = validatedDoc.body.split(/\s+/).length;
          const blogEntry: BlogPostIndexEntry = {
            slug: validatedDoc.slug,
            title: validatedDoc.title,
            description: validatedDoc.description,
            category: 'categorySlug' in validatedDoc ? validatedDoc.categorySlug : 'uncategorized',
            publishedAt: validatedDoc.dates.publishedAt,
            updatedAt: validatedDoc.dates.updatedAt,
            wordCount: wordCount,
            author: validatedDoc.author.name,
            flags: {
              draft: validatedDoc.flags.draft || false,
              noindex: validatedDoc.flags.noindex || false,
            },
            // Optional fields (limited arrays)
            heroImage: validatedDoc.heroImage,
            featuredImage: 'featuredImage' in validatedDoc ? validatedDoc.featuredImage : undefined,
            // Limit keywords to first 10 (for listing/search)
            keywords: [validatedDoc.primaryKeyword, ...validatedDoc.secondaryKeywords].slice(0, 10),
            // Limit tags to first 5 (for listing/filtering)
            tags: 'tags' in validatedDoc && validatedDoc.tags ? validatedDoc.tags.slice(0, 5) : undefined,
          };
          
          // Validate index entry (ensures no heavy data)
          const { validateIndexEntry } = await import('./index-entry-validator');
          validateIndexEntry(blogEntry);

          index.blogPosts.push(blogEntry);
          stats.validPosts++;
          console.log(`  ✅ ${slug}: Valid post indexed`);
        } catch (error) {
          stats.invalidPosts++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          stats.errors.push({
            slug,
            filePath,
            reason: `Error processing file: ${errorMessage}`,
          });
          console.error(`  ❌ ${slug}: ${errorMessage}`);
        }
      }

      // Print summary (can be suppressed by caller for custom formatting)
      console.log(`\n📊 Rebuild Summary:`);
      console.log(`   Total files: ${stats.totalFiles}`);
      console.log(`   ✅ Valid posts: ${stats.validPosts}`);
      console.log(`   ❌ Invalid posts: ${stats.invalidPosts}`);
      console.log(`   🚫 Quarantined posts: ${stats.quarantinedPosts}`);
      console.log(`   📝 Draft/noindex posts: ${stats.draftPosts}`);
      console.log(`   📋 Total indexed: ${index.blogPosts.length}\n`);

      if (stats.errors.length > 0) {
        console.log(`⚠️  Invalid/Quarantined Posts:\n`);
        stats.errors.forEach((error) => {
          console.log(`   - ${error.slug}: ${error.reason}`);
        });
        console.log('');
      }
    } catch (error) {
      console.error(
        `\n❌ Error reading blog directory: ${error instanceof Error ? error.message : 'Unknown error'}\n`
      );
    }

    return { index, stats };
  } catch (error) {
    console.error(
      `\n❌ Failed to rebuild index: ${error instanceof Error ? error.message : 'Unknown error'}\n`
    );
    return { index, stats };
  }
}

/**
 * Save rebuilt index to file
 * WITH LOCKING: Prevents concurrent updates during rebuild
 */
export async function saveRebuiltIndex(index: ContentIndex): Promise<void> {
  const { withIndexLock } = await import('./index-lock');
  
  await withIndexLock(async () => {
    try {
      // Ensure directory exists
      const dir = path.dirname(CONTENT_INDEX_PATH);
      await fs.mkdir(dir, { recursive: true });

      // Write to temp file first (atomic write)
      const tempPath = `${CONTENT_INDEX_PATH}.tmp`;
      const jsonString = JSON.stringify(index, null, 2);
      
      await fs.writeFile(tempPath, jsonString, 'utf-8');
      
      // Verify temp file
      const written = await fs.readFile(tempPath, 'utf-8');
      if (written !== jsonString) {
        await fs.unlink(tempPath).catch(() => {});
        throw new Error('Index write verification failed');
      }
      
      // Atomic rename
      await fs.rename(tempPath, CONTENT_INDEX_PATH);

      console.log(`✅ Index saved to: ${CONTENT_INDEX_PATH}`);
    } catch (error) {
      throw new Error(
        `Failed to save rebuilt index: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  });
}

/**
 * Rebuild and save index (complete operation)
 */
export async function rebuildAndSaveIndex(): Promise<RebuildStats> {
  console.log('🔧 Rebuilding content index from files...\n');
  
  const { index, stats } = await rebuildIndexFromFiles();
  
  await saveRebuiltIndex(index);
  
  console.log(`\n✅ Index rebuild complete!\n`);
  
  return stats;
}
