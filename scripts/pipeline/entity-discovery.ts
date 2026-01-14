/**
 * Entity Discovery Module
 * Uses Perplexity to brainstorm entities (species, gear types, etc.)
 * Step 1 of the combined workflow: Generate the seed entities before creating combinations
 */

import { logger } from './logger';
import { researchTopic } from './perplexity';
import { Entity } from './matrix';

export interface EntityDiscoveryOptions {
  entityType: 'species' | 'gear' | 'lure' | 'location' | 'technique';
  count?: number; // Number of entities to discover (default: 20)
  niche?: string; // Fishing niche context
  location?: string; // Optional location focus
}

/**
 * Get site context for Perplexity
 */
function getSiteContext(): string {
  return `Tackle is an AI-powered fishing companion iOS app. The website focuses on SEO content for:
- Species fishing guides (how to catch specific fish)
- How-to guides (fishing techniques, gear usage)
- Location guides (best fishing spots)
- Blog posts (tips, gear reviews, conditions)
- Tool comparisons (lures, rods, reels, etc.)

Target audience: Weekend anglers, tournament fishermen, new fishermen, traveling anglers.`;
}

/**
 * Discover entities using Perplexity
 * This is Step 1 of the combined workflow - brainstorm entities before creating combinations
 */
export async function discoverEntities(
  options: EntityDiscoveryOptions
): Promise<Entity[]> {
  logger.info(`Discovering ${options.count || 20} ${options.entityType} entities using Perplexity...`);
  
  const count = options.count || 20;
  const siteContext = getSiteContext();
  
  // Build query based on entity type
  let query = '';
  
  switch (options.entityType) {
    case 'species':
      query = `Based on this fishing website context: "${siteContext}"

List ${count} fish species that would be valuable for programmatic SEO content. These should be species that:
- Anglers actively search for fishing information about
- Have sufficient search volume for "best lures for X" or "how to catch X" queries
- Are commonly targeted by recreational fishermen
- Work well in combination pages (e.g., "Best lures for Redfish in Florida")

For each species, provide:
1. The common name (e.g., "Redfish", "Snook", "Tarpon")
2. A brief note on why it's valuable for SEO content

Format as a numbered list: "1. Species Name - reason"`;
      break;
      
    case 'gear':
    case 'lure':
      query = `Based on this fishing website context: "${siteContext}"

List ${count} types of fishing gear/lures that would be valuable for programmatic SEO content. These should be gear types that:
- Anglers actively search for comparisons and recommendations
- Work well in "Best X for Y" or "X vs. Y" type content
- Have sufficient search volume for combination queries
- Are commonly used by recreational fishermen

For each gear/lure type, provide:
1. The gear/lure name (e.g., "Topwater Lures", "Soft Plastics", "Jigs")
2. A brief note on why it's valuable for SEO content

Format as a numbered list: "1. Gear Name - reason"`;
      break;
      
    case 'location':
      query = `Based on this fishing website context: "${siteContext}"

List ${count} fishing locations (states, cities, regions) that would be valuable for programmatic SEO content. These should be locations that:
- Have active fishing communities
- Generate search volume for location-specific fishing queries
- Work well in "Best X for Y in Z" type content
- Are popular fishing destinations

For each location, provide:
1. The location name (e.g., "Florida", "Miami", "Tampa Bay")
2. A brief note on why it's valuable for SEO content

Format as a numbered list: "1. Location Name - reason"`;
      break;
      
    case 'technique':
      query = `Based on this fishing website context: "${siteContext}"

List ${count} fishing techniques that would be valuable for programmatic SEO content. These should be techniques that:
- Anglers actively search for information about
- Work well in combination content (e.g., "Jigging techniques for Snook")
- Have sufficient search volume
- Are commonly used by recreational fishermen

For each technique, provide:
1. The technique name (e.g., "Jigging", "Trolling", "Topwater Fishing")
2. A brief note on why it's valuable for SEO content

Format as a numbered list: "1. Technique Name - reason"`;
      break;
  }
  
  // Add location context if provided
  if (options.location) {
    query += `\n\nFocus on entities relevant to ${options.location}.`;
  }
  
  // Add niche context if provided
  if (options.niche) {
    query += `\n\nNiche focus: ${options.niche}`;
  }
  
  try {
    logger.info(`Querying Perplexity to brainstorm ${options.entityType} entities...`);
    const response = await researchTopic(query, {
      model: 'llama-3.1-sonar-large-128k-online', // Use larger model for better brainstorming
      temperature: 0.4, // Slightly higher for more creativity
      maxTokens: 2000,
    });
    
    // Parse entities from response
    const entities = parseEntitiesFromResponse(response.answer, options.entityType, count);
    
    logger.info(`✅ Discovered ${entities.length} ${options.entityType} entities from Perplexity`);
    
    return entities;
  } catch (error) {
    logger.error(`Failed to discover ${options.entityType} entities:`, error);
    // Return fallback entities if Perplexity fails
    return getFallbackEntities(options.entityType, count);
  }
}

/**
 * Parse entities from Perplexity response
 */
function parseEntitiesFromResponse(
  answer: string,
  entityType: EntityDiscoveryOptions['entityType'],
  expectedCount: number
): Entity[] {
  const entities: Entity[] = [];
  const lines = answer.split('\n');
  
  for (const line of lines) {
    // Match numbered list format: "1. Entity Name - reason" or "1. Entity Name"
    const match = line.match(/^\d+[\.\)]\s*(.+?)(?:\s*[-–]\s*(.+))?$/);
    if (match) {
      const entityName = match[1].trim();
      
      // Skip if too short or looks like a description
      if (entityName.length < 2 || entityName.length > 50) continue;
      
      // Generate ID from name (slugify)
      const id = entityName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      entities.push({
        id,
        name: entityName,
        type: entityType === 'gear' ? 'lure' : entityType,
      });
      
      if (entities.length >= expectedCount) break;
    }
  }
  
  // If we didn't get enough, try less strict parsing
  if (entities.length < expectedCount) {
    // Try to find entities in other formats
    const words = answer.split(/\s+/);
    const capitalizedWords = words.filter(w => 
      w.length > 3 && 
      /^[A-Z][a-z]+$/.test(w) &&
      !['Fishing', 'Anglers', 'Species', 'Location', 'Technique', 'Gear', 'Lure'].includes(w)
    );
    
    for (const word of capitalizedWords) {
      if (entities.length >= expectedCount) break;
      if (entities.some(e => e.name.toLowerCase() === word.toLowerCase())) continue;
      
      const id = word.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      entities.push({
        id,
        name: word,
        type: entityType === 'gear' ? 'lure' : entityType,
      });
    }
  }
  
  return entities.slice(0, expectedCount);
}

/**
 * Fallback entities if Perplexity fails
 */
function getFallbackEntities(
  entityType: EntityDiscoveryOptions['entityType'],
  count: number
): Entity[] {
  const fallback: Record<string, Entity[]> = {
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
    lure: [
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
      { id: 'buzzbaits', name: 'Buzzbaits', type: 'lure' },
      { id: 'chatterbaits', name: 'Chatterbaits', type: 'lure' },
      { id: 'swim-jigs', name: 'Swim Jigs', type: 'lure' },
      { id: 'drop-shot', name: 'Drop Shot Rigs', type: 'lure' },
      { id: 'wacky-rig', name: 'Wacky Rigs', type: 'lure' },
      { id: 'texas-rig', name: 'Texas Rigs', type: 'lure' },
      { id: 'carolina-rig', name: 'Carolina Rigs', type: 'lure' },
    ],
    gear: [
      { id: 'topwater', name: 'Topwater Lures', type: 'lure' },
      { id: 'soft-plastics', name: 'Soft Plastics', type: 'lure' },
      { id: 'jigs', name: 'Jigs', type: 'lure' },
      { id: 'spinnerbaits', name: 'Spinnerbaits', type: 'lure' },
      { id: 'crankbaits', name: 'Crankbaits', type: 'lure' },
    ],
  };
  
  return (fallback[entityType] || []).slice(0, count);
}

/**
 * Discover multiple entity types at once
 * Used for the combined workflow: brainstorm all entities, then create combinations
 */
export async function discoverAllEntities(options: {
  speciesCount?: number;
  gearCount?: number;
  locationCount?: number;
  techniqueCount?: number;
  niche?: string;
  location?: string;
}): Promise<{
  species: Entity[];
  lures: Entity[];
  locations: Entity[];
  techniques: Entity[];
}> {
  logger.info('Step 1: Brainstorming entities with Perplexity...');
  
  const [
    species,
    lures,
    locations,
    techniques,
  ] = await Promise.all([
    discoverEntities({ entityType: 'species', count: options.speciesCount || 20, niche: options.niche, location: options.location }),
    discoverEntities({ entityType: 'gear', count: options.gearCount || 20, niche: options.niche, location: options.location }),
    options.locationCount ? discoverEntities({ entityType: 'location', count: options.locationCount, niche: options.niche, location: options.location }) : Promise.resolve([]),
    options.techniqueCount ? discoverEntities({ entityType: 'technique', count: options.techniqueCount, niche: options.niche, location: options.location }) : Promise.resolve([]),
  ]);
  
  logger.info(`✅ Discovered entities:`);
  logger.info(`   - ${species.length} species`);
  logger.info(`   - ${lures.length} gear/lure types`);
  logger.info(`   - ${locations.length} locations`);
  logger.info(`   - ${techniques.length} techniques`);
  
  return {
    species,
    lures,
    locations,
    techniques,
  };
}
