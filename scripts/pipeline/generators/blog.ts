/**
 * Blog Post Generator
 */

import { BlogPostDoc, ContentBrief } from '../types';
import { generateWithLLM } from '../llm';
import { DEFAULT_AUTHOR_NAME, DEFAULT_AUTHOR_URL } from '../config';
import { logger } from '../logger';
import { generateVibeTest } from '../vibe-test';
import { generateAlternativeRecommendations } from '../alternative-recommendations';
import crypto from 'crypto';

/**
 * Generate blog post document
 */
export async function generateBlogPost(brief: ContentBrief): Promise<BlogPostDoc> {
  logger.info(`Generating blog post: ${brief.slug}`);
  
  const prompt = buildPrompt(brief);
  
  // Generate content using LLM
  const generated = await generateWithLLM({
    prompt,
    systemPrompt: `You are a fishing content writer. Generate original, SEO-optimized blog posts.
Never copy text verbatim from sources. Write in a conversational, helpful tone.
Include all required sections, FAQs, and internal links naturally in the content.`,
  });
  
  // Parse generated content (assuming it returns structured data)
  const body = typeof generated === 'string' ? generated : generated.body || '';
  const faqs = generated.faqs || [];
  const headings = extractHeadings(body);
  
  // Generate Vibe Test for comparison/lure/technique posts
  let vibeTest;
  try {
    const pageType = determinePageType(brief);
    if (pageType) {
      const primaryEntity = extractPrimaryEntity(brief);
      vibeTest = await generateVibeTest(pageType, primaryEntity, {
        species: extractSpeciesFromBrief(brief),
        location: extractLocationFromBrief(brief),
        comparison: extractComparisonFromBrief(brief),
      });
      logger.info(`Generated Vibe Test for ${pageType}: ${primaryEntity}`);
    }
  } catch (error) {
    logger.warn('Vibe Test generation failed, continuing without it:', error);
  }
  
  // Generate alternative recommendations
  let alternativeRecommendations;
  try {
    const { generateAlternativeRecommendations } = await import('../alternative-recommendations');
    const { loadSiteIndex } = await import('../internalLinks');
    const siteIndex = await loadSiteIndex();
    
    // Convert site index to format needed
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
  const doc: BlogPostDoc = {
    id: crypto.randomUUID(),
    pageType: 'blog',
    slug: brief.slug,
    title: brief.title,
    description: generateDescription(brief, body),
    body,
    headings,
    primaryKeyword: brief.primaryKeyword,
    secondaryKeywords: brief.secondaryKeywords,
    categorySlug: extractCategoryFromSlug(brief.slug),
    tags: brief.secondaryKeywords.slice(0, 5),
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
 * Determine page type for vibe test
 */
function determinePageType(brief: ContentBrief): 'lure' | 'technique' | 'comparison' | null {
  const titleLower = brief.title.toLowerCase();
  const keywordLower = brief.primaryKeyword.toLowerCase();
  const allText = `${titleLower} ${keywordLower}`;
  
  // Check for comparison patterns
  if (allText.includes(' vs ') || allText.includes(' versus ') || allText.includes(' comparison')) {
    return 'comparison';
  }
  
  // Check for lure patterns
  if (allText.includes('lure') || allText.includes('bait') || allText.includes('rod') || allText.includes('reel')) {
    return 'lure';
  }
  
  // Check for technique patterns
  if (allText.includes('technique') || allText.includes('method') || allText.includes('how to')) {
    return 'technique';
  }
  
  return null;
}

/**
 * Extract primary entity from brief
 */
function extractPrimaryEntity(brief: ContentBrief): string {
  // Try to extract from title or keyword
  const titleWords = brief.title.split(' ');
  const keywordWords = brief.primaryKeyword.split(' ');
  
  // Look for nouns (capitalized words or common fishing terms)
  const fishingTerms = ['lure', 'bait', 'rod', 'reel', 'technique', 'method', 'topwater', 'jig', 'spinnerbait'];
  
  for (const word of [...titleWords, ...keywordWords]) {
    const lower = word.toLowerCase();
    if (fishingTerms.some(term => lower.includes(term))) {
      return word;
    }
  }
  
  // Fallback to first significant word from title
  return titleWords.find(w => w.length > 4) || brief.primaryKeyword;
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
 * Extract location from brief
 */
function extractLocationFromBrief(brief: ContentBrief): string | undefined {
  const locations = ['florida', 'texas', 'miami', 'tampa', 'key west', 'orlando'];
  const allText = `${brief.title} ${brief.primaryKeyword}`.toLowerCase();
  
  for (const loc of locations) {
    if (allText.includes(loc)) {
      return loc;
    }
  }
  
  return undefined;
}

/**
 * Extract comparison item from brief
 */
function extractComparisonFromBrief(brief: ContentBrief): string | undefined {
  const title = brief.title.toLowerCase();
  const vsMatch = title.match(/(.+?)\s+(?:vs|versus)\s+(.+)/);
  if (vsMatch) {
    return vsMatch[2].trim();
  }
  return undefined;
}

/**
 * Build LLM prompt for blog post
 */
function buildPrompt(brief: ContentBrief): string {
  const internalLinks = [
    ...(brief.internalLinksToInclude.speciesSlugs || []).map((s) => `- Species: /species/${s}`),
    ...(brief.internalLinksToInclude.howToSlugs || []).map((h) => `- How-to: /how-to/${h}`),
    ...(brief.internalLinksToInclude.locationSlugs || []).map((l) => `- Location: /locations/${l}`),
    ...(brief.internalLinksToInclude.postSlugs || []).map((p) => `- Blog: /blog/${p}`),
  ].join('\n');
  
  const keyFacts = brief.keyFacts
    .slice(0, 10)
    .map((f) => `- ${f.claim}`)
    .join('\n');
  
  return `Write an SEO-optimized blog post with the following requirements:

TITLE: ${brief.title}
PRIMARY KEYWORD: ${brief.primaryKeyword}
SECONDARY KEYWORDS: ${brief.secondaryKeywords.join(', ')}

REQUIREMENTS:
1. Write original content (minimum ${brief.minWordCount} words)
2. Use conversational, helpful tone
3. Include all required sections from outline
4. Never copy text verbatim from sources
5. Include 5-8 FAQs at the end
6. Include a "What to do next" CTA pointing to /download
7. Include a "See local regulations" outbound link block if relevant

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
- End with FAQs section (5-8 questions)
- End with "What to do next" CTA linking to /download
- End with "See local regulations" link block if relevant
- End with "Sources consulted" list

Write the complete blog post now:`;
}

/**
 * Extract headings from markdown body
 */
function extractHeadings(body: string): BlogPostDoc['headings'] {
  const headings: BlogPostDoc['headings'] = [];
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
    } else if (line.startsWith('# ')) {
      headings.push({
        level: 1,
        text: line.substring(2).trim(),
        id: slugify(line.substring(2).trim()),
      });
    }
  }
  
  return headings;
}

/**
 * Generate description from brief and body
 */
function generateDescription(brief: ContentBrief, body: string): string {
  // Extract first paragraph or generate from title
  const firstParagraph = body.split('\n\n')[0]?.replace(/^#+\s*/, '').trim();
  if (firstParagraph && firstParagraph.length >= 100 && firstParagraph.length <= 160) {
    return firstParagraph;
  }
  
  // Fallback: generate from title and keywords
  return `${brief.title}. ${brief.secondaryKeywords.slice(0, 3).join(', ')}. Learn more about ${brief.primaryKeyword}.`.substring(0, 160);
}

/**
 * Extract category from slug
 */
function extractCategoryFromSlug(slug: string): string {
  // Simple heuristic - can be improved
  if (slug.includes('tip') || slug.includes('guide')) return 'fishing-tips';
  if (slug.includes('gear') || slug.includes('review')) return 'gear-reviews';
  if (slug.includes('condition') || slug.includes('weather')) return 'conditions';
  return 'fishing-tips';
}

/**
 * Generate default FAQs if LLM didn't provide enough
 */
function generateDefaultFaqs(brief: ContentBrief): BlogPostDoc['faqs'] {
  return [
    {
      question: `What is ${brief.primaryKeyword}?`,
      answer: `This guide covers ${brief.primaryKeyword} and provides helpful information for anglers.`,
    },
    {
      question: `How can I learn more about ${brief.primaryKeyword}?`,
      answer: `Continue reading this guide for detailed information, or check out our related guides and species pages.`,
    },
  ];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}



