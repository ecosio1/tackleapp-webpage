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
 * Load content index
 */
async function loadContentIndex(): Promise<{
  species: Array<{ slug: string; keywords: string[]; tags?: string[] }>;
  howTo: Array<{ slug: string; keywords: string[]; tags?: string[] }>;
  locations: Array<{ slug: string; state: string; city: string; keywords: string[] }>;
  blogPosts: Array<{ slug: string; category: string; keywords: string[]; tags?: string[] }>;
}> {
  try {
    const data = await fs.readFile(CONTENT_INDEX_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Return empty index if file doesn't exist
    return {
      species: [],
      howTo: [],
      locations: [],
      blogPosts: [],
    };
  }
}

/**
 * Load content document by path
 */
async function loadContentDoc(filePath: string): Promise<GeneratedDoc | null> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
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
 */
export async function getAllSpeciesDocs(): Promise<GeneratedDoc[]> {
  const slugs = await getAllSpeciesSlugs();
  const docs: GeneratedDoc[] = [];
  
  for (const slug of slugs) {
    const doc = await loadContentDoc(path.join(CONTENT_DIR, 'species', `${slug}.json`));
    if (doc && !doc.flags.draft && !doc.flags.noindex) {
      docs.push(doc);
    }
  }
  
  return docs;
}

/**
 * Get all how-to documents (for sitemap)
 */
export async function getAllHowToDocs(): Promise<GeneratedDoc[]> {
  const slugs = await getAllHowToSlugs();
  const docs: GeneratedDoc[] = [];
  
  for (const slug of slugs) {
    const doc = await loadContentDoc(path.join(CONTENT_DIR, 'how-to', `${slug}.json`));
    if (doc && !doc.flags.draft && !doc.flags.noindex) {
      docs.push(doc);
    }
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
    const doc = await loadContentDoc(path.join(CONTENT_DIR, 'locations', state, `${city}.json`));
    if (doc && !doc.flags.draft && !doc.flags.noindex) {
      docs.push(doc);
    }
  }
  
  return docs;
}

/**
 * Get all blog post documents (for sitemap)
 */
export async function getAllBlogPostDocs(): Promise<GeneratedDoc[]> {
  const slugs = await getAllPostSlugs();
  const docs: GeneratedDoc[] = [];
  
  for (const slug of slugs) {
    const doc = await loadContentDoc(path.join(CONTENT_DIR, 'blog', `${slug}.json`));
    if (doc && !doc.flags.draft && !doc.flags.noindex) {
      docs.push(doc);
    }
  }
  
  return docs;
}



