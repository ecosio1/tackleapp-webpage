/**
 * Location Page Generator
 */

import { LocationDoc, ContentBrief } from '../types';
import { DEFAULT_AUTHOR_NAME, DEFAULT_AUTHOR_URL } from '../config';
import { logger } from '../logger';
import { generateWithLLM } from '../llm';
import { generateVibeTest } from '../vibe-test';
import crypto from 'crypto';

/**
 * Generate location document
 */
export async function generateLocation(brief: ContentBrief): Promise<LocationDoc> {
  logger.info(`Generating location page: ${brief.slug}`);
  
  // Parse state and city from slug (format: "state/city")
  const [stateSlug, citySlug] = brief.slug.split('/');
  
  const prompt = buildPrompt(brief, stateSlug, citySlug);
  
  // Generate content using LLM
  const generated = await generateWithLLM({
    prompt,
    systemPrompt: `You are a fishing content writer. Generate original, SEO-optimized location guides.
Never copy text verbatim from sources. Write helpful, location-specific information.
Include all required sections, FAQs, and internal links naturally in the content.`,
  });
  
  // Parse generated content
  const body = typeof generated === 'string' ? generated : generated.body || '';
  const faqs = generated.faqs || [];
  const headings = extractHeadings(body);
  
  // Extract geo information
  const geo = extractGeoInfo(stateSlug, citySlug);
  
  // Generate Vibe Test (Location Quality Score)
  let vibeTest;
  try {
    const locationName = `${geo.city}, ${geo.state}`;
    const species = extractSpeciesFromBrief(brief);
    vibeTest = await generateVibeTest('location', locationName, {
      species,
    });
    logger.info(`Generated Vibe Test for location: ${locationName}`);
  } catch (error) {
    logger.warn('Vibe Test generation failed, continuing without it:', error);
  }
  
  // Build document
  const doc: LocationDoc = {
    id: crypto.randomUUID(),
    pageType: 'location',
    slug: brief.slug,
    stateSlug,
    citySlug,
    title: brief.title,
    description: generateDescription(brief, body),
    body,
    headings,
    primaryKeyword: brief.primaryKeyword,
    secondaryKeywords: brief.secondaryKeywords,
    geo,
    faqs: faqs.length >= 5 ? faqs.slice(0, 8) : generateDefaultFaqs(brief, citySlug),
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
  };
  
  return doc;
}

/**
 * Extract species from brief
 */
function extractSpeciesFromBrief(brief: ContentBrief): string | undefined {
  const species = ['redfish', 'snook', 'tarpon', 'bass', 'grouper', 'snapper', 'trout', 'flounder'];
  const allText = `${brief.title} ${brief.primaryKeyword}`.toLowerCase();
  
  for (const sp of species) {
    if (allText.includes(sp)) {
      return sp;
    }
  }
  
  return undefined;
}

/**
 * Build LLM prompt for location page
 */
function buildPrompt(brief: ContentBrief, stateSlug: string, citySlug: string): string {
  const internalLinks = [
    ...(brief.internalLinksToInclude.speciesSlugs || []).map((s) => `- Species: /species/${s}`),
    ...(brief.internalLinksToInclude.howToSlugs || []).map((h) => `- How-to: /how-to/${h}`),
    ...(brief.internalLinksToInclude.postSlugs || []).map((p) => `- Blog: /blog/${p}`),
  ].join('\n');
  
  const keyFacts = brief.keyFacts
    .slice(0, 15)
    .map((f) => `- ${f.claim}`)
    .join('\n');
  
  return `Write an SEO-optimized fishing location guide for ${citySlug}, ${stateSlug} with the following requirements:

TITLE: ${brief.title}
PRIMARY KEYWORD: ${brief.primaryKeyword}
SECONDARY KEYWORDS: ${brief.secondaryKeywords.join(', ')}

REQUIREMENTS:
1. Write original location guide (minimum ${brief.minWordCount} words)
2. Include specific fishing spots (5-10 spots with descriptions)
3. Include "Popular Species" section
4. Include "Fishing Techniques" section
5. Include "Best Times to Fish" section
6. Include "Local Tips" section
7. Never copy text verbatim from sources
8. Include 5-8 FAQs at the end
9. Include a "What to do next" CTA pointing to /download
10. Include a prominent "See local regulations" outbound link (REQUIRED)

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
- Use H2 for main sections, H3 for fishing spots
- Include internal links naturally in content
- End with FAQs section (5-8 questions)
- End with "What to do next" CTA linking to /download
- End with prominent "See local regulations" link block (REQUIRED)
- End with "Sources consulted" list

IMPORTANT - Vibe Test Section:
Include a "Vibe Test: Location Quality Score" section that shows:
- A proprietary Location Quality Score (0-100) for this fishing location
- Unique insights from "real-world fishing experience" at this location
- Real-world notes from actual fishing trips here
- Factors that contribute to the quality rating
- Make it sound authentic and experience-based, not generic location data

Write the complete location guide now:`;
}

/**
 * Extract geo information
 */
function extractGeoInfo(stateSlug: string, citySlug: string): LocationDoc['geo'] {
  const stateMap: Record<string, { name: string; code: string }> = {
    florida: { name: 'Florida', code: 'FL' },
    texas: { name: 'Texas', code: 'TX' },
    california: { name: 'California', code: 'CA' },
    'new-york': { name: 'New York', code: 'NY' },
  };
  
  const stateInfo = stateMap[stateSlug] || { name: stateSlug, code: stateSlug.toUpperCase().substring(0, 2) };
  const cityName = citySlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  return {
    state: stateInfo.name,
    stateCode: stateInfo.code,
    city: cityName,
  };
}

/**
 * Extract headings from markdown body
 */
function extractHeadings(body: string): LocationDoc['headings'] {
  const headings: LocationDoc['headings'] = [];
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
  
  return `${brief.title}. Complete fishing guide with best spots, popular species, techniques, and local tips.`.substring(0, 160);
}

/**
 * Generate default FAQs
 */
function generateDefaultFaqs(brief: ContentBrief, citySlug: string): LocationDoc['faqs'] {
  const cityName = citySlug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return [
    {
      question: `What are the best fishing spots in ${cityName}?`,
      answer: `The best fishing spots in ${cityName} are covered in the "Best Fishing Spots" section of this guide.`,
    },
    {
      question: `What fish can I catch in ${cityName}?`,
      answer: `Popular species in ${cityName} are listed in the "Popular Species" section.`,
    },
    {
      question: `What techniques work best in ${cityName}?`,
      answer: `Effective fishing techniques for ${cityName} are covered in the "Fishing Techniques" section.`,
    },
    {
      question: `When is the best time to fish in ${cityName}?`,
      answer: `The "Best Times to Fish" section covers seasonal patterns and optimal timing for ${cityName}.`,
    },
    {
      question: `Do I need a fishing license in ${cityName}?`,
      answer: `Fishing license requirements vary. Always check current regulations with official sources. See the "See local regulations" link for official information.`,
    },
  ];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}



