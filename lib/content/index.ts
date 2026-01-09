/**
 * Content index access functions
 * These read from the content index built by the publisher
 */

import fs from 'fs/promises';
import path from 'path';
import { GeneratedDoc } from '@/scripts/pipeline/types';

const CONTENT_INDEX_PATH = path.join(process.cwd(), 'content', '_system', 'contentIndex.json');
const CONTENT_DIR = path.join(process.cwd(), 'content');

/**
 * Blog post index entry (minimal data for listing)
 */
export interface BlogPostIndexEntry {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string; // ISO 8601
  updatedAt?: string; // ISO 8601
  heroImage?: string;
  featuredImage?: string;
  tags?: string[];
  keywords?: string[];
  wordCount?: number; // For calculating readTime
  author?: string;
  flags?: {
    draft?: boolean;
    noindex?: boolean;
  };
}

/**
 * Content index structure
 */
export interface ContentIndex {
  version: string;
  lastUpdated: string;
  species: Array<{ slug: string; keywords: string[]; tags?: string[] }>;
  howTo: Array<{ slug: string; keywords: string[]; tags?: string[] }>;
  locations: Array<{ slug: string; state: string; city: string; keywords: string[] }>;
  blogPosts: BlogPostIndexEntry[];
}

/**
 * Load content index with automatic recovery
 * Recovery flow:
 * 1. Try primary index
 * 2. If corrupt/missing → try backup
 * 3. If backup fails → rebuild from files
 * 4. Save recovered index back to disk
 * 
 * This ensures no data loss even if index is corrupted
 */
export async function loadContentIndex(): Promise<ContentIndex> {
  try {
    // Step 1: Try to load primary index
    const data = await fs.readFile(CONTENT_INDEX_PATH, 'utf-8');
    const index = JSON.parse(data);
    
    // Validate index structure
    if (!index || typeof index !== 'object') {
      throw new Error('Invalid index structure');
    }
    
    // Ensure required arrays exist (repair minor structure issues)
    if (!Array.isArray(index.species)) index.species = [];
    if (!Array.isArray(index.howTo)) index.howTo = [];
    if (!Array.isArray(index.locations)) index.locations = [];
    if (!Array.isArray(index.blogPosts)) {
      console.warn('[INDEX_LOAD] Missing blogPosts array, initializing empty array');
      index.blogPosts = [];
    }
    
    // Validate version and lastUpdated exist
    if (!index.version) index.version = '1.0.0';
    if (!index.lastUpdated) index.lastUpdated = new Date().toISOString();
    
    console.log(
      `[INDEX_LOAD] ✅ Successfully loaded primary index (${index.blogPosts.length} blog posts)`
    );
    
    return index as ContentIndex;
  } catch (error) {
    // Index is corrupted, missing, or invalid - attempt recovery
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(
      `[INDEX_LOAD] ${new Date().toISOString()} - Primary index load failed: ${errorMessage}`
    );
    console.log(
      `[INDEX_LOAD] Attempting automatic recovery (backup → rebuild from files)...`
    );
    
    // Step 2-4: Attempt recovery (backup → rebuild from files → save)
    // recoverIndex() handles the full recovery flow and saves the result
    try {
      const { recoverIndex } = await import('./index-recovery');
      const recoveredIndex = await recoverIndex();
      
      console.log(
        `[INDEX_LOAD] ✅ Recovery successful: ${recoveredIndex.blogPosts.length} blog posts recovered`
      );
      
      return recoveredIndex;
    } catch (recoveryError) {
      // Recovery failed - log and return empty index as last resort
      console.error(
        `[INDEX_LOAD] ❌ CRITICAL: Recovery failed: ${recoveryError instanceof Error ? recoveryError.message : 'Unknown error'}`
      );
      console.warn(
        `[INDEX_LOAD] Returning empty index as last resort - blog will be empty until recovery succeeds`
      );
      
      // Return minimal valid index structure to prevent complete failure
      return {
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
        species: [],
        howTo: [],
        locations: [],
        blogPosts: [],
      };
    }
  }
}

/**
 * Load content document by path
 * Logs errors with file path and error details
 */
export async function loadContentDoc(filePath: string): Promise<GeneratedDoc | null> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    
    // Try to parse JSON
    let parsed: any;
    try {
      parsed = JSON.parse(data);
    } catch (parseError) {
      // Log JSON parse error
      const { logContentLoadError } = await import('./logger');
      logContentLoadError({
        filePath,
        reason: 'Invalid JSON - failed to parse',
        error: parseError,
      });
      return null;
    }
    
    // Basic type check
    if (!parsed || typeof parsed !== 'object') {
      const { logContentLoadError } = await import('./logger');
      logContentLoadError({
        filePath,
        reason: 'Invalid content - not an object',
        error: new Error('Parsed content is not an object'),
      });
      return null;
    }
    
    // Note: Full schema validation happens in getBlogPostBySlug() and similar functions
    // This allows us to load the document first, then validate with context (slug, pageType)
    return parsed as GeneratedDoc;
  } catch (error) {
    // Log file read error
    const { logContentLoadError } = await import('./logger');
    const fileError = error as NodeJS.ErrnoException;
    
    if (fileError.code === 'ENOENT') {
      logContentLoadError({
        filePath,
        reason: 'File not found',
        error: fileError,
      });
    } else if (fileError.code === 'EACCES') {
      logContentLoadError({
        filePath,
        reason: 'Permission denied - cannot read file',
        error: fileError,
      });
    } else {
      logContentLoadError({
        filePath,
        reason: 'Failed to read file',
        error: fileError,
      });
    }
    
    return null;
  }
}

/**
 * Get all species slugs
 */
export async function getAllSpeciesSlugs(): Promise<string[]> {
  const index = await loadContentIndex();
  return index.species.map((s) => s.slug);
}

/**
 * Get all how-to slugs
 */
export async function getAllHowToSlugs(): Promise<string[]> {
  const index = await loadContentIndex();
  return index.howTo.map((h) => h.slug);
}

/**
 * Get all location slugs (format: state/city)
 */
export async function getAllLocationSlugs(): Promise<string[]> {
  const index = await loadContentIndex();
  return index.locations.map((l) => `${l.state}/${l.city}`);
}

/**
 * Get all blog post slugs
 */
export async function getAllPostSlugs(): Promise<string[]> {
  const index = await loadContentIndex();
  return index.blogPosts.map((p) => p.slug);
}

/**
 * Get all category slugs
 */
export async function getAllCategorySlugs(): Promise<string[]> {
  const index = await loadContentIndex();
  const categories = new Set(index.blogPosts.map((p) => p.category));
  return Array.from(categories);
}

/**
 * Get all species documents (for sitemap)
 * Logs errors for any files that fail to load
 */
export async function getAllSpeciesDocs(): Promise<GeneratedDoc[]> {
  const slugs = await getAllSpeciesSlugs();
  const docs: GeneratedDoc[] = [];
  
  for (const slug of slugs) {
    const filePath = path.join(CONTENT_DIR, 'species', `${slug}.json`);
    const doc = await loadContentDoc(filePath);
    
    if (!doc) {
      // loadContentDoc already logged the error
      continue;
    }
    
    if (doc.flags.draft || doc.flags.noindex) {
      // Valid state, not an error
      continue;
    }
    
    docs.push(doc);
  }
  
  return docs;
}

/**
 * Get all how-to documents (for sitemap)
 * Logs errors for any files that fail to load
 */
export async function getAllHowToDocs(): Promise<GeneratedDoc[]> {
  const slugs = await getAllHowToSlugs();
  const docs: GeneratedDoc[] = [];
  
  for (const slug of slugs) {
    const filePath = path.join(CONTENT_DIR, 'how-to', `${slug}.json`);
    const doc = await loadContentDoc(filePath);
    
    if (!doc) {
      // loadContentDoc already logged the error
      continue;
    }
    
    if (doc.flags.draft || doc.flags.noindex) {
      // Valid state, not an error
      continue;
    }
    
    docs.push(doc);
  }
  
  return docs;
}

/**
 * Get all location documents (for sitemap)
 */
export async function getAllLocationDocs(): Promise<GeneratedDoc[]> {
  const slugs = await getAllLocationSlugs();
  const docs: GeneratedDoc[] = [];
  
  for (const slug of slugs) {
    const [state, city] = slug.split('/');
    const filePath = path.join(CONTENT_DIR, 'locations', state, `${city}.json`);
    const doc = await loadContentDoc(filePath);
    
    if (!doc) {
      // loadContentDoc already logged the error
      continue;
    }
    
    if (doc.flags.draft || doc.flags.noindex) {
      // Valid state, not an error
      continue;
    }
    
    docs.push(doc);
  }
  
  return docs;
}

/**
 * Get all blog post documents (for sitemap)
 * Logs errors for any files that fail to load
 */
export async function getAllBlogPostDocs(): Promise<GeneratedDoc[]> {
  const slugs = await getAllPostSlugs();
  const docs: GeneratedDoc[] = [];
  
  for (const slug of slugs) {
    const filePath = path.join(CONTENT_DIR, 'blog', `${slug}.json`);
    const doc = await loadContentDoc(filePath);
    
    if (!doc) {
      // loadContentDoc already logged the error
      continue;
    }
    
    if (doc.flags.draft || doc.flags.noindex) {
      // Valid state, not an error
      continue;
    }
    
    docs.push(doc);
  }
  
  return docs;
}



