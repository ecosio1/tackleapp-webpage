/**
 * Migration script to update existing content index
 * Adds missing fields to existing blog post entries
 */

import fs from 'fs/promises';
import path from 'path';
import { loadContentDoc } from '../lib/content/index';

const CONTENT_INDEX_PATH = path.join(process.cwd(), 'content', '_system', 'contentIndex.json');
const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog');

async function migrateIndex() {
  console.log('🔄 Migrating content index...\n');

  // Load current index
  let index: any;
  try {
    const data = await fs.readFile(CONTENT_INDEX_PATH, 'utf-8');
    index = JSON.parse(data);
  } catch (error) {
    console.error('Failed to load index:', error);
    process.exit(1);
  }

  // Ensure version and lastUpdated exist
  if (!index.version) {
    index.version = '1.0.0';
  }
  if (!index.lastUpdated) {
    index.lastUpdated = new Date().toISOString();
  }

  // Migrate blog posts
  if (index.blogPosts && Array.isArray(index.blogPosts)) {
    console.log(`Found ${index.blogPosts.length} blog post entries to migrate\n`);

    const migrated: any[] = [];

    for (const entry of index.blogPosts) {
      // Check if entry already has all required fields
      if (entry.title && entry.description && entry.publishedAt && entry.wordCount !== undefined) {
        console.log(`✅ ${entry.slug} - already complete`);
        migrated.push(entry);
        continue;
      }

      // Load full post file to get missing fields
      const filePath = path.join(CONTENT_DIR, `${entry.slug}.json`);
      const doc = await loadContentDoc(filePath);

      if (!doc || doc.pageType !== 'blog') {
        console.log(`⚠️  ${entry.slug} - file not found or invalid, skipping`);
        continue;
      }

      const blogDoc = doc as any;
      const wordCount = blogDoc.body ? blogDoc.body.split(/\s+/).length : 0;

      // Create complete entry
      const completeEntry = {
        slug: entry.slug,
        title: blogDoc.title || entry.slug,
        description: blogDoc.description || '',
        category: blogDoc.categorySlug || entry.category || 'fishing-tips',
        publishedAt: blogDoc.dates?.publishedAt || new Date().toISOString(),
        updatedAt: blogDoc.dates?.updatedAt || new Date().toISOString(),
        heroImage: blogDoc.heroImage,
        featuredImage: blogDoc.featuredImage,
        tags: blogDoc.tags || entry.tags || [],
        keywords: entry.keywords || [blogDoc.primaryKeyword, ...(blogDoc.secondaryKeywords || [])],
        wordCount: wordCount,
        author: blogDoc.author?.name || 'Tackle Fishing Team',
        flags: {
          draft: blogDoc.flags?.draft || false,
          noindex: blogDoc.flags?.noindex || false,
        },
      };

      console.log(`✅ ${entry.slug} - migrated`);
      migrated.push(completeEntry);
    }

    index.blogPosts = migrated;
    index.lastUpdated = new Date().toISOString();

    // Write updated index
    const tempPath = `${CONTENT_INDEX_PATH}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(index, null, 2), 'utf-8');
    await fs.rename(tempPath, CONTENT_INDEX_PATH);

    console.log(`\n✅ Migration complete! Updated ${migrated.length} blog post entries.`);
  } else {
    console.log('No blog posts to migrate');
  }
}

migrateIndex().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
