/**
 * Auto-Links - Frontend functions to get internal link suggestions
 * These are generated automatically when content is published
 */

import { getAllSpeciesDocs, getAllHowToDocs, getAllLocationDocs, loadContentIndex } from './index';
import { getBlogPostBySlug } from './blog';
import { BlogPostDoc, SpeciesDoc, HowToDoc, LocationDoc } from '@/scripts/pipeline/types';
import fs from 'fs/promises';
import path from 'path';

/**
 * Load site index (frontend-compatible version)
 * Uses the same structure as content index
 */
async function loadSiteIndex() {
  return await loadContentIndex();
}

/**
 * Internal link suggestion
 */
export interface LinkSuggestion {
  slug: string;
  title: string;
  url: string;
  type: 'species' | 'location' | 'how-to' | 'blog';
  reason?: string;
}

/**
 * Get automatic internal link suggestions for a blog post
 * Uses the document's related field and site index to find relevant links
 */
export async function getAutoLinksForBlog(slug: string): Promise<LinkSuggestion[]> {
  // Load only the current post (not all posts)
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return [];
  }

  const suggestions: LinkSuggestion[] = [];
  const siteIndex = await loadSiteIndex();

  // Get related content from document
  const related = post.related || {};

  // Add species links
  if (related.speciesSlugs && related.speciesSlugs.length > 0) {
    const speciesDocs = await getAllSpeciesDocs();
    for (const speciesSlug of related.speciesSlugs.slice(0, 3)) {
      const species = speciesDocs.find(s => s.slug === speciesSlug);
      if (species) {
        suggestions.push({
          slug: speciesSlug,
          title: species.title,
          url: `/species/${speciesSlug}`,
          type: 'species',
          reason: `Learn about ${species.title}`,
        });
      }
    }
  }

  // Add location links
  if (related.locationSlugs && related.locationSlugs.length > 0) {
    const locationDocs = await getAllLocationDocs();
    for (const locationSlug of related.locationSlugs.slice(0, 2)) {
      // Location slugs can be "state/city" format
      const location = locationDocs.find(l => {
        if (locationSlug.includes('/')) {
          const [state, city] = locationSlug.split('/');
          return l.stateSlug === state && l.citySlug === city;
        }
        return l.slug === locationSlug;
      });
      if (location) {
        suggestions.push({
          slug: location.slug,
          title: location.title,
          url: `/locations/${location.stateSlug}/${location.citySlug}`,
          type: 'location',
          reason: `Fishing in ${location.title}`,
        });
      }
    }
  }

  // Add how-to (technique) links
  if (related.howToSlugs && related.howToSlugs.length > 0) {
    const howToDocs = await getAllHowToDocs();
    for (const howToSlug of related.howToSlugs.slice(0, 3)) {
      const howTo = howToDocs.find(h => h.slug === howToSlug);
      if (howTo) {
        suggestions.push({
          slug: howToSlug,
          title: howTo.title,
          url: `/how-to/${howToSlug}`,
          type: 'how-to',
          reason: `Learn ${howTo.title}`,
        });
      }
    }
  }

  // Add related blog posts
  if (related.postSlugs && related.postSlugs.length > 0) {
    for (const postSlug of related.postSlugs.slice(0, 3)) {
      // Load only the specific related post (not all posts)
      const relatedPost = await getBlogPostBySlug(postSlug);
      if (relatedPost && relatedPost.slug !== slug) {
        suggestions.push({
          slug: postSlug,
          title: relatedPost.title,
          url: `/blog/${postSlug}`,
          type: 'blog',
          reason: `Related: ${relatedPost.categorySlug}`,
        });
      }
    }
  }

  // If we don't have enough suggestions, use site index to find more
  if (suggestions.length < 5 && post) {
    const index = await loadContentIndex();
    const remaining = 5 - suggestions.length;

    // Find more related posts from same category using index only
    const categoryPosts = index.blogPosts
      .filter(entry => 
        !entry.flags?.draft &&
        !entry.flags?.noindex &&
        entry.slug !== slug &&
        entry.category === post.categorySlug
      )
      .slice(0, remaining);

    for (const entry of categoryPosts) {
      if (!suggestions.some(s => s.slug === entry.slug)) {
        suggestions.push({
          slug: entry.slug,
          title: entry.title,
          url: `/blog/${entry.slug}`,
          type: 'blog',
          reason: `More ${entry.category} tips`,
        });
      }
    }
  }

  return suggestions.slice(0, 5); // Limit to 5 total
}
