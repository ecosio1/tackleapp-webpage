/**
 * Auto-Linking - Automatically generates internal link suggestions when publishing
 * This runs AFTER publishing to ensure we have the latest site index
 */

import { GeneratedDoc } from './types';
import { loadSiteIndex } from './internalLinks';
import { logger } from './logger';

/**
 * Internal link suggestions for a published document
 */
export interface InternalLinkSuggestions {
  species: Array<{ slug: string; title: string; reason: string }>;
  locations: Array<{ slug: string; title: string; reason: string }>;
  techniques: Array<{ slug: string; title: string; reason: string }>;
  relatedPosts: Array<{ slug: string; title: string; reason: string }>;
}

/**
 * Generate automatic internal link suggestions for a published document
 * This runs after publishing to ensure we have the latest content index
 */
export async function generateAutoLinks(doc: GeneratedDoc): Promise<InternalLinkSuggestions> {
  logger.info(`Generating auto-links for ${doc.pageType}:${doc.slug}`);

  const siteIndex = await loadSiteIndex();
  const suggestions: InternalLinkSuggestions = {
    species: [],
    locations: [],
    techniques: [],
    relatedPosts: [],
  };

  // Extract keywords and hints from document
  const allKeywords = [doc.primaryKeyword, ...doc.secondaryKeywords];
  const titleWords = doc.title.toLowerCase().split(/\s+/);
  const hints = [...allKeywords, ...titleWords];

  // Extract species mentions from title/keywords
  const speciesKeywords = ['redfish', 'snook', 'tarpon', 'bass', 'grouper', 'snapper', 'trout', 'flounder', 'mackerel', 'perch'];
  const mentionedSpecies = speciesKeywords.filter(sp => 
    hints.some(h => h.toLowerCase().includes(sp))
  );

  // Extract location mentions
  const locationKeywords = ['florida', 'texas', 'miami', 'tampa', 'key west', 'orlando', 'naples', 'fort myers'];
  const mentionedLocations = locationKeywords.filter(loc =>
    hints.some(h => h.toLowerCase().includes(loc))
  );

  switch (doc.pageType) {
    case 'blog': {
      // Blog posts: 2-3 species, 1-2 locations, 2-3 related posts
      const blogDoc = doc as Extract<GeneratedDoc, { pageType: 'blog' }>;

      // Find related species (2-3)
      const speciesMatches = findBestMatches(
        siteIndex.species,
        mentionedSpecies.length > 0 ? mentionedSpecies : allKeywords,
        doc.primaryKeyword,
        3
      );
      suggestions.species = speciesMatches.map(s => ({
        slug: s.slug,
        title: s.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        reason: `Mentioned in "${doc.title}" or related to ${doc.primaryKeyword}`,
      }));

      // Find related locations (1-2)
      if (mentionedLocations.length > 0 || blogDoc.related?.locationSlugs?.length) {
        const locationMatches = findBestMatches(
          siteIndex.locations,
          mentionedLocations.length > 0 ? mentionedLocations : ['florida'],
          doc.primaryKeyword,
          2
        );
        suggestions.locations = locationMatches.map(l => ({
          slug: l.slug,
          title: l.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          reason: `Location mentioned in "${doc.title}" or related to ${doc.primaryKeyword}`,
        }));
      }

      // Find related techniques (how-to guides) (2-3)
      const techniqueMatches = findBestMatches(
        siteIndex.howTo,
        allKeywords,
        doc.primaryKeyword,
        3
      );
      suggestions.techniques = techniqueMatches.map(t => ({
        slug: t.slug,
        title: t.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        reason: `Technique related to ${doc.primaryKeyword}`,
      }));

      // Find related blog posts (2-3, excluding current)
      const postMatches = findBestMatches(
        siteIndex.blogPosts.filter(p => p.slug !== doc.slug),
        allKeywords,
        doc.primaryKeyword,
        3
      );
      suggestions.relatedPosts = postMatches.map(p => ({
        slug: p.slug,
        title: p.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        reason: `Related fishing topic`,
      }));

      break;
    }

    case 'species': {
      // Species pages: 3-5 locations, 3-5 techniques, 3-5 related posts
      const speciesMatches = findBestMatches(
        siteIndex.locations,
        ['florida', 'texas'],
        doc.primaryKeyword,
        5
      );
      suggestions.locations = speciesMatches.map(l => ({
        slug: l.slug,
        title: l.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        reason: `Common location for ${doc.primaryKeyword}`,
      }));

      const techniqueMatches = findBestMatches(
        siteIndex.howTo,
        [`catch-${doc.slug}`, ...allKeywords],
        doc.primaryKeyword,
        5
      );
      suggestions.techniques = techniqueMatches.map(t => ({
        slug: t.slug,
        title: t.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        reason: `How to catch ${doc.primaryKeyword}`,
      }));

      const postMatches = findBestMatches(
        siteIndex.blogPosts,
        allKeywords,
        doc.primaryKeyword,
        5
      );
      suggestions.relatedPosts = postMatches.map(p => ({
        slug: p.slug,
        title: p.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        reason: `Blog post about ${doc.primaryKeyword}`,
      }));

      break;
    }

    case 'how-to': {
      // How-to pages: 3-5 species, 3-5 locations, 3-5 related posts
      const speciesMatches = findBestMatches(
        siteIndex.species,
        allKeywords,
        doc.primaryKeyword,
        5
      );
      suggestions.species = speciesMatches.map(s => ({
        slug: s.slug,
        title: s.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        reason: `Species you can catch using this technique`,
      }));

      const locationMatches = findBestMatches(
        siteIndex.locations,
        allKeywords,
        doc.primaryKeyword,
        5
      );
      suggestions.locations = locationMatches.map(l => ({
        slug: l.slug,
        title: l.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        reason: `Good location for ${doc.primaryKeyword}`,
      }));

      const postMatches = findBestMatches(
        siteIndex.blogPosts,
        allKeywords,
        doc.primaryKeyword,
        5
      );
      suggestions.relatedPosts = postMatches.map(p => ({
        slug: p.slug,
        title: p.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        reason: `Related technique or topic`,
      }));

      break;
    }

    case 'location': {
      // Location pages: 5 species, 5 techniques, 5 related posts
      const locationDoc = doc as Extract<GeneratedDoc, { pageType: 'location' }>;

      const speciesMatches = findBestMatches(
        siteIndex.species,
        [],
        doc.primaryKeyword,
        5
      );
      suggestions.species = speciesMatches.map(s => ({
        slug: s.slug,
        title: s.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        reason: `Common species in ${locationDoc.citySlug || locationDoc.stateSlug}`,
      }));

      const techniqueMatches = findBestMatches(
        siteIndex.howTo,
        allKeywords,
        doc.primaryKeyword,
        5
      );
      suggestions.techniques = techniqueMatches.map(t => ({
        slug: t.slug,
        title: t.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        reason: `Effective technique for ${locationDoc.citySlug || locationDoc.stateSlug}`,
      }));

      const postMatches = findBestMatches(
        siteIndex.blogPosts,
        allKeywords,
        doc.primaryKeyword,
        5
      );
      suggestions.relatedPosts = postMatches.map(p => ({
        slug: p.slug,
        title: p.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        reason: `Fishing tips for ${locationDoc.citySlug || locationDoc.stateSlug}`,
      }));

      break;
    }
  }

  // Log summary
  const totalLinks = 
    suggestions.species.length +
    suggestions.locations.length +
    suggestions.techniques.length +
    suggestions.relatedPosts.length;

  logger.info(`Generated ${totalLinks} auto-links: ${suggestions.species.length} species, ${suggestions.locations.length} locations, ${suggestions.techniques.length} techniques, ${suggestions.relatedPosts.length} posts`);

  return suggestions;
}

/**
 * Find best matching content based on keywords and hints
 */
function findBestMatches(
  candidates: Array<{ slug: string; keywords: string[]; tags?: string[] }>,
  hints: string[],
  primaryKeyword: string,
  count: number
): Array<{ slug: string; keywords: string[]; tags?: string[] }> {
  if (candidates.length === 0) {
    return [];
  }

  // Score each candidate
  const scored = candidates.map(candidate => {
    let score = 0;

    // Check keyword matches
    const candidateText = [
      candidate.slug,
      ...candidate.keywords,
      ...(candidate.tags || []),
    ].join(' ').toLowerCase();

    const hintText = hints.join(' ').toLowerCase();
    const primaryLower = primaryKeyword.toLowerCase();

    // Exact keyword match
    if (candidate.keywords.some(k => k.toLowerCase() === primaryLower)) {
      score += 10;
    }

    // Partial keyword match
    if (candidateText.includes(primaryLower) || primaryLower.includes(candidateText)) {
      score += 5;
    }

    // Hint matches
    for (const hint of hints) {
      const hintLower = hint.toLowerCase();
      if (candidateText.includes(hintLower)) {
        score += 2;
      }
    }

    // Tag matches
    if (candidate.tags) {
      for (const tag of candidate.tags) {
        if (hints.some(h => h.toLowerCase().includes(tag.toLowerCase()))) {
          score += 1;
        }
      }
    }

    return { ...candidate, score };
  });

  // Sort by score (highest first) and take top N
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ score, ...rest }) => rest);
}
