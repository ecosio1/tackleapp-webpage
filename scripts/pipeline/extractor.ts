/**
 * Extractor - Extracts facts and structure from raw documents
 * IMPORTANT: We extract facts only, never store verbatim content
 */

import { RawDocument, Fact, Entity, Heading } from './types';
import { logger } from './logger';

/**
 * Extract title from HTML or text
 */
function extractTitle(raw: RawDocument): string {
  if (raw.html) {
    // Try to extract from HTML
    const h1Match = raw.html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (h1Match) {
      return cleanText(h1Match[1]);
    }
    
    const titleMatch = raw.html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch) {
      return cleanText(titleMatch[1]);
    }
  }
  
  // Fallback: use first line of text
  const firstLine = raw.text.split('\n')[0].trim();
  return firstLine.substring(0, 200); // Max 200 chars
}

/**
 * Extract headings from HTML or text
 */
function extractHeadings(raw: RawDocument): Heading[] {
  const headings: Heading[] = [];
  
  if (raw.html) {
    // Extract H1, H2, H3 from HTML
    const h1Matches = raw.html.matchAll(/<h1[^>]*>(.*?)<\/h1>/gi);
    for (const match of h1Matches) {
      headings.push({
        level: 1,
        text: cleanText(match[1]),
        id: slugify(match[1]),
      });
    }
    
    const h2Matches = raw.html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi);
    for (const match of h2Matches) {
      headings.push({
        level: 2,
        text: cleanText(match[1]),
        id: slugify(match[1]),
      });
    }
    
    const h3Matches = raw.html.matchAll(/<h3[^>]*>(.*?)<\/h3>/gi);
    for (const match of h3Matches) {
      headings.push({
        level: 3,
        text: cleanText(match[1]),
        id: slugify(match[1]),
      });
    }
  } else {
    // Extract from text (look for lines starting with #)
    const lines = raw.text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ')) {
        headings.push({
          level: 3,
          text: cleanText(trimmed.substring(4)),
          id: slugify(trimmed.substring(4)),
        });
      } else if (trimmed.startsWith('## ')) {
        headings.push({
          level: 2,
          text: cleanText(trimmed.substring(3)),
          id: slugify(trimmed.substring(3)),
        });
      } else if (trimmed.startsWith('# ')) {
        headings.push({
          level: 1,
          text: cleanText(trimmed.substring(2)),
          id: slugify(trimmed.substring(2)),
        });
      }
    }
  }
  
  return headings;
}

/**
 * Extract facts from content (lightweight fact harvesting)
 * Only extracts short paraphrased summaries, not full content
 */
function extractFacts(raw: RawDocument): Fact[] {
  const facts: Fact[] = [];
  const text = raw.text.toLowerCase();
  
  // Extract from bullet lists
  const bulletMatches = raw.html
    ? raw.html.matchAll(/<li[^>]*>(.*?)<\/li>/gi)
    : raw.text.matchAll(/^[-*•]\s+(.+)$/gm);
  
  for (const match of bulletMatches) {
    const bulletText = cleanText(match[1] || match[0]);
    if (bulletText.length > 20 && bulletText.length < 200) {
      // Create fact from bullet point
      facts.push({
        claim: bulletText.substring(0, 150), // Truncate long bullets
        confidence: 0.7,
        supportingSources: [raw.url],
        observedAt: raw.fetchedAt,
        scope: 'global',
        category: inferCategory(bulletText),
      });
    }
  }
  
  // Extract from short paragraphs (2-3 sentences)
  const sentences = raw.text.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length > 30 && trimmed.length < 300) {
      // Check if it's a factual claim (heuristic)
      if (isFactualClaim(trimmed)) {
        facts.push({
          claim: trimmed.substring(0, 200), // Truncate
          confidence: 0.6,
          supportingSources: [raw.url],
          observedAt: raw.fetchedAt,
          scope: inferScope(trimmed),
          category: inferCategory(trimmed),
        });
      }
    }
  }
  
  // Limit to top 20 facts (by length - prefer concise)
  return facts
    .sort((a, b) => a.claim.length - b.claim.length)
    .slice(0, 20);
}

/**
 * Extract entities (species, locations, etc.)
 */
function extractEntities(raw: RawDocument): Entity[] {
  const entities: Entity[] = [];
  const text = raw.text.toLowerCase();
  
  // Common species names (simplified - use NER in production)
  const speciesPatterns = [
    /\b(redfish|red drum)\b/gi,
    /\b(snook)\b/gi,
    /\b(tarpon)\b/gi,
    /\b(speckled trout|sea trout)\b/gi,
    /\b(flounder)\b/gi,
    /\b(sheepshead)\b/gi,
    /\b(bass)\b/gi,
    /\b(grouper)\b/gi,
    /\b(snapper)\b/gi,
  ];
  
  for (const pattern of speciesPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      entities.push({
        text: match[0],
        type: 'species',
        confidence: 0.8,
        normalized: normalizeSpeciesName(match[0]),
      });
    }
  }
  
  // Location patterns
  const locationPatterns = [
    /\b(florida|fl)\b/gi,
    /\b(miami|tampa|orlando|key west)\b/gi,
    /\b(texas|tx)\b/gi,
    /\b(california|ca)\b/gi,
  ];
  
  for (const pattern of locationPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      entities.push({
        text: match[0],
        type: 'location',
        confidence: 0.7,
        normalized: normalizeLocation(match[0]),
      });
    }
  }
  
  // Deduplicate
  const seen = new Set<string>();
  return entities.filter((e) => {
    const key = e.normalized || e.text.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Extract location and species hints
 */
function extractHints(raw: RawDocument, entities: Entity[]): {
  locationHints: string[];
  speciesHints: string[];
} {
  const locationHints = new Set<string>();
  const speciesHints = new Set<string>();
  
  for (const entity of entities) {
    if (entity.type === 'location' && entity.normalized) {
      locationHints.add(entity.normalized);
    } else if (entity.type === 'species' && entity.normalized) {
      speciesHints.add(entity.normalized);
    }
  }
  
  return {
    locationHints: Array.from(locationHints),
    speciesHints: Array.from(speciesHints),
  };
}

/**
 * Calculate quality score
 */
function calculateQualityScore(raw: RawDocument): number {
  let score = 0;
  
  // Has title
  if (raw.title.length > 10) score += 0.2;
  
  // Has headings
  if (raw.headings.length >= 2) score += 0.2;
  
  // Has facts
  if (raw.extractedFacts.length >= 5) score += 0.2;
  
  // Word count (200-5000 words is good)
  if (raw.wordCount >= 200 && raw.wordCount <= 5000) score += 0.2;
  
  // Has entities
  if (raw.entities.length >= 2) score += 0.2;
  
  return Math.min(score, 1.0);
}

/**
 * Main extraction function
 */
export function extract(raw: RawDocument): RawDocument {
  logger.info(`Extracting from: ${raw.url}`);
  
  // Extract title
  raw.title = extractTitle(raw);
  
  // Extract headings
  raw.headings = extractHeadings(raw);
  
  // Extract facts (lightweight)
  raw.extractedFacts = extractFacts(raw);
  
  // Extract entities
  raw.entities = extractEntities(raw);
  
  // Extract hints
  const hints = extractHints(raw, raw.entities);
  raw.locationHints = hints.locationHints;
  raw.speciesHints = hints.speciesHints;
  
  // Calculate word count
  raw.wordCount = raw.text.split(/\s+/).length;
  
  // Calculate quality score
  raw.qualityScore = calculateQualityScore(raw);
  
  // Determine content type
  if (raw.headings.some((h) => h.text.toLowerCase().includes('how to'))) {
    raw.contentType = 'guide';
  } else if (raw.headings.length >= 3) {
    raw.contentType = 'article';
  } else {
    raw.contentType = 'unknown';
  }
  
  // Reject if quality too low
  if (raw.qualityScore < 0.3 || raw.wordCount < 200) {
    logger.warn(`Low quality document: ${raw.url} (score: ${raw.qualityScore}, words: ${raw.wordCount})`);
  }
  
  return raw;
}

// Helper functions

function cleanText(text: string): string {
  return text
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeSpeciesName(name: string): string {
  const normalized = name.toLowerCase().trim();
  const mappings: Record<string, string> = {
    'red drum': 'redfish',
    'sea trout': 'speckled-trout',
  };
  return mappings[normalized] || normalized.replace(/\s+/g, '-');
}

function normalizeLocation(location: string): string {
  const normalized = location.toLowerCase().trim();
  const mappings: Record<string, string> = {
    'fl': 'florida',
    'tx': 'texas',
    'ca': 'california',
    'key west': 'key-west',
  };
  return mappings[normalized] || normalized.replace(/\s+/g, '-');
}

function isFactualClaim(text: string): boolean {
  // Heuristic: factual claims often contain numbers, specific terms
  const factualIndicators = [
    /\d+/, // Contains numbers
    /\b(typically|usually|often|commonly|generally)\b/i,
    /\b(inches|feet|pounds|degrees)\b/i,
    /\b(habitat|diet|behavior|size)\b/i,
  ];
  
  return factualIndicators.some((pattern) => pattern.test(text));
}

function inferScope(text: string): Fact['scope'] {
  const lower = text.toLowerCase();
  if (lower.includes('florida') || lower.includes('fl ')) return 'regional';
  if (lower.includes('winter') || lower.includes('summer') || lower.includes('season')) return 'seasonal';
  if (lower.includes('miami') || lower.includes('tampa')) return 'location-specific';
  return 'global';
}

function inferCategory(text: string): Fact['category'] {
  const lower = text.toLowerCase();
  if (lower.includes('habitat') || lower.includes('water') || lower.includes('depth')) return 'habitat';
  if (lower.includes('feed') || lower.includes('eat') || lower.includes('diet')) return 'diet';
  if (lower.includes('size') || lower.includes('inches') || lower.includes('pounds')) return 'size';
  if (lower.includes('season') || lower.includes('winter') || lower.includes('summer')) return 'season';
  if (lower.includes('technique') || lower.includes('method') || lower.includes('how')) return 'technique';
  if (lower.includes('weather') || lower.includes('wind') || lower.includes('tide')) return 'weather';
  return 'other';
}



