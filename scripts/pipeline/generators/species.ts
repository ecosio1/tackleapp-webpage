/**
 * Species Page Generator
 */

import { SpeciesDoc, ContentBrief } from '../types';
import { generateWithLLM } from '../llm';
import { DEFAULT_AUTHOR_NAME, DEFAULT_AUTHOR_URL } from '../config';
import { logger } from '../logger';
import { generateVibeTest } from '../vibe-test';
import { generateAlternativeRecommendations } from '../alternative-recommendations';
import crypto from 'crypto';

/**
 * Generate species document
 */
export async function generateSpecies(brief: ContentBrief): Promise<SpeciesDoc> {
  logger.info(`Generating species page: ${brief.slug}`);
  
  const prompt = buildPrompt(brief);
  
  // Generate content using LLM
  const generated = await generateWithLLM({
    prompt,
    systemPrompt: `You are a fishing content writer. Generate original, SEO-optimized species guides.
Never copy text verbatim from sources. Write beginner-friendly explanations.
Include all required sections, FAQs, and internal links naturally in the content.`,
  });
  
  // Parse generated content
  const body = typeof generated === 'string' ? generated : generated.body || '';
  const faqs = generated.faqs || [];
  const headings = extractHeadings(body);
  
  // Extract species metadata from facts
  const speciesMeta = extractSpeciesMetadata(brief);
  
  // Generate Vibe Test (unique authority signal)
  let vibeTest;
  try {
    const speciesName = brief.primaryKeyword.split(' ')[0]; // Extract species name
    vibeTest = await generateVibeTest('species', speciesName, {
      location: extractLocationFromBrief(brief),
    });
    logger.info(`Generated Vibe Test for ${speciesName}`);
  } catch (error) {
    logger.warn('Vibe Test generation failed, continuing without it:', error);
  }
  
  // Generate alternative recommendations
  let alternativeRecommendations;
  try {
    const { loadSiteIndex } = await import('../internalLinks');
    const siteIndex = await loadSiteIndex();
    const availableContent = [
      ...siteIndex.species.map(s => ({ ...s, type: 'species', title: s.slug })),
      ...siteIndex.howTo.map(h => ({ ...h, type: 'how-to', title: h.slug })),
      ...siteIndex.locations.map(l => ({ ...l, type: 'location', title: l.city || l.slug })),
      ...siteIndex.blogPosts.map(b => ({ ...b, type: 'blog', title: b.slug })),
    ];
    alternativeRecommendations = await generateAlternativeRecommendations(brief, availableContent);
    logger.info(`Generated ${alternativeRecommendations.length} alternative recommendations`);
  } catch (error) {
    logger.warn('Alternative recommendations generation failed:', error);
  }
  
  // Build document
  const doc: SpeciesDoc = {
    id: crypto.randomUUID(),
    pageType: 'species',
    slug: brief.slug,
    title: brief.title,
    description: generateDescription(brief, body),
    body,
    headings,
    primaryKeyword: brief.primaryKeyword,
    secondaryKeywords: brief.secondaryKeywords,
    speciesMeta,
    faqs: faqs.length >= 5 ? faqs.slice(0, 8) : generateDefaultFaqs(brief),
    sources: brief.sources,
    related: brief.internalLinksToInclude,
    author: {
      name: DEFAULT_AUTHOR_NAME,
      url: DEFAULT_AUTHOR_URL,
    },
    dates: {
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    flags: {
      draft: false,
      noindex: false,
    },
    vibeTest,
    alternativeRecommendations,
  };
  
  return doc;
}

/**
 * Extract location from brief for context
 */
function extractLocationFromBrief(brief: ContentBrief): string | undefined {
  // Try to extract location from keywords or title
  const locationKeywords = ['florida', 'texas', 'miami', 'tampa', 'key west'];
  const allText = `${brief.title} ${brief.primaryKeyword} ${brief.secondaryKeywords.join(' ')}`.toLowerCase();
  
  for (const loc of locationKeywords) {
    if (allText.includes(loc)) {
      return loc;
    }
  }
  
  return undefined;
}

/**
 * Build LLM prompt for species page
 */
function buildPrompt(brief: ContentBrief): string {
  const internalLinks = [
    ...(brief.internalLinksToInclude.howToSlugs || []).map((h) => `- How-to: /how-to/${h}`),
    ...(brief.internalLinksToInclude.locationSlugs || []).map((l) => `- Location: /locations/${l}`),
    ...(brief.internalLinksToInclude.postSlugs || []).map((p) => `- Blog: /blog/${p}`),
  ].join('\n');
  
  const keyFacts = brief.keyFacts
    .slice(0, 15)
    .map((f) => `- ${f.claim}`)
    .join('\n');
  
  return `Write an SEO-optimized species fishing guide with the following requirements:

TITLE: ${brief.title}
PRIMARY KEYWORD: ${brief.primaryKeyword}
SECONDARY KEYWORDS: ${brief.secondaryKeywords.join(', ')}

REQUIREMENTS:
1. Write original content (minimum ${brief.minWordCount} words)
2. Use beginner-friendly language with definitions
3. Include all required sections from outline
4. Never copy text verbatim from sources
5. Include 5-8 FAQs at the end
6. Include a "What to do next" CTA pointing to /download
7. Include a "See local regulations" outbound link block (no legal advice)

OUTLINE (must include all sections):
${brief.outline.map((o) => `- ${o.title}: ${o.description}`).join('\n')}

KEY FACTS TO INCLUDE (cite these, don't copy):
${keyFacts}

INTERNAL LINKS TO INCLUDE (link naturally in content):
${internalLinks}

SOURCES CONSULTED (cite at end, don't copy):
${brief.sources.map((s) => `- ${s.label}: ${s.url}`).join('\n')}

DISCLAIMERS TO INCLUDE:
${brief.disclaimers.join('\n')}

OUTPUT FORMAT:
- Markdown format
- Use H2 for main sections, H3 for subsections
- Include internal links naturally in content
- Include a "Vibe Test: Difficulty Rating" section with proprietary scoring
- End with FAQs section (5-8 questions)
- End with "What to do next" CTA linking to /download
- End with "See local regulations" link block
- End with "Sources consulted" list

IMPORTANT - Vibe Test Section:
Include a "Vibe Test: Difficulty Rating" section that shows:
- A proprietary Difficulty Rating score (0-100) for catching this species
- Unique insights from "real-world fishing experience"
- Real-world notes from actual fishing trips
- Factors that contribute to the difficulty rating
- Make it sound authentic and experience-based, not generic data

Write the complete species guide now:`;
}

/**
 * Extract species metadata from facts
 */
function extractSpeciesMetadata(brief: ContentBrief): SpeciesDoc['speciesMeta'] {
  const facts = brief.keyFacts;
  
  const habitats = facts
    .filter((f) => f.category === 'habitat')
    .map((f) => f.claim)
    .slice(0, 5);
  
  const seasons = facts
    .filter((f) => f.scope === 'seasonal' || f.category === 'season')
    .map((f) => f.claim)
    .slice(0, 3);
  
  const sizes = facts
    .filter((f) => f.category === 'size')
    .map((f) => f.claim)
    .slice(0, 2);
  
  return {
    habitats: habitats.length > 0 ? habitats : undefined,
    bestSeasons: seasons.length > 0 ? seasons : undefined,
    averageSize: sizes[0] || undefined,
    maxSize: sizes[1] || undefined,
  };
}

/**
 * Extract headings from markdown body
 */
function extractHeadings(body: string): SpeciesDoc['headings'] {
  const headings: SpeciesDoc['headings'] = [];
  const lines = body.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('### ')) {
      headings.push({
        level: 3,
        text: line.substring(4).trim(),
        id: slugify(line.substring(4).trim()),
      });
    } else if (line.startsWith('## ')) {
      headings.push({
        level: 2,
        text: line.substring(3).trim(),
        id: slugify(line.substring(3).trim()),
      });
    }
  }
  
  return headings;
}

/**
 * Generate description
 */
function generateDescription(brief: ContentBrief, body: string): string {
  const firstParagraph = body.split('\n\n')[0]?.replace(/^#+\s*/, '').trim();
  if (firstParagraph && firstParagraph.length >= 100 && firstParagraph.length <= 160) {
    return firstParagraph;
  }
  
  return `${brief.title}. Complete guide to ${brief.primaryKeyword} including habitat, behavior, and fishing techniques.`.substring(0, 160);
}

/**
 * Generate default FAQs
 */
function generateDefaultFaqs(brief: ContentBrief): SpeciesDoc['faqs'] {
  const speciesName = brief.title.split(' ')[0];
  return [
    {
      question: `What is ${speciesName}?`,
      answer: `${speciesName} is a popular game fish. This guide provides detailed information about ${speciesName} fishing.`,
    },
    {
      question: `Where can I find ${speciesName}?`,
      answer: `${speciesName} can be found in various locations. Check the "Where to Find" section for specific locations.`,
    },
    {
      question: `What is the best technique for catching ${speciesName}?`,
      answer: `The best techniques for ${speciesName} are covered in the "Best Techniques" section of this guide.`,
    },
    {
      question: `When is the best time to catch ${speciesName}?`,
      answer: `The best times to catch ${speciesName} vary by season and location. See the guide for detailed information.`,
    },
    {
      question: `What equipment do I need for ${speciesName}?`,
      answer: `Equipment recommendations for ${speciesName} fishing are included in the techniques section.`,
    },
  ];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}



