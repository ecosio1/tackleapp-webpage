/**
 * Source Registry - Approved sources for content extraction
 */

import { SourceRegistryEntry } from './types';

/**
 * Approved sources for fact extraction
 * IMPORTANT: We extract facts only, never copy-paste content
 */
export const APPROVED_SOURCES: SourceRegistryEntry[] = [
  // Weather/Conditions Sources
  {
    id: 'src-001',
    name: 'NOAA Weather Service',
    homepage: 'https://www.weather.gov',
    allowedPaths: ['/marine', '/forecasts'],
    disallowedPaths: ['/archive', '/historical'],
    rateLimitPerMin: 10,
    fetchMethod: 'api',
    tags: ['weather-conditions'],
    notes: 'Official weather data - educational use only. Extract facts about weather patterns.',
    status: 'active',
  },
  {
    id: 'src-002',
    name: 'Weather Underground - Marine',
    homepage: 'https://www.wunderground.com',
    allowedPaths: ['/marine'],
    disallowedPaths: ['/premium', '/api'],
    rateLimitPerMin: 5,
    fetchMethod: 'html',
    tags: ['weather-conditions'],
    notes: 'Marine weather concepts - extract educational facts only.',
    status: 'active',
  },
  
  // Tides/Solunar Sources
  {
    id: 'src-003',
    name: 'NOAA Tides & Currents',
    homepage: 'https://tidesandcurrents.noaa.gov',
    allowedPaths: ['/tides', '/predictions'],
    disallowedPaths: [],
    rateLimitPerMin: 15,
    fetchMethod: 'api',
    tags: ['tides-solunar'],
    notes: 'Tide data and explanations - extract concepts, not copy explanations.',
    status: 'active',
  },
  {
    id: 'src-004',
    name: 'Solunar Fishing Times',
    homepage: 'https://www.solunarforecast.com',
    allowedPaths: ['/fishing-times'],
    disallowedPaths: ['/premium'],
    rateLimitPerMin: 5,
    fetchMethod: 'html',
    tags: ['tides-solunar'],
    notes: 'Solunar concepts - educational facts only.',
    status: 'active',
  },
  
  // Species Biology Sources
  {
    id: 'src-005',
    name: 'FishBase',
    homepage: 'https://www.fishbase.se',
    allowedPaths: ['/summary'],
    disallowedPaths: [],
    rateLimitPerMin: 20,
    fetchMethod: 'api',
    tags: ['species-biology'],
    notes: 'Species biology database - extract facts about habitat, diet, behavior. Never copy descriptions verbatim.',
    status: 'active',
  },
  {
    id: 'src-006',
    name: 'Florida Fish and Wildlife Conservation Commission',
    homepage: 'https://myfwc.com',
    allowedPaths: ['/wildlifehabitats/profiles', '/fishing/saltwater'],
    disallowedPaths: ['/regulations', '/licenses'],
    rateLimitPerMin: 10,
    fetchMethod: 'html',
    tags: ['species-biology'],
    notes: 'Species profiles - extract habitat and behavior facts. Do NOT extract regulations.',
    status: 'active',
  },
  {
    id: 'src-007',
    name: 'NOAA Fisheries',
    homepage: 'https://www.fisheries.noaa.gov',
    allowedPaths: ['/species'],
    disallowedPaths: ['/regulations', '/management'],
    rateLimitPerMin: 15,
    fetchMethod: 'api',
    tags: ['species-biology'],
    notes: 'Species information - extract biology facts only.',
    status: 'active',
  },
  
  // Seasonal Patterns Sources
  {
    id: 'src-008',
    name: 'Salt Water Sportsman - Seasonal Guides',
    homepage: 'https://www.saltwatersportsman.com',
    allowedPaths: ['/fishing-tips', '/seasonal'],
    disallowedPaths: ['/premium', '/subscription'],
    rateLimitPerMin: 3,
    fetchMethod: 'html',
    tags: ['seasonal-patterns'],
    notes: 'Seasonal fishing patterns - extract general patterns, not specific articles. Rewrite all concepts.',
    status: 'active',
  },
  
  // Technique Guides Sources
  {
    id: 'src-009',
    name: 'Take Me Fishing - Techniques',
    homepage: 'https://www.takemefishing.org',
    allowedPaths: ['/how-to-fish'],
    disallowedPaths: [],
    rateLimitPerMin: 5,
    fetchMethod: 'html',
    tags: ['technique-guides'],
    notes: 'General fishing techniques - extract concepts, create original explanations.',
    status: 'active',
  },
  
  // Additional placeholder source
  {
    id: 'src-010',
    name: 'Fishing Education Resource',
    homepage: 'https://example.com',
    allowedPaths: ['/guides', '/articles'],
    disallowedPaths: ['/premium'],
    rateLimitPerMin: 5,
    fetchMethod: 'html',
    tags: ['technique-guides', 'species-biology'],
    notes: 'Placeholder source - replace with actual source when available.',
    status: 'paused',
  },
];

/**
 * Check if URL is allowed for a source
 */
export function isUrlAllowed(url: string, source: SourceRegistryEntry): boolean {
  const urlObj = new URL(url);
  const sourceUrl = new URL(source.homepage);
  
  // Must be from same domain
  if (urlObj.hostname !== sourceUrl.hostname) {
    return false;
  }
  
  // Check disallowed paths first
  for (const disallowed of source.disallowedPaths) {
    if (urlObj.pathname.includes(disallowed)) {
      return false;
    }
  }
  
  // Check allowed paths
  if (source.allowedPaths.length === 0) {
    return true; // No restrictions
  }
  
  for (const allowed of source.allowedPaths) {
    if (urlObj.pathname.includes(allowed)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Normalize URL (strip UTM params, fragments, etc.)
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Remove fragment
    urlObj.hash = '';
    
    // Remove UTM and tracking parameters
    const paramsToRemove = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'gclid',
      'ref',
      'source',
    ];
    
    paramsToRemove.forEach((param) => {
      urlObj.searchParams.delete(param);
    });
    
    // Remove trailing slash
    let pathname = urlObj.pathname;
    if (pathname.endsWith('/') && pathname.length > 1) {
      pathname = pathname.slice(0, -1);
    }
    urlObj.pathname = pathname;
    
    return urlObj.toString();
  } catch (error) {
    // Invalid URL, return as-is
    return url;
  }
}

/**
 * Get source by ID
 */
export function getSourceById(id: string): SourceRegistryEntry | undefined {
  return APPROVED_SOURCES.find((s) => s.id === id);
}

/**
 * Get active sources
 */
export function getActiveSources(): SourceRegistryEntry[] {
  return APPROVED_SOURCES.filter((s) => s.status === 'active');
}



