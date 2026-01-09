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

  // Extract content focus (location & species)
  const locationFocus = extractLocationFocus(input.title, input.primaryKeyword, input.secondaryKeywords);
  const speciesFocus = extractSpeciesFocus(input.title, input.primaryKeyword, input.secondaryKeywords);

  // Determine content strategy
  const userIntent = determineUserIntent(input.primaryKeyword, input.pageType);
  const angle = determineContentAngle(input.title, input.primaryKeyword, input.secondaryKeywords, input.pageType);

  // Generate internal links
  const tempBrief: Partial<ContentBrief> = {
    pageType: input.pageType,
    slug: input.slug,
    topicKey: input.topicKey,
    title: input.title,
    primaryKeyword: input.primaryKeyword,
    secondaryKeywords: input.secondaryKeywords,
    locationFocus,
    speciesFocus,
    userIntent,
    angle,
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

  logger.info(`Brief built with focus: ${speciesFocus || 'none'} @ ${locationFocus || 'general'}, angle: ${angle}, intent: ${userIntent}`);

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

/**
 * Extract location focus from title and keywords
 */
function extractLocationFocus(title: string, primaryKeyword: string, secondaryKeywords: string[]): string | undefined {
  const allText = [title, primaryKeyword, ...secondaryKeywords].join(' ').toLowerCase();

  // US States (common fishing destinations)
  const states = [
    'florida', 'texas', 'california', 'louisiana', 'alabama', 'mississippi',
    'georgia', 'south carolina', 'north carolina', 'virginia', 'maryland',
    'new jersey', 'new york', 'massachusetts', 'maine', 'alaska', 'hawaii',
    'washington', 'oregon', 'michigan', 'wisconsin', 'minnesota'
  ];

  for (const state of states) {
    if (allText.includes(state)) {
      return state.charAt(0).toUpperCase() + state.slice(1);
    }
  }

  // Regions
  const regions = [
    { pattern: /gulf coast|gulf of mexico/i, name: 'Gulf Coast' },
    { pattern: /east coast|eastern seaboard/i, name: 'East Coast' },
    { pattern: /west coast|pacific coast/i, name: 'West Coast' },
    { pattern: /great lakes/i, name: 'Great Lakes' },
    { pattern: /florida keys|the keys/i, name: 'Florida Keys' },
    { pattern: /tampa bay/i, name: 'Tampa Bay' },
    { pattern: /chesapeake bay/i, name: 'Chesapeake Bay' },
  ];

  for (const region of regions) {
    if (region.pattern.test(allText)) {
      return region.name;
    }
  }

  return undefined;
}

/**
 * Extract species focus from title and keywords
 */
function extractSpeciesFocus(title: string, primaryKeyword: string, secondaryKeywords: string[]): string | undefined {
  const allText = [title, primaryKeyword, ...secondaryKeywords].join(' ').toLowerCase();

  // Common gamefish species
  const species = [
    { pattern: /\bsnook\b/i, name: 'Snook' },
    { pattern: /\bredfish\b|red drum/i, name: 'Redfish' },
    { pattern: /\btarpon\b/i, name: 'Tarpon' },
    { pattern: /\bbass\b|largemouth bass|smallmouth bass/i, name: 'Bass' },
    { pattern: /\btrout\b|speckled trout|spotted seatrout/i, name: 'Trout' },
    { pattern: /\bgrouper\b/i, name: 'Grouper' },
    { pattern: /\bsnapper\b|red snapper/i, name: 'Snapper' },
    { pattern: /\bmahi\b|mahi mahi|dorado/i, name: 'Mahi-Mahi' },
    { pattern: /\bwahoo\b/i, name: 'Wahoo' },
    { pattern: /\btuna\b|yellowfin|blackfin/i, name: 'Tuna' },
    { pattern: /\bmarlin\b|blue marlin|white marlin/i, name: 'Marlin' },
    { pattern: /\bsailfish\b/i, name: 'Sailfish' },
    { pattern: /\bcobia\b/i, name: 'Cobia' },
    { pattern: /\bking mackerel\b|kingfish/i, name: 'King Mackerel' },
    { pattern: /\bflounder\b/i, name: 'Flounder' },
    { pattern: /\bpompano\b/i, name: 'Pompano' },
    { pattern: /\bpermit\b/i, name: 'Permit' },
    { pattern: /\bbonefish\b/i, name: 'Bonefish' },
    { pattern: /\bjack crevalle\b|jack/i, name: 'Jack Crevalle' },
    { pattern: /\bsheepshead\b/i, name: 'Sheepshead' },
  ];

  for (const sp of species) {
    if (sp.pattern.test(allText)) {
      return sp.name;
    }
  }

  return undefined;
}

/**
 * Determine user intent from keyword and page type
 */
function determineUserIntent(
  primaryKeyword: string,
  pageType: PageType
): ContentBrief['userIntent'] {
  const keyword = primaryKeyword.toLowerCase();

  // Transactional intent keywords
  if (/\b(buy|purchase|order|shop|deal|price|cost|cheap|best price)\b/i.test(keyword)) {
    return 'transactional';
  }

  // Navigational intent keywords
  if (/\b(login|sign in|website|official|contact|near me)\b/i.test(keyword)) {
    return 'navigational';
  }

  // Default to informational (most blog/content should be informational)
  return 'informational';
}

/**
 * Determine content angle from title, keyword, and page type
 */
function determineContentAngle(
  title: string,
  primaryKeyword: string,
  secondaryKeywords: string[],
  pageType: PageType
): ContentBrief['angle'] {
  const allText = [title, primaryKeyword, ...secondaryKeywords].join(' ').toLowerCase();

  // Check for beginner indicators
  if (/\b(beginner|start|intro|guide for beginners|how to start|basics|101)\b/i.test(allText)) {
    return 'beginner';
  }

  // Check for seasonal indicators
  if (/\b(spring|summer|fall|winter|season|seasonal|month|january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(allText)) {
    return 'seasonal';
  }

  // Check for gear focus
  if (/\b(lure|bait|rod|reel|tackle|gear|equipment|best.*for)\b/i.test(allText)) {
    return 'gear-focused';
  }

  // Check for location focus
  if (extractLocationFocus(title, primaryKeyword, secondaryKeywords)) {
    return 'location-focused';
  }

  // Check for technique focus
  if (/\b(technique|method|how to|strategy|tactic|approach|way to|tips for)\b/i.test(allText)) {
    return 'technique-focused';
  }

  // Check for advanced indicators
  if (/\b(advanced|expert|pro|professional|master|tournament)\b/i.test(allText)) {
    return 'advanced';
  }

  // Default based on page type
  if (pageType === 'how-to') {
    return 'technique-focused';
  } else if (pageType === 'location') {
    return 'location-focused';
  }

  // Default to technique-focused for blog posts
  return 'technique-focused';
}



