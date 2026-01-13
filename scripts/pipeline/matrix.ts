/**
 * Head-to-Head Matrix Generator
 * Creates programmatic combinations of entities (species x lures x locations, etc.)
 * Validates combinations with DataForSEO to find best opportunities
 */

import { logger } from './logger';
import { validateKeywords, ValidationOptions } from './validation';

export interface Entity {
  id: string;
  name: string;
  type: 'species' | 'lure' | 'location' | 'technique' | 'season' | 'gear';
  category?: string;
}

export interface MatrixCombination {
  entities: Entity[];
  keyword: string;
  pattern: string; // e.g., "Best {lure} for {species} in {location}"
  searchVolume?: number;
  keywordDifficulty?: number;
  opportunityScore?: number;
  validated: boolean;
  relatedQuestions?: string[];
}

export interface MatrixConfig {
  entities: {
    species?: Entity[];
    lures?: Entity[];
    locations?: Entity[];
    techniques?: Entity[];
    seasons?: Entity[];
    gear?: Entity[];
  };
  patterns: string[]; // e.g., ["Best {lure} for {species}", "How to catch {species} with {lure}"]
  maxCombinations?: number; // Limit total combinations to validate
}

/**
 * Generate fishing entities (DEPRECATED - use entity-discovery.ts instead)
 * This is kept for backward compatibility, but new code should use discoverAllEntities() from entity-discovery.ts
 */
export function getFishingEntities(): MatrixConfig['entities'] {
  logger.warn('⚠️ Using hardcoded entities. Consider using discoverAllEntities() from entity-discovery.ts for Perplexity-generated entities.');
  
  return {
    species: [
      { id: 'redfish', name: 'Redfish', type: 'species' },
      { id: 'snook', name: 'Snook', type: 'species' },
      { id: 'tarpon', name: 'Tarpon', type: 'species' },
      { id: 'speckled-trout', name: 'Speckled Trout', type: 'species' },
      { id: 'bass', name: 'Bass', type: 'species' },
      { id: 'grouper', name: 'Grouper', type: 'species' },
      { id: 'snapper', name: 'Snapper', type: 'species' },
      { id: 'flounder', name: 'Flounder', type: 'species' },
      { id: 'sheepshead', name: 'Sheepshead', type: 'species' },
      { id: 'pompano', name: 'Pompano', type: 'species' },
      { id: 'mackerel', name: 'Mackerel', type: 'species' },
      { id: 'cobia', name: 'Cobia', type: 'species' },
      { id: 'kingfish', name: 'Kingfish', type: 'species' },
      { id: 'wahoo', name: 'Wahoo', type: 'species' },
      { id: 'tuna', name: 'Tuna', type: 'species' },
      { id: 'dolphin', name: 'Dolphin (Mahi)', type: 'species' },
      { id: 'sailfish', name: 'Sailfish', type: 'species' },
      { id: 'marlin', name: 'Marlin', type: 'species' },
      { id: 'bonefish', name: 'Bonefish', type: 'species' },
      { id: 'permit', name: 'Permit', type: 'species' },
    ],
    lures: [
      { id: 'topwater', name: 'Topwater Lures', type: 'lure' },
      { id: 'soft-plastics', name: 'Soft Plastics', type: 'lure' },
      { id: 'jigs', name: 'Jigs', type: 'lure' },
      { id: 'spinnerbaits', name: 'Spinnerbaits', type: 'lure' },
      { id: 'crankbaits', name: 'Crankbaits', type: 'lure' },
      { id: 'spoons', name: 'Spoons', type: 'lure' },
      { id: 'swimbaits', name: 'Swimbaits', type: 'lure' },
      { id: 'poppers', name: 'Poppers', type: 'lure' },
      { id: 'walking-baits', name: 'Walking Baits', type: 'lure' },
      { id: 'flukes', name: 'Flukes', type: 'lure' },
      { id: 'shrimp-imitations', name: 'Shrimp Imitations', type: 'lure' },
      { id: 'crab-imitations', name: 'Crab Imitations', type: 'lure' },
      { id: 'jerkbaits', name: 'Jerkbaits', type: 'lure' },
      { id: 'spinnerbaits', name: 'Spinnerbaits', type: 'lure' },
      { id: 'buzzbaits', name: 'Buzzbaits', type: 'lure' },
      { id: 'chatterbaits', name: 'Chatterbaits', type: 'lure' },
      { id: 'swim-jigs', name: 'Swim Jigs', type: 'lure' },
      { id: 'drop-shot', name: 'Drop Shot Rigs', type: 'lure' },
      { id: 'wacky-rig', name: 'Wacky Rigs', type: 'lure' },
      { id: 'texas-rig', name: 'Texas Rigs', type: 'lure' },
    ],
    locations: [
      { id: 'florida', name: 'Florida', type: 'location' },
      { id: 'miami', name: 'Miami', type: 'location' },
      { id: 'tampa', name: 'Tampa', type: 'location' },
      { id: 'key-west', name: 'Key West', type: 'location' },
      { id: 'orlando', name: 'Orlando', type: 'location' },
      { id: 'jacksonville', name: 'Jacksonville', type: 'location' },
      { id: 'fort-lauderdale', name: 'Fort Lauderdale', type: 'location' },
      { id: 'naples', name: 'Naples', type: 'location' },
      { id: 'sarasota', name: 'Sarasota', type: 'location' },
      { id: 'panama-city', name: 'Panama City', type: 'location' },
      { id: 'destin', name: 'Destin', type: 'location' },
      { id: 'pensacola', name: 'Pensacola', type: 'location' },
      { id: 'texas', name: 'Texas', type: 'location' },
      { id: 'louisiana', name: 'Louisiana', type: 'location' },
      { id: 'california', name: 'California', type: 'location' },
      { id: 'north-carolina', name: 'North Carolina', type: 'location' },
      { id: 'south-carolina', name: 'South Carolina', type: 'location' },
      { id: 'georgia', name: 'Georgia', type: 'location' },
      { id: 'alabama', name: 'Alabama', type: 'location' },
      { id: 'mississippi', name: 'Mississippi', type: 'location' },
    ],
    techniques: [
      { id: 'jigging', name: 'Jigging', type: 'technique' },
      { id: 'trolling', name: 'Trolling', type: 'technique' },
      { id: 'bottom-fishing', name: 'Bottom Fishing', type: 'technique' },
      { id: 'fly-fishing', name: 'Fly Fishing', type: 'technique' },
      { id: 'surf-fishing', name: 'Surf Fishing', type: 'technique' },
      { id: 'kayak-fishing', name: 'Kayak Fishing', type: 'technique' },
      { id: 'pier-fishing', name: 'Pier Fishing', type: 'technique' },
      { id: 'bridge-fishing', name: 'Bridge Fishing', type: 'technique' },
      { id: 'wade-fishing', name: 'Wade Fishing', type: 'technique' },
      { id: 'drift-fishing', name: 'Drift Fishing', type: 'technique' },
    ],
    seasons: [
      { id: 'spring', name: 'Spring', type: 'season' },
      { id: 'summer', name: 'Summer', type: 'season' },
      { id: 'fall', name: 'Fall', type: 'season' },
      { id: 'winter', name: 'Winter', type: 'season' },
    ],
  };
}

/**
 * Generate matrix combinations
 */
export function generateMatrixCombinations(config: MatrixConfig): MatrixCombination[] {
  logger.info('Generating matrix combinations...');
  
  const combinations: MatrixCombination[] = [];
  const { entities, patterns } = config;
  const maxCombinations = config.maxCombinations || 1000;
  
  // Generate combinations for each pattern
  for (const pattern of patterns) {
    const placeholders = pattern.match(/\{(\w+)\}/g) || [];
    const entityTypes = placeholders.map(p => p.replace(/[{}]/g, ''));
    
    // Get entity arrays for this pattern
    const entityArrays: Entity[][] = entityTypes.map(type => {
      const key = type as keyof typeof entities;
      return entities[key] || [];
    });
    
    // Generate all combinations
    const patternCombinations = generateCombinations(entityArrays, pattern);
    
    for (const combo of patternCombinations) {
      if (combinations.length >= maxCombinations) {
        logger.warn(`Reached max combinations limit: ${maxCombinations}`);
        break;
      }
      
      const keyword = formatKeyword(pattern, combo);
      combinations.push({
        entities: combo,
        keyword,
        pattern,
        validated: false,
      });
    }
    
    if (combinations.length >= maxCombinations) break;
  }
  
  logger.info(`Generated ${combinations.length} matrix combinations`);
  return combinations;
}

/**
 * Generate all combinations from entity arrays
 */
function generateCombinations(arrays: Entity[][], pattern: string): Entity[][] {
  if (arrays.length === 0) return [];
  if (arrays.length === 1) return arrays[0].map(e => [e]);
  
  const [first, ...rest] = arrays;
  const restCombinations = generateCombinations(rest, pattern);
  
  const combinations: Entity[][] = [];
  for (const entity of first) {
    for (const restCombo of restCombinations) {
      combinations.push([entity, ...restCombo]);
    }
  }
  
  return combinations;
}

/**
 * Format keyword from pattern and entities
 */
function formatKeyword(pattern: string, entities: Entity[]): string {
  let keyword = pattern;
  const placeholders = pattern.match(/\{(\w+)\}/g) || [];
  
  for (let i = 0; i < placeholders.length && i < entities.length; i++) {
    const placeholder = placeholders[i];
    const entity = entities[i];
    keyword = keyword.replace(placeholder, entity.name.toLowerCase());
  }
  
  return keyword;
}

/**
 * Validate matrix combinations with DataForSEO
 */
export async function validateMatrixCombinations(
  combinations: MatrixCombination[],
  options: ValidationOptions = {}
): Promise<MatrixCombination[]> {
  logger.info(`Validating ${combinations.length} matrix combinations...`);
  
  // Extract keywords
  const keywords = combinations.map(c => c.keyword);
  
  // Validate with DataForSEO
  const validatedKeywords = await validateKeywords(keywords, {
    minVolume: options.minVolume || 200,
    maxVolume: options.maxVolume || 500,
    intent: 'informational',
    location: options.location,
    includeQuestions: true,
  });
  
  // Create a map of validated keywords
  const validatedMap = new Map(
    validatedKeywords.map(k => [k.keyword.toLowerCase(), k])
  );
  
  // Update combinations with validation data
  const validatedCombinations = combinations.map(combo => {
    const validated = validatedMap.get(combo.keyword.toLowerCase());
    
    if (validated) {
      return {
        ...combo,
        searchVolume: validated.searchVolume,
        keywordDifficulty: validated.keywordDifficulty,
        opportunityScore: validated.opportunityScore,
        validated: true,
        relatedQuestions: validated.relatedQuestions,
      };
    }
    
    return {
      ...combo,
      validated: false,
    };
  });
  
  // Sort by opportunity score (highest first)
  validatedCombinations.sort((a, b) => {
    if (a.validated && !b.validated) return -1;
    if (!a.validated && b.validated) return 1;
    return (b.opportunityScore || 0) - (a.opportunityScore || 0);
  });
  
  const validCount = validatedCombinations.filter(c => c.validated).length;
  logger.info(`Validated ${validCount}/${combinations.length} combinations`);
  
  return validatedCombinations;
}

/**
 * Calculate matrix statistics
 */
export function calculateMatrixStats(combinations: MatrixCombination[]): {
  totalCombinations: number;
  validatedCount: number;
  totalVolume: number;
  averageDifficulty: number;
  topOpportunities: MatrixCombination[];
  byPattern: Record<string, number>;
} {
  const validated = combinations.filter(c => c.validated);
  const totalVolume = validated.reduce((sum, c) => sum + (c.searchVolume || 0), 0);
  const avgDifficulty = validated.length > 0
    ? validated.reduce((sum, c) => sum + (c.keywordDifficulty || 0), 0) / validated.length
    : 0;
  
  const topOpportunities = validated
    .sort((a, b) => (b.opportunityScore || 0) - (a.opportunityScore || 0))
    .slice(0, 20);
  
  const byPattern: Record<string, number> = {};
  validated.forEach(c => {
    byPattern[c.pattern] = (byPattern[c.pattern] || 0) + 1;
  });
  
  return {
    totalCombinations: combinations.length,
    validatedCount: validated.length,
    totalVolume,
    averageDifficulty: Math.round(avgDifficulty),
    topOpportunities,
    byPattern,
  };
}
