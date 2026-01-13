/**
 * Blog Post Generator
 * Updated to use 12-section retention-focused template
 */

import { BlogPostDoc, ContentBrief, CTA } from '../types';
import { generateWithLLM } from '../llm';
import { DEFAULT_AUTHOR_NAME, DEFAULT_AUTHOR_URL } from '../config';
import { logger } from '../logger';
import { generateVibeTest } from '../vibe-test';
import { generateAlternativeRecommendations } from '../alternative-recommendations';
import {
  generateRetentionPrompt,
  addImagesToPost,
  validateRetentionStructure,
} from '../blog-retention-template';
import crypto from 'crypto';

/**
 * Generate blog post document
 */
export async function generateBlogPost(brief: ContentBrief): Promise<BlogPostDoc> {
  logger.info(`Generating blog post with 12-section retention structure: ${brief.slug}`);

  // Use retention-focused prompt instead of old buildPrompt()
  const prompt = generateRetentionPrompt({
    title: brief.title,
    primaryKeyword: brief.primaryKeyword,
    secondaryKeywords: brief.secondaryKeywords,
    speciesFocus: brief.speciesFocus,
    locationFocus: brief.locationFocus,
    internalLinks: [
      ...(brief.internalLinksToInclude.speciesSlugs || []).map((s) => `- Species: /species/${s}`),
      ...(brief.internalLinksToInclude.howToSlugs || []).map((h) => `- How-to: /how-to/${h}`),
      ...(brief.internalLinksToInclude.locationSlugs || []).map((l) => `- Location: /locations/${l}`),
      ...(brief.internalLinksToInclude.postSlugs || []).map((p) => `- Blog: /blog/${p}`),
    ],
    keyFacts: brief.keyFacts.slice(0, 10).map((f) => f.claim),
    sources: brief.sources,
    minWordCount: Math.max(brief.minWordCount, 1500),
  });

  // Generate content using LLM with retention-focused system prompt
  const generated = await generateWithLLM({
    prompt,
    systemPrompt: `You are an expert fishing content writer specializing in high-retention blog posts.

CRITICAL STRUCTURE (NON-NEGOTIABLE):
- Follow the exact 12-section retention structure provided in the prompt
- Include "DO THIS FIRST" callout in Section 1
- Create decision tree with 6 conditions in Section 5
- List 10-12 specific mistakes in Section 7
- Include 4 image placeholders (IMAGE_TACKLE, IMAGE_TECHNIQUE, IMAGE_STRUCTURE, IMAGE_DETAIL)

WRITING STYLE:
- Use specific measurements (depths, weights, distances, times)
- Include brand names and product specifics
- Short paragraphs (max 4-5 lines)
- Active voice, 2nd person ("you should cast...")
- Include realistic constraints and conditions

CRITICAL PROHIBITIONS (WILL CAUSE REJECTION):
❌ NEVER mention bag limits, catch limits, or possession limits (e.g., "5 fish per day", "daily limit")
❌ NEVER mention size limits or slot limits (e.g., "12-15 inches", "minimum 18 inches")
❌ NEVER mention fishing seasons or closed seasons (e.g., "open April-October")
❌ NEVER mention specific license requirements or costs
❌ NEVER copy text verbatim from sources
❌ NEVER use generic AI phrases ("dive into", "unlock", "explore")
❌ NEVER create walls of text without structure

If regulations are relevant, ONLY say: "Check local regulations for current rules" with a link to official sources.

ALWAYS INCLUDE:
✓ Minimum 1500 words of original, specific content
✓ EXACTLY 5-8 FAQs with 2-4 sentence answers
✓ "Tackle app" CTA with value props (log catches, track patterns, discover spots)
✓ Use ALL provided internal links naturally
✓ Focus on techniques, gear, and strategies (NOT regulations)

Write in a conversational, helpful tone with specific actionable advice.`,
  });

  // Parse generated content
  let body = typeof generated === 'string' ? generated : generated.body || '';

  // Add real image URLs to replace placeholders
  body = addImagesToPost(body, brief.speciesFocus, brief.locationFocus);
  logger.info('Added image URLs to post');

  // Validate retention structure
  const validation = validateRetentionStructure(body);
  if (!validation.valid) {
    logger.warn('Post failed retention structure validation:', validation.errors);
    // Log errors but continue - quality gate will catch if critical
  }

  const faqs = generated.faqs || extractFaqsFromMarkdown(body);
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
  // NOTE: Feature disabled - loadSiteIndex function not implemented
  // To enable: implement loadSiteIndex in internalLinks.ts
  const alternativeRecommendations: any[] = [];

  /* DISABLED - Missing loadSiteIndex implementation
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
  */
  
  // Generate structured CTAs (required for blog posts)
  const ctas: CTA[] = [
    {
      position: 'top',
      type: 'app_download',
      location: extractLocationFromBrief(brief),
    },
    {
      position: 'end',
      type: 'app_download',
      location: extractLocationFromBrief(brief),
    },
  ];

  // Build document
  const doc: BlogPostDoc = {
    id: crypto.randomUUID(),
    pageType: 'blog',
    slug: brief.slug,
    title: brief.title,
    description: generateDescription(brief, body),
    body, // Body should NOT contain CTA text - CTAs are structured
    headings,
    primaryKeyword: brief.primaryKeyword,
    secondaryKeywords: brief.secondaryKeywords,
    categorySlug: extractCategoryFromSlug(brief.slug, brief.title, brief.primaryKeyword),
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
    ctas, // Structured CTAs - validated by quality gate
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

  const minWords = Math.max(brief.minWordCount, 1000);

  return `Write an SEO-optimized blog post with the following requirements:

TITLE: ${brief.title}
PRIMARY KEYWORD: ${brief.primaryKeyword}
SECONDARY KEYWORDS: ${brief.secondaryKeywords.join(', ')}

CRITICAL REQUIREMENTS (MUST INCLUDE):
1. Write original content (MINIMUM ${minWords} words - this is non-negotiable)
2. Include EXACTLY 5-8 FAQs at the end (questions anglers actually ask)
3. **REQUIRED**: Include "Tackle app" CTA with value proposition
   - Must mention "Tackle app" by name
   - Must include value props like: "log your catches", "track patterns", "discover hot spots", "catch more fish"
   - Example: "Ready to catch more fish? Download the Tackle app to log your catches, track patterns, and discover hot spots near you."
4. Use ALL ${internalLinks.split('\n').length} internal links provided below naturally in the content
5. Never copy text verbatim from sources - always paraphrase and add original insights

CONTENT REQUIREMENTS:
- Use conversational, helpful tone
- Include all required sections from outline below
- Provide specific, actionable advice (brands, sizes, techniques, locations)
- If mentioning regulations, include "See local regulations" link to official sources

OUTLINE (must include all sections):
${brief.outline.map((o) => `- ${o.title}: ${o.description}`).join('\n')}

KEY FACTS TO INCLUDE (cite these naturally, don't copy verbatim):
${keyFacts}

INTERNAL LINKS TO INCLUDE (USE ALL OF THESE - link naturally in relevant sections):
${internalLinks}

SOURCES CONSULTED (cite at end, don't copy):
${brief.sources.map((s) => `- ${s.label}: ${s.url}`).join('\n')}

DISCLAIMERS TO INCLUDE:
${brief.disclaimers.join('\n')}

OUTPUT FORMAT:
- Markdown format
- Use H2 for main sections (##), H3 for subsections (###)
- Include internal links naturally in content (use ALL provided links)
- End with FAQs section with 5-8 questions/answers
- Include Tackle app CTA (mention "Tackle app" with value props)
- If relevant, include "See local regulations" link to official source
- End with "Sources" section listing references

VALIDATION CHECKLIST (your content MUST pass):
✓ ${minWords}+ words
✓ 5-8 FAQs with helpful answers
✓ ${internalLinks.split('\n').length} internal links used
✓ "Tackle app" mentioned with value proposition
✓ Original content (not copied from sources)

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
 * Extract FAQs from markdown body
 * Looks for Q: or ** patterns followed by A: or answers
 */
function extractFaqsFromMarkdown(body: string): BlogPostDoc['faqs'] {
  const faqs: BlogPostDoc['faqs'] = [];
  const lines = body.split('\n');

  let currentQuestion: string | null = null;
  let currentAnswer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Match patterns like:
    // **Q: Question?** or **Question?** or Q: Question?
    const questionMatch = line.match(/^(?:\*\*)?(?:Q:|Question:)?\s*(.+\?)\*?\*?$/i);

    if (questionMatch) {
      // Save previous FAQ if exists
      if (currentQuestion && currentAnswer.length > 0) {
        faqs.push({
          question: currentQuestion,
          answer: currentAnswer.join(' ').trim(),
        });
      }

      // Start new question
      currentQuestion = questionMatch[1].trim().replace(/^\*\*|\*\*$/g, '');
      currentAnswer = [];
      continue;
    }

    // Match answer patterns like: A: Answer or just regular text after question
    const answerMatch = line.match(/^(?:A:|Answer:)?\s*(.+)$/i);

    if (currentQuestion && answerMatch && line.length > 0 && !line.startsWith('#')) {
      currentAnswer.push(answerMatch[1].trim());
    }

    // Empty line or new section ends current answer
    if ((line === '' || line.startsWith('##')) && currentQuestion && currentAnswer.length > 0) {
      faqs.push({
        question: currentQuestion,
        answer: currentAnswer.join(' ').trim(),
      });
      currentQuestion = null;
      currentAnswer = [];
    }
  }

  // Save last FAQ if exists
  if (currentQuestion && currentAnswer.length > 0) {
    faqs.push({
      question: currentQuestion,
      answer: currentAnswer.join(' ').trim(),
    });
  }

  return faqs;
}

/**
 * Generate description from brief and body
 */
function generateDescription(brief: ContentBrief, body: string): string {
  // Try to extract a compelling description from the body
  // Look for the "Quick Answer" section or first meaningful paragraph
  const lines = body.split('\n');
  
  // Find "Quick Answer" section (usually has bullet points with actionable info)
  const quickAnswerIndex = lines.findIndex(line => 
    line.toLowerCase().includes('quick answer') || 
    line.toLowerCase().includes('top 3') ||
    line.toLowerCase().includes('here\'s what')
  );
  
  if (quickAnswerIndex !== -1) {
    // Extract next few lines after "Quick Answer" heading
    const quickAnswerContent = lines.slice(quickAnswerIndex + 1, quickAnswerIndex + 4)
      .join(' ')
      .replace(/\*\*/g, '')
      .replace(/^[-*•]\s*/, '')
      .trim();
    
    if (quickAnswerContent.length >= 100 && quickAnswerContent.length <= 160) {
      return quickAnswerContent;
    }
  }
  
  // Try first paragraph after removing markdown
  const cleanBody = body.replace(/```markdown\n?/g, '').replace(/```\n?/g, '');
  const paragraphs = cleanBody.split('\n\n').filter(p => p.trim().length > 0);
  
  for (const para of paragraphs) {
    const cleaned = para
      .replace(/^#+\s*/, '')
      .replace(/\*\*/g, '')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove markdown links
      .trim();
    
    // Skip if it's just a heading or too short
    if (cleaned.length >= 120 && cleaned.length <= 160 && !cleaned.startsWith('##')) {
      return cleaned;
    }
    
    // If paragraph is longer, truncate intelligently
    if (cleaned.length > 160) {
      const truncated = cleaned.substring(0, 157).trim();
      const lastSpace = truncated.lastIndexOf(' ');
      if (lastSpace > 100) {
        return truncated.substring(0, lastSpace) + '...';
      }
      return truncated + '...';
    }
  }
  
  // Fallback: Create a compelling description from title and primary keyword
  // Format: "Learn [primary keyword] with expert tips on [key benefit]. [Actionable promise]."
  const location = brief.locationFocus ? ` in ${brief.locationFocus}` : '';
  const species = brief.speciesFocus ? ` for ${brief.speciesFocus}` : '';
  
  const fallback = `Learn ${brief.primaryKeyword}${location}${species} with expert tips, proven techniques, and actionable advice. Discover the best strategies to improve your fishing success.`;
  
  return fallback.substring(0, 160);
}

/**
 * Extract category from slug and content type
 * Improved categorization that detects content types (how-to, comparison, review, etc.)
 */
function extractCategoryFromSlug(slug: string, title?: string, primaryKeyword?: string): string {
  const text = `${slug} ${title || ''} ${primaryKeyword || ''}`.toLowerCase();
  
  // Content Type Detection (more specific first)
  
  // How-to guides
  if (text.includes('how-to') || text.includes('how to') || text.includes('step-by-step') || 
      text.includes('guide') && (text.includes('beginner') || text.includes('complete'))) {
    return 'fishing-tips'; // How-tos are tips/guides
  }
  
  // Comparisons
  if (text.includes('vs') || text.includes('versus') || text.includes('compare') || 
      text.includes('difference between') || text.includes('best') && text.includes('or')) {
    return 'gear-reviews'; // Comparisons are typically gear-focused
  }
  
  // Gear Reviews
  if (text.includes('best') && (text.includes('lure') || text.includes('rod') || 
      text.includes('reel') || text.includes('tackle') || text.includes('gear'))) {
    return 'gear-reviews';
  }
  
  // Reviews (specific products)
  if (text.includes('review') || text.includes('tested') || text.includes('recommendation')) {
    return 'gear-reviews';
  }
  
  // Conditions/Weather/Tides
  if (text.includes('condition') || text.includes('weather') || text.includes('tide') || 
      text.includes('time') && (text.includes('best') || text.includes('when'))) {
    return 'conditions';
  }
  
  // Techniques/Tactics
  if (text.includes('technique') || text.includes('tactic') || text.includes('method') || 
      text.includes('strategy')) {
    return 'fishing-tips';
  }
  
  // Species-specific (could be its own category)
  if (text.includes('snook') || text.includes('bass') || text.includes('redfish') || 
      text.includes('trout') || text.includes('tarpon')) {
    // If it's about catching a species, it's tips; if it's about the species itself, could be species-spotlight
    if (text.includes('catch') || text.includes('target') || text.includes('lure')) {
      return 'fishing-tips';
    }
  }
  
  // Location-specific
  if (text.includes('florida') || text.includes('texas') || text.includes('location') || 
      text.includes('where to')) {
    return 'fishing-tips'; // Location guides are tips
  }
  
  // Default fallback
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



