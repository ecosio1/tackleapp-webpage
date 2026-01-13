/**
 * Ideation Module - Traffic Engine (Upstream System)
 *
 * ROLE: Discover, validate, and rank blog opportunities
 *
 * DOES:
 * - ✅ Discover low-competition, high-intent informational queries
 * - ✅ Validate search volume and difficulty (DataForSEO)
 * - ✅ Output ranked blog opportunities
 *
 * DOES NOT:
 * - ❌ Generate content (that's the generation system)
 * - ❌ Decide formatting (that's the generation system)
 * - ❌ Handle publishing (that's the publishing system)
 *
 * OUTPUT: Ranked list of BlogIdea[] objects
 * HANDOFF: Opportunities pass to generation system
 *
 * See: docs/IDEATION-SYSTEM.md for full documentation
 */

import { logger } from './logger';

const DATAFORSEO_API_URL = 'https://api.dataforseo.com';
const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN || process.env.DATAFORSEO_EMAIL;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD || process.env.DATAFORSEO_API_KEY;

/**
 * Blog idea generated from keyword research
 */
export interface BlogIdea {
  keyword: string;
  searchVolume: number;
  keywordDifficulty: number; // 0-100
  cpc: number;
  searchIntent: 'informational' | 'commercial' | 'navigational' | 'transactional';
  location?: string; // 'florida', 'texas', etc.
  category: string; // 'fishing-tips', 'gear-reviews', etc.
  relatedQuestions: string[]; // For FAQ section
  serpFeatures: string[]; // 'featured_snippet', 'people_also_ask', etc.
  opportunityScore: number; // Calculated score (0-100) - higher = better opportunity
  slug: string; // Generated from keyword
  title: string; // Generated from keyword + intent
}

/**
 * Keyword research data from DataForSEO
 */
export interface KeywordData {
  keyword: string;
  searchVolume: number;
  keywordDifficulty: number;
  cpc: number;
  competition: 'low' | 'medium' | 'high';
  trends?: Array<{ month: string; volume: number }>;
  relatedKeywords: string[];
  questions: string[];
  serpFeatures: string[];
}

/**
 * Generate blog ideas using DataForSEO + Perplexity in tandem
 */
export async function generateBlogIdeas(options: {
  category: string;
  location?: string;
  maxIdeas: number;
  minSearchVolume?: number; // Only filters keywords with volume > 0
  maxDifficulty?: number; // Only filters keywords with difficulty > 0
}): Promise<BlogIdea[]> {
  logger.info(`Generating blog ideas for category: ${options.category}`);
  
  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    throw new Error('DataForSEO credentials not found. Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD environment variables.');
  }
  
  // STEP 1: Use Perplexity to discover blog topic opportunities
  logger.info('🔍 Step 1: Using Perplexity to discover blog opportunities...');
  const perplexityIdeas = await discoverBlogIdeasWithPerplexity(options.category, options.location);
  logger.info(`Perplexity discovered ${perplexityIdeas.length} potential blog topics`);
  
  // STEP 2: Build seed keywords (combine Perplexity ideas + category-based)
  const seedKeywords = [
    ...getSeedKeywords(options.category, options.location),
    ...perplexityIdeas.slice(0, 10).map(idea => idea.keyword),
  ];
  logger.info(`Seed keywords: ${seedKeywords.slice(0, 5).join(', ')}... (${seedKeywords.length} total)`);
  
  // STEP 3: Get keyword suggestions from DataForSEO with volume/difficulty
  logger.info('📊 Step 2: Fetching keyword data with search volume from DataForSEO...');
  const keywordData = await fetchKeywordSuggestions(seedKeywords, options.location);
  logger.info(`Found ${keywordData.length} keywords from DataForSEO`);
  
  // STEP 4: Filter by search intent (informational only)
  const informationalKeywords = await filterByIntent(keywordData, 'informational');
  logger.info(`Filtered to ${informationalKeywords.length} informational keywords`);

  // STEP 4.5: Filter out duplicates (keywords that already have blog posts)
  logger.info('🔍 Step 3: Checking for duplicate content...');
  const existingBlogData = await loadExistingBlogKeywords();
  const beforeDedupe = informationalKeywords.length;

  const dedupedKeywords = informationalKeywords.filter(k => {
    const slug = generateSlug(k.keyword);

    // Check if slug already exists
    if (existingBlogData.slugs.has(slug)) {
      logger.debug(`Filtered duplicate: "${k.keyword}" (slug already exists: ${slug})`);
      return false;
    }

    // Check if keyword is very similar to existing keyword (normalize for comparison)
    const normalizedKeyword = k.keyword.toLowerCase().trim();
    if (existingBlogData.keywords.has(normalizedKeyword)) {
      logger.debug(`Filtered duplicate: "${k.keyword}" (keyword already exists)`);
      return false;
    }

    return true;
  });

  const duplicatesRemoved = beforeDedupe - dedupedKeywords.length;
  logger.info(`Removed ${duplicatesRemoved} duplicate keywords (${dedupedKeywords.length} remaining)`);

  // Use deduplicated keywords for rest of pipeline
  let filtered = dedupedKeywords;

  // 4. Filter by volume and difficulty
  // Log sample keywords to understand the data structure
  if (filtered.length > 0) {
    const sample = filtered.slice(0, 10);
    logger.info(`Sample keywords (first 10) after deduplication:`);
    sample.forEach(k => {
      logger.info(`  - "${k.keyword}": volume=${k.searchVolume}, difficulty=${k.keywordDifficulty}`);
    });
    
    // Check how many have actual volume/difficulty data
    const withVolume = informationalKeywords.filter(k => k.searchVolume > 0).length;
    const withDifficulty = informationalKeywords.filter(k => k.keywordDifficulty > 0).length;
    logger.info(`Keywords with volume > 0: ${withVolume}/${informationalKeywords.length}`);
    logger.info(`Keywords with difficulty > 0: ${withDifficulty}/${informationalKeywords.length}`);
  }
  
  // Filter: only apply if keyword has actual data AND fails the filter
  // If keyword has volume=0 or difficulty=0, assume it's unknown and keep it
  filtered = filtered.filter(k => {
    // If we have actual volume data (volume > 0) and it's below minimum, filter out
    if (options.minSearchVolume && k.searchVolume > 0 && k.searchVolume < options.minSearchVolume) {
      return false;
    }
    // If we have actual difficulty data (difficulty > 0) and it's above maximum, filter out
    if (options.maxDifficulty && k.keywordDifficulty > 0 && k.keywordDifficulty > options.maxDifficulty) {
      return false;
    }
    // Keep keyword if it passes OR has unknown values (0)
    return true;
  });
  
  logger.info(`Filtered to ${filtered.length} keywords matching criteria (volume >= ${options.minSearchVolume || 0}, difficulty <= ${options.maxDifficulty || 100})`);
  
  // STEP 6: Use Perplexity to validate and enrich remaining keywords
  if (filtered.length > 0 && filtered.length < options.maxIdeas * 2) {
    logger.info('🔍 Step 4: Using Perplexity to validate and enrich keywords...');
    try {
      const enriched = await enrichKeywordsWithPerplexity(
        filtered.slice(0, 20).map(k => k.keyword),
        options.category
      );
      
      // Merge Perplexity insights with DataForSEO data
      filtered = filtered.map(k => {
        const enrichment = enriched.find(e => 
          e.keyword.toLowerCase() === k.keyword.toLowerCase()
        );
        if (enrichment) {
          // If DataForSEO has no volume but Perplexity suggests it's valuable, use estimate
          if (k.searchVolume === 0 && enrichment.estimatedVolume > 0) {
            k.searchVolume = enrichment.estimatedVolume;
            logger.debug(`Enriched "${k.keyword}" with Perplexity volume: ${enrichment.estimatedVolume}`);
          }
        }
        return k;
      });
    } catch (error) {
      logger.warn('Perplexity enrichment failed, continuing without it:', error);
    }
  }
  
  // If filtering removed all keywords, use all informational keywords
  if (filtered.length === 0 && informationalKeywords.length > 0) {
    logger.warn('⚠️ Filters removed all keywords. Using all informational keywords...');
    filtered = informationalKeywords;
  }
  
  // STEP 7: Calculate opportunity scores
  const scored = filtered.map(k => ({
    ...k,
    opportunityScore: calculateOpportunityScore(k),
  }));
  
  // STEP 8: Sort by opportunity score (highest first), prioritizing keywords with actual data
  scored.sort((a, b) => {
    // Prioritize keywords with actual volume/difficulty data
    if (a.searchVolume > 0 && b.searchVolume === 0) return -1;
    if (a.searchVolume === 0 && b.searchVolume > 0) return 1;
    if (a.keywordDifficulty > 0 && b.keywordDifficulty === 0) return -1;
    if (a.keywordDifficulty === 0 && b.keywordDifficulty > 0) return 1;
    // Then sort by opportunity score
    return b.opportunityScore - a.opportunityScore;
  });
  
  // STEP 9: Convert to blog ideas
  const ideas = scored
    .slice(0, options.maxIdeas)
    .map(k => keywordToBlogIdea(k, options.category));
  
  logger.info(`✅ Generated ${ideas.length} blog ideas using DataForSEO + Perplexity`);
  return ideas;
}

/**
 * Discover blog ideas using Perplexity
 */
async function discoverBlogIdeasWithPerplexity(
  category: string,
  location?: string
): Promise<Array<{ keyword: string; description: string }>> {
  try {
    const { researchTopic } = await import('./perplexity');
    
    const query = `For a fishing blog website, suggest 15 specific blog post topics in the "${category}" category${location ? ` for ${location}` : ''}.

Focus on:
- Topics that fishing enthusiasts actively search for
- Specific, actionable topics (not generic)
- Topics that would rank well on Google
- Topics that provide real value to anglers

For each topic, provide:
1. The main keyword people would search for
2. A brief description of why it's valuable

Format as a numbered list.`;

      const response = await researchTopic(query, {
        model: 'llama-3.1-sonar-small-128k-online', // Try default, will fallback if invalid
        temperature: 0.3,
        maxTokens: 2000,
      });

    // Parse ideas from response
    const ideas: Array<{ keyword: string; description: string }> = [];
    const lines = response.answer.split('\n');
    
    for (const line of lines) {
      const match = line.match(/^\d+[\.\)]\s*(.+?)(?:\s*[-–]\s*(.+))?$/);
      if (match) {
        const keyword = match[1].trim();
        const description = match[2]?.trim() || keyword;
        if (keyword.length > 10 && keyword.length < 100) {
          ideas.push({ keyword, description });
        }
      }
    }
    
    return ideas.slice(0, 15);
  } catch (error) {
    logger.warn('Perplexity discovery failed, continuing without it:', error);
    return [];
  }
}

/**
 * Enrich keywords with Perplexity validation
 */
async function enrichKeywordsWithPerplexity(
  keywords: string[],
  category: string
): Promise<Array<{ keyword: string; estimatedVolume: number; relevance: number }>> {
  try {
    const { researchTopic } = await import('./perplexity');
    
    const query = `For these fishing blog keywords, estimate their search volume and relevance:

${keywords.slice(0, 10).map((k, i) => `${i + 1}. ${k}`).join('\n')}

For each keyword, provide:
1. Estimated monthly search volume (0-10000)
2. Relevance score (1-10) for a fishing blog in the "${category}" category

Format as: "Keyword: [volume] searches/month, Relevance: [score]/10"`;

    const response = await researchTopic(query, {
      model: 'llama-3.1-sonar-small-128k-online',
      temperature: 0.2,
      maxTokens: 1500,
    });

    // Parse enrichment data
    const enriched: Array<{ keyword: string; estimatedVolume: number; relevance: number }> = [];
    const lines = response.answer.split('\n');
    
    for (const line of lines) {
      for (const keyword of keywords) {
        if (line.toLowerCase().includes(keyword.toLowerCase())) {
          const volumeMatch = line.match(/(\d+)\s*searches?\/month/i);
          const relevanceMatch = line.match(/relevance[:\s]+(\d+)/i);
          
          if (volumeMatch || relevanceMatch) {
            enriched.push({
              keyword,
              estimatedVolume: volumeMatch ? parseInt(volumeMatch[1], 10) : 0,
              relevance: relevanceMatch ? parseInt(relevanceMatch[1], 10) : 5,
            });
            break;
          }
        }
      }
    }
    
    return enriched;
  } catch (error) {
    logger.warn('Perplexity enrichment failed:', error);
    return [];
  }
}

/**
 * Get seed keywords for category
 */
function getSeedKeywords(category: string, location?: string): string[] {
  const baseKeywords: Record<string, string[]> = {
    'fishing-tips': [
      'fishing tips',
      'how to fish',
      'fishing techniques',
      'fishing advice',
    ],
    'gear-reviews': [
      'best fishing rods',
      'fishing gear reviews',
      'fishing equipment',
    ],
    'conditions': [
      'fishing conditions',
      'best time to fish',
      'fishing weather',
    ],
    'species-spotlights': [
      'fishing species',
      'fish identification',
    ],
    'techniques-tactics': [
      'fishing techniques',
      'fishing tactics',
    ],
  };
  
  const seeds = baseKeywords[category] || ['fishing tips'];
  
  if (location) {
    // Add location-specific variants
    return seeds.flatMap(s => [
      s,
      `${s} ${location}`,
      `${s} in ${location}`,
    ]);
  }
  
  return seeds;
}

/**
 * Fetch keyword suggestions from DataForSEO
 */
export async function fetchKeywordSuggestions(
  seedKeywords: string[],
  location?: string
): Promise<KeywordData[]> {
  const locationCode = location === 'florida' ? 2840 : 2840; // USA
  const languageCode = 'en';
  
  logger.info(`Fetching keyword suggestions for: ${seedKeywords.slice(0, 3).join(', ')}...`);
  
  try {
    const authHeader = `Basic ${Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64')}`;
    
    // Use Google Ads API for keyword suggestions
    // Note: This endpoint provides search volume but NOT keyword_difficulty
    // We'll fetch difficulty separately using Bulk Keyword Difficulty API
    const endpoints = [
      {
        path: '/v3/keywords_data/google_ads/keywords_for_keywords/live',
        body: {
          keywords: seedKeywords.slice(0, 10),
          location_code: locationCode,
          language_code: languageCode,
          limit: 100,
          sort_by: 'search_volume',
        },
        expectsDifficulty: false, // Google Ads API does NOT have difficulty
      },
    ];
    
    let data: any;
    let lastError: Error | null = null;
    let selectedEndpoint: typeof endpoints[0] | null = null;

    // Try Google Ads API endpoint
    for (const endpoint of endpoints) {
      try {
        logger.info(`Trying endpoint: ${endpoint.path}${endpoint.expectsDifficulty ? ' (expects keyword_difficulty)' : ''}`);
        const response = await fetch(`${DATAFORSEO_API_URL}${endpoint.path}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader,
          },
          // DataForSEO Labs API expects array, Google Ads API may need different format
          body: JSON.stringify(endpoint.path.includes('dataforseo_labs') ? [endpoint.body] : [endpoint.body]),
        });
        
        const responseText = await response.text();
        
        try {
          data = JSON.parse(responseText);
        } catch {
          throw new Error(`Invalid JSON: ${responseText.substring(0, 200)}`);
        }
        
        // Check for DataForSEO error codes
        if (data.status_code && data.status_code >= 40000) {
          logger.warn(`Endpoint ${endpoint.path} failed: ${data.status_message} (${data.status_code})`);
          lastError = new Error(`${data.status_message} (${data.status_code})`);
          continue; // Try next endpoint
        }
        
        // Check if we got valid results
        // DataForSEO returns: { tasks: [{ result: [...] }] }
        if (data && data.tasks && data.tasks[0] && data.tasks[0].result) {
          selectedEndpoint = endpoint;
          logger.info(`✅ Using endpoint: ${endpoint.path}`);
          
          // Inspect first result to check for keyword_difficulty
          const firstResult = Array.isArray(data.tasks[0].result) 
            ? data.tasks[0].result[0] 
            : data.tasks[0].result;
          
          if (firstResult) {
            logger.debug(`First result keys: ${Object.keys(firstResult).slice(0, 10).join(', ')}`);
            if (firstResult.keyword_info) {
              logger.debug(`keyword_info keys: ${Object.keys(firstResult.keyword_info).slice(0, 10).join(', ')}`);
            }
            
            const hasDifficulty = 
              firstResult.keyword_difficulty !== undefined ||
              firstResult.keyword_info?.keyword_difficulty !== undefined ||
              firstResult.difficulty !== undefined;
            
            if (hasDifficulty && endpoint.expectsDifficulty) {
              logger.info(`✅ Endpoint includes keyword_difficulty field - difficulty data available!`);
            } else if (!endpoint.expectsDifficulty) {
              logger.info(`ℹ️ Endpoint does not provide keyword_difficulty (expected for Google Ads API)`);
            } else {
              logger.warn(`⚠️ Endpoint expected to have keyword_difficulty but field not found`);
            }
          }
          break; // Success, use this endpoint
        }
        
        // Check alternative response structure
        if (data && Array.isArray(data) && data.length > 0 && data[0].result) {
          logger.info(`✅ Using endpoint (alternative format): ${endpoint.path}`);
          selectedEndpoint = endpoint;
          data = { tasks: data }; // Normalize to expected format
          break;
        }
        
        lastError = new Error(`Unexpected response structure from ${endpoint.path}`);
        
      } catch (err) {
        logger.warn(`Endpoint ${endpoint.path} error:`, err instanceof Error ? err.message : String(err));
        lastError = err instanceof Error ? err : new Error(String(err));
        continue;
      }
    }
    
    // If keyword APIs failed, try SERP API as fallback
    if (!data || !data.tasks || !data.tasks[0]) {
      logger.warn('Keyword research APIs not available, using SERP API as fallback...');
      return await fetchKeywordsFromSERP(seedKeywords, locationCode, languageCode);
    }
    
    // Check for task-level errors
    if (data.tasks[0].status_code && data.tasks[0].status_code >= 40000) {
      logger.warn(`Task error: ${data.tasks[0].status_message} (${data.tasks[0].status_code})`);
      logger.warn('Falling back to SERP API...');
      return await fetchKeywordsFromSERP(seedKeywords, locationCode, languageCode);
    }
    
    const results = data.tasks[0].result || [];
    
    if (results.length === 0) {
      logger.warn(`Endpoint returned 0 results. Response structure:`, JSON.stringify(data.tasks[0], null, 2).substring(0, 500));
      logger.warn('Falling back to SERP API...');
      return await fetchKeywordsFromSERP(seedKeywords, locationCode, languageCode);
    }
    
    // Check if we got keyword_difficulty in response by inspecting first item
    const firstItem = results[0];
    const hasDifficultyInResponse = firstItem && (
      firstItem.keyword_difficulty !== undefined ||
      firstItem.keyword_info?.keyword_difficulty !== undefined
    );
    
    if (!hasDifficultyInResponse && selectedEndpoint?.expectsDifficulty) {
      logger.warn('⚠️ DataForSEO Labs API endpoint used but keyword_difficulty not found in response');
      logger.warn('⚠️ This may mean your account does not have access to keyword_difficulty data');
      logger.warn('⚠️ Or the field name is different - checking response structure...');
      logger.debug('First result sample:', JSON.stringify(firstItem, null, 2).substring(0, 500));
    }
    
    const keywordData: KeywordData[] = results.map((item: any) => {
      // According to DataForSEO docs, keyword_difficulty should be in the response
      // Try multiple possible field names and locations
      const keywordInfo = item.keyword_info || {};
      const serpInfo = item.serp_info || {};
      
      // Search volume - try multiple field names
      const searchVolume = 
        keywordInfo.search_volume || 
        keywordInfo.monthly_searches?.[0]?.search_volume ||
        item.search_volume ||
        keywordInfo.volume ||
        0;
      
      // Keyword difficulty - according to DataForSEO docs (https://dataforseo.com/help-center/what-is-keyword-difficulty-and-how-is-it-calculated)
      // keyword_difficulty is a metric from 0-100 indicating ranking difficulty
      // In DataForSEO Labs API, it's typically at top level: item.keyword_difficulty
      // Or in keyword_info: item.keyword_info.keyword_difficulty
      const keywordDifficulty = 
        item.keyword_difficulty !== undefined ? item.keyword_difficulty : // Top level (DataForSEO Labs)
        keywordInfo.keyword_difficulty !== undefined ? keywordInfo.keyword_difficulty : // In keyword_info
        item.difficulty !== undefined ? item.difficulty : // Alternative name
        keywordInfo.difficulty_index !== undefined ? keywordInfo.difficulty_index : // Alternative name
        keywordInfo.keyword_difficulty_index !== undefined ? keywordInfo.keyword_difficulty_index : // Alternative
        0; // Not available
      
      // CPC
      const cpc = keywordInfo.cpc || item.cpc || keywordInfo.bid || 0;
      
      // Competition
      const competitionIndex = keywordInfo.competition_index || item.competition_index || 50;
      const competition = competitionIndex < 33 ? 'low' : competitionIndex < 66 ? 'medium' : 'high';
      
      return {
        keyword: item.keyword || '',
        searchVolume,
        keywordDifficulty: keywordDifficulty > 100 ? 100 : (keywordDifficulty < 0 ? 0 : keywordDifficulty), // Clamp to 0-100
        cpc,
        competition,
        relatedKeywords: keywordInfo.related_keywords || [],
        questions: [],
        serpFeatures: serpInfo.se_results_count ? ['organic_results'] : [],
      };
    });
    
    // Log how many keywords have actual data
    const withVolume = keywordData.filter(k => k.searchVolume > 0).length;
    const withDifficulty = keywordData.filter(k => k.keywordDifficulty > 0).length;
    logger.info(`📊 Keywords with volume data: ${withVolume}/${keywordData.length}`);
    logger.info(`📊 Keywords with difficulty data: ${withDifficulty}/${keywordData.length}`);
    
    // If no difficulty data from primary endpoint, try Bulk Keyword Difficulty API
    if (withDifficulty === 0 && withVolume > 0) {
      logger.info('⚠️ No keyword_difficulty found in response. Attempting to fetch from Bulk Keyword Difficulty API...');
      const keywordsWithVolume = keywordData.filter(k => k.searchVolume > 0).slice(0, 100);
      const difficultyMap = await fetchBulkKeywordDifficulty(
        keywordsWithVolume.map(k => k.keyword),
        locationCode,
        languageCode
      );
      
      // Merge difficulty data
      if (difficultyMap.size > 0) {
        keywordData.forEach(k => {
          const difficulty = difficultyMap.get(k.keyword.toLowerCase());
          if (difficulty !== undefined && difficulty > 0) {
            k.keywordDifficulty = difficulty;
          }
        });
        
        const withDifficultyAfter = keywordData.filter(k => k.keywordDifficulty > 0).length;
        logger.info(`✅ Retrieved difficulty for ${withDifficultyAfter}/${keywordData.length} keywords from Bulk Keyword Difficulty API`);
      } else {
        logger.warn('⚠️ Bulk Keyword Difficulty API also returned no difficulty data');
        logger.warn('⚠️ This may indicate your DataForSEO account does not have access to keyword_difficulty');
        logger.warn('⚠️ Check your DataForSEO subscription plan - keyword_difficulty may require Labs API access');
      }
    }
    
    logger.info(`Parsed ${keywordData.length} keywords from DataForSEO`);
    return keywordData;
    
  } catch (error) {
    logger.error('Error fetching keyword suggestions:', error);
    throw error;
  }
}

/**
 * Fetch keyword difficulty using Bulk Keyword Difficulty API
 * According to DataForSEO docs (https://dataforseo.com/help-center/what-is-keyword-difficulty-and-how-is-it-calculated),
 * keyword_difficulty is available in the Bulk Keyword Difficulty endpoint
 * This endpoint specifically returns keyword_difficulty (0-100)
 */
async function fetchBulkKeywordDifficulty(
  keywords: string[],
  locationCode: number,
  languageCode: string
): Promise<Map<string, number>> {
  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    logger.warn('DataForSEO credentials not available for Bulk Keyword Difficulty API');
    return new Map();
  }
  
  logger.info(`Fetching keyword difficulty for ${keywords.length} keywords using Bulk Keyword Difficulty API...`);
  
  const authHeader = `Basic ${Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64')}`;
  const difficultyMap = new Map<string, number>();
  
  try {
    // Use Bulk Keyword Difficulty endpoint from DataForSEO Labs API
    // This endpoint is specifically designed to return keyword_difficulty (0-100)
    // According to docs, it's available at: /v3/dataforseo_labs/google/bulk_keyword_difficulty/live
    const response = await fetch(`${DATAFORSEO_API_URL}/v3/dataforseo_labs/google/bulk_keyword_difficulty/live`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify([{
        keywords: keywords.slice(0, 100), // Limit to 100 per API docs
        location_code: locationCode,
        language_code: languageCode,
      }]),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      logger.warn(`Bulk Keyword Difficulty API failed: ${response.status} - ${errorText.substring(0, 200)}`);
      return difficultyMap;
    }
    
    const data = await response.json();
    
    // Check for DataForSEO error codes
    if (data.status_code && data.status_code >= 40000) {
      logger.warn(`Bulk Keyword Difficulty API error: ${data.status_message} (${data.status_code})`);
      if (data.status_code === 40201) {
        logger.warn('⚠️ This endpoint may not be available on your DataForSEO plan');
      }
      return difficultyMap;
    }
    
    if (data && data.tasks && data.tasks[0] && data.tasks[0].result) {
      const taskResult = data.tasks[0].result;

      // DEBUG: Log taskResult structure
      logger.info(`[DEBUG] taskResult type: ${typeof taskResult}, isArray: ${Array.isArray(taskResult)}`);
      if (typeof taskResult === 'object' && taskResult !== null) {
        logger.info(`[DEBUG] taskResult keys: ${Object.keys(taskResult).join(', ')}`);
        if (taskResult.items) {
          logger.info(`[DEBUG] taskResult.items exists, isArray: ${Array.isArray(taskResult.items)}, length: ${Array.isArray(taskResult.items) ? taskResult.items.length : 'N/A'}`);
        }
      }

      // According to DataForSEO API docs, Bulk Keyword Difficulty API returns:
      // { se_type, location_code, language_code, total_count, items_count, items: [...] }
      // The actual keyword data with keyword_difficulty is in the items array
      let results: any[] = [];

      // IMPORTANT: The response structure can be:
      // 1. An array with one object: [{ se_type, location_code, ..., items: [...] }]
      // 2. A direct object: { se_type, location_code, ..., items: [...] }
      // 3. An array of items directly: [{ keyword, keyword_difficulty }, ...]

      if (Array.isArray(taskResult) && taskResult.length > 0 && taskResult[0].items && Array.isArray(taskResult[0].items)) {
        // Response is array with wrapped object: [{ items: [...] }]
        results = taskResult[0].items;
        logger.info(`[DEBUG] Using taskResult[0].items: ${results.length} items`);
      } else if (taskResult.items && Array.isArray(taskResult.items)) {
        // Response is direct object: { items: [...] }
        results = taskResult.items;
        logger.info(`[DEBUG] Using taskResult.items: ${results.length} items`);
      } else if (Array.isArray(taskResult)) {
        // Response is array of items directly
        results = taskResult;
        logger.info(`[DEBUG] Using taskResult as array: ${results.length} items`);
      } else if (taskResult && typeof taskResult === 'object' && taskResult.keyword) {
        // Single item object
        results = [taskResult];
        logger.info(`[DEBUG] Using taskResult as single object`);
      }
      
      logger.info(`Bulk Keyword Difficulty API: Found ${results.length} results to process`);
      
      let processedCount = 0;
      results.forEach((item: any) => {
        if (!item || !item.keyword) return;
        
        // According to DataForSEO docs (https://dataforseo.com/help-center/what-is-keyword-difficulty-and-how-is-it-calculated):
        // keyword_difficulty is 0-100, typically at top level in the item
        // From the actual response we saw earlier, keyword_difficulty is directly in the item object
        // Example: { "keyword": "bass catching techniques", "keyword_difficulty": 6 }
        
        let difficulty: number | undefined = undefined;
        
        // Check for keyword_difficulty in multiple locations (most common first)
        if (typeof item.keyword_difficulty === 'number') {
          difficulty = item.keyword_difficulty;
        } else if (item.keyword_info && typeof item.keyword_info.keyword_difficulty === 'number') {
          difficulty = item.keyword_info.keyword_difficulty;
        } else if (typeof item.difficulty === 'number') {
          difficulty = item.difficulty;
        } else if (typeof item.se_difficulty === 'number') {
          difficulty = item.se_difficulty;
        } else if (item.keyword_difficulty !== undefined && item.keyword_difficulty !== null) {
          // Try to convert to number if it's a string
          const numDifficulty = Number(item.keyword_difficulty);
          if (!isNaN(numDifficulty)) {
            difficulty = numDifficulty;
          }
        }
        
        // keyword_difficulty can be 0 (easy), so we accept any number >= 0
        // But we need to distinguish between "not found" (undefined) and "easy" (0)
        if (difficulty !== undefined && typeof difficulty === 'number' && !isNaN(difficulty) && difficulty >= 0 && difficulty <= 100) {
          // Clamp to 0-100 range (should already be in range per docs, but just in case)
          const clampedDifficulty = Math.max(0, Math.min(100, Math.round(difficulty)));
          difficultyMap.set(item.keyword.toLowerCase(), clampedDifficulty);
          processedCount++;
          logger.debug(`Extracted difficulty ${clampedDifficulty} for keyword: ${item.keyword}`);
        } else {
          logger.debug(`No valid difficulty found for keyword: ${item.keyword}. Item keys: ${Object.keys(item).join(', ')}`);
        }
      });
      
      logger.info(`Bulk Keyword Difficulty API: Processed ${processedCount} keywords with difficulty values`);
      
      logger.info(`✅ Retrieved keyword_difficulty for ${difficultyMap.size}/${keywords.length} keywords from Bulk Keyword Difficulty API`);
      
      if (difficultyMap.size === 0 && results.length > 0) {
        logger.warn('⚠️ Bulk Keyword Difficulty API returned results but no keyword_difficulty values');
        const sampleResult = results[0];
        logger.warn('⚠️ Sample result structure (first 1000 chars):');
        logger.warn(JSON.stringify(sampleResult, null, 2).substring(0, 1000));
        logger.warn('⚠️ Available keys:', Object.keys(sampleResult).join(', '));
        if (sampleResult.keyword_info) {
          logger.warn('⚠️ keyword_info keys:', Object.keys(sampleResult.keyword_info).join(', '));
        }
        logger.warn('⚠️ According to DataForSEO docs (https://dataforseo.com/help-center/what-is-keyword-difficulty-and-how-is-it-calculated):');
        logger.warn('⚠️ keyword_difficulty should be in the response, but may require a different subscription plan');
        logger.warn('⚠️ Try checking your DataForSEO account dashboard for Labs API access');
      }
    } else {
      logger.warn('Bulk Keyword Difficulty API returned unexpected structure');
      logger.debug('Response structure (first 500 chars):', JSON.stringify(data, null, 2).substring(0, 500));
      if (data && data.tasks && data.tasks[0]) {
        logger.debug('Task structure:', JSON.stringify(data.tasks[0], null, 2).substring(0, 500));
      }
    }
  } catch (error) {
    logger.warn('Bulk Keyword Difficulty API failed:', error instanceof Error ? error.message : String(error));
  }
  
  return difficultyMap;
}

/**
 * Fetch keywords from SERP API (fallback when keyword APIs unavailable)
 * Extracts keywords from "Related Searches" and "People Also Ask"
 */
async function fetchKeywordsFromSERP(
  seedKeywords: string[],
  locationCode: number,
  languageCode: string
): Promise<KeywordData[]> {
  logger.info('Using SERP API to extract keywords...');
  
  const authHeader = `Basic ${Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64')}`;
  const allKeywords: KeywordData[] = [];
  const seenKeywords = new Set<string>();
  
  // Process each seed keyword
  for (const seedKeyword of seedKeywords.slice(0, 5)) { // Limit to 5 to avoid too many API calls
    try {
      logger.info(`Fetching SERP for: ${seedKeyword}`);
      
      const response = await fetch(`${DATAFORSEO_API_URL}/v3/serp/google/organic/live/advanced`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify([{
          keyword: seedKeyword,
          location_code: locationCode,
          language_code: languageCode,
          depth: 1,
          device: 'desktop',
        }]),
      });
      
      if (!response.ok) {
        logger.warn(`SERP API failed for "${seedKeyword}": ${response.status}`);
        continue;
      }
      
      const data = await response.json();
      
      if (!data || !data.tasks || !data.tasks[0] || !data.tasks[0].result) {
        logger.warn(`No SERP results for "${seedKeyword}"`);
        continue;
      }
      
      const result = data.tasks[0].result[0];
      
      // Extract related searches
      if (result.related_searches && Array.isArray(result.related_searches)) {
        result.related_searches.forEach((related: any) => {
          const keyword = related.query || related.keyword || related.text;
          if (keyword && !seenKeywords.has(keyword.toLowerCase())) {
            seenKeywords.add(keyword.toLowerCase());
            allKeywords.push({
              keyword,
              searchVolume: related.search_volume || 0, // May not be available
              keywordDifficulty: 0, // Not available from SERP
              cpc: 0,
              competition: 'medium',
              relatedKeywords: [],
              questions: [],
              serpFeatures: result.featured_snippet ? ['featured_snippet'] : [],
            });
          }
        });
      }
      
      // Extract People Also Ask questions
      if (result.people_also_ask && Array.isArray(result.people_also_ask)) {
        result.people_also_ask.forEach((paa: any) => {
          const question = paa.question || paa.title;
          if (question && !seenKeywords.has(question.toLowerCase())) {
            seenKeywords.add(question.toLowerCase());
            // Convert question to keyword format
            const keywordText = question.replace(/\?/g, '').toLowerCase();
            allKeywords.push({
              keyword: keywordText,
              searchVolume: 0, // Not available
              keywordDifficulty: 0,
              cpc: 0,
              competition: 'medium',
              relatedKeywords: [],
              questions: [question],
              serpFeatures: ['people_also_ask'],
            });
          }
        });
      }
      
      // Extract from organic results titles (keywords that rank)
      if (result.items && Array.isArray(result.items)) {
        result.items.slice(0, 10).forEach((item: any) => {
          if (item.title) {
            // Extract potential keywords from titles
            const titleWords = item.title.toLowerCase().split(/\s+/);
            titleWords.forEach((word: string) => {
              if (word.length > 4 && !seenKeywords.has(word)) {
                seenKeywords.add(word);
                allKeywords.push({
                  keyword: word,
                  searchVolume: 0,
                  keywordDifficulty: 0,
                  cpc: 0,
                  competition: 'medium',
                  relatedKeywords: [],
                  questions: [],
                  serpFeatures: ['organic_results'],
                });
              }
            });
          }
        });
      }
      
      logger.info(`Extracted ${allKeywords.length} keywords so far from SERP`);
      
    } catch (error) {
      logger.warn(`Error fetching SERP for "${seedKeyword}":`, error);
      continue;
    }
  }
  
  logger.info(`Extracted total of ${allKeywords.length} keywords from SERP API`);
  
  if (allKeywords.length === 0) {
    throw new Error(
      'No keywords could be extracted from SERP API.\n\n' +
      'Your account has access to SERP API but keyword research APIs are not available.\n' +
      'Options:\n' +
      '1. Upgrade your DataForSEO plan to get keyword research API access\n' +
      '2. Use manual keyword list (we can add support for that)\n' +
      '3. Check DataForSEO dashboard for which APIs are available'
    );
  }
  
  return allKeywords;
}

/**
 * Filter keywords by search intent
 */
export async function filterByIntent(
  keywords: KeywordData[],
  intent: 'informational' | 'commercial'
): Promise<KeywordData[]> {
  logger.info(`Filtering keywords by intent: ${intent}`);

  // Note: DataForSEO Search Intent API requires Labs API access which this account doesn't have
  // Using keyword-based filtering which works well for fishing content
  // To enable Search Intent API, upgrade DataForSEO plan and uncomment the code below

  return filterByKeywordPattern(keywords, intent);

  /* DISABLED - Requires DataForSEO Labs API access
  try {
    const keywordList = keywords.slice(0, 100).map(k => k.keyword);

    const response = await fetch(`${DATAFORSEO_API_URL}/v3/dataforseo_labs/google/search_intent/live/advanced`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64')}`,
      },
      body: JSON.stringify([{
        keywords: keywordList,
        location_code: 2840,
        language_code: 'en',
      }]),
    });

    if (!response.ok) {
      logger.warn('Search Intent API failed, using keyword-based filtering');
      return filterByKeywordPattern(keywords, intent);
    }

    const data = await response.json();

    if (!data || !data.tasks || !data.tasks[0] || !data.tasks[0].result) {
      return filterByKeywordPattern(keywords, intent);
    }

    const results = data.tasks[0].result || [];
    const intentMap = new Map<string, string>();

    results.forEach((item: any) => {
      if (item.keyword && item.search_intents) {
        const primaryIntent = item.search_intents[0]?.label || 'informational';
        intentMap.set(item.keyword, primaryIntent.toLowerCase());
      }
    });

    const filtered = keywords.filter(k => {
      const keywordIntent = intentMap.get(k.keyword) || 'informational';
      return keywordIntent === intent;
    });

    logger.info(`Filtered to ${filtered.length} ${intent} keywords`);
    return filtered;

  } catch (error) {
    logger.warn('Error filtering by intent, using keyword-based filtering:', error);
    return filterByKeywordPattern(keywords, intent);
  }
  */
}

/**
 * Fallback: Filter keywords by pattern matching
 */
function filterByKeywordPattern(
  keywords: KeywordData[],
  intent: 'informational' | 'commercial'
): KeywordData[] {
  // Fishing-specific keywords filter
  const fishingTerms = [
    'fish', 'fishing', 'angler', 'bait', 'lure', 'hook', 'line', 'rod', 'reel',
    'tackle', 'catch', 'species', 'snook', 'redfish', 'bass', 'trout', 'tarpon',
    'knot', 'knots', 'cast', 'casting', 'tide', 'tides', 'weather', 'water',
    'boat', 'shore', 'pier', 'flats', 'deep', 'saltwater', 'freshwater'
  ];
  
  // Exclude non-fishing keywords
  const excludePatterns = [
    /draw.*fish/i, // "how to draw a fish" (art)
    /crip walk/i, // Dance move
    /dance/i,
    /art/i,
    /sketch/i,
    /paint/i,
  ];
  
  let filtered = keywords;
  
  if (intent === 'informational') {
    // Informational keywords typically start with: how, what, when, where, why, best, guide, tips
    const informationalPatterns = /^(how|what|when|where|why|best|guide|tips|learn|understand|complete)/i;
    filtered = keywords.filter(k => informationalPatterns.test(k.keyword));
  } else {
    // Commercial keywords typically include: buy, price, review, best [product]
    filtered = keywords.filter(k => /buy|price|cost|review|best.*rod|best.*reel/i.test(k.keyword));
  }
  
  // Filter to fishing-related only
  filtered = filtered.filter(k => {
    // Exclude non-fishing keywords
    if (excludePatterns.some(pattern => pattern.test(k.keyword))) {
      return false;
    }
    
    // Must contain at least one fishing term
    const keywordLower = k.keyword.toLowerCase();
    return fishingTerms.some(term => keywordLower.includes(term));
  });
  
  return filtered;
}

/**
 * Find related questions for keywords
 */
export async function findRelatedQuestions(keywords: string[]): Promise<Map<string, string[]>> {
  logger.info(`Finding related questions for ${keywords.length} keywords`);
  
  const questionMap = new Map<string, string[]>();
  
  // Extract questions from keyword list (keywords that start with what, how, when, etc.)
  keywords.forEach(keyword => {
    if (/^(what|how|when|where|why|can|should|do|does|is|are|will)/i.test(keyword)) {
      // This looks like a question - extract variations
      const questions: string[] = [keyword];
      
      // Add question mark variations
      if (!keyword.endsWith('?')) {
        questions.push(`${keyword}?`);
      }
      
      questionMap.set(keyword, questions);
    }
  });
  
  return questionMap;
}

/**
 * Calculate opportunity score (0-100)
 * Higher = better opportunity
 */
function calculateOpportunityScore(keyword: KeywordData): number {
  // Formula combines:
  // - High search volume = good (if available)
  // - Low difficulty = good (if available)
  // - Has SERP features = good (ranking opportunities)
  // - Has related questions = good (FAQ content)
  // - Keyword length = medium-length keywords are better (more specific)
  
  let volumeScore = 0;
  let difficultyScore = 0;
  
  if (keyword.searchVolume > 0) {
    // Search volume available - use it for scoring
    volumeScore = Math.min(keyword.searchVolume / 1000, 1) * 30; // Max 30 points
    difficultyScore = (100 - keyword.keywordDifficulty) / 100 * 30; // Max 30 points
  } else {
    // No search volume data (from SERP API) - use alternative scoring
    // Give base score for being found in SERP
    volumeScore = 15; // Base score for appearing in SERP
    // If has questions, it's likely searched
    if (keyword.questions.length > 0) {
      volumeScore = 20; // Bonus for having questions
    }
    // If has SERP features, it's valuable
    if (keyword.serpFeatures.length > 0) {
      volumeScore = 25; // Higher score for SERP features
    }
    difficultyScore = 20; // Assume medium difficulty if unknown
  }
  
  const serpScore = Math.min(keyword.serpFeatures.length * 5, 20); // Max 20 points
  const questionScore = Math.min(keyword.questions.length / 10, 1) * 20; // Max 20 points
  
  // Keyword quality score (length-based)
  const wordCount = keyword.keyword.split(/\s+/).length;
  const qualityScore = wordCount >= 2 && wordCount <= 6 ? 10 : 5; // 2-6 words is optimal
  
  return Math.round(volumeScore + difficultyScore + serpScore + questionScore + qualityScore);
}

/**
 * Convert keyword data to blog idea
 */
function keywordToBlogIdea(keyword: KeywordData, category: string): BlogIdea {
  return {
    keyword: keyword.keyword,
    searchVolume: keyword.searchVolume,
    keywordDifficulty: keyword.keywordDifficulty,
    cpc: keyword.cpc,
    searchIntent: 'informational', // Already filtered
    category,
    relatedQuestions: keyword.questions.slice(0, 8), // Top 8 for FAQs
    serpFeatures: keyword.serpFeatures,
    opportunityScore: calculateOpportunityScore(keyword),
    slug: generateSlug(keyword.keyword),
    title: generateTitleFromKeyword(keyword.keyword),
  };
}

/**
 * Generate slug from keyword
 */
function generateSlug(keyword: string): string {
  return keyword
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate title from keyword
 */
function generateTitleFromKeyword(keyword: string): string {
  // Capitalize and format: "how to catch redfish" → "How to Catch Redfish: Complete Guide"
  const wordArray = keyword.split(' ');
  const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'of', 'on', 'or', 'the', 'to'];
  
  const words = wordArray.map((w, index) => {
    // Don't capitalize articles and prepositions unless first word
    if (smallWords.includes(w.toLowerCase()) && index > 0) {
      return w.toLowerCase();
    }
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  });
  
  const title = words.join(' ');
  
  // Add "Complete Guide" or "Expert Guide" if not already present
  if (!/guide|tips|advice|strategies/i.test(title)) {
    return `${title}: Complete Guide`;
  }
  
  return title;
}

/**
 * Load existing blog posts to prevent duplicates
 * Returns slugs and keywords from published blog posts
 */
async function loadExistingBlogKeywords(): Promise<{
  slugs: Set<string>;
  keywords: Set<string>;
}> {
  const slugs = new Set<string>();
  const keywords = new Set<string>();

  try {
    const fs = await import('fs/promises');
    const path = await import('path');

    const blogDir = path.resolve(process.cwd(), 'content', 'blog');

    // Read all blog post files
    const files = await fs.readdir(blogDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    for (const file of jsonFiles) {
      try {
        const filePath = path.join(blogDir, file);
        const content = await fs.readFile(filePath, 'utf-8');
        const blogPost = JSON.parse(content);

        // Add slug
        if (blogPost.slug) {
          slugs.add(blogPost.slug);
        }

        // Add primary keyword (normalized)
        if (blogPost.primaryKeyword) {
          keywords.add(blogPost.primaryKeyword.toLowerCase().trim());
        }

        // Add title as keyword variant (normalized)
        if (blogPost.title) {
          const titleAsKeyword = blogPost.title
            .toLowerCase()
            .replace(/:\s*complete guide$/i, '') // Remove "Complete Guide" suffix
            .replace(/:\s*expert guide$/i, '')
            .replace(/:\s*guide$/i, '')
            .trim();
          keywords.add(titleAsKeyword);
        }

      } catch (error) {
        logger.warn(`Failed to parse blog file ${file}:`, error);
      }
    }

    logger.debug(`Loaded ${slugs.size} existing blog slugs and ${keywords.size} keywords for deduplication`);

  } catch (error) {
    logger.warn('Failed to load existing blog posts for deduplication:', error);
  }

  return { slugs, keywords };
}

/**
 * Test DataForSEO connection
 * Tries multiple endpoints to find which one works with your account
 */
export async function testDataForSEOConnection(): Promise<boolean> {
  logger.info('Testing DataForSEO connection...');
  
  if (!DATAFORSEO_LOGIN || !DATAFORSEO_PASSWORD) {
    throw new Error('DataForSEO credentials not found. Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD environment variables.');
  }
  
  logger.info(`Using login: ${DATAFORSEO_LOGIN}`);
  logger.info('Testing multiple API endpoints...');
  
  // Try different endpoints that DataForSEO offers
  const testEndpoints = [
    {
      name: 'SERP API (most common)',
      path: '/v3/serp/google/organic/live/advanced',
      body: [{
        keyword: 'fishing tips',
        location_code: 2840,
        language_code: 'en',
        depth: 1,
      }],
    },
    {
      name: 'Keywords Data API (Google Ads)',
      path: '/v3/keywords_data/google_ads/keywords_for_keywords/live',
      body: [{
        keywords: ['fishing tips'],
        location_code: 2840,
        language_code: 'en',
        limit: 1,
      }],
    },
    {
      name: 'DataForSEO Labs API',
      path: '/v3/dataforseo_labs/google/keywords_for_keywords/live',
      body: [{
        keywords: ['fishing tips'],
        location_code: 2840,
        language_code: 'en',
        limit: 1,
      }],
    },
  ];
  
  const authHeader = `Basic ${Buffer.from(`${DATAFORSEO_LOGIN}:${DATAFORSEO_PASSWORD}`).toString('base64')}`;
  let lastError: Error | null = null;
  
  for (const endpoint of testEndpoints) {
    try {
      logger.info(`\nTrying: ${endpoint.name}`);
      logger.info(`Endpoint: ${endpoint.path}`);
      
      const response = await fetch(`${DATAFORSEO_API_URL}${endpoint.path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify([endpoint.body]), // DataForSEO expects array
      });
      
      const responseText = await response.text();
      let data: any;
      
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
      }
      
      // Check for DataForSEO error codes
      if (data.status_code && data.status_code >= 40000) {
        logger.warn(`  ❌ Failed: ${data.status_message || 'Error'} (Code: ${data.status_code})`);
        lastError = new Error(`${endpoint.name}: ${data.status_message} (${data.status_code})`);
        continue;
      }
      
      // Check if response has valid structure
      if (response.ok && (data.status_code === 20000 || data.tasks)) {
        logger.info(`  ✅ Success! ${endpoint.name} works`);
        logger.info(`  Status: ${data.status_message || 'OK'} (Code: ${data.status_code || 'N/A'})`);
        return true;
      }
      
      // If we get here, response structure is unexpected
      logger.warn(`  ⚠️ Unexpected response structure from ${endpoint.name}`);
      lastError = new Error(`Unexpected response from ${endpoint.name}`);
      
    } catch (err) {
      logger.warn(`  ❌ Error: ${err instanceof Error ? err.message : String(err)}`);
      lastError = err instanceof Error ? err : new Error(String(err));
      continue;
    }
  }
  
  // If all endpoints failed, provide helpful error message
  throw new Error(
    `❌ All DataForSEO API endpoints failed.\n\n` +
    `Last error: ${lastError?.message}\n\n` +
    `Troubleshooting:\n` +
    `1. Verify credentials: Check DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in .env.local\n` +
    `2. Check API credits: Log into DataForSEO dashboard and verify you have credits\n` +
    `3. Verify API access: Some endpoints require specific API access levels\n` +
    `4. Check endpoint documentation: Visit https://docs.dataforseo.com/ to see available endpoints\n` +
    `5. Contact DataForSEO support if credentials are correct but endpoints still fail`
  );
}
