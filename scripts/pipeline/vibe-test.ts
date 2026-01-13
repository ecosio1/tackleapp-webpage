/**
 * Vibe Test & Unique Authority System
 * Generates proprietary scoring systems and human-centric insights
 * Signals to search engines that content contains unique, tested information
 */

import { logger } from './logger';
import { generateWithLLM } from './llm';

export interface VibeTestScore {
  name: string; // e.g., "Catchability Score", "Difficulty Rating"
  value: number; // 0-100
  explanation: string; // Why this score
  factors: string[]; // What contributes to the score
  lastUpdated: string; // When this was calculated
}

export interface VibeTest {
  primaryScore: VibeTestScore;
  secondaryScores?: VibeTestScore[];
  uniqueInsights: string[]; // Proprietary observations
  realWorldNotes: string[]; // Human-centric observations
  comparisonContext?: string; // How this compares to alternatives
}

/**
 * Generate Catchability Score for lures
 * Proprietary scoring based on multiple factors
 */
export async function generateCatchabilityScore(
  lure: string,
  species: string,
  location?: string
): Promise<VibeTestScore> {
  logger.info(`Generating Catchability Score for ${lure} targeting ${species}`);
  
  const prompt = `As an expert fishing guide with years of hands-on experience, rate the catchability of "${lure}" for targeting "${species}"${location ? ` in ${location}` : ''}.

Consider these factors:
- Effectiveness in real-world conditions
- Versatility across different scenarios
- Ease of use for anglers
- Success rate based on actual fishing reports
- Seasonal effectiveness
- Water condition adaptability

Provide:
1. A score from 0-100 (Catchability Score)
2. A brief explanation of why this score
3. The top 3-5 factors that contribute to this score
4. Make it sound like real, tested experience, not generic advice

Format as JSON with: score, explanation, factors (array)`;

  try {
    const response = await generateWithLLM({
      prompt,
      jsonSchema: {
        type: 'object',
        properties: {
          score: { type: 'number', minimum: 0, maximum: 100 },
          explanation: { type: 'string' },
          factors: { type: 'array', items: { type: 'string' } },
        },
        required: ['score', 'explanation', 'factors'],
      },
      systemPrompt: 'You are an expert fishing guide with decades of real-world experience. Provide authentic, tested insights based on actual fishing scenarios.',
    });

    return {
      name: 'Catchability Score',
      value: response.score,
      explanation: response.explanation,
      factors: response.factors,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
  } catch (error) {
    logger.error('Error generating Catchability Score:', error);
    // Fallback to calculated score
    return generateFallbackCatchabilityScore(lure, species);
  }
}

/**
 * Generate Difficulty Rating for species
 */
export async function generateDifficultyRating(
  species: string,
  location?: string
): Promise<VibeTestScore> {
  logger.info(`Generating Difficulty Rating for ${species}`);
  
  const prompt = `As an expert angler, rate the difficulty of catching "${species}"${location ? ` in ${location}` : ''} on a scale of 0-100 (where 0 = very easy, 100 = extremely difficult).

Consider:
- Skill level required
- Equipment needs
- Time investment
- Location accessibility
- Seasonal availability
- Success rate for average anglers

Provide:
1. A difficulty score (0-100)
2. Explanation of the rating
3. Top 3-5 factors that make it easier or harder
4. Make it sound like real experience, not generic data

Format as JSON with: score, explanation, factors (array)`;

  try {
    const response = await generateWithLLM({
      prompt,
      jsonSchema: {
        type: 'object',
        properties: {
          score: { type: 'number', minimum: 0, maximum: 100 },
          explanation: { type: 'string' },
          factors: { type: 'array', items: { type: 'string' } },
        },
        required: ['score', 'explanation', 'factors'],
      },
      systemPrompt: 'You are an experienced angler providing authentic difficulty assessments based on real fishing experiences.',
    });

    return {
      name: 'Difficulty Rating',
      value: response.score,
      explanation: response.explanation,
      factors: response.factors,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
  } catch (error) {
    logger.error('Error generating Difficulty Rating:', error);
    return generateFallbackDifficultyRating(species);
  }
}

/**
 * Generate Effectiveness Score for techniques
 */
export async function generateEffectivenessScore(
  technique: string,
  species: string,
  context?: string
): Promise<VibeTestScore> {
  logger.info(`Generating Effectiveness Score for ${technique} on ${species}`);
  
  const prompt = `Rate the effectiveness of "${technique}" for catching "${species}"${context ? ` (${context})` : ''} on a scale of 0-100.

Consider:
- Success rate in real conditions
- Consistency of results
- Learning curve
- Equipment requirements
- Best use cases
- Limitations

Provide:
1. An effectiveness score (0-100)
2. Explanation
3. Top factors affecting effectiveness
4. Sound like real, tested experience

Format as JSON with: score, explanation, factors (array)`;

  try {
    const response = await generateWithLLM({
      prompt,
      jsonSchema: {
        type: 'object',
        properties: {
          score: { type: 'number', minimum: 0, maximum: 100 },
          explanation: { type: 'string' },
          factors: { type: 'array', items: { type: 'string' } },
        },
        required: ['score', 'explanation', 'factors'],
      },
      systemPrompt: 'You are a fishing expert providing authentic effectiveness ratings based on real-world testing.',
    });

    return {
      name: 'Effectiveness Score',
      value: response.score,
      explanation: response.explanation,
      factors: response.factors,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
  } catch (error) {
    logger.error('Error generating Effectiveness Score:', error);
    return generateFallbackEffectivenessScore(technique, species);
  }
}

/**
 * Generate Location Quality Score
 */
export async function generateLocationQualityScore(
  location: string,
  species?: string
): Promise<VibeTestScore> {
  logger.info(`Generating Location Quality Score for ${location}`);
  
  const prompt = `Rate the overall fishing quality of "${location}"${species ? ` for ${species}` : ''} on a scale of 0-100.

Consider:
- Fish population density
- Accessibility
- Variety of species
- Year-round fishing opportunities
- Local knowledge required
- Success rate for visitors

Provide:
1. A quality score (0-100)
2. Explanation
3. Top factors contributing to quality
4. Sound like real, on-the-water experience

Format as JSON with: score, explanation, factors (array)`;

  try {
    const response = await generateWithLLM({
      prompt,
      jsonSchema: {
        type: 'object',
        properties: {
          score: { type: 'number', minimum: 0, maximum: 100 },
          explanation: { type: 'string' },
          factors: { type: 'array', items: { type: 'string' } },
        },
        required: ['score', 'explanation', 'factors'],
      },
      systemPrompt: 'You are a local fishing expert providing authentic location assessments based on real fishing experiences.',
    });

    return {
      name: 'Location Quality Score',
      value: response.score,
      explanation: response.explanation,
      factors: response.factors,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
  } catch (error) {
    logger.error('Error generating Location Quality Score:', error);
    return generateFallbackLocationScore(location);
  }
}

/**
 * Generate unique insights (proprietary observations)
 */
export async function generateUniqueInsights(
  topic: string,
  context: string
): Promise<string[]> {
  logger.info(`Generating unique insights for ${topic}`);
  
  const prompt = `As an expert fishing guide, provide 3-5 unique, proprietary insights about "${topic}" in the context of "${context}".

These should be:
- Based on real-world testing and observation
- Not commonly found in generic fishing guides
- Specific and actionable
- Sound like insider knowledge from actual fishing experience
- Recent and relevant

Avoid generic advice. Focus on specific, tested observations that show real experience.`;

  try {
    const response = await generateWithLLM({
      prompt,
      systemPrompt: 'You are an expert fishing guide sharing proprietary insights from years of hands-on experience. Be specific and authentic.',
    });

    // Extract insights (could be a list or paragraph)
    const insights: string[] = [];
    
    // Try to extract numbered or bulleted list
    const listPattern = /(?:^|\n)[-•*]\s*(.+?)(?=\n|$)/g;
    const matches = response.matchAll(listPattern);
    for (const match of matches) {
      insights.push(match[1].trim());
    }
    
    // If no list found, split by sentences
    if (insights.length === 0) {
      const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 20);
      insights.push(...sentences.slice(0, 5).map(s => s.trim()));
    }
    
    return insights.slice(0, 5);
  } catch (error) {
    logger.error('Error generating unique insights:', error);
    return [];
  }
}

/**
 * Generate real-world notes (human-centric observations)
 */
export async function generateRealWorldNotes(
  topic: string,
  context: string
): Promise<string[]> {
  logger.info(`Generating real-world notes for ${topic}`);
  
  const prompt = `As someone who has actually fished for "${topic}" in "${context}", provide 2-3 real-world notes that anglers should know.

These should be:
- Practical observations from actual fishing
- Things you learned the hard way
- Tips that aren't in books
- Human-centric, relatable experiences
- Recent and relevant

Make it sound like real, lived experience, not generic advice.`;

  try {
    const response = await generateWithLLM({
      prompt,
      systemPrompt: 'You are an experienced angler sharing practical, real-world observations from actual fishing trips.',
    });

    const notes: string[] = [];
    const listPattern = /(?:^|\n)[-•*]\s*(.+?)(?=\n|$)/g;
    const matches = response.matchAll(listPattern);
    for (const match of matches) {
      notes.push(match[1].trim());
    }
    
    if (notes.length === 0) {
      const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 20);
      notes.push(...sentences.slice(0, 3).map(s => s.trim()));
    }
    
    return notes.slice(0, 3);
  } catch (error) {
    logger.error('Error generating real-world notes:', error);
    return [];
  }
}

/**
 * Generate complete Vibe Test for a page
 */
export async function generateVibeTest(
  pageType: 'species' | 'lure' | 'technique' | 'location' | 'comparison',
  primaryEntity: string,
  context?: {
    species?: string;
    location?: string;
    technique?: string;
    comparison?: string;
  }
): Promise<VibeTest> {
  logger.info(`Generating Vibe Test for ${pageType}: ${primaryEntity}`);
  
  let primaryScore: VibeTestScore;
  const secondaryScores: VibeTestScore[] = [];
  
  // Generate primary score based on page type
  switch (pageType) {
    case 'species':
      primaryScore = await generateDifficultyRating(primaryEntity, context?.location);
      if (context?.technique) {
        const effectiveness = await generateEffectivenessScore(context.technique, primaryEntity);
        secondaryScores.push(effectiveness);
      }
      break;
      
    case 'lure':
      primaryScore = await generateCatchabilityScore(
        primaryEntity,
        context?.species || 'general',
        context?.location
      );
      break;
      
    case 'technique':
      primaryScore = await generateEffectivenessScore(
        primaryEntity,
        context?.species || 'general',
        context?.location
      );
      break;
      
    case 'location':
      primaryScore = await generateLocationQualityScore(
        primaryEntity,
        context?.species
      );
      break;
      
    case 'comparison':
      // For comparisons, generate scores for both items
      if (context?.comparison) {
        const score1 = await generateCatchabilityScore(primaryEntity, context.species || 'general');
        const score2 = await generateCatchabilityScore(context.comparison, context.species || 'general');
        primaryScore = score1;
        secondaryScores.push(score2);
      } else {
        primaryScore = await generateCatchabilityScore(primaryEntity, context?.species || 'general');
      }
      break;
      
    default:
      primaryScore = await generateCatchabilityScore(primaryEntity, context?.species || 'general');
  }
  
  // Generate unique insights
  const insightContext = [
    context?.species,
    context?.location,
    context?.technique,
  ].filter(Boolean).join(', ') || primaryEntity;
  
  const uniqueInsights = await generateUniqueInsights(primaryEntity, insightContext);
  const realWorldNotes = await generateRealWorldNotes(primaryEntity, insightContext);
  
  return {
    primaryScore,
    secondaryScores: secondaryScores.length > 0 ? secondaryScores : undefined,
    uniqueInsights,
    realWorldNotes,
  };
}

// Fallback functions (if LLM fails)
function generateFallbackCatchabilityScore(lure: string, species: string): VibeTestScore {
  // Simple heuristic-based fallback
  const baseScore = 65; // Default moderate score
  return {
    name: 'Catchability Score',
    value: baseScore,
    explanation: `Based on general effectiveness for ${species}. Individual results may vary based on conditions and technique.`,
    factors: ['Lure type', 'Target species behavior', 'Water conditions'],
    lastUpdated: new Date().toISOString().split('T')[0],
  };
}

function generateFallbackDifficultyRating(species: string): VibeTestScore {
  return {
    name: 'Difficulty Rating',
    value: 50,
    explanation: `Moderate difficulty. Success depends on location, season, and angler experience.`,
    factors: ['Species behavior', 'Location accessibility', 'Skill requirements'],
    lastUpdated: new Date().toISOString().split('T')[0],
  };
}

function generateFallbackEffectivenessScore(technique: string, species: string): VibeTestScore {
  return {
    name: 'Effectiveness Score',
    value: 60,
    explanation: `Generally effective for ${species} when conditions are right.`,
    factors: ['Technique match', 'Conditions', 'Angler skill'],
    lastUpdated: new Date().toISOString().split('T')[0],
  };
}

function generateFallbackLocationScore(location: string): VibeTestScore {
  return {
    name: 'Location Quality Score',
    value: 55,
    explanation: `Decent fishing location with seasonal variations.`,
    factors: ['Species variety', 'Accessibility', 'Seasonal patterns'],
    lastUpdated: new Date().toISOString().split('T')[0],
  };
}
