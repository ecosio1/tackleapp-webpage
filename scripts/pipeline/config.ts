/**
 * Pipeline configuration
 */

import { STATE_REGULATION_LINKS } from '@/lib/regLinks/stateRegLinks';

export const DAILY_PUBLISH_CAP = 20; // Maximum pages to publish per day
export const DEFAULT_REVALIDATE_SECRET_NAME = 'REVALIDATION_SECRET';
export const DEFAULT_REVALIDATE_ENDPOINT = '/api/revalidate';
export const DEFAULT_AUTHOR_NAME = 'Tackle Team';
export const DEFAULT_AUTHOR_URL = '/about';
export const FAILURE_STOP_THRESHOLD = 3; // Stop after N consecutive failures

/**
 * Minimum word counts by page type
 */
export const MIN_WORD_COUNTS: Record<string, number> = {
  blog: 900,
  species: 1200,
  'how-to': 1200,
  location: 1000,
};

/**
 * State regulation links (imported from lib)
 */
export { STATE_REGULATION_LINKS };

/**
 * Default disclaimers
 */
export const DEFAULT_DISCLAIMERS = [
  'Regulations change—always verify with official sources.',
];

/**
 * Forbidden phrases that must not appear in content
 */
export const FORBIDDEN_PHRASES = [
  'official regulation',
  'legal advice',
  'official guide',
  'guaranteed to',
  'always legal',
];

/**
 * Content quality thresholds
 */
export const QUALITY_THRESHOLDS = {
  minH2Sections: 4,
  minFaqs: 5,
  maxFaqs: 8,
  minInternalLinks: {
    blog: 3,
    species: 6,
    'how-to': 6,
    location: 6,
  },
  minSourcesForSeasonal: 2, // Minimum sources if content mentions seasons
  plagiarismThreshold: 0.15, // 15% similarity max
  duplicateSimilarityThreshold: 0.85, // 85% similarity = duplicate
};

/**
 * LLM configuration
 */
export const LLM_CONFIG = {
  model: 'gpt-4-turbo-preview',
  maxTokens: 4000,
  temperature: 0.7,
  maxRetries: 3,
  retryDelayMs: 1000,
};

/**
 * Rate limiting configuration
 */
export const RATE_LIMIT_CONFIG = {
  defaultRateLimitPerMin: 10,
  maxConcurrentFetches: 5,
};


