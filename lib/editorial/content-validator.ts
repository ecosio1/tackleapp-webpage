/**
 * Content Validation - Non-Negotiable Rules
 *
 * Every blog post must pass these validation rules before publication.
 * These rules ensure content is safe, evergreen, valuable, and aligned with app goals.
 */

import { BlogPostDoc } from '@/scripts/pipeline/types';

export interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100
}

export interface ValidationRule {
  name: string;
  description: string;
  level: 'critical' | 'error' | 'warning';
  validate: (post: BlogPostDoc) => boolean;
  message: string;
}

/**
 * Validate blog post against all content rules
 */
export function validateBlogPost(post: BlogPostDoc): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  let score = 100;

  // ==========================================================================
  // RULE 1: Informational Search Intent
  // ==========================================================================
  const hasInformationalIntent =
    /how to|best|guide|tips|techniques|when to|where to|what|complete/i.test(post.title);

  if (!hasInformationalIntent) {
    errors.push(
      'Title must target informational search intent (how to, best, guide, tips, etc.)'
    );
    score -= 20;
  }

  // ==========================================================================
  // RULE 2: Location or Species Specificity
  // ==========================================================================
  const commonSpecies =
    /snook|redfish|tarpon|bass|trout|grouper|mahi|wahoo|tuna|cobia|permit|bonefish|kingfish|mackerel|dolphin|sailfish|marlin/i;
  const locationPatterns =
    /florida|texas|california|louisiana|carolina|gulf|atlantic|pacific|keys|coast|bay|sound|river|lake/i;

  const hasSpecies = commonSpecies.test(post.body) || commonSpecies.test(post.title);
  const hasLocation =
    locationPatterns.test(post.body) || locationPatterns.test(post.title);

  if (!hasSpecies && !hasLocation) {
    errors.push(
      'Post must include species specificity (e.g., snook, redfish) OR location specificity (e.g., Florida, Texas Gulf)'
    );
    score -= 20;
  } else if (!hasSpecies || !hasLocation) {
    warnings.push(
      'Post has only one of species/location. Both is ideal for better SEO targeting.'
    );
    score -= 5;
  }

  // ==========================================================================
  // RULE 3: Practical, Actionable Fishing Advice
  // ==========================================================================
  const hasGearRecommendations = /top picks|recommended|best for|use|try/i.test(post.body);
  const hasTechniques =
    /technique|retrieve|presentation|method|cast|approach|strategy/i.test(post.body);
  const hasSpecifics = /\d+\s*inch|\d+\s*lb|dawn|dusk|tide|structure|depth/i.test(post.body);

  if (!hasGearRecommendations && !hasTechniques) {
    errors.push(
      'Post must include practical advice: gear recommendations, techniques, or specific tips'
    );
    score -= 15;
  }

  if (!hasSpecifics) {
    warnings.push(
      'Post should include specific details: lure sizes, line weights, times, depths, etc.'
    );
    score -= 5;
  }

  // ==========================================================================
  // RULE 4: App Conversion Block (REQUIRED)
  // ==========================================================================
  const hasAppMention = /tackle app|download tackle/i.test(post.body);
  const hasValueProp =
    /log your catches|track patterns|discover hot spots|ai fish id|catch more/i.test(
      post.body
    );

  if (!hasAppMention) {
    errors.push('REQUIRED: Post must include Tackle app CTA (call-to-action)');
    score -= 25;
  } else if (!hasValueProp) {
    warnings.push('App CTA should include value proposition (track catches, discover spots, etc.)');
    score -= 10;
  }

  // ==========================================================================
  // RULE 5: NO SPECIFIC REGULATIONS (CRITICAL)
  // ==========================================================================
  const hasBagLimit =
    /bag limit|daily limit|keep \d+|harvest limit|\d+\s+fish per|limit.*\d+\s+fish/i.test(
      post.body
    );
  const hasSizeLimit =
    /slot limit|size limit|minimum.*\d+\s*inch|maximum.*\d+\s*inch|\d+\s*-\s*\d+\s*inch|must be.*\d+\s*inch/i.test(
      post.body
    );
  const hasClosedSeason =
    /closed season|open season|no fishing.*january|no fishing.*june|closed.*december|season runs/i.test(
      post.body
    );
  const hasLegalClaim = /illegal to|must have.*license|violations.*fine|against the law/i.test(
    post.body
  );

  // CRITICAL VIOLATIONS - Block publication
  if (hasBagLimit) {
    errors.push(
      'CRITICAL: Post contains bag limit information. Remove all specific bag limits (e.g., "1 fish per day")'
    );
    score -= 50;
  }

  if (hasSizeLimit) {
    errors.push(
      'CRITICAL: Post contains size limit information. Remove all specific measurements (e.g., "28-32 inches")'
    );
    score -= 50;
  }

  if (hasClosedSeason) {
    errors.push(
      'CRITICAL: Post contains closed season information. Remove all specific dates/months (e.g., "December-January")'
    );
    score -= 50;
  }

  if (hasLegalClaim) {
    errors.push(
      'CRITICAL: Post makes legal claims. Remove all legal advice - only link to official sources'
    );
    score -= 50;
  }

  // Must have regulations link
  const hasRegulationsLink =
    /see local regulations|check.*regulations|consult.*regulations|official.*regulations/i.test(
      post.body
    );
  const hasRegulationsDisclaimer =
    /regulations.*subject to change|verify.*rules|consult.*government|not responsible/i.test(
      post.body
    );

  if (!hasRegulationsLink) {
    errors.push(
      'Post must include "See local regulations" link to official government source'
    );
    score -= 15;
  }

  if (!hasRegulationsDisclaimer) {
    warnings.push(
      'Post should include disclaimer about regulations changing and consulting official sources'
    );
    score -= 5;
  }

  // ==========================================================================
  // RULE 6: Evergreen Content Only
  // ==========================================================================
  const timeSensitivePatterns = [
    /this year|last year|next year/i,
    /currently|right now|at this time/i,
    /202\d/i,
    /recent study|new study|latest research/i,
    /new regulation|updated regulation/i,
    /as of \w+ \d+/i,
  ];

  const hasTimeSensitive = timeSensitivePatterns.some((pattern) => pattern.test(post.body));

  if (hasTimeSensitive) {
    warnings.push(
      'Avoid time-sensitive language. Use evergreen phrasing that remains accurate over time.'
    );
    score -= 10;
  }

  // ==========================================================================
  // Additional Quality Checks
  // ==========================================================================

  // Word count
  const wordCount = post.body.split(/\s+/).length;
  if (wordCount < 800) {
    errors.push(`Post too short: ${wordCount} words. Minimum 800 words required.`);
    score -= 20;
  } else if (wordCount < 1000) {
    warnings.push(`Post is ${wordCount} words. Aim for 1000+ for better SEO performance.`);
    score -= 5;
  }

  // Headings
  const h2Count = (post.headings.filter((h) => h.level === 2) || []).length;
  if (h2Count < 3) {
    warnings.push(`Only ${h2Count} H2 headings. Aim for 3-5 for better structure.`);
    score -= 5;
  }

  // FAQs
  if (!post.faqs || post.faqs.length < 3) {
    warnings.push('Post should include at least 3 FAQs for better SEO (rich snippets).');
    score -= 5;
  }

  // Sources
  if (!post.sources || post.sources.length < 2) {
    warnings.push('Post should cite at least 2 authoritative sources for E-A-T signals.');
    score -= 5;
  }

  // Description length
  if (post.description.length < 150 || post.description.length > 160) {
    warnings.push(
      `Meta description is ${post.description.length} chars. Aim for 150-160 for optimal display.`
    );
    score -= 3;
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    score,
  };
}

/**
 * Validate blog post and throw error if validation fails
 * Use this in pipeline to block publication of invalid posts
 */
export function validateBlogPostOrThrow(post: BlogPostDoc): void {
  const result = validateBlogPost(post);

  if (!result.passed) {
    const errorMessage = [
      '❌ Blog post validation failed!',
      '',
      'Errors:',
      ...result.errors.map((e) => `  - ${e}`),
      '',
      result.warnings.length > 0
        ? ['Warnings:', ...result.warnings.map((w) => `  - ${w}`), ''].join('\n')
        : '',
      `Score: ${result.score}/100`,
      '',
      'Fix these issues before publishing.',
    ].join('\n');

    throw new Error(errorMessage);
  }
}

/**
 * Get validation summary for reporting
 */
export function getValidationSummary(result: ValidationResult): string {
  const status = result.passed ? '✅ PASSED' : '❌ FAILED';
  const summary = [
    `Validation ${status} (Score: ${result.score}/100)`,
    '',
    result.errors.length > 0
      ? [`Errors (${result.errors.length}):`, ...result.errors.map((e) => `  • ${e}`), ''].join(
          '\n'
        )
      : '',
    result.warnings.length > 0
      ? [
          `Warnings (${result.warnings.length}):`,
          ...result.warnings.map((w) => `  • ${w}`),
          '',
        ].join('\n')
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  return summary;
}
