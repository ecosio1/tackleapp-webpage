# DataForSEO Ideation Integration Plan

## Overview

This document outlines how to integrate DataForSEO APIs to generate researched, search-intent-focused blog post ideas that replace the placeholder `topic-${i}` logic.

## Advantages of DataForSEO

### ✅ Perfect Fit for Your Needs

1. **Keyword Research API**
   - Search volume, keyword difficulty, CPC, trends
   - Related keywords, keyword suggestions, questions
   - Location-specific data (Florida, Texas, etc.) - perfect for your location pages

2. **Search Intent API**
   - Classifies keywords into: informational, commercial, navigational, transactional
   - Prioritize informational content (matches your SEO strategy)

3. **SERP Analysis API**
   - See what's ranking, featured snippets, People Also Ask
   - Identify ranking opportunities (topics with less competition)

4. **Question Suggestions API**
   - Find question-based queries (perfect for FAQ sections)
   - "how to catch redfish", "best time to fish florida", etc.

5. **Cost-Effective**
   - Pay-as-you-go pricing (starts at ~$0.01-0.05 per keyword)
   - Only pay for what you use
   - No monthly subscriptions for unused credits

### ✅ Will It Work?

**YES** - Perfect integration because:

1. Your pipeline already supports API sources (`fetchMethod: 'api'` in source registry)
2. You have rate limiting infrastructure (`rateLimitPerMin`)
3. You need exactly what DataForSEO provides
4. Location-specific data aligns with your Florida/local focus
5. Pay-as-you-go fits startup budgets

## Integration Architecture

### New Module: `scripts/pipeline/ideation.ts`

**Purpose:** Generate blog post ideas using DataForSEO keyword research

**Key Functions:**

```typescript
// Generate blog ideas from DataForSEO
async function generateBlogIdeas(options: {
  category: string; // 'fishing-tips', 'gear-reviews', etc.
  location?: string; // 'florida', 'texas', etc.
  maxIdeas: number;
  minSearchVolume?: number; // Filter low-volume keywords
  maxDifficulty?: number; // Filter high-competition keywords
}): Promise<BlogIdea[]>

// Research keyword opportunity
async function researchKeyword(keyword: string, location?: string): Promise<KeywordData>

// Check if keyword matches search intent (informational only)
async function checkSearchIntent(keyword: string): Promise<'informational' | 'commercial' | 'navigational' | 'transactional'>

// Find related questions for a keyword
async function findRelatedQuestions(keyword: string): Promise<string[]>
```

### New Types: `scripts/pipeline/types.ts` (additions)

```typescript
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
  trends: Array<{ month: string; volume: number }>;
  relatedKeywords: string[];
  questions: string[];
  serpFeatures: string[];
}
```

## DataForSEO API Endpoints Needed

### 1. **Keyword Research API**
```
POST /v3/dataforseo_labs/google/keywords_for_site/live/advanced
```
**Purpose:** Find keywords related to fishing topics

**Example Query:**
```json
{
  "target": "fishing tips",
  "location_code": 2840, // USA
  "language_code": "en",
  "limit": 100,
  "filters": [
    ["keyword_info.search_volume", ">", 100], // Min 100 searches/month
    ["keyword_info.keyword_difficulty", "<", 50] // Max 50 difficulty
  ]
}
```

### 2. **Search Intent API**
```
POST /v3/dataforseo_labs/google/search_intent/live/advanced
```
**Purpose:** Classify search intent (filter to informational only)

**Example Query:**
```json
{
  "keywords": ["how to catch redfish", "best fishing rods 2024"],
  "location_code": 2840,
  "language_code": "en"
}
```

### 3. **SERP API**
```
POST /v3/serp/google/organic/live/advanced
```
**Purpose:** Analyze SERP features (featured snippets, People Also Ask)

**Example Query:**
```json
{
  "keyword": "best time to fish florida",
  "location_code": 2840,
  "language_code": "en",
  "depth": 1
}
```

### 4. **Keyword Suggestions API**
```
POST /v3/dataforseo_labs/google/keywords_for_keywords/live
```
**Purpose:** Find related keywords and questions

**Example Query:**
```json
{
  "keywords": ["fishing florida"],
  "location_code": 2840,
  "language_code": "en",
  "limit": 50,
  "sort_by": "search_volume",
  "include_serp_info": true
}
```

## Integration Steps

### Step 1: Add DataForSEO to Source Registry

```typescript
// scripts/pipeline/sourceRegistry.ts
export const APPROVED_SOURCES: SourceRegistryEntry[] = [
  // ... existing sources ...
  
  {
    id: 'src-dataforseo',
    name: 'DataForSEO Labs API',
    homepage: 'https://api.dataforseo.com',
    allowedPaths: ['/v3/dataforseo_labs', '/v3/serp'],
    disallowedPaths: [],
    rateLimitPerMin: 60, // DataForSEO allows up to 60 requests/min on most plans
    fetchMethod: 'api',
    apiKey: process.env.DATAFORSEO_API_KEY,
    headers: {
      'Authorization': `Basic ${Buffer.from(`${process.env.DATAFORSEO_LOGIN}:${process.env.DATAFORSEO_PASSWORD}`).toString('base64')}`
    },
    tags: ['keyword-research', 'seo-data'],
    notes: 'Keyword research and SEO data for blog ideation. Used for finding high-value blog topics.',
    status: 'active',
  },
];
```

### Step 2: Create Ideation Module

Create `scripts/pipeline/ideation.ts` with:

```typescript
/**
 * Ideation Module - Generate blog ideas from DataForSEO
 */

import { logger } from './logger';
import { fetchUrl } from './fetcher';
import { getSourceById } from './sourceRegistry';
import { BlogIdea, KeywordData } from './types';
import { generateSlug } from './utils';

const DATAFORSEO_API_URL = 'https://api.dataforseo.com';
const DATAFORSEO_LOGIN = process.env.DATAFORSEO_LOGIN;
const DATAFORSEO_PASSWORD = process.env.DATAFORSEO_PASSWORD;

/**
 * Generate blog ideas using DataForSEO
 */
export async function generateBlogIdeas(options: {
  category: string;
  location?: string;
  maxIdeas: number;
  minSearchVolume?: number;
  maxDifficulty?: number;
}): Promise<BlogIdea[]> {
  logger.info(`Generating blog ideas for category: ${options.category}`);
  
  // 1. Build seed keywords based on category
  const seedKeywords = getSeedKeywords(options.category, options.location);
  
  // 2. Get keyword suggestions from DataForSEO
  const keywordData = await fetchKeywordSuggestions(seedKeywords, options.location);
  
  // 3. Filter by search intent (informational only)
  const informationalKeywords = await filterByIntent(keywordData, 'informational');
  
  // 4. Filter by volume and difficulty
  const filtered = informationalKeywords.filter(k => {
    if (options.minSearchVolume && k.searchVolume < options.minSearchVolume) return false;
    if (options.maxDifficulty && k.keywordDifficulty > options.maxDifficulty) return false;
    return true;
  });
  
  // 5. Calculate opportunity scores
  const scored = filtered.map(k => ({
    ...k,
    opportunityScore: calculateOpportunityScore(k),
  }));
  
  // 6. Sort by opportunity score (highest first)
  scored.sort((a, b) => b.opportunityScore - a.opportunityScore);
  
  // 7. Convert to blog ideas
  const ideas = scored.slice(0, options.maxIdeas).map(k => keywordToBlogIdea(k, options.category));
  
  logger.info(`Generated ${ideas.length} blog ideas`);
  return ideas;
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
async function fetchKeywordSuggestions(
  seedKeywords: string[],
  location?: string
): Promise<KeywordData[]> {
  // Implementation: Call DataForSEO Keyword Suggestions API
  // Return structured keyword data
}

/**
 * Filter keywords by search intent
 */
async function filterByIntent(
  keywords: KeywordData[],
  intent: 'informational' | 'commercial'
): Promise<KeywordData[]> {
  // Implementation: Call DataForSEO Search Intent API
  // Filter to only informational keywords
}

/**
 * Calculate opportunity score (0-100)
 * Higher = better opportunity
 */
function calculateOpportunityScore(keyword: KeywordData): number {
  // Formula combines:
  // - High search volume = good
  // - Low difficulty = good
  // - Has SERP features = good (ranking opportunities)
  // - Has related questions = good (FAQ content)
  
  const volumeScore = Math.min(keyword.searchVolume / 1000, 1) * 30; // Max 30 points
  const difficultyScore = (100 - keyword.keywordDifficulty) / 100 * 30; // Max 30 points
  const serpScore = keyword.serpFeatures.length * 5; // Max 20 points (4 features)
  const questionScore = Math.min(keyword.questions.length / 10, 1) * 20; // Max 20 points
  
  return volumeScore + difficultyScore + serpScore + questionScore;
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
 * Generate title from keyword
 */
function generateTitleFromKeyword(keyword: string): string {
  // Capitalize and format: "how to catch redfish" → "How to Catch Redfish: Complete Guide"
  const words = keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1));
  return `${words.join(' ')}: Complete Guide`;
}
```

### Step 3: Update Seed Command

Replace placeholder logic in `scripts/run.ts`:

```typescript
// OLD (lines 49-57):
// Example seed data (replace with actual topic generation logic)
for (let i = 0; i < count; i++) {
  const topicKey = generateTopicKey(type, {
    blog: `topic-${i}`,
    // ...
  });
}

// NEW:
if (type === 'blog') {
  // Generate researched blog ideas using DataForSEO
  const ideas = await generateBlogIdeas({
    category: 'fishing-tips', // TODO: Make this configurable
    location: 'florida', // TODO: Make this configurable
    maxIdeas: count,
    minSearchVolume: 100, // Min 100 searches/month
    maxDifficulty: 50, // Max 50 difficulty
  });
  
  for (const idea of ideas) {
    const topicKey = generateTopicKey(type, {
      blog: idea.slug,
    });
    
    const priority = calculatePriority(type, topicKey);
    // Boost priority for high opportunity scores
    const adjustedPriority = priority + Math.floor(idea.opportunityScore / 10);
    
    await addJob({
      type,
      topicKey,
      priority: adjustedPriority,
      maxAttempts: 3,
      scheduledAt: new Date().toISOString(),
      metadata: {
        keyword: idea.keyword,
        searchVolume: idea.searchVolume,
        opportunityScore: idea.opportunityScore,
        relatedQuestions: idea.relatedQuestions,
      },
    });
  }
}
```

### Step 4: Environment Variables

Add to `.env.local`:

```bash
# DataForSEO API Credentials
DATAFORSEO_LOGIN=your_login_email
DATAFORSEO_PASSWORD=your_api_password
```

### Step 5: Update Job Processing

Use keyword metadata in content generation:

```typescript
// In processJob function, use relatedQuestions from metadata
if (job.metadata?.relatedQuestions) {
  // Use these questions for FAQ generation
  brief.relatedQuestions = job.metadata.relatedQuestions;
}
```

## Cost Estimate

**DataForSEO Pricing (as of 2024):**

- Keyword Suggestions API: ~$0.02 per request (gets ~50 keywords)
- Search Intent API: ~$0.01 per keyword
- SERP API: ~$0.05 per request

**Example: Generate 20 blog ideas**

1. 2 seed keywords × $0.02 = $0.04 (keyword suggestions)
2. 100 keywords × $0.01 = $1.00 (search intent filtering)
3. 20 keywords × $0.05 = $1.00 (SERP analysis)

**Total: ~$2.04 for 20 researched blog ideas**

This is very cost-effective compared to:
- Ahrefs: $99/month minimum
- SEMrush: $119/month minimum
- Manual research: Hours of time

## Next Steps

1. ✅ Sign up for DataForSEO account
2. ✅ Get API credentials
3. ✅ Create `scripts/pipeline/ideation.ts` module
4. ✅ Add DataForSEO to source registry
5. ✅ Update seed command to use ideation module
6. ✅ Test with small batch (5 blog ideas)
7. ✅ Scale up once working

## Example Output

After integration, running:

```bash
node scripts/run.ts seed --type blog --count 10
```

Would generate real blog ideas like:

```json
[
  {
    "keyword": "best time to fish florida",
    "searchVolume": 1200,
    "keywordDifficulty": 35,
    "opportunityScore": 78,
    "slug": "best-time-to-fish-florida",
    "title": "Best Time to Fish Florida: Complete Guide",
    "relatedQuestions": [
      "What is the best month to fish in Florida?",
      "What time of day is best for fishing in Florida?",
      "What are the best fishing seasons in Florida?"
    ]
  },
  {
    "keyword": "how to catch snook in florida",
    "searchVolume": 890,
    "keywordDifficulty": 28,
    "opportunityScore": 82,
    "slug": "how-to-catch-snook-in-florida",
    "title": "How to Catch Snook in Florida: Complete Guide",
    "relatedQuestions": [
      "What is the best bait for snook in Florida?",
      "Where can you catch snook in Florida?",
      "What time of year is best for snook fishing?"
    ]
  }
  // ... 8 more researched ideas
]
```

## Summary

✅ **DataForSEO is perfect for this** - provides exactly what you need  
✅ **Cost-effective** - pay-as-you-go, ~$0.10 per blog idea  
✅ **Will work** - integrates cleanly with your existing pipeline  
✅ **Scalable** - can generate hundreds of ideas automatically  
✅ **Research-backed** - real search volume, intent, competition data

**Recommendation:** Proceed with DataForSEO integration. It's the most cost-effective and feature-complete solution for automated blog ideation.
