/**
 * Brief Builder - Builds content briefs for LLM generation
 */

import { ContentBrief, Fact, Source, PageType, TopicKey } from './types';
import { pickLinksForBrief } from './internalLinks';
import { DEFAULT_DISCLAIMERS } from './config';
import { MIN_WORD_COUNTS } from './config';
import { logger } from './logger';

/**
 * Generate topic key
 */
export function generateTopicKey(
  pageType: PageType,
  identifiers: {
    species?: string;
    howTo?: string;
    state?: string;
    city?: string;
    blog?: string;
  }
): TopicKey {
  switch (pageType) {
    case 'species':
      return `species::${identifiers.species}::${identifiers.state || 'global'}`;
    case 'how-to':
      return `howto::${identifiers.howTo}`;
    case 'location':
      return `location::${identifiers.state}::${identifiers.city}`;
    case 'blog':
      return `blog::${identifiers.blog}`;
  }
}

/**
 * Build content brief
 */
export async function buildBrief(input: {
  pageType: PageType;
  topicKey: TopicKey;
  slug: string;
  title: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  facts: Fact[];
  sources: Source[];
  siteIndex?: any;
}): Promise<ContentBrief> {
  logger.info(`Building brief for ${input.pageType}:${input.slug}`);
  
  // Select top facts (limit to 15)
  const keyFacts = input.facts
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 15);
  
  // Build outline based on page type
  const outline = buildOutline(input.pageType, input.title, keyFacts);
  
  // Generate internal links
  const tempBrief: Partial<ContentBrief> = {
    pageType: input.pageType,
    slug: input.slug,
    topicKey: input.topicKey,
    title: input.title,
    primaryKeyword: input.primaryKeyword,
    secondaryKeywords: input.secondaryKeywords,
    keyFacts,
    sources: input.sources,
    disclaimers: DEFAULT_DISCLAIMERS,
    minWordCount: MIN_WORD_COUNTS[input.pageType] || 1000,
    requiredSections: getRequiredSections(input.pageType),
  };
  
  const internalLinks = await pickLinksForBrief(tempBrief as ContentBrief);
  
  // Build complete brief
  const brief: ContentBrief = {
    ...tempBrief,
    outline,
    internalLinksToInclude: internalLinks,
  } as ContentBrief;
  
  return brief;
}

/**
 * Build outline based on page type
 */
function buildOutline(
  pageType: PageType,
  title: string,
  facts: Fact[]
): ContentBrief['outline'] {
  switch (pageType) {
    case 'species':
      return [
        {
          level: 2,
          title: `About ${title.split(' ')[0]}`,
          description: 'Introduction to the species, including identification and basic information',
          keyFacts: facts.filter((f) => f.category === 'habitat' || f.category === 'size'),
        },
        {
          level: 2,
          title: 'Habitat and Behavior',
          description: 'Where the species lives and how it behaves',
          keyFacts: facts.filter((f) => f.category === 'habitat' || f.category === 'behavior'),
        },
        {
          level: 2,
          title: 'Best Techniques',
          description: 'How to catch this species effectively',
          keyFacts: facts.filter((f) => f.category === 'technique'),
        },
        {
          level: 2,
          title: 'Where to Find',
          description: 'Locations where this species is commonly found',
          keyFacts: facts.filter((f) => f.scope === 'location-specific'),
        },
      ];
      
    case 'how-to':
      return [
        {
          level: 2,
          title: 'Why This Technique Matters',
          description: 'Introduction to why this technique is important',
          keyFacts: facts.slice(0, 3),
        },
        {
          level: 2,
          title: 'Step-by-Step Guide',
          description: 'Detailed steps to execute this technique',
          keyFacts: facts.filter((f) => f.category === 'technique'),
        },
        {
          level: 2,
          title: 'Tips & Tricks',
          description: 'Pro tips for success',
          keyFacts: facts.filter((f) => f.confidence > 0.7),
        },
        {
          level: 2,
          title: 'Best Conditions',
          description: 'When and where to use this technique',
          keyFacts: facts.filter((f) => f.category === 'weather' || f.scope === 'seasonal'),
        },
        {
          level: 2,
          title: 'Common Mistakes',
          description: 'What to avoid when using this technique',
        },
      ];
      
    case 'location':
      return [
        {
          level: 2,
          title: 'Best Fishing Spots',
          description: 'Top fishing locations in this area',
        },
        {
          level: 2,
          title: 'Popular Species',
          description: 'Fish species commonly found here',
          keyFacts: facts.filter((f) => f.category !== 'technique'),
        },
        {
          level: 2,
          title: 'Fishing Techniques',
          description: 'Best techniques for this location',
          keyFacts: facts.filter((f) => f.category === 'technique'),
        },
        {
          level: 2,
          title: 'Best Times to Fish',
          description: 'Seasonal patterns and optimal timing',
          keyFacts: facts.filter((f) => f.scope === 'seasonal'),
        },
        {
          level: 2,
          title: 'Local Tips',
          description: 'Insider knowledge for fishing this location',
        },
      ];
      
    case 'blog':
      return [
        {
          level: 2,
          title: 'Introduction',
          description: 'Overview of the topic',
          keyFacts: facts.slice(0, 3),
        },
        {
          level: 2,
          title: 'Main Content',
          description: 'Detailed information about the topic',
          keyFacts: facts.slice(3, 10),
        },
        {
          level: 2,
          title: 'Practical Tips',
          description: 'Actionable advice',
          keyFacts: facts.filter((f) => f.confidence > 0.7),
        },
        {
          level: 2,
          title: 'Conclusion',
          description: 'Summary and next steps',
        },
      ];
  }
}

/**
 * Get required sections by page type
 */
function getRequiredSections(pageType: PageType): string[] {
  switch (pageType) {
    case 'species':
      return ['About', 'Habitat', 'Techniques', 'Where to Find'];
    case 'how-to':
      return ['Why This Technique Matters', 'Step-by-Step', 'Tips', 'Best Conditions'];
    case 'location':
      return ['Best Fishing Spots', 'Popular Species', 'Fishing Techniques', 'Best Times'];
    case 'blog':
      return ['Introduction', 'Main Content', 'Conclusion'];
    default:
      return [];
  }
}


