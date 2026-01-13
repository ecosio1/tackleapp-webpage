/**
 * Fetcher - Fetches content from approved sources
 */

import { SourceRegistryEntry, RawDocument } from './types';
import { isUrlAllowed, normalizeUrl } from './sourceRegistry';
import { logger } from './logger';

/**
 * Rate limiter per source
 */
const rateLimiters = new Map<string, { count: number; resetAt: number }>();

/**
 * Check and enforce rate limit
 */
function checkRateLimit(source: SourceRegistryEntry): boolean {
  const now = Date.now();
  const limiter = rateLimiters.get(source.id);
  
  if (!limiter || now > limiter.resetAt) {
    // Reset or initialize
    rateLimiters.set(source.id, {
      count: 1,
      resetAt: now + 60000, // 1 minute
    });
    return true;
  }
  
  if (limiter.count >= source.rateLimitPerMin) {
    return false; // Rate limited
  }
  
  limiter.count++;
  return true;
}

/**
 * Fetch URL and return raw document
 */
export async function fetchUrl(
  url: string,
  source: SourceRegistryEntry
): Promise<RawDocument> {
  // Normalize URL
  const normalizedUrl = normalizeUrl(url);
  
  // Check if URL is allowed
  if (!isUrlAllowed(normalizedUrl, source)) {
    throw new Error(`URL not allowed: ${normalizedUrl}`);
  }
  
  // Check rate limit
  if (!checkRateLimit(source)) {
    throw new Error(`Rate limit exceeded for source: ${source.name}`);
  }
  
  logger.info(`Fetching: ${normalizedUrl}`);
  
  try {
    // Fetch based on method
    let html: string;
    let text: string;
    
    if (source.fetchMethod === 'api' && source.apiKey) {
      // API fetch
      const response = await fetch(normalizedUrl, {
        headers: {
          ...source.headers,
          'Authorization': `Bearer ${source.apiKey}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`API fetch failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      // Convert JSON to text (simplified - adjust based on API structure)
      text = JSON.stringify(data);
      html = '';
    } else {
      // HTML fetch
      const response = await fetch(normalizedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TackleBot/1.0; +https://tackleapp.ai)',
          ...source.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Fetch failed: ${response.status} ${response.statusText}`);
      }
      
      html = await response.text();
      text = html; // Will be cleaned by extractor
    }
    
    // Create raw document (minimal - extractor will process)
    const rawDoc: RawDocument = {
      sourceId: source.id,
      url: normalizedUrl,
      fetchedAt: new Date().toISOString(),
      title: '', // Will be extracted
      html,
      text,
      headings: [],
      extractedFacts: [],
      entities: [],
      locationHints: [],
      speciesHints: [],
      tags: source.tags,
      contentType: 'unknown',
      language: 'en',
      wordCount: 0,
      qualityScore: 0,
    };
    
    // Update source last fetched
    source.lastFetchedAt = rawDoc.fetchedAt;
    
    return rawDoc;
  } catch (error) {
    logger.error(`Fetch error for ${normalizedUrl}:`, error);
    throw error;
  }
}

/**
 * Fetch multiple URLs (with concurrency limit)
 */
export async function fetchUrls(
  urls: Array<{ url: string; source: SourceRegistryEntry }>,
  maxConcurrent: number = 5
): Promise<Array<{ url: string; doc: RawDocument } | { url: string; error: Error }>> {
  const results: Array<{ url: string; doc: RawDocument } | { url: string; error: Error }> = [];
  
  for (let i = 0; i < urls.length; i += maxConcurrent) {
    const batch = urls.slice(i, i + maxConcurrent);
    
    const batchResults = await Promise.allSettled(
      batch.map(async ({ url, source }) => {
        try {
          const doc = await fetchUrl(url, source);
          return { url, doc };
        } catch (error) {
          return { url, error: error as Error };
        }
      })
    );
    
    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({ url: batch[results.length].url, error: result.reason });
      }
    }
  }
  
  return results;
}



