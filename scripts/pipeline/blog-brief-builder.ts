/**
 * Blog Brief Builder - Converts BlogIdea to ContentBrief
 * This bridges the gap between ideation and generation
 */

import { ContentBrief, Fact, Source } from './types';
import { BlogIdea } from './ideation';
import { buildBrief } from './briefBuilder';
import { logger } from './logger';

/**
 * Convert BlogIdea to ContentBrief
 */
export async function blogIdeaToBrief(idea: BlogIdea): Promise<ContentBrief> {
  logger.info(`Converting blog idea to brief: ${idea.title}`);

  // Extract facts from related questions (for FAQ generation)
  const facts: Fact[] = idea.relatedQuestions.map((question, index) => ({
    claim: question,
    confidence: 0.7,
    supportingSources: [],
    observedAt: new Date().toISOString(),
    scope: 'global' as const,
    category: 'other' as const,
  }));

  // Create sources (minimal - can be enhanced later)
  const sources: Source[] = [
    {
      label: 'Fishing Research',
      url: 'https://www.tackleapp.com',
      retrievedAt: new Date().toISOString(),
    },
  ];

  // Build the brief using the existing brief builder
  const brief = await buildBrief({
    pageType: 'blog',
    topicKey: `blog::${idea.slug}`,
    slug: idea.slug,
    title: idea.title,
    primaryKeyword: idea.keyword,
    secondaryKeywords: [
      ...idea.relatedQuestions.slice(0, 5).map(q => q.toLowerCase().replace(/\?/g, '')),
      idea.category,
    ],
    facts,
    sources,
  });

  return brief;
}
