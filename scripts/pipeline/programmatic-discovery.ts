/**
 * Programmatic SEO Concept Discovery
 * Uses Perplexity MCP to find broad programmatic keyword opportunities
 * Discovers patterns like "X vs. Y", "How to Catch X in Y Location", etc.
 */

import { logger } from './logger';
import { researchTopic } from './perplexity';
import { validateConcepts, ValidatedKeyword } from './validation';

export interface ProgrammaticConcept {
  concept: string;
  pattern: string; // e.g., "X vs. Y", "How to Catch X in Y"
  description: string;
  exampleKeywords: string[];
  estimatedVolume: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  validated?: {
    keywords: ValidatedKeyword[];
    totalVolume: number;
    averageDifficulty: number;
    totalOpportunity: number;
    isValid: boolean;
  };
}

export interface DiscoveryOptions {
  niche: string; // e.g., "fishing", "fishing gear", "fishing techniques"
  count?: number; // Number of concepts to discover
  includePatterns?: string[]; // Specific patterns to look for
  location?: string; // Optional location focus
}

/**
 * Get site summary for context
 */
function getSiteSummary(): string {
  return `Tackle is an AI-powered fishing companion iOS app that helps anglers catch more fish. 
Key features:
- AI Captain Chat for personalized fishing advice
- AI Fish Identification (95% accuracy)
- Real-time fishing conditions (weather, tides, moon phases, solunar forecasts)
- Interactive fishing map with hotspots
- Catch tracking and history
- Fishing regulations by state

The website focuses on SEO content for:
- Species fishing guides (how to catch specific fish)
- How-to guides (fishing techniques, gear usage)
- Location guides (best fishing spots by location)
- Blog posts (tips, gear reviews, conditions)
- Tool comparisons (lures, rods, reels, etc.)

Target audience: Weekend anglers, tournament fishermen, new fishermen, traveling anglers, charter captains.`;
}

/**
 * Discover programmatic concepts using Perplexity
 * Optionally validates with DataForSEO
 */
export async function discoverProgrammaticConcepts(
  options: DiscoveryOptions & { validate?: boolean; minVolume?: number; maxVolume?: number }
): Promise<ProgrammaticConcept[]> {
  logger.info(`Discovering programmatic concepts for niche: ${options.niche}`);
  
  const siteSummary = getSiteSummary();
  const count = options.count || 10;
  
  // Build the discovery query
  let query = `Based on this fishing website and app context: "${siteSummary}"

Find ${count} programmatic SEO keyword concepts for a fishing blog. 

Programmatic keywords are scalable patterns that can generate many pages, such as:
- "X vs. Y" comparisons (e.g., "topwater lures vs. soft plastics for snook")
- "How to catch X in Y location" (e.g., "how to catch redfish in Florida")
- "Best X for Y" (e.g., "best lures for redfish")
- "X fishing techniques" (e.g., "jigging techniques for grouper")
- "X fishing in Y season" (e.g., "snook fishing in winter")

For each concept, provide:
1. The concept name/pattern
2. The pattern type (e.g., "X vs. Y", "How to Catch X in Y")
3. A brief description
4. 3-5 example keywords following this pattern
5. Estimated search volume (high/medium/low)
6. Difficulty to rank (easy/medium/hard)
7. Content category (species, gear, technique, location, etc.)

Format as a structured list.`;

  // Add location context if provided
  if (options.location) {
    query += `\n\nFocus on concepts relevant to ${options.location}.`;
  }

  // Add specific patterns if requested
  if (options.includePatterns && options.includePatterns.length > 0) {
    query += `\n\nPrioritize these patterns: ${options.includePatterns.join(', ')}`;
  }

  try {
    logger.info('Querying Perplexity for programmatic concepts...');
    const response = await researchTopic(query, {
      model: 'llama-3.1-sonar-large-128k-online', // Use larger model for better analysis
      temperature: 0.3, // Lower temperature for more structured output
      maxTokens: 3000,
    });

    // Parse the response to extract concepts
    let concepts = parseConceptsFromResponse(response.answer, count);
    
    logger.info(`Discovered ${concepts.length} programmatic concepts`);

    // Validate with DataForSEO if requested
    if (options.validate) {
      logger.info('Validating concepts with DataForSEO...');
      const validationResults = await validateConcepts(
        concepts.map(c => ({
          concept: c.concept,
          exampleKeywords: c.exampleKeywords,
        })),
        {
          minVolume: options.minVolume || 200,
          maxVolume: options.maxVolume || 500,
          intent: 'informational',
          location: options.location,
          includeQuestions: true,
        }
      );

      // Merge validation results into concepts
      concepts = concepts.map((concept, index) => {
        const validation = validationResults[index];
        return {
          ...concept,
          validated: {
            keywords: validation.validatedKeywords,
            totalVolume: validation.totalVolume,
            averageDifficulty: validation.averageDifficulty,
            totalOpportunity: validation.totalOpportunity,
            isValid: validation.isValid,
          },
        };
      });

      // Sort by validation results (valid concepts first, then by total opportunity)
      concepts.sort((a, b) => {
        if (a.validated?.isValid && !b.validated?.isValid) return -1;
        if (!a.validated?.isValid && b.validated?.isValid) return 1;
        return (b.validated?.totalOpportunity || 0) - (a.validated?.totalOpportunity || 0);
      });

      const validCount = concepts.filter(c => c.validated?.isValid).length;
      logger.info(`Validated ${validCount}/${concepts.length} concepts with qualifying keywords`);
    }

    return concepts;

  } catch (error) {
    logger.error('Error discovering programmatic concepts:', error);
    throw error;
  }
}

/**
 * Parse concepts from Perplexity response
 * Handles various response formats
 */
function parseConceptsFromResponse(
  response: string,
  expectedCount: number
): ProgrammaticConcept[] {
  const concepts: ProgrammaticConcept[] = [];
  
  // Try to extract numbered list items
  const numberedPattern = /(\d+)\.\s*(.+?)(?=\d+\.|$)/gs;
  const matches = Array.from(response.matchAll(numberedPattern));
  
  if (matches.length > 0) {
    for (const match of matches) {
      const content = match[2].trim();
      const concept = parseConceptFromText(content);
      if (concept) {
        concepts.push(concept);
      }
    }
  }
  
  // If no numbered list, try bullet points
  if (concepts.length === 0) {
    const bulletPattern = /[-•*]\s*(.+?)(?=[-•*]|$)/gs;
    const bulletMatches = Array.from(response.matchAll(bulletPattern));
    
    for (const match of bulletMatches) {
      const content = match[1].trim();
      const concept = parseConceptFromText(content);
      if (concept) {
        concepts.push(concept);
      }
    }
  }
  
  // If still no concepts, try to extract from paragraphs
  if (concepts.length === 0) {
    const paragraphs = response.split(/\n\n+/);
    for (const para of paragraphs) {
      if (para.length > 50) {
        const concept = parseConceptFromText(para);
        if (concept) {
          concepts.push(concept);
        }
      }
    }
  }
  
  // Limit to expected count
  return concepts.slice(0, expectedCount);
}

/**
 * Parse a single concept from text
 */
function parseConceptFromText(text: string): ProgrammaticConcept | null {
  // Extract concept name (usually first line or bold text)
  const conceptMatch = text.match(/^(?:Concept|Pattern|Name)[:：]\s*(.+?)(?:\n|$)/i) ||
                      text.match(/^(.+?)(?:\n|$)/);
  
  if (!conceptMatch) return null;
  
  const conceptName = conceptMatch[1].trim();
  
  // Extract pattern type
  const patternMatch = text.match(/(?:Pattern|Type)[:：]\s*(.+?)(?:\n|$)/i) ||
                      text.match(/("X vs\. Y"|"How to Catch X in Y"|"Best X for Y"|"X fishing techniques"|"X fishing in Y season")/i);
  const pattern = patternMatch ? patternMatch[1].replace(/"/g, '') : 'Unknown';
  
  // Extract description
  const descMatch = text.match(/(?:Description|About)[:：]\s*(.+?)(?:\n|$)/i);
  const description = descMatch ? descMatch[1].trim() : conceptName;
  
  // Extract example keywords
  const exampleKeywords: string[] = [];
  const exampleMatch = text.match(/(?:Examples?|Keywords?)[:：]\s*(.+?)(?:\n|$)/i);
  if (exampleMatch) {
    const examples = exampleMatch[1]
      .split(/[,;]/)
      .map(e => e.trim().replace(/^[-•*]\s*/, ''))
      .filter(e => e.length > 5);
    exampleKeywords.push(...examples.slice(0, 5));
  }
  
  // Extract estimated volume
  const volumeMatch = text.match(/(?:Volume|Search Volume)[:：]\s*(high|medium|low)/i);
  const estimatedVolume = (volumeMatch ? volumeMatch[1].toLowerCase() : 'medium') as 'high' | 'medium' | 'low';
  
  // Extract difficulty
  const difficultyMatch = text.match(/(?:Difficulty|Rank Difficulty)[:：]\s*(easy|medium|hard)/i);
  const difficulty = (difficultyMatch ? difficultyMatch[1].toLowerCase() : 'medium') as 'easy' | 'medium' | 'hard';
  
  // Extract category
  const categoryMatch = text.match(/(?:Category|Type)[:：]\s*(species|gear|technique|location|blog|other)/i);
  const category = categoryMatch ? categoryMatch[1].toLowerCase() : 'other';
  
  // If we have at least a concept name, create the concept
  if (conceptName.length > 3) {
    return {
      concept: conceptName,
      pattern,
      description: description.length > 200 ? description.substring(0, 200) + '...' : description,
      exampleKeywords: exampleKeywords.length > 0 ? exampleKeywords : generateExampleKeywords(conceptName, pattern),
      estimatedVolume,
      difficulty,
      category,
    };
  }
  
  return null;
}

/**
 * Generate example keywords from concept and pattern
 */
function generateExampleKeywords(concept: string, pattern: string): string[] {
  const examples: string[] = [];
  
  // Common fishing species
  const species = ['redfish', 'snook', 'tarpon', 'speckled trout', 'bass', 'grouper', 'snapper', 'flounder'];
  
  // Common locations
  const locations = ['Florida', 'Texas', 'Louisiana', 'Miami', 'Tampa', 'Key West'];
  
  // Common gear
  const gear = ['topwater lures', 'soft plastics', 'jigs', 'spinnerbaits', 'crankbaits', 'rods', 'reels'];
  
  if (pattern.includes('vs')) {
    // X vs Y pattern
    examples.push(`${gear[0]} vs ${gear[1]} for ${species[0]}`);
    examples.push(`${gear[2]} vs ${gear[3]} for ${species[1]}`);
  } else if (pattern.includes('How to Catch')) {
    // How to catch X in Y
    examples.push(`how to catch ${species[0]} in ${locations[0]}`);
    examples.push(`how to catch ${species[1]} in ${locations[1]}`);
  } else if (pattern.includes('Best')) {
    // Best X for Y
    examples.push(`best ${gear[0]} for ${species[0]}`);
    examples.push(`best ${gear[1]} for ${species[1]}`);
  } else {
    // Generic
    examples.push(`${concept} for ${species[0]}`);
    examples.push(`${concept} in ${locations[0]}`);
  }
  
  return examples.slice(0, 5);
}

/**
 * Discover concepts for specific patterns
 */
export async function discoverPatternConcepts(
  pattern: string,
  options: { niche?: string; count?: number; location?: string } = {}
): Promise<ProgrammaticConcept[]> {
  const siteSummary = getSiteSummary();
  const count = options.count || 10;
  
  let query = `Based on this fishing website: "${siteSummary}"

Find ${count} specific keyword opportunities following this pattern: "${pattern}"

For example, if pattern is "X vs. Y", find specific comparisons like:
- "topwater lures vs. soft plastics for snook"
- "spinning reels vs. baitcasting reels for bass"

For each opportunity, provide:
1. The specific keyword/phrase
2. Brief description
3. Estimated search volume (high/medium/low)
4. Difficulty to rank (easy/medium/hard)
5. Content category

Format as a numbered list.`;

  if (options.location) {
    query += `\n\nFocus on ${options.location}.`;
  }

  try {
    const response = await researchTopic(query, {
      model: 'llama-3.1-sonar-small-128k-online',
      temperature: 0.2,
      maxTokens: 2000,
    });

    const concepts = parseConceptsFromResponse(response.answer, count);
    
    // Normalize pattern for all concepts
    return concepts.map(c => ({
      ...c,
      pattern,
    }));
    
  } catch (error) {
    logger.error('Error discovering pattern concepts:', error);
    throw error;
  }
}

/**
 * Get recommended patterns for fishing niche
 */
export function getRecommendedPatterns(): string[] {
  return [
    'X vs. Y',
    'How to Catch X in Y Location',
    'Best X for Y',
    'X Fishing Techniques',
    'X Fishing in Y Season',
    'X Fishing Tips',
    'X Fishing Gear',
    'X vs. Y for Z Species',
    'How to Use X for Y',
    'X Fishing Regulations',
  ];
}
