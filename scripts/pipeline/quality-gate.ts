/**
 * Quality Gate - Fast, automated pre-publish checks
 * Blocks publishing if content fails critical quality checks
 */

import { GeneratedDoc } from './types';
import { logger } from './logger';

/**
 * Quality gate result
 */
export interface QualityGateResult {
  passed: boolean;
  blocked: boolean; // If true, publishing should be blocked
  errors: string[];
  warnings: string[];
}

/**
 * Run quality gate checks before publishing
 * Fast, automated checks that block bad posts
 */
export function runQualityGate(doc: GeneratedDoc): QualityGateResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const bodyLower = doc.body.toLowerCase();
  const bodyText = doc.body;

  // ============================================
  // 1. MISSING CTA BLOCKS CHECK (REQUIRED FOR BLOG POSTS)
  // ============================================
  logger.info('Quality Gate: Checking for CTA blocks...');

  if (doc.pageType === 'blog') {
    // CTA patterns to look for
    const ctaPatterns = [
      /download tackle|tackle app|get tackle|install tackle/i,
      /\[download tackle\]|\[get tackle\]|\[install tackle\]/i,
      /\/download/i,
      /what to do next.*download/i,
      /ready to.*download/i,
      /get.*tackle.*iphone/i,
    ];

    // Split content into halves for placement checking
    const wordCount = bodyText.split(/\s+/).length;
    const midPoint = Math.floor(wordCount / 2);
    const words = bodyText.split(/\s+/);
    const topHalf = words.slice(0, midPoint).join(' ');
    const bottomHalf = words.slice(midPoint).join(' ');

    // Check for CTA in top half
    let hasTopHalfCTA = false;
    for (const pattern of ctaPatterns) {
      if (pattern.test(topHalf)) {
        hasTopHalfCTA = true;
        break;
      }
    }

    // Check for CTA in bottom half (last 40% of content)
    const bottomStart = Math.floor(wordCount * 0.6);
    const bottomSection = words.slice(bottomStart).join(' ');
    let hasBottomHalfCTA = false;
    for (const pattern of ctaPatterns) {
      if (pattern.test(bottomSection)) {
        hasBottomHalfCTA = true;
        break;
      }
    }

    // Check for value proposition in CTA
    const hasValueProp = 
      /real-time|live conditions|tide|wind|weather|ai fish|fish id|log catch|track|personalized/i.test(bodyText);

    // BLOCKING: Must have CTA in top half
    if (!hasTopHalfCTA) {
      errors.push(
        'BLOCKED: Missing required App CTA in top half of content. ' +
        'Blog posts must include at least one call-to-action for the Tackle app in the first half of the content.'
      );
    }

    // BLOCKING: Must have CTA near the end
    if (!hasBottomHalfCTA) {
      errors.push(
        'BLOCKED: Missing required App CTA near the end. ' +
        'Blog posts must include at least one call-to-action for the Tackle app in the last 40% of the content.'
      );
    }

    // WARNING: Missing value proposition
    if (hasTopHalfCTA && hasBottomHalfCTA && !hasValueProp) {
      warnings.push('CTA found but missing value proposition (real-time conditions, AI fish ID, etc.)');
    }
  }

  // ============================================
  // 2. REGULATIONS BLOCK CHECK (REQUIRED FOR BLOG POSTS)
  // ============================================
  logger.info('Quality Gate: Checking for regulations block...');

  if (doc.pageType === 'blog') {
    // Check for neutral "See local regulations" text (required)
    const hasRegulationsBlock = 
      /see local regulations|check.*local regulations|consult.*local regulations|see.*regulations/i.test(bodyText) ||
      /regulations.*change|always verify.*regulations|check.*regulations.*official/i.test(bodyText);

    // BLOCKING: Must have neutral regulations reminder
    if (!hasRegulationsBlock) {
      errors.push(
        'BLOCKED: Missing required "See local regulations" block. ' +
        'Blog posts must include a neutral reminder to check local regulations (no specific limits, seasons, or legal claims).'
      );
    }
  }

  // ============================================
  // 3. REGULATIONS SPECIFICS CHECK (CRITICAL - BLOCK IF FOUND)
  // Uses robust blocklist with allowlist for safe neutral reminders
  // ============================================
  logger.info('Quality Gate: Checking for regulations specifics...');

  // ALLOWLIST: Safe neutral phrases that should NOT trigger blocklist
  // These are exempt from regulations detection
  const safeAllowlistPatterns = [
    /see local regulations/i,
    /check local regulations/i,
    /consult local regulations/i,
    /see.*local.*rules/i,
    /check.*local.*rules/i,
    /verify.*local.*regulations/i,
    /always verify.*regulations/i,
    /check.*regulations.*official/i,
    /regulations.*change/i,
    /regulations.*vary/i,
    /local.*regulations.*apply/i,
    /regulations.*differ/i,
    /check.*official.*regulations/i,
    /consult.*official.*sources/i,
    /refer.*to.*local.*regulations/i,
  ];

  // Check if text contains safe allowlist phrases
  const hasSafePhrase = safeAllowlistPatterns.some(pattern => pattern.test(bodyText));

  // BAG LIMIT PATTERNS - "X fish per day" variations
  const bagLimitPatterns = [
    // Direct patterns: "5 fish per day", "10 fish per person"
    /\d+\s+fish\s+per\s+(day|person|angler|trip)/i,
    /\d+\s+fish\s+(per|each)\s+(day|person|angler|trip)/i,
    // Limit patterns: "bag limit of 5", "daily limit 10"
    /bag limit.*\d+/i,
    /daily limit.*\d+/i,
    /harvest limit.*\d+/i,
    /possession limit.*\d+/i,
    /creel limit.*\d+/i,
    /catch limit.*\d+/i,
    // Action patterns: "keep 5 fish", "take up to 10"
    /keep.*\d+\s+fish/i,
    /take.*\d+\s+fish/i,
    /retain.*\d+\s+fish/i,
    /maximum.*\d+\s+fish/i,
    /limit.*\d+\s+fish/i,
    /up to.*\d+\s+fish/i,
    // Possession patterns
    /possess.*\d+\s+fish/i,
    /possession.*\d+/i,
    // Combined patterns
    /\d+\s+fish.*limit/i,
    /limit.*\d+.*fish/i,
  ];

  // SIZE LIMIT PATTERNS - "minimum X inches" variations
  const sizeLimitPatterns = [
    // Minimum patterns: "minimum 14 inches", "at least 12 inches"
    /minimum.*\d+\s*inch/i,
    /at least.*\d+\s*inch/i,
    /no less than.*\d+\s*inch/i,
    /must be.*\d+\s*inch/i,
    /must measure.*\d+\s*inch/i,
    // Maximum patterns: "maximum 20 inches", "no more than 18 inches"
    /maximum.*\d+\s*inch/i,
    /no more than.*\d+\s*inch/i,
    /must not exceed.*\d+\s*inch/i,
    // Slot patterns: "14-20 inch slot", "between 12 and 18 inches"
    /slot limit.*\d+/i,
    /slot.*\d+.*\d+/i,
    /size limit.*\d+/i,
    /\d+\s*-\s*\d+\s*inch/i,
    /\d+\s*to\s*\d+\s*inch/i,
    /between.*\d+.*and.*\d+.*inch/i,
    /from.*\d+.*to.*\d+.*inch/i,
    // Measurement patterns
    /\d+\s*inch.*minimum/i,
    /\d+\s*inch.*maximum/i,
    /\d+\s*inch.*limit/i,
    // Length patterns (alternative to inches)
    /minimum.*\d+\s*(cm|centimeter)/i,
    /at least.*\d+\s*(cm|centimeter)/i,
  ];

  // POSSESSION LIMIT PATTERNS - "possession limit" variations
  const possessionLimitPatterns = [
    /possession limit.*\d+/i,
    /possess.*\d+\s+fish/i,
    /possession.*\d+/i,
    /total possession.*\d+/i,
    /combined possession.*\d+/i,
    /aggregate possession.*\d+/i,
  ];

  // SEASON/DATE PATTERNS - "closed season" variations
  const seasonPatterns = [
    // Closed season patterns
    /closed.*season/i,
    /closed.*(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    /closed.*from.*to/i,
    /closed.*between/i,
    /no fishing.*(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    /fishing.*closed.*(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    // Open season patterns
    /open.*season/i,
    /open.*(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    /season runs.*(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    /fishing.*open.*(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    // Date range patterns
    /season.*(january|february|march|april|may|june|july|august|september|october|november|december).*(january|february|march|april|may|june|july|august|september|october|november|december)/i,
    /closed.*\d+\/\d+.*\d+\/\d+/i, // Closed 1/1 to 3/31
    /open.*\d+\/\d+.*\d+\/\d+/i, // Open 4/1 to 12/31
  ];

  // LEGAL CLAIM PATTERNS
  const legalClaimPatterns = [
    /illegal to/i,
    /illegal.*fish/i,
    /against the law/i,
    /violation.*fine/i,
    /subject to fine/i,
    /fined.*\d+/i,
    /penalty.*\d+/i,
    /must have.*license/i,
    /required.*permit/i,
    /required.*license/i,
    /legal requirement/i,
    /mandatory.*license/i,
    /mandatory.*permit/i,
    /law requires/i,
    /legally required/i,
    /prohibited by law/i,
  ];

  /**
   * Check if a match is in a safe context (near allowlist phrase)
   * This prevents false positives when safe phrases are nearby
   */
  function isInSafeContext(matchIndex: number, matchLength: number, text: string): boolean {
    if (hasSafePhrase) {
      // If safe phrase exists anywhere, check if match is in same sentence/paragraph
      const contextStart = Math.max(0, matchIndex - 200); // 200 chars before
      const contextEnd = Math.min(text.length, matchIndex + matchLength + 200); // 200 chars after
      const context = text.substring(contextStart, contextEnd);
      
      // If context contains safe phrase, it's likely a false positive
      return safeAllowlistPatterns.some(pattern => pattern.test(context));
    }
    return false;
  }

  /**
   * Check patterns with context awareness
   */
  function checkPatternsWithContext(patterns: RegExp[], errorMessage: string): void {
    for (const pattern of patterns) {
      const matches = [...bodyText.matchAll(new RegExp(pattern.source, pattern.flags + 'g'))];
      
      for (const match of matches) {
        if (match.index !== undefined) {
          // Check if match is in safe context
          if (!isInSafeContext(match.index, match[0].length, bodyText)) {
            errors.push(errorMessage);
            return; // Only report once per category
          }
        }
      }
    }
  }

  // Check for bag limits (with allowlist protection)
  checkPatternsWithContext(
    bagLimitPatterns,
    'BLOCKED: Content contains specific bag limit information (e.g., "X fish per day"). Remove all bag limit numbers. Use "See local regulations" instead.'
  );

  // Check for size limits (with allowlist protection)
  checkPatternsWithContext(
    sizeLimitPatterns,
    'BLOCKED: Content contains specific size limit information (e.g., "minimum X inches"). Remove all size measurements. Use "See local regulations" instead.'
  );

  // Check for possession limits (with allowlist protection)
  checkPatternsWithContext(
    possessionLimitPatterns,
    'BLOCKED: Content contains specific possession limit information. Remove all possession limit numbers. Use "See local regulations" instead.'
  );

  // Check for closed seasons (with allowlist protection)
  checkPatternsWithContext(
    seasonPatterns,
    'BLOCKED: Content contains specific season/date information (e.g., "closed season", specific months). Remove all specific dates. Use "See local regulations" instead.'
  );

  // Check for legal claims (with allowlist protection)
  checkPatternsWithContext(
    legalClaimPatterns,
    'BLOCKED: Content makes legal claims (e.g., "illegal", "against the law", "required license"). Remove all legal advice and requirements. Use "See local regulations" instead.'
  );

  // ============================================
  // 4. PRACTICAL STEPS CHECK (REQUIRED FOR BLOG POSTS)
  // ============================================
  logger.info('Quality Gate: Checking for practical steps...');

  if (doc.pageType === 'blog') {
    // Check for numbered steps
    const hasNumberedSteps = 
      /step \d+|step-by-step|^\d+\./m.test(bodyText) ||
      (bodyText.match(/^\d+\./gm) || []).length >= 3;

    // Check for instruction patterns
    const hasInstructions = 
      /how to|instructions|guide|tutorial|process|method|technique|follow these|do this/i.test(bodyText);

    // Check for actionable content (not just fluff)
    const hasActionableContent = 
      /first.*second.*third|begin by|start with|next.*then|finally|in conclusion.*action/i.test(bodyText);

    // Check for substantial instructional paragraphs
    const paragraphs = bodyText.split(/\n\n/).filter(p => p.trim().length > 0);
    const instructionalParagraphs = paragraphs.filter(p => 
      /step|instruction|guide|how|method|technique|process|procedure|action|do|make|create|build|tie|attach|connect/i.test(p)
    );

    // BLOCKING: Must have practical steps or instructions
    if (!hasNumberedSteps && !hasInstructions && !hasActionableContent) {
      errors.push(
        'BLOCKED: Content lacks practical steps or instructions. ' +
        'Blog posts must include actionable steps, numbered instructions, or clear how-to guidance (not just fluff).'
      );
    } else if (!hasNumberedSteps && instructionalParagraphs.length < 3) {
      errors.push(
        'BLOCKED: Content lacks sufficient practical steps. ' +
        'Blog posts must include at least 3 instructional paragraphs with actionable steps or numbered instructions.'
      );
    }
  }

  // ============================================
  // 5. THIN CONTENT CHECK
  // ============================================
  logger.info('Quality Gate: Checking for thin content...');

  const wordCount = bodyText.split(/\s+/).length;
  const minWords = doc.pageType === 'blog' ? 900 : 1000;

  if (wordCount < minWords) {
    errors.push(`BLOCKED: Content too short (${wordCount} words, minimum ${minWords}). Thin content detected.`);
  }

  // Additional thin content check for how-to (blog already checked above)
  if (doc.pageType === 'how-to') {
    const hasSteps = 
      /step \d+|step-by-step|first.*second.*third|1\.|2\.|3\./i.test(bodyText) ||
      (bodyText.match(/^\d+\./gm) || []).length >= 3;

    const hasInstructions = 
      /how to|instructions|guide|tutorial|process|method|technique/i.test(bodyText);

    if (!hasSteps && !hasInstructions) {
      errors.push('BLOCKED: Content lacks actionable steps or instructions. Thin content detected.');
    } else if (!hasSteps && wordCount < 1200) {
      warnings.push('Content mentions instructions but lacks numbered steps. Consider adding step-by-step format.');
    }
  }

  // Check for substantial paragraphs (not just fluff)
  const paragraphs = bodyText.split(/\n\n/).filter(p => p.trim().length > 0);
  const substantialParagraphs = paragraphs.filter(p => p.split(/\s+/).length >= 50);
  
  if (substantialParagraphs.length < 3) {
    warnings.push(`Only ${substantialParagraphs.length} substantial paragraphs found. Content may be thin.`);
  }

  // Check heading-to-content ratio (too many headings, not enough content)
  const headingCount = doc.headings.length;
  const wordsPerHeading = wordCount / Math.max(headingCount, 1);
  if (wordsPerHeading < 100 && headingCount > 5) {
    warnings.push(`Low content-to-heading ratio (${Math.round(wordsPerHeading)} words/heading). Content may be thin.`);
  }

  // ============================================
  // 6. KEYWORD STUFFING CHECK
  // ============================================
  logger.info('Quality Gate: Checking for keyword stuffing...');

  // Calculate keyword density
  const primaryKeyword = doc.primaryKeyword.toLowerCase();
  const primaryKeywordCount = (bodyLower.match(new RegExp(primaryKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  const primaryKeywordDensity = (primaryKeywordCount / wordCount) * 100;

  // Check for excessive primary keyword usage
  if (primaryKeywordDensity > 3) {
    errors.push(
      `BLOCKED: Keyword stuffing detected. Primary keyword "${primaryKeyword}" appears ${primaryKeywordCount} times ` +
      `(${primaryKeywordDensity.toFixed(1)}% density, maximum 3%).`
    );
  } else if (primaryKeywordDensity > 2) {
    warnings.push(
      `High keyword density: ${primaryKeywordDensity.toFixed(1)}% for "${primaryKeyword}". Consider reducing usage.`
    );
  }

  // Check for repetitive keyword phrases
  const keywordPhrases = doc.secondaryKeywords.slice(0, 5);
  for (const phrase of keywordPhrases) {
    const phraseLower = phrase.toLowerCase();
    const phraseCount = (bodyLower.match(new RegExp(phraseLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
    const phraseDensity = (phraseCount / wordCount) * 100;
    
    if (phraseDensity > 2) {
      warnings.push(`High density for secondary keyword "${phrase}": ${phraseDensity.toFixed(1)}%`);
    }
  }

  // Check for unnatural keyword repetition (same keyword in consecutive sentences)
  const sentences = bodyText.split(/[.!?]+/).filter(s => s.trim().length > 20);
  let consecutiveKeywordCount = 0;
  for (let i = 0; i < sentences.length - 1; i++) {
    const current = sentences[i].toLowerCase();
    const next = sentences[i + 1].toLowerCase();
    if (current.includes(primaryKeyword) && next.includes(primaryKeyword)) {
      consecutiveKeywordCount++;
    }
  }
  if (consecutiveKeywordCount > 3) {
    warnings.push(`Primary keyword appears in ${consecutiveKeywordCount} consecutive sentences. May appear unnatural.`);
  }

  // Check for exact keyword repetition patterns
  const exactRepetitions = bodyText.match(new RegExp(`\\b${primaryKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'));
  if (exactRepetitions && exactRepetitions.length > 10) {
    warnings.push(`Primary keyword "${primaryKeyword}" appears ${exactRepetitions.length} times. Consider using variations.`);
  }

  // ============================================
  // 7. ADDITIONAL QUALITY CHECKS
  // ============================================

  // Check for excessive use of same words (low lexical diversity)
  const words = bodyLower.split(/\s+/).filter(w => w.length > 3);
  const uniqueWords = new Set(words);
  const lexicalDiversity = uniqueWords.size / words.length;
  
  if (lexicalDiversity < 0.25) {
    errors.push(
      `BLOCKED: Low lexical diversity (${(lexicalDiversity * 100).toFixed(1)}%, minimum 25%). Content appears repetitive.`
    );
  }

  // Check for AI patterns (repetitive sentence structure)
  if (sentences.length >= 10) {
    const sentenceLengths = sentences.map(s => s.split(/\s+/).length);
    const avgLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    const variance = sentenceLengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / sentenceLengths.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev < (avgLength * 0.15)) {
      errors.push('BLOCKED: Repetitive sentence structure detected (AI pattern). Content lacks natural variation.');
    }
  }

  // Check for placeholder text
  const placeholderPatterns = [
    /lorem ipsum/i,
    /placeholder/i,
    /\[insert.*here\]/i,
    /todo:/i,
    /fixme:/i,
    /xxx/i,
  ];
  
  for (const pattern of placeholderPatterns) {
    if (pattern.test(bodyText)) {
      errors.push('BLOCKED: Content contains placeholder text. Remove all placeholders before publishing.');
      break;
    }
  }

  // Check for broken markdown/formatting
  const brokenMarkdown = 
    (bodyText.match(/\[.*?\]\(\)/g) || []).length > 0 || // Empty links
    (bodyText.match(/\[.*?\]\([^)]*$/gm) || []).length > 0; // Unclosed links

  if (brokenMarkdown) {
    warnings.push('Broken markdown links detected. Review content formatting.');
  }

  // ============================================
  // RESULT
  // ============================================
  const blocked = errors.length > 0;
  const passed = !blocked;

  if (blocked) {
    logger.error(`Quality gate FAILED for ${doc.pageType}:${doc.slug}`, errors);
  } else if (warnings.length > 0) {
    logger.warn(`Quality gate passed with warnings for ${doc.pageType}:${doc.slug}`, warnings);
  } else {
    logger.info(`Quality gate PASSED for ${doc.pageType}:${doc.slug}`);
  }

  return {
    passed,
    blocked,
    errors,
    warnings,
  };
}
