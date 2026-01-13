/**
 * Cadence Controls - Quality gates and publishing limits
 * Prevents flooding the site with low-quality content
 */

import { BlogIdea } from './ideation';
import { logger } from './logger';

/**
 * Cadence control configuration
 */
export interface CadenceControls {
  // Publishing limits
  maxPostsPerRun: number; // Maximum posts to publish in a single run
  maxPostsPerDay?: number; // Maximum posts per day (optional)
  
  // Quality thresholds
  minOpportunityScore: number; // Minimum opportunity score (0-100)
  minSearchVolume?: number; // Minimum search volume (optional)
  maxKeywordDifficulty?: number; // Maximum keyword difficulty (optional)
  
  // Intent filtering
  allowedIntents: Array<'informational' | 'commercial' | 'navigational' | 'transactional'>;
  
  // Category clustering
  allowedCategories?: string[]; // Only publish from these categories (optional)
  blockedCategories?: string[]; // Never publish from these categories (optional)
  
  // Additional filters
  requireRelatedQuestions?: boolean; // Only publish if has related questions
  minRelatedQuestions?: number; // Minimum number of related questions
}

/**
 * Default cadence controls (conservative settings)
 */
export const DEFAULT_CADENCE_CONTROLS: CadenceControls = {
  maxPostsPerRun: 5,
  maxPostsPerDay: 20,
  minOpportunityScore: 60, // Only high-opportunity content
  minSearchVolume: 50, // Minimum 50 searches/month
  maxKeywordDifficulty: 65, // Not too competitive
  allowedIntents: ['informational'], // Only informational content
  requireRelatedQuestions: true,
  minRelatedQuestions: 3,
};

/**
 * Check if a blog idea passes all cadence controls
 */
export function passesCadenceControls(
  idea: BlogIdea,
  controls: CadenceControls
): { passed: boolean; reason?: string } {
  // Check opportunity score
  if (idea.opportunityScore < controls.minOpportunityScore) {
    return {
      passed: false,
      reason: `Opportunity score ${idea.opportunityScore} below minimum ${controls.minOpportunityScore}`,
    };
  }

  // Check search volume
  if (controls.minSearchVolume !== undefined && idea.searchVolume < controls.minSearchVolume) {
    return {
      passed: false,
      reason: `Search volume ${idea.searchVolume} below minimum ${controls.minSearchVolume}`,
    };
  }

  // Check keyword difficulty
  if (controls.maxKeywordDifficulty !== undefined && idea.keywordDifficulty > controls.maxKeywordDifficulty) {
    return {
      passed: false,
      reason: `Keyword difficulty ${idea.keywordDifficulty} above maximum ${controls.maxKeywordDifficulty}`,
    };
  }

  // Check search intent
  if (!controls.allowedIntents.includes(idea.searchIntent)) {
    return {
      passed: false,
      reason: `Search intent "${idea.searchIntent}" not in allowed intents: ${controls.allowedIntents.join(', ')}`,
    };
  }

  // Check category allowlist
  if (controls.allowedCategories && controls.allowedCategories.length > 0) {
    if (!controls.allowedCategories.includes(idea.category)) {
      return {
        passed: false,
        reason: `Category "${idea.category}" not in allowed categories: ${controls.allowedCategories.join(', ')}`,
      };
    }
  }

  // Check category blocklist
  if (controls.blockedCategories && controls.blockedCategories.includes(idea.category)) {
    return {
      passed: false,
      reason: `Category "${idea.category}" is blocked`,
    };
  }

  // Check related questions
  if (controls.requireRelatedQuestions) {
    const minQuestions = controls.minRelatedQuestions || 3;
    if (!idea.relatedQuestions || idea.relatedQuestions.length < minQuestions) {
      return {
        passed: false,
        reason: `Only ${idea.relatedQuestions?.length || 0} related questions, minimum is ${minQuestions}`,
      };
    }
  }

  return { passed: true };
}

/**
 * Filter blog ideas by cadence controls
 */
export function filterIdeasByCadence(
  ideas: BlogIdea[],
  controls: CadenceControls
): { passed: BlogIdea[]; rejected: Array<{ idea: BlogIdea; reason: string }> } {
  const passed: BlogIdea[] = [];
  const rejected: Array<{ idea: BlogIdea; reason: string }> = [];

  for (const idea of ideas) {
    const result = passesCadenceControls(idea, controls);
    if (result.passed) {
      passed.push(idea);
    } else {
      rejected.push({ idea, reason: result.reason || 'Unknown reason' });
    }
  }

  // Sort passed ideas by opportunity score (highest first)
  passed.sort((a, b) => b.opportunityScore - a.opportunityScore);

  // Apply max posts per run limit
  const limited = passed.slice(0, controls.maxPostsPerRun);

  logger.info(
    `Cadence filtering: ${passed.length}/${ideas.length} passed, ${rejected.length} rejected, ${limited.length} after limit`
  );

  return {
    passed: limited,
    rejected: [
      ...rejected,
      ...passed.slice(controls.maxPostsPerRun).map((idea) => ({
        idea,
        reason: `Exceeded max posts per run (${controls.maxPostsPerRun})`,
      })),
    ],
  };
}

/**
 * Check daily publishing limit
 */
export async function checkDailyLimit(
  controls: CadenceControls
): Promise<{ withinLimit: boolean; countToday: number; limit: number }> {
  if (!controls.maxPostsPerDay) {
    return { withinLimit: true, countToday: 0, limit: Infinity };
  }

  // Load topic index to count today's publishes
  const { loadTopicIndex } = await import('./topicIndex');
  const index = await loadTopicIndex();

  const today = new Date().toISOString().split('T')[0];
  const countToday = index.filter(
    (record) =>
      record.status === 'published' &&
      record.lastPublishedAt &&
      record.lastPublishedAt.startsWith(today) &&
      record.pageType === 'blog'
  ).length;

  return {
    withinLimit: countToday < controls.maxPostsPerDay,
    countToday,
    limit: controls.maxPostsPerDay,
  };
}
