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
 * Returns empty array if index fails or no species exist (prevents crashes)
 */
export async function getAllSpeciesSlugs(): Promise<string[]> {
  try {
    const index = await loadContentIndex();
    if (!Array.isArray(index.species)) {
      return [];
    }
    return index.species
      .filter((s) => s && s.slug)
      .map((s) => s.slug);
  } catch (error) {
    console.error('[getAllSpeciesSlugs] Failed to load slugs:', error);
    return []; // Return empty array instead of crashing
  }
}

/**
 * Get all how-to slugs
 * Returns empty array if index fails or no how-to guides exist (prevents crashes)
 */
export async function getAllHowToSlugs(): Promise<string[]> {
  try {
    const index = await loadContentIndex();
    if (!Array.isArray(index.howTo)) {
      return [];
    }
    return index.howTo
      .filter((h) => h && h.slug)
      .map((h) => h.slug);
  } catch (error) {
    console.error('[getAllHowToSlugs] Failed to load slugs:', error);
    return []; // Return empty array instead of crashing
  }
}

/**
 * Get all location slugs (format: state/city)
 * Returns empty array if index fails or no locations exist (prevents crashes)
 */
export async function getAllLocationSlugs(): Promise<string[]> {
  try {
    const index = await loadContentIndex();
    if (!Array.isArray(index.locations)) {
      return [];
    }
    return index.locations
      .filter((l) => l && l.state && l.city)
      .map((l) => `${l.state}/${l.city}`);
  } catch (error) {
    console.error('[getAllLocationSlugs] Failed to load slugs:', error);
    return []; // Return empty array instead of crashing
  }
}

/**
 * Get all blog post slugs
 * Returns empty array if index fails to load (prevents build crashes)
 */
export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const index = await loadContentIndex();
    // Only return slugs for published posts (non-draft, non-noindex)
    return index.blogPosts
      .filter((p) => !p.flags?.draft && !p.flags?.noindex)
      .map((p) => p.slug);
  } catch (error) {
    console.error('[getAllPostSlugs] Failed to load slugs:', error);
    return []; // Return empty array instead of crashing
  }
}

/**
 * Get all category slugs
 * Returns empty array if index fails or no categories exist (prevents crashes)
 */
export async function getAllCategorySlugs(): Promise<string[]> {
  try {
    const index = await loadContentIndex();
    if (!Array.isArray(index.blogPosts)) {
      return [];
    }
    const categories = new Set(
      index.blogPosts
        .filter((p) => p && p.category && !p.flags?.draft && !p.flags?.noindex)
        .map((p) => p.category)
    );
    return Array.from(categories);
  } catch (error) {
    console.error('[getAllCategorySlugs] Failed to load categories:', error);
    return []; // Return empty array instead of crashing
  }
}

/**
 * Get all species documents (for sitemap)
 * Logs errors for any files that fail to load
 * Returns empty array if no species exist (prevents crashes)
 */
export async function getAllSpeciesDocs(): Promise<GeneratedDoc[]> {
  try {
    const slugs = await getAllSpeciesSlugs();
    const docs: GeneratedDoc[] = [];
    
    for (const slug of slugs) {
      try {
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
      } catch (error) {
        // Skip this species if file fails to load
        console.warn(`[getAllSpeciesDocs] Failed to load species ${slug}:`, error);
        continue;
      }
    }
    
    return docs;
  } catch (error) {
    console.error('[getAllSpeciesDocs] Failed to load species slugs:', error);
    return []; // Return empty array instead of crashing
  }
}

/**
 * Get all how-to documents (for sitemap)
 * Logs errors for any files that fail to load
 * Returns empty array if no how-to guides exist (prevents crashes)
 */
export async function getAllHowToDocs(): Promise<GeneratedDoc[]> {
  try {
    const slugs = await getAllHowToSlugs();
    const docs: GeneratedDoc[] = [];
    
    for (const slug of slugs) {
      try {
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
      } catch (error) {
        // Skip this how-to if file fails to load
        console.warn(`[getAllHowToDocs] Failed to load how-to ${slug}:`, error);
        continue;
      }
    }
    
    return docs;
  } catch (error) {
    console.error('[getAllHowToDocs] Failed to load how-to slugs:', error);
    return []; // Return empty array instead of crashing
  }
}

/**
 * Get all location documents (for sitemap)
 * Returns empty array if no locations exist (prevents crashes)
 */
export async function getAllLocationDocs(): Promise<GeneratedDoc[]> {
  try {
    const slugs = await getAllLocationSlugs();
    const docs: GeneratedDoc[] = [];
    
    for (const slug of slugs) {
      try {
        const [state, city] = slug.split('/');
        if (!state || !city) {
          console.warn(`[getAllLocationDocs] Invalid location slug format: ${slug}`);
          continue;
        }
        
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
      } catch (error) {
        // Skip this location if file fails to load
        console.warn(`[getAllLocationDocs] Failed to load location ${slug}:`, error);
        continue;
      }
    }
    
    return docs;
  } catch (error) {
    console.error('[getAllLocationDocs] Failed to load location slugs:', error);
    return []; // Return empty array instead of crashing
  }
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



