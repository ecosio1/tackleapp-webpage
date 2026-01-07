/**
 * How-To Guide Generator
 */

import { HowToDoc, ContentBrief } from '../types';
import { generateWithLLM } from '../llm';
import { DEFAULT_AUTHOR_NAME, DEFAULT_AUTHOR_URL } from '../config';
import { logger } from '../logger';
import crypto from 'crypto';

/**
 * Generate how-to document
 */
export async function generateHowTo(brief: ContentBrief): Promise<HowToDoc> {
  logger.info(`Generating how-to guide: ${brief.slug}`);
  
  const prompt = buildPrompt(brief);
  
  // Generate content using LLM
  const generated = await generateWithLLM({
    prompt,
    systemPrompt: `You are a fishing content writer. Generate original, SEO-optimized how-to guides.
Never copy text verbatim from sources. Write step-by-step instructions clearly.
Include all required sections, FAQs, and internal links naturally in the content.`,
  });
  
  // Parse generated content
  const body = typeof generated === 'string' ? generated : generated.body || '';
  const faqs = generated.faqs || [];
  const headings = extractHeadings(body);
  
  // Determine category from slug
  const category = determineCategory(brief.slug);
  
  // Build document
  const doc: HowToDoc = {
    id: crypto.randomUUID(),
    pageType: 'how-to',
    slug: brief.slug,
    title: brief.title,
    description: generateDescription(brief, body),
    body,
    headings,
    primaryKeyword: brief.primaryKeyword,
    secondaryKeywords: brief.secondaryKeywords,
    category,
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
  };
  
  return doc;
}

/**
 * Build LLM prompt for how-to guide
 */
function buildPrompt(brief: ContentBrief): string {
  const internalLinks = [
    ...(brief.internalLinksToInclude.speciesSlugs || []).map((s) => `- Species: /species/${s}`),
    ...(brief.internalLinksToInclude.locationSlugs || []).map((l) => `- Location: /locations/${l}`),
    ...(brief.internalLinksToInclude.howToSlugs || []).map((h) => `- Related guide: /how-to/${h}`),
  ].join('\n');
  
  const keyFacts = brief.keyFacts
    .slice(0, 15)
    .map((f) => `- ${f.claim}`)
    .join('\n');
  
  return `Write an SEO-optimized how-to guide with the following requirements:

TITLE: ${brief.title}
PRIMARY KEYWORD: ${brief.primaryKeyword}
SECONDARY KEYWORDS: ${brief.secondaryKeywords.join(', ')}

REQUIREMENTS:
1. Write original, step-by-step guide (minimum ${brief.minWordCount} words)
2. Use beginner-friendly language
3. Include numbered steps if applicable
4. Include "Tips & Tricks" section
5. Include "Common Mistakes" section
6. Include "Best Conditions" section
7. Never copy text verbatim from sources
8. Include 5-8 FAQs at the end
9. Include a "What to do next" CTA pointing to /download
10. Include a "See local regulations" outbound link block (no legal advice)

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
- Use H2 for main sections
- Include numbered steps if applicable
- Include internal links naturally
- End with FAQs section (5-8 questions)
- End with "What to do next" CTA linking to /download
- End with "See local regulations" link block
- End with "Sources consulted" list

Write the complete how-to guide now:`;
}

/**
 * Determine category from slug
 */
function determineCategory(slug: string): HowToDoc['category'] {
  if (slug.includes('beginner') || slug.includes('basic') || slug.includes('knot')) {
    return 'beginner';
  }
  if (slug.includes('inshore') || slug.includes('flat') || slug.includes('mangrove')) {
    return 'inshore';
  }
  if (slug.includes('pier') || slug.includes('bank') || slug.includes('shore')) {
    return 'pier-bank';
  }
  if (slug.includes('kayak')) {
    return 'kayak';
  }
  return 'advanced';
}

/**
 * Extract headings from markdown body
 */
function extractHeadings(body: string): HowToDoc['headings'] {
  const headings: HowToDoc['headings'] = [];
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
  
  return `${brief.title}. Step-by-step guide with tips, techniques, and best practices for ${brief.primaryKeyword}.`.substring(0, 160);
}

/**
 * Generate default FAQs
 */
function generateDefaultFaqs(brief: ContentBrief): HowToDoc['faqs'] {
  return [
    {
      question: `What is ${brief.primaryKeyword}?`,
      answer: `This guide explains ${brief.primaryKeyword} in detail with step-by-step instructions.`,
    },
    {
      question: `How long does it take to learn ${brief.primaryKeyword}?`,
      answer: `The time to learn ${brief.primaryKeyword} varies. Follow the steps in this guide to get started.`,
    },
    {
      question: `What equipment do I need for ${brief.primaryKeyword}?`,
      answer: `Equipment requirements are covered in the guide. Check the "Step-by-Step Guide" section.`,
    },
    {
      question: `What are common mistakes when doing ${brief.primaryKeyword}?`,
      answer: `Common mistakes are covered in the "Common Mistakes" section of this guide.`,
    },
    {
      question: `When is the best time to use this technique?`,
      answer: `The "Best Conditions" section covers when and where to use this technique.`,
    },
  ];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}


