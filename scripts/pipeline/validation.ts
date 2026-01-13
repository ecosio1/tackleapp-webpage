/**
 * Keyword Validation with DataForSEO
 * Validates programmatic concepts with actual search metrics
 * Filters for: 200-500 search volume, informational intent, gets question suggestions
 */

import { logger } from './logger';
import { KeywordData, fetchKeywordSuggestions, filterByIntent } from './ideation';

const DATAFORSEO_API_URL = 'https://api.dataforseo.com';
const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN || process.env.DATAFORSEO_EMAIL;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD || process.env.DATAFORSEO_API_KEY;

export interface ValidatedKeyword {
  keyword: string;
  searchVolume: number;
  keywordDifficulty: number;
  searchIntent: 'informational' | 'commercial' | 'navigational' | 'transactional';
  cpc: number;
  relatedQuestions: string[];
  serpFeatures: string[];
  opportunityScore: number;
  validated: boolean; // True if meets criteria (200-500 volume, informational)
}

export interface ValidationOptions {
  minVolume?: number; // Default: 200
  maxVolume?: number; // Default: 500
  intent?: 'informational' | 'commercial'; // Default: 'informational'
  location?: string; // e.g., 'florida'
  includeQuestions?: boolean; // Get People Also Ask questions
}

/**
 * Validate keywords from programmatic concepts
 * Takes example keywords from concepts and validates them with DataForSEO
 */
export async function validateKeywords(
  keywords: string[],
  options: ValidationOptions = {}
): Promise<ValidatedKeyword[]> {
  logger.info(`Validating ${keywords.length} keywords with DataForSEO...`);
  
  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    throw new Error('DataForSEO credentials not found. Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD environment variables.');
  }

  const minVolume = options.minVolume || 200;
  const maxVolume = options.maxVolume || 500;
  const intent = options.intent || 'informational';
  
  logger.info(`Criteria: Volume ${minVolume}-${maxVolume}, Intent: ${intent}`);

  // Fetch keyword data from DataForSEO
  const keywordData = await fetchKeywordSuggestions(keywords, options.location);
  logger.info(`Fetched data for ${keywordData.length} keywords`);

  // Filter by intent (informational only)
  const informationalKeywords = await filterByIntent(keywordData, intent);
  logger.info(`Filtered to ${informationalKeywords.length} ${intent} keywords`);

  // Get questions for validated keywords if requested
  let questionsMap = new Map<string, string[]>();
  if (options.includeQuestions !== false) {
    logger.info('Fetching related questions...');
    questionsMap = await getRelatedQuestions(informationalKeywords.map(k => k.keyword));
  }

  // Validate and score keywords
  const validated: ValidatedKeyword[] = informationalKeywords.map(k => {
    const meetsVolume = k.searchVolume >= minVolume && k.searchVolume <= maxVolume;
    const meetsIntent = true; // Already filtered by intent
    
    // Calculate opportunity score
    const opportunityScore = calculateOpportunityScore(k, minVolume, maxVolume);
    
    return {
      keyword: k.keyword,
      searchVolume: k.searchVolume,
      keywordDifficulty: k.keywordDifficulty,
      searchIntent: intent,
      cpc: k.cpc,
      relatedQuestions: questionsMap.get(k.keyword) || [],
      serpFeatures: k.serpFeatures,
      opportunityScore,
      validated: meetsVolume && meetsIntent,
    };
  });

  // Filter to only validated keywords
  const validKeywords = validated.filter(k => k.validated);
  logger.info(`Validated ${validKeywords.length} keywords meeting criteria`);

  // Sort by opportunity score (highest first)
  validKeywords.sort((a, b) => b.opportunityScore - a.opportunityScore);

  return validKeywords;
}

/**
 * Get related questions (People Also Ask) for keywords
 */
async function getRelatedQuestions(keywords: string[]): Promise<Map<string, string[]>> {
  const questionsMap = new Map<string, string[]>();
  const authHeader = `Basic ${Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64')}`;
  
  // Use SERP API to get People Also Ask questions
  // Limit to avoid too many API calls
  const keywordsToCheck = keywords.slice(0, 20);
  
  for (const keyword of keywordsToCheck) {
    try {
      const response = await fetch(`${DATAFORSEO_API_URL}/v3/serp/google/organic/live/advanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify([{
          keyword,
          location_code: 2840, // USA
          language_code: 'en',
          depth: 1,
          device: 'desktop',
        }]),
      });

      if (!response.ok) {
        logger.warn(`SERP API failed for "${keyword}": ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (!data || !data.tasks || !data.tasks[0] || !data.tasks[0].result) {
        continue;
      }

      const result = data.tasks[0].result[0];
      const questions: string[] = [];

      // Extract People Also Ask questions
      if (result.people_also_ask && Array.isArray(result.people_also_ask)) {
        result.people_also_ask.forEach((paa: any) => {
          const question = paa.question || paa.title;
          if (question && question.length > 10 && question.length < 200) {
            questions.push(question);
          }
        });
      }

      if (questions.length > 0) {
        questionsMap.set(keyword, questions.slice(0, 8)); // Limit to 8 questions
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));

    } catch (error) {
      logger.warn(`Error fetching questions for "${keyword}":`, error);
      continue;
    }
  }

  logger.info(`Fetched questions for ${questionsMap.size} keywords`);
  return questionsMap;
}

/**
 * Calculate opportunity score for validated keywords
 * Prioritizes keywords in the 200-500 volume range
 */
function calculateOpportunityScore(
  keyword: KeywordData,
  minVolume: number,
  maxVolume: number
): number {
  let score = 0;

  // Volume score (prefer 200-500 range)
  if (keyword.searchVolume >= minVolume && keyword.searchVolume <= maxVolume) {
    // Perfect range - max points
    score += 40;
  } else if (keyword.searchVolume > 0) {
    // Close to range - partial points
    if (keyword.searchVolume < minVolume) {
      score += (keyword.searchVolume / minVolume) * 20; // Up to 20 points
    } else if (keyword.searchVolume > maxVolume) {
      const excess = keyword.searchVolume - maxVolume;
      score += Math.max(0, 40 - (excess / 100) * 10); // Penalize excess volume
    }
  } else {
    // Unknown volume - give base score
    score += 15;
  }

  // Difficulty score (lower is better)
  if (keyword.keywordDifficulty > 0) {
    score += (100 - keyword.keywordDifficulty) / 100 * 30; // Up to 30 points
  } else {
    score += 15; // Unknown difficulty - base score
  }

  // SERP features score (more features = more opportunity)
  score += Math.min(keyword.serpFeatures.length * 5, 20); // Up to 20 points

  // Competition score (lower is better)
  if (keyword.competition === 'low') {
    score += 10;
  } else if (keyword.competition === 'medium') {
    score += 5;
  }

  return Math.round(Math.min(score, 100));
}

/**
 * Validate a programmatic concept by checking its example keywords
 */
export async function validateConcept(
  conceptKeywords: string[],
  options: ValidationOptions = {}
): Promise<{
  concept: string;
  validatedKeywords: ValidatedKeyword[];
  totalVolume: number;
  averageDifficulty: number;
  totalOpportunity: number;
}> {
  logger.info(`Validating concept with ${conceptKeywords.length} example keywords...`);

  const validated = await validateKeywords(conceptKeywords, options);

  const totalVolume = validated.reduce((sum, k) => sum + k.searchVolume, 0);
  const avgDifficulty = validated.length > 0
    ? validated.reduce((sum, k) => sum + k.keywordDifficulty, 0) / validated.length
    : 0;
  const totalOpportunity = validated.reduce((sum, k) => sum + k.opportunityScore, 0);

  return {
    concept: conceptKeywords[0] || 'Unknown',
    validatedKeywords: validated,
    totalVolume,
    averageDifficulty: Math.round(avgDifficulty),
    totalOpportunity,
  };
}

/**
 * Batch validate multiple concepts
 */
export async function validateConcepts(
  concepts: Array<{ concept: string; exampleKeywords: string[] }>,
  options: ValidationOptions = {}
): Promise<Array<{
  concept: string;
  validatedKeywords: ValidatedKeyword[];
  totalVolume: number;
  averageDifficulty: number;
  totalOpportunity: number;
  isValid: boolean; // True if has validated keywords
}>> {
  logger.info(`Validating ${concepts.length} concepts...`);

  const results = await Promise.all(
    concepts.map(async (concept) => {
      try {
        const validation = await validateConcept(concept.exampleKeywords, options);
        return {
          ...validation,
          concept: concept.concept,
          isValid: validation.validatedKeywords.length > 0,
        };
      } catch (error) {
        logger.error(`Error validating concept "${concept.concept}":`, error);
        return {
          concept: concept.concept,
          validatedKeywords: [],
          totalVolume: 0,
          averageDifficulty: 0,
          totalOpportunity: 0,
          isValid: false,
        };
      }
    })
  );

  const validCount = results.filter(r => r.isValid).length;
  logger.info(`Validated ${validCount}/${concepts.length} concepts with qualifying keywords`);

  return results;
}
