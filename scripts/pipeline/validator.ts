/**
 * Validator - Validates generated content against quality gates
 */

import { GeneratedDoc } from './types';
import { MIN_WORD_COUNTS, QUALITY_THRESHOLDS, FORBIDDEN_PHRASES } from './config';
import { logger } from './logger';

export interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate document against quality gates
 */
export function validateDoc(doc: GeneratedDoc): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 1. Word count check
  const wordCount = doc.body.split(/\s+/).length;
  const minWords = MIN_WORD_COUNTS[doc.pageType] || 1000;
  if (wordCount < minWords) {
    errors.push(`Word count ${wordCount} is below minimum ${minWords}`);
  }
  
  // 2. H2 sections check
  const h2Count = doc.headings.filter((h) => h.level === 2).length;
  if (h2Count < QUALITY_THRESHOLDS.minH2Sections) {
    errors.push(`Only ${h2Count} H2 sections found, minimum is ${QUALITY_THRESHOLDS.minH2Sections}`);
  }
  
  // 3. FAQ count check
  if (doc.faqs.length < QUALITY_THRESHOLDS.minFaqs) {
    errors.push(`Only ${doc.faqs.length} FAQs found, minimum is ${QUALITY_THRESHOLDS.minFaqs}`);
  }
  if (doc.faqs.length > QUALITY_THRESHOLDS.maxFaqs) {
    warnings.push(`More than ${QUALITY_THRESHOLDS.maxFaqs} FAQs found (${doc.faqs.length})`);
  }
  
  // 4. Internal links check
  const internalLinkCount = countInternalLinks(doc.body);
  const minLinks = QUALITY_THRESHOLDS.minInternalLinks[doc.pageType] || 3;
  if (internalLinkCount < minLinks) {
    errors.push(`Only ${internalLinkCount} internal links found, minimum is ${minLinks}`);
  }
  
  // 5. Forbidden phrases check
  const bodyLower = doc.body.toLowerCase();
  for (const phrase of FORBIDDEN_PHRASES) {
    if (bodyLower.includes(phrase.toLowerCase())) {
      errors.push(`Content contains forbidden phrase: "${phrase}"`);
    }
  }
  
  // 6. Sources check for seasonal content
  const hasSeasonalContent = bodyLower.includes('season') ||
    bodyLower.includes('winter') ||
    bodyLower.includes('summer') ||
    bodyLower.includes('spring') ||
    bodyLower.includes('fall');
  
  if (hasSeasonalContent && doc.sources.length < QUALITY_THRESHOLDS.minSourcesForSeasonal) {
    errors.push(`Seasonal content requires at least ${QUALITY_THRESHOLDS.minSourcesForSeasonal} sources, found ${doc.sources.length}`);
  }
  
  // 7. Regulations link check (for location pages)
  if (doc.pageType === 'location') {
    if (!bodyLower.includes('see local regulations') && !bodyLower.includes('regulations')) {
      warnings.push('Location page may be missing "See local regulations" link');
    }
  }
  
  // 8. Download CTA check
  if (!bodyLower.includes('/download') && !bodyLower.includes('download')) {
    warnings.push('Content may be missing download CTA');
  }
  
  // 9. Required sections check (basic)
  const requiredSections = getRequiredSections(doc.pageType);
  for (const section of requiredSections) {
    if (!bodyLower.includes(section.toLowerCase())) {
      warnings.push(`Content may be missing required section: "${section}"`);
    }
  }
  
  // 10. Description length check
  if (doc.description.length < 100 || doc.description.length > 160) {
    warnings.push(`Meta description length is ${doc.description.length} (recommended: 100-160)`);
  }
  
  // 11. Title length check
  if (doc.title.length > 60) {
    warnings.push(`Title length is ${doc.title.length} (recommended: < 60)`);
  }
  
  // 12. Editorial guardrails check (basic checks inline, full guardrails in lib/editorial/guardrails.ts)
  // Note: Full AI pattern detection should be called from publisher before publishing
  // hasSeasonalContent already declared above

  // Basic guardrail checks (full implementation in lib/editorial/guardrails.ts)
  // Check sentence variety
  const sentences = doc.body.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length >= 10) {
    const lengths = sentences.map(s => s.split(/\s+/).length);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    if (stdDev < (avgLength * 0.2)) {
      errors.push('Repetitive sentence structure detected (AI pattern)');
    }
  }
  
  // Check lexical diversity
  const words = bodyLower.split(/\s+/).filter(w => w.length > 2);
  if (words.length >= 50) {
    const uniqueWords = new Set(words);
    const lexicalDiversity = uniqueWords.size / words.length;
    if (lexicalDiversity < 0.3) {
      errors.push(`Low lexical diversity: ${(lexicalDiversity * 100).toFixed(1)}% (minimum 30%)`);
    }
  }
  
  const passed = errors.length === 0;
  
  if (!passed) {
    logger.error(`Validation failed for ${doc.pageType}:${doc.slug}`, errors);
  } else if (warnings.length > 0) {
    logger.warn(`Validation passed with warnings for ${doc.pageType}:${doc.slug}`, warnings);
  } else {
    logger.info(`Validation passed for ${doc.pageType}:${doc.slug}`);
  }
  
  return { passed, errors, warnings };
}

/**
 * Count internal links in body
 */
function countInternalLinks(body: string): number {
  // Count markdown links to internal paths
  const markdownLinks = (body.match(/\[.*?\]\(\/(?:species|how-to|locations|blog)\/[^)]+\)/g) || []).length;
  // Count HTML links to internal paths
  const htmlLinks = (body.match(/<a[^>]+href=["']\/(?:species|how-to|locations|blog)\/[^"']+["']/g) || []).length;
  return markdownLinks + htmlLinks;
}

/**
 * Get required sections by page type
 */
function getRequiredSections(pageType: GeneratedDoc['pageType']): string[] {
  switch (pageType) {
    case 'species':
      return ['About', 'Habitat', 'Techniques'];
    case 'how-to':
      return ['Step-by-Step', 'Tips', 'Best Conditions'];
    case 'location':
      return ['Best Fishing Spots', 'Popular Species', 'Fishing Techniques'];
    case 'blog':
      return ['Introduction', 'Conclusion'];
    default:
      return [];
  }
}

