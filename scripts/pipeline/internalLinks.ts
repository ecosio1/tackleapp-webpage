/**
 * Internal Link Generator - Generates internal links for content
 */

import { ContentBrief, SiteIndex } from './types';
import { logger } from './logger';
import fs from 'fs/promises';
import path from 'path';

const CONTENT_INDEX_PATH = path.join(process.cwd(), 'content', '_system', 'contentIndex.json');

/**
 * Load site content index
 */
async function loadSiteIndex(): Promise<SiteIndex> {
  try {
    const data = await fs.readFile(CONTENT_INDEX_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    logger.warn('Content index not found, using empty index');
    return {
      species: [],
      howTo: [],
      locations: [],
      blogPosts: [],
    };
  }
}

/**
 * Calculate match score for content
 */
function calculateMatchScore(
  candidate: { keywords: string[]; tags?: string[] },
  hints: string[],
  primaryKeyword: string
): number {
  let score = 0;
  
  // Primary keyword match
  if (candidate.keywords.some((k) => k.toLowerCase().includes(primaryKeyword.toLowerCase()))) {
    score += 2;
  }
  
  // Hint matches
  for (const hint of hints) {
    const lowerHint = hint.toLowerCase();
    if (candidate.keywords.some((k) => k.toLowerCase().includes(lowerHint))) {
      score += 1;
    }
    if (candidate.tags?.some((t) => t.toLowerCase().includes(lowerHint))) {
      score += 1;
    }
  }
  
  return score;
}

/**
 * Select best matching content
 */
function selectBestMatches(
  candidates: Array<{ slug: string; keywords: string[]; tags?: string[] }>,
  hints: string[],
  primaryKeyword: string,
  count: number,
  excludeSlug?: string
): string[] {
  const scored = candidates
    .filter((c) => c.slug !== excludeSlug)
    .map((candidate) => ({
      slug: candidate.slug,
      score: calculateMatchScore(candidate, hints, primaryKeyword),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
  
  return scored.map((s) => s.slug);
}

/**
 * Pick internal links for brief
 */
export async function pickLinksForBrief(brief: ContentBrief): Promise<{
  speciesSlugs: string[];
  howToSlugs: string[];
  locationSlugs: string[];
  postSlugs: string[];
}> {
  const siteIndex = await loadSiteIndex();
  
  const hints = [
    ...(brief.keyFacts.flatMap((f) => f.entities || [])),
    ...brief.secondaryKeywords,
  ];
  
  const result = {
    speciesSlugs: [] as string[],
    howToSlugs: [] as string[],
    locationSlugs: [] as string[],
    postSlugs: [] as string[],
  };
  
  switch (brief.pageType) {
    case 'blog':
      // Blog posts: 1-2 species, 1-2 how-to, 1 location (if applicable)
      result.speciesSlugs = selectBestMatches(
        siteIndex.species,
        hints,
        brief.primaryKeyword,
        2
      );
      result.howToSlugs = selectBestMatches(
        siteIndex.howTo,
        hints,
        brief.primaryKeyword,
        2
      );
      // Check if location hints exist
      const locationHints = brief.keyFacts
        .flatMap((f) => f.entities || [])
        .filter((e) => e.includes('florida') || e.includes('miami') || e.includes('tampa'));
      if (locationHints.length > 0) {
        result.locationSlugs = selectBestMatches(
          siteIndex.locations,
          locationHints,
          brief.primaryKeyword,
          1
        );
      }
      result.postSlugs = selectBestMatches(
        siteIndex.blogPosts,
        hints,
        brief.primaryKeyword,
        3,
        brief.slug
      );
      break;
      
    case 'species':
      // Species: 3 how-to, 3 locations, 3 blog posts
      result.howToSlugs = selectBestMatches(
        siteIndex.howTo,
        [`catch-${brief.slug}`, ...hints],
        brief.primaryKeyword,
        3
      );
      result.locationSlugs = selectBestMatches(
        siteIndex.locations,
        hints.length > 0 ? hints : ['florida'],
        brief.primaryKeyword,
        3
      );
      result.postSlugs = selectBestMatches(
        siteIndex.blogPosts,
        hints,
        brief.primaryKeyword,
        3
      );
      break;
      
    case 'how-to':
      // How-to: 3 species, 3 locations, 3 related how-to
      result.speciesSlugs = selectBestMatches(
        siteIndex.species,
        hints,
        brief.primaryKeyword,
        3
      );
      result.locationSlugs = selectBestMatches(
        siteIndex.locations,
        hints,
        brief.primaryKeyword,
        3
      );
      result.howToSlugs = selectBestMatches(
        siteIndex.howTo,
        hints,
        brief.primaryKeyword,
        3,
        brief.slug
      );
      break;
      
    case 'location':
      // Location: 5 species, 5 how-to, 5 blog posts
      result.speciesSlugs = selectBestMatches(
        siteIndex.species,
        [],
        brief.primaryKeyword,
        5
      );
      result.howToSlugs = selectBestMatches(
        siteIndex.howTo,
        hints,
        brief.primaryKeyword,
        5
      );
      result.postSlugs = selectBestMatches(
        siteIndex.blogPosts,
        hints,
        brief.primaryKeyword,
        5
      );
      break;
  }
  
  // Ensure no duplicates
  const allSlugs = [
    ...result.speciesSlugs,
    ...result.howToSlugs,
    ...result.locationSlugs,
    ...result.postSlugs,
  ];
  const uniqueSlugs = Array.from(new Set(allSlugs));
  
  logger.info(`Generated ${uniqueSlugs.length} internal links for ${brief.pageType}:${brief.slug}`);
  
  return result;
}

/**
 * Update content index (called after publishing)
 */
export async function updateContentIndex(doc: {
  pageType: string;
  slug: string;
  keywords: string[];
  tags?: string[];
  category?: string;
  state?: string;
  city?: string;
}): Promise<void> {
  const index = await loadSiteIndex();
  
  switch (doc.pageType) {
    case 'species':
      index.species.push({
        slug: doc.slug,
        keywords: doc.keywords,
        tags: doc.tags,
      });
      break;
    case 'how-to':
      index.howTo.push({
        slug: doc.slug,
        keywords: doc.keywords,
        tags: doc.tags,
      });
      break;
    case 'location':
      index.locations.push({
        slug: doc.slug,
        state: doc.state || '',
        city: doc.city || '',
        keywords: doc.keywords,
      });
      break;
    case 'blog':
      index.blogPosts.push({
        slug: doc.slug,
        category: doc.category || '',
        keywords: doc.keywords,
        tags: doc.tags,
      });
      break;
  }
  
  // Save updated index
  const dir = path.dirname(CONTENT_INDEX_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(CONTENT_INDEX_PATH, JSON.stringify(index, null, 2), 'utf-8');
  
  logger.info(`Updated content index with ${doc.pageType}:${doc.slug}`);
}


