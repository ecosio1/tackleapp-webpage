# Automated Content Publishing Pipeline - Tackle SEO System

**Version:** 1.0  
**Goal:** Safely generate hundreds/thousands of SEO pages without duplicate/thin content flags  
**Exclusions:** No regulations pages (outbound links only)

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Source Strategy](#source-strategy)
3. [Data Extraction & Normalization](#data-extraction--normalization)
4. [De-duplication & Canonicalization](#de-duplication--canonicalization)
5. [Content Generation (LLM)](#content-generation-llm)
6. [Internal Link Generation](#internal-link-generation)
7. [Publishing Workflow](#publishing-workflow)
8. [Scheduling Strategy](#scheduling-strategy)
9. [Revalidation & Sitemap Updates](#revalidation--sitemap-updates)
10. [Monitoring, QA & Rollback](#monitoring-qa--rollback)

---

## Architecture Overview

### Pipeline Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        SOURCE REGISTRY                           │
│  (Approved sources per category with rate limits & paths)        │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTRACTION LAYER                              │
│  1. Fetch (RSS/HTML/API)                                         │
│  2. Parse & Normalize → RawDocument                                │
│  3. Extract Facts, Entities, Hints                             │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  DEDUPLICATION LAYER                             │
│  1. URL-level dedupe                                             │
│  2. Content hash dedupe                                          │
│  3. Embedding similarity check                                   │
│  4. Topic Key generation                                         │
│  5. Topic Index lookup                                           │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  CONTENT GENERATION LAYER                        │
│  1. Build ContentBrief from Facts                                │
│  2. Generate Internal Links                                      │
│  3. LLM Prompt (per page type)                                  │
│  4. Output Validation (quality gates)                            │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PUBLISHING LAYER                              │
│  1. Schema Validation                                            │
│  2. Write to Storage (DB/File)                                   │
│  3. Update Topic Index                                            │
│  4. Trigger Revalidation                                         │
│  5. Update Sitemap                                               │
└────────────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MONITORING LAYER                              │
│  - Quality Metrics                                               │
│  - Publishing Stats                                              │
│  - Alerting                                                       │
│  - Rollback Capability                                           │
└─────────────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Never Copy-Paste:** All content is original, generated from extracted facts
2. **Topic Canonicalization:** One topic = one page (prevent duplicates)
3. **Quality Gates:** All content must pass validation before publishing
4. **Source Attribution:** Facts are cited, not copied
5. **Automated Linking:** Internal links generated algorithmically
6. **Version Control:** All content is versioned for rollback

---

## Source Strategy

### Source Registry Structure

```typescript
/**
 * Source Registry - Approved sources per content category
 */
export interface SourceRegistry {
  sources: SourceEntry[];
}

export interface SourceEntry {
  id: string; // UUID
  name: string; // Display name
  homepage: string; // Base URL
  category: SourceCategory; // Content category
  allowedPaths: string[]; // Allowed URL patterns (regex or glob)
  disallowedPaths: string[]; // Disallowed URL patterns
  rateLimitPerMin: number; // Requests per minute
  fetchMethod: 'rss' | 'html' | 'api'; // Fetch method
  apiKey?: string; // API key if needed
  headers?: Record<string, string>; // Custom headers
  notes: string; // Notes about source
  lastFetchedAt?: string; // ISO 8601
  status: 'active' | 'paused' | 'deprecated';
}

export type SourceCategory =
  | 'weather-conditions' // Weather/conditions concepts
  | 'tides-solunar' // Tide/solunar explanations
  | 'species-biology' // Species biology/habitat
  | 'seasonal-patterns' // Seasonal patterns (non-volatile)
  | 'technique-guides'; // General technique guides
```

### Source Registry Configuration

```typescript
export const SOURCE_REGISTRY: SourceRegistry = {
  sources: [
    // Weather/Conditions Sources
    {
      id: 'src-001',
      name: 'NOAA Weather Service',
      homepage: 'https://www.weather.gov',
      category: 'weather-conditions',
      allowedPaths: ['/marine', '/forecasts'],
      disallowedPaths: ['/archive', '/historical'],
      rateLimitPerMin: 10,
      fetchMethod: 'api',
      notes: 'Official weather data - educational use only. Extract facts about weather patterns, not copy text.',
      status: 'active'
    },
    {
      id: 'src-002',
      name: 'Weather Underground - Marine',
      homepage: 'https://www.wunderground.com',
      category: 'weather-conditions',
      allowedPaths: ['/marine'],
      disallowedPaths: ['/premium', '/api'],
      rateLimitPerMin: 5,
      fetchMethod: 'html',
      notes: 'Marine weather concepts - extract educational facts only.',
      status: 'active'
    },
    
    // Tides/Solunar Sources
    {
      id: 'src-003',
      name: 'NOAA Tides & Currents',
      homepage: 'https://tidesandcurrents.noaa.gov',
      category: 'tides-solunar',
      allowedPaths: ['/tides', '/predictions'],
      disallowedPaths: [],
      rateLimitPerMin: 15,
      fetchMethod: 'api',
      notes: 'Tide data and explanations - extract concepts, not copy explanations.',
      status: 'active'
    },
    {
      id: 'src-004',
      name: 'Solunar Fishing Times',
      homepage: 'https://www.solunarforecast.com',
      category: 'tides-solunar',
      allowedPaths: ['/fishing-times'],
      disallowedPaths: ['/premium'],
      rateLimitPerMin: 5,
      fetchMethod: 'html',
      notes: 'Solunar concepts - educational facts only.',
      status: 'active'
    },
    
    // Species Biology Sources
    {
      id: 'src-005',
      name: 'FishBase',
      homepage: 'https://www.fishbase.se',
      category: 'species-biology',
      allowedPaths: ['/summary'],
      disallowedPaths: [],
      rateLimitPerMin: 20,
      fetchMethod: 'api',
      notes: 'Species biology database - extract facts about habitat, diet, behavior. Never copy descriptions verbatim.',
      status: 'active'
    },
    {
      id: 'src-006',
      name: 'Florida Fish and Wildlife Conservation Commission',
      homepage: 'https://myfwc.com',
      category: 'species-biology',
      allowedPaths: ['/wildlifehabitats/profiles', '/fishing/saltwater'],
      disallowedPaths: ['/regulations', '/licenses'],
      rateLimitPerMin: 10,
      fetchMethod: 'html',
      notes: 'Species profiles - extract habitat and behavior facts. Do NOT extract regulations.',
      status: 'active'
    },
    {
      id: 'src-007',
      name: 'NOAA Fisheries',
      homepage: 'https://www.fisheries.noaa.gov',
      category: 'species-biology',
      allowedPaths: ['/species'],
      disallowedPaths: ['/regulations', '/management'],
      rateLimitPerMin: 15,
      fetchMethod: 'api',
      notes: 'Species information - extract biology facts only.',
      status: 'active'
    },
    
    // Seasonal Patterns Sources
    {
      id: 'src-008',
      name: 'Salt Water Sportsman - Seasonal Guides',
      homepage: 'https://www.saltwatersportsman.com',
      category: 'seasonal-patterns',
      allowedPaths: ['/fishing-tips', '/seasonal'],
      disallowedPaths: ['/premium', '/subscription'],
      rateLimitPerMin: 3,
      fetchMethod: 'html',
      notes: 'Seasonal fishing patterns - extract general patterns, not specific articles. Rewrite all concepts.',
      status: 'active'
    },
    
    // Technique Guides Sources
    {
      id: 'src-009',
      name: 'Take Me Fishing - Techniques',
      homepage: 'https://www.takemefishing.org',
      category: 'technique-guides',
      allowedPaths: ['/how-to-fish'],
      disallowedPaths: [],
      rateLimitPerMin: 5,
      fetchMethod: 'html',
      notes: 'General fishing techniques - extract concepts, create original explanations.',
      status: 'active'
    }
  ]
};
```

### Source Usage Rules

**Critical Rules:**
1. **Never Copy-Paste:** We extract facts and create original explanations
2. **Fact Extraction Only:** Extract structured facts (habitat, size, behavior), not prose
3. **Source Attribution:** Facts are cited in sources array, not copied
4. **Educational Use:** Sources are used for educational fact extraction only
5. **Rate Limiting:** Always respect rate limits to avoid blocking
6. **Path Restrictions:** Only fetch from allowed paths, never from disallowed paths

**Example Fact Extraction:**
- ❌ **Bad:** Copying "Redfish prefer shallow inshore waters with grass flats and mangrove shorelines."
- ✅ **Good:** Extracting fact: `{ claim: "Redfish habitat includes shallow inshore waters", confidence: 0.95, scope: "global" }` then generating original explanation

---

## Data Extraction & Normalization

### RawDocument Structure

```typescript
/**
 * Raw document extracted from source
 */
export interface RawDocument {
  // Identity
  sourceId: string; // Source registry ID
  url: string; // Original URL
  fetchedAt: string; // ISO 8601
  
  // Content
  title: string; // Extracted title
  html?: string; // Raw HTML (if HTML source)
  text: string; // Cleaned text content
  headings: Heading[]; // Extracted headings (H1-H3)
  
  // Extracted Data
  extractedFacts: Fact[]; // Structured facts
  entities: Entity[]; // Named entities (species, locations, etc.)
  locationHints: string[]; // Location mentions (e.g., ["Florida", "Miami"])
  speciesHints: string[]; // Species mentions (e.g., ["redfish", "snook"])
  tags: string[]; // Content tags
  
  // Metadata
  contentType: 'article' | 'guide' | 'data' | 'unknown';
  language: string; // ISO 639-1 (e.g., "en")
  wordCount: number;
  qualityScore: number; // 0-1 (signal vs noise)
}
```

### Fact Structure

```typescript
/**
 * Extracted fact from source
 */
export interface Fact {
  claim: string; // Factual claim (e.g., "Redfish prefer water temperatures 65-75°F")
  confidence: number; // 0-1 (extraction confidence)
  supportingSources: string[]; // Source URLs
  observedAt: string; // ISO 8601 (when fact was observed)
  scope: 'global' | 'regional' | 'seasonal' | 'location-specific';
  category: 'habitat' | 'behavior' | 'diet' | 'size' | 'season' | 'technique' | 'weather' | 'other';
  entities?: string[]; // Related entities (species, locations)
}
```

### Entity Structure

```typescript
/**
 * Named entity extracted from content
 */
export interface Entity {
  text: string; // Entity text
  type: 'species' | 'location' | 'technique' | 'gear' | 'other';
  confidence: number; // 0-1
  normalized?: string; // Normalized form (e.g., "Red Drum" → "redfish")
}
```

### Heading Structure

```typescript
export interface Heading {
  level: 1 | 2 | 3; // H1, H2, H3
  text: string; // Heading text
  id?: string; // Anchor ID (generated)
}
```

### Extraction Process

#### 1. Fetch Content

```typescript
async function fetchContent(source: SourceEntry, url: string): Promise<RawDocument> {
  // Rate limit check
  // Fetch based on method (RSS/HTML/API)
  // Return raw HTML/text
}
```

#### 2. Parse & Normalize

```typescript
function parseAndNormalize(html: string, source: SourceEntry): RawDocument {
  // 1. Strip boilerplate (nav, footer, ads, scripts)
  // 2. Extract title (from <title> or H1)
  // 3. Extract headings (H1-H3)
  // 4. Extract main content (article, main, or content selectors)
  // 5. Clean text (remove extra whitespace, normalize)
  // 6. Calculate quality score (signal vs noise ratio)
  
  // Reject if:
  // - Word count < 200
  // - Quality score < 0.3
  // - No headings found
  // - Too much boilerplate (> 50% of content)
}
```

#### 3. Extract Facts

```typescript
function extractFacts(text: string, headings: Heading[]): Fact[] {
  // Use NLP/LLM to extract structured facts:
  // - Habitat claims: "X prefers Y habitat"
  // - Size claims: "X grows to Y inches"
  // - Seasonal claims: "X is most active in Y season"
  // - Behavioral claims: "X feeds on Y"
  // - Technique claims: "Use Y technique for X"
  
  // Return array of Fact objects with:
  // - claim (normalized)
  // - confidence (extraction confidence)
  // - category
  // - scope
}
```

#### 4. Extract Entities

```typescript
function extractEntities(text: string): Entity[] {
  // Use NER (Named Entity Recognition) or LLM to extract:
  // - Species names (redfish, snook, tarpon)
  // - Locations (Florida, Miami, Tampa Bay)
  // - Techniques (jigging, trolling, sight fishing)
  // - Gear (spinning rod, braided line)
  
  // Normalize species names to slugs
  // Normalize locations to state/city format
}
```

#### 5. Extract Hints

```typescript
function extractHints(entities: Entity[], text: string): {
  locationHints: string[];
  speciesHints: string[];
} {
  // From entities, extract:
  // - locationHints: unique location mentions
  // - speciesHints: unique species mentions
  
  // Normalize to slugs/codes
}
```

### Extraction Safety Rules

1. **Boilerplate Removal:**
   - Remove navigation, footer, ads, scripts
   - Keep only main content area
   - Remove "Related Articles" sections

2. **Quality Thresholds:**
   - Minimum 200 words of actual content
   - Quality score > 0.3 (signal vs noise)
   - At least 2 headings (H2 or H3)
   - At least 5 extracted facts

3. **Rejection Criteria:**
   - Too much boilerplate (> 50% of content)
   - No factual content (only opinions/ads)
   - Duplicate content (check against existing)
   - Copyright notices or paywalls

---

## De-duplication & Canonicalization

### Deduplication Layers

#### Layer 1: URL-Level Dedupe

```typescript
function normalizeUrl(url: string): string {
  // 1. Remove UTM parameters
  // 2. Remove tracking parameters
  // 3. Normalize protocol (http → https)
  // 4. Remove trailing slashes
  // 5. Remove fragments (#)
  // 6. Sort query parameters
  
  // Example:
  // "https://example.com/page?utm_source=google&id=123"
  // → "https://example.com/page?id=123"
}
```

#### Layer 2: Content Hash Dedupe

```typescript
function generateContentHash(text: string): string {
  // 1. Normalize text (lowercase, remove whitespace)
  // 2. Remove stop words
  // 3. Generate SHA-256 hash
  // 4. Compare against existing content hashes
  
  // If hash exists → skip (exact duplicate)
}
```

#### Layer 3: Embedding Similarity Check

```typescript
async function checkSimilarity(
  text: string,
  threshold: number = 0.85
): Promise<{ isDuplicate: boolean; similarTopicKey?: string }> {
  // 1. Generate embedding for text (using OpenAI/Cohere)
  // 2. Compare against embeddings of published content
  // 3. If similarity > threshold → mark as duplicate
  // 4. Return similar topic key if found
  
  // Threshold: 0.85 = 85% similar (very similar, likely duplicate)
}
```

### Topic Key System

```typescript
/**
 * Topic Key - Canonical identifier for a topic
 */
export type TopicKey = string;

/**
 * Generate topic key from content type and identifiers
 */
function generateTopicKey(
  pageType: 'species' | 'how-to' | 'location' | 'blog',
  identifiers: {
    species?: string; // slug
    howTo?: string; // slug
    state?: string; // state code
    city?: string; // city slug
    blog?: string; // topic identifier
  }
): TopicKey {
  // Format: "{type}::{identifier1}::{identifier2}"
  
  // Examples:
  // - "species::redfish::florida"
  // - "howto::tie_fg_knot"
  // - "location::fl::naples"
  // - "blog::best_lures_for_snook_in_winter"
  
  switch (pageType) {
    case 'species':
      return `species::${identifiers.species}::${identifiers.state || 'global'}`;
    case 'how-to':
      return `howto::${identifiers.howTo}`;
    case 'location':
      return `location::${identifiers.state}::${identifiers.city}`;
    case 'blog':
      return `blog::${identifiers.blog}`;
  }
}
```

### Topic Index

```typescript
/**
 * Topic Index - Prevents duplicate topics
 */
export interface TopicIndex {
  topicKey: TopicKey;
  pageType: 'species' | 'how-to' | 'location' | 'blog';
  slug: string; // Current slug
  lastPublishedAt: string; // ISO 8601
  lastUpdatedAt: string; // ISO 8601
  status: 'published' | 'draft' | 'archived';
  contentHash: string; // SHA-256 of content
  sourcesUsed: string[]; // Source IDs used
  embedding?: number[]; // Content embedding for similarity
}

/**
 * Check if topic already exists
 */
async function checkTopicExists(topicKey: TopicKey): Promise<TopicIndex | null> {
  // Query Topic Index database/table
  // Return existing topic or null
}

/**
 * Register new topic
 */
async function registerTopic(topic: TopicIndex): Promise<void> {
  // Insert/update Topic Index
  // Store embedding for similarity checks
}
```

### Collision Handling

```typescript
/**
 * Handle slug collisions
 */
async function resolveSlugCollision(
  desiredSlug: string,
  pageType: string
): Promise<string> {
  // 1. Check if slug exists in database
  // 2. If exists:
  //    - Check if it's the same topic (via Topic Key)
  //    - If same topic → use existing slug
  //    - If different topic → append short suffix
  // 3. Suffix options:
  //    - "-2", "-3" (if generic)
  //    - "-[state]" (if location-specific)
  //    - "-[year]" (if time-sensitive)
  
  // Example:
  // "bass" → "largemouth-bass" (more specific)
  // "miami" → "florida/miami" (location structure)
}
```

---

## Content Generation (LLM)

### ContentBrief Structure

```typescript
/**
 * Content brief - input to LLM generation
 */
export interface ContentBrief {
  // Identity
  pageType: 'species' | 'how-to' | 'location' | 'blog';
  slug: string;
  topicKey: TopicKey;
  
  // SEO
  title: string; // Target title
  primaryKeyword: string;
  secondaryKeywords: string[];
  
  // Content Structure
  outline: OutlineItem[]; // Required sections
  
  // Facts & Sources
  keyFacts: Fact[]; // Facts to include
  sources: Source[]; // Sources to cite
  
  // Internal Links
  internalLinksToInclude: {
    speciesSlugs?: string[];
    howToSlugs?: string[];
    locationSlugs?: string[];
    postSlugs?: string[];
  };
  
  // Requirements
  disclaimers: string[]; // Required disclaimers
  minWordCount: number;
  requiredSections: string[]; // Section names that must appear
}
```

### Outline Structure

```typescript
export interface OutlineItem {
  level: 2 | 3; // H2 or H3
  title: string; // Section title
  description: string; // What to cover in this section
  keyFacts?: Fact[]; // Facts relevant to this section
}
```

### Prompt Templates

#### Species Page Prompt Template

```typescript
const SPECIES_PAGE_PROMPT = `
You are writing an SEO-optimized fishing guide about {speciesName}.

TITLE: {title}
PRIMARY KEYWORD: {primaryKeyword}
SECONDARY KEYWORDS: {secondaryKeywords}

REQUIREMENTS:
1. Write original, helpful content (minimum {minWordCount} words)
2. Use beginner-friendly language with definitions
3. Include all required sections from the outline
4. Never copy text verbatim from sources
5. Cite facts but explain in your own words
6. Include 5-8 FAQs at the end
7. Include a "What to do next" CTA pointing to /download
8. Include a "See local regulations" outbound link block (no legal advice)

OUTLINE (must include all sections):
{outline}

KEY FACTS TO INCLUDE (cite these, don't copy):
{keyFacts}

INTERNAL LINKS TO INCLUDE:
- How-to guides: {howToLinks}
- Locations: {locationLinks}
- Blog posts: {postLinks}

SOURCES CONSULTED (cite at end, don't copy):
{sources}

DISCLAIMERS TO INCLUDE:
{disclaimers}

OUTPUT FORMAT:
- Markdown format
- Use H2 for main sections, H3 for subsections
- Include internal links naturally in content
- End with FAQs section
- End with "What to do next" CTA
- End with "See local regulations" link block
- End with "Sources consulted" list

Write the complete article now:
`;
```

#### How-To Page Prompt Template

```typescript
const HOW_TO_PAGE_PROMPT = `
You are writing an SEO-optimized how-to guide: {title}

PRIMARY KEYWORD: {primaryKeyword}
SECONDARY KEYWORDS: {secondaryKeywords}

REQUIREMENTS:
1. Write original, step-by-step guide (minimum {minWordCount} words)
2. Use beginner-friendly language
3. Include numbered steps if applicable
4. Include "Tips & Tricks" section
5. Include "Common Mistakes" section
6. Include "Best Conditions" section
7. Never copy text verbatim from sources
8. Include 5-8 FAQs at the end
9. Include a "What to do next" CTA pointing to /download
10. Include a "See local regulations" outbound link block (no legal advice)

OUTLINE (must include all sections):
{outline}

KEY FACTS TO INCLUDE (cite these, don't copy):
{keyFacts}

INTERNAL LINKS TO INCLUDE:
- Species: {speciesLinks}
- Locations: {locationLinks}
- Related guides: {howToLinks}

SOURCES CONSULTED (cite at end, don't copy):
{sources}

DISCLAIMERS TO INCLUDE:
{disclaimers}

OUTPUT FORMAT:
- Markdown format
- Use H2 for main sections
- Include numbered steps if applicable
- Include internal links naturally
- End with FAQs section
- End with "What to do next" CTA
- End with "See local regulations" link block
- End with "Sources consulted" list

Write the complete guide now:
`;
```

#### Location Page Prompt Template

```typescript
const LOCATION_PAGE_PROMPT = `
You are writing an SEO-optimized fishing guide for {city}, {state}.

TITLE: {title}
PRIMARY KEYWORD: {primaryKeyword}
SECONDARY KEYWORDS: {secondaryKeywords}

REQUIREMENTS:
1. Write original, helpful location guide (minimum {minWordCount} words)
2. Include specific fishing spots (5-10 spots with descriptions)
3. Include "Popular Species" section
4. Include "Fishing Techniques" section
5. Include "Best Times to Fish" section
6. Include "Local Tips" section
7. Never copy text verbatim from sources
8. Include 5-8 FAQs at the end
9. Include a "What to do next" CTA pointing to /download
10. Include a prominent "See local regulations" outbound link (required)

OUTLINE (must include all sections):
{outline}

KEY FACTS TO INCLUDE (cite these, don't copy):
{keyFacts}

INTERNAL LINKS TO INCLUDE:
- Species: {speciesLinks}
- How-to guides: {howToLinks}
- Blog posts: {postLinks}

SOURCES CONSULTED (cite at end, don't copy):
{sources}

DISCLAIMERS TO INCLUDE:
{disclaimers}

OUTPUT FORMAT:
- Markdown format
- Use H2 for main sections, H3 for fishing spots
- Include internal links naturally
- End with FAQs section
- End with "What to do next" CTA
- End with prominent "See local regulations" link block
- End with "Sources consulted" list

Write the complete location guide now:
`;
```

#### Blog Post Prompt Template

```typescript
const BLOG_POST_PROMPT = `
You are writing an SEO-optimized blog post: {title}

PRIMARY KEYWORD: {primaryKeyword}
SECONDARY KEYWORDS: {secondaryKeywords}
CATEGORY: {category}

REQUIREMENTS:
1. Write original, engaging blog post (minimum {minWordCount} words)
2. Use conversational, helpful tone
3. Include all required sections from the outline
4. Never copy text verbatim from sources
5. Include 5-8 FAQs at the end (optional but recommended)
6. Include a "What to do next" CTA pointing to /download
7. Include a "See local regulations" outbound link block if relevant

OUTLINE (must include all sections):
{outline}

KEY FACTS TO INCLUDE (cite these, don't copy):
{keyFacts}

INTERNAL LINKS TO INCLUDE:
- Species: {speciesLinks}
- How-to guides: {howToLinks}
- Locations: {locationLinks}

SOURCES CONSULTED (cite at end, don't copy):
{sources}

DISCLAIMERS TO INCLUDE:
{disclaimers}

OUTPUT FORMAT:
- Markdown format
- Use H2 for main sections, H3 for subsections
- Include internal links naturally
- End with FAQs section (if applicable)
- End with "What to do next" CTA
- End with "See local regulations" link block (if relevant)
- End with "Sources consulted" list

Write the complete blog post now:
`;
```

### Output Validation

```typescript
/**
 * Validate generated content
 */
export interface ValidationResult {
  passed: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  rule: string;
  message: string;
  severity: 'error' | 'warning';
}

/**
 * Validate content against quality gates
 */
async function validateContent(
  content: string,
  brief: ContentBrief
): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  
  // 1. Word count check
  const wordCount = content.split(/\s+/).length;
  if (wordCount < brief.minWordCount) {
    errors.push({
      rule: 'min_word_count',
      message: `Content has ${wordCount} words, minimum is ${brief.minWordCount}`,
      severity: 'error'
    });
  }
  
  // 2. Required sections check
  for (const section of brief.requiredSections) {
    if (!content.toLowerCase().includes(section.toLowerCase())) {
      errors.push({
        rule: 'required_section',
        message: `Missing required section: ${section}`,
        severity: 'error'
      });
    }
  }
  
  // 3. Internal links check
  const internalLinkCount = (content.match(/\[.*?\]\(\/[^)]+\)/g) || []).length;
  const minLinks = brief.pageType === 'location' ? 10 : 5;
  if (internalLinkCount < minLinks) {
    errors.push({
      rule: 'min_internal_links',
      message: `Content has ${internalLinkCount} internal links, minimum is ${minLinks}`,
      severity: 'error'
    });
  }
  
  // 4. Forbidden phrases check
  const forbiddenPhrases = [
    'official regulation',
    'legal advice',
    'official guide',
    'guaranteed to',
    'always legal'
  ];
  for (const phrase of forbiddenPhrases) {
    if (content.toLowerCase().includes(phrase.toLowerCase())) {
      errors.push({
        rule: 'forbidden_phrase',
        message: `Content contains forbidden phrase: "${phrase}"`,
        severity: 'error'
      });
    }
  }
  
  // 5. Plagiarism check (n-gram overlap)
  const plagiarismScore = await checkPlagiarism(content, brief.sources);
  if (plagiarismScore > 0.15) { // 15% overlap threshold
    errors.push({
      rule: 'plagiarism',
      message: `Content has ${(plagiarismScore * 100).toFixed(1)}% similarity to sources (max 15%)`,
      severity: 'error'
    });
  }
  
  // 6. FAQ count check
  const faqMatches = content.match(/#{1,3}\s*(?:FAQ|Frequently Asked Questions|Questions?)/i);
  if (!faqMatches || (content.match(/\?\s*\n/g) || []).length < 5) {
    warnings.push({
      rule: 'faq_count',
      message: 'Content may not have enough FAQs (minimum 5 recommended)',
      severity: 'warning'
    });
  }
  
  // 7. CTA check
  if (!content.includes('/download') && !content.includes('download')) {
    warnings.push({
      rule: 'missing_cta',
      message: 'Content may be missing download CTA',
      severity: 'warning'
    });
  }
  
  return {
    passed: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Check for plagiarism using n-gram overlap
 */
async function checkPlagiarism(
  content: string,
  sources: Source[]
): Promise<number> {
  // 1. Extract n-grams from content (3-5 word phrases)
  // 2. Compare against source text n-grams
  // 3. Calculate overlap percentage
  // 4. Return similarity score (0-1)
  
  // Threshold: > 0.15 (15%) = potential plagiarism
}
```

---

## Internal Link Generation

### Link Generation Algorithm

```typescript
/**
 * Generate internal links for a page
 */
export interface LinkGenerationInput {
  pageType: 'species' | 'how-to' | 'location' | 'blog';
  speciesHints?: string[]; // Species mentioned
  locationHints?: string[]; // Locations mentioned
  tags?: string[]; // Content tags
  primaryKeyword: string;
  siteIndex: SiteIndex; // Current site content index
}

export interface LinkGenerationOutput {
  speciesSlugs: string[];
  howToSlugs: string[];
  locationSlugs: string[];
  postSlugs: string[];
}

/**
 * Site index - current published content
 */
export interface SiteIndex {
  species: Array<{ slug: string; keywords: string[]; tags: string[] }>;
  howTo: Array<{ slug: string; keywords: string[]; tags: string[] }>;
  locations: Array<{ slug: string; state: string; city: string; keywords: string[] }>;
  blogPosts: Array<{ slug: string; category: string; keywords: string[]; tags: string[] }>;
}

async function generateInternalLinks(
  input: LinkGenerationInput
): Promise<LinkGenerationOutput> {
  const output: LinkGenerationOutput = {
    speciesSlugs: [],
    howToSlugs: [],
    locationSlugs: [],
    postSlugs: []
  };
  
  switch (input.pageType) {
    case 'blog':
      // Blog posts always link to:
      // - 1-2 species pages
      // - 1-2 how-to pages
      // - 1 location page if local intent detected
      // - /download CTA
      
      output.speciesSlugs = selectBestMatches(
        input.siteIndex.species,
        input.speciesHints || [],
        input.primaryKeyword,
        2
      );
      
      output.howToSlugs = selectBestMatches(
        input.siteIndex.howTo,
        input.tags || [],
        input.primaryKeyword,
        2
      );
      
      if (input.locationHints && input.locationHints.length > 0) {
        output.locationSlugs = selectBestMatches(
          input.siteIndex.locations,
          input.locationHints,
          input.primaryKeyword,
          1
        );
      }
      
      output.postSlugs = selectBestMatches(
        input.siteIndex.blogPosts,
        input.tags || [],
        input.primaryKeyword,
        3
      );
      break;
      
    case 'species':
      // Species pages link to:
      // - 3 how-to guides (specific to species)
      // - 3 locations (top markets)
      // - 3 blog posts
      
      output.howToSlugs = selectBestMatches(
        input.siteIndex.howTo,
        [`catch-${input.speciesHints?.[0]}`, ...(input.tags || [])],
        input.primaryKeyword,
        3
      );
      
      output.locationSlugs = selectBestMatches(
        input.siteIndex.locations,
        input.locationHints || ['florida'], // Default to Florida
        input.primaryKeyword,
        3
      );
      
      output.postSlugs = selectBestMatches(
        input.siteIndex.blogPosts,
        input.speciesHints || [],
        input.primaryKeyword,
        3
      );
      break;
      
    case 'how-to':
      // How-to pages link to:
      // - 3 species pages
      // - 3 location pages
      // - 3 related how-to guides
      
      output.speciesSlugs = selectBestMatches(
        input.siteIndex.species,
        input.speciesHints || [],
        input.primaryKeyword,
        3
      );
      
      output.locationSlugs = selectBestMatches(
        input.siteIndex.locations,
        input.locationHints || [],
        input.primaryKeyword,
        3
      );
      
      output.howToSlugs = selectBestMatches(
        input.siteIndex.howTo,
        input.tags || [],
        input.primaryKeyword,
        3,
        true // Exclude current page
      );
      break;
      
    case 'location':
      // Location pages link to:
      // - 5 species
      // - 5 how-to
      // - 5 blog posts
      // - /download CTA
      
      output.speciesSlugs = selectBestMatches(
        input.siteIndex.species,
        [], // Use location-specific species
        input.primaryKeyword,
        5
      );
      
      output.howToSlugs = selectBestMatches(
        input.siteIndex.howTo,
        input.tags || [],
        input.primaryKeyword,
        5
      );
      
      output.postSlugs = selectBestMatches(
        input.siteIndex.blogPosts,
        input.locationHints || [],
        input.primaryKeyword,
        5
      );
      break;
  }
  
  return output;
}

/**
 * Select best matching content based on keywords/tags
 */
function selectBestMatches(
  candidates: Array<{ slug: string; keywords: string[]; tags?: string[] }>,
  hints: string[],
  primaryKeyword: string,
  count: number,
  excludeCurrent?: boolean
): string[] {
  // 1. Score each candidate:
  //    - Keyword match: +2 points
  //    - Tag match: +1 point
  //    - Hint match: +1 point
  // 2. Sort by score (descending)
  // 3. Return top N slugs
  
  const scored = candidates
    .map(candidate => ({
      slug: candidate.slug,
      score: calculateMatchScore(candidate, hints, primaryKeyword)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
  
  return scored.map(s => s.slug);
}

function calculateMatchScore(
  candidate: { keywords: string[]; tags?: string[] },
  hints: string[],
  primaryKeyword: string
): number {
  let score = 0;
  
  // Primary keyword match
  if (candidate.keywords.includes(primaryKeyword)) {
    score += 2;
  }
  
  // Hint matches
  for (const hint of hints) {
    if (candidate.keywords.some(k => k.includes(hint))) {
      score += 1;
    }
    if (candidate.tags?.includes(hint)) {
      score += 1;
    }
  }
  
  return score;
}
```

### Related Content Modules

```typescript
/**
 * Generate "Related Content" module HTML
 */
function generateRelatedContentModule(
  title: string,
  items: Array<{ title: string; href: string; description?: string }>
): string {
  // Generate HTML for related content module
  // Consistent heading: "Related [Type]"
  // Card-based layout
  // Include descriptions if available
}
```

---

## Publishing Workflow

### Publisher Responsibilities

```typescript
/**
 * Publisher - handles content publishing
 */
export interface Publisher {
  validateSchema(content: any): ValidationResult;
  writeToStorage(content: ContentDoc): Promise<void>;
  updateTopicIndex(topic: TopicIndex): Promise<void>;
  updateSearchIndex(content: ContentDoc): Promise<void>;
  triggerRevalidation(slug: string, pageType: string): Promise<void>;
}
```

### Publishing Process

```typescript
async function publishContent(
  content: GeneratedContent,
  brief: ContentBrief
): Promise<PublishResult> {
  // 1. Validate schema
  const schemaValidation = publisher.validateSchema(content);
  if (!schemaValidation.valid) {
    throw new Error(`Schema validation failed: ${schemaValidation.errors.join(', ')}`);
  }
  
  // 2. Write to storage
  const contentDoc: ContentDoc = {
    ...content,
    id: generateUUID(),
    slug: brief.slug,
    dates: {
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    flags: {
      draft: false,
      noindex: false
    }
  };
  
  await publisher.writeToStorage(contentDoc);
  
  // 3. Update Topic Index
  const topicIndex: TopicIndex = {
    topicKey: brief.topicKey,
    pageType: brief.pageType,
    slug: brief.slug,
    lastPublishedAt: new Date().toISOString(),
    lastUpdatedAt: new Date().toISOString(),
    status: 'published',
    contentHash: generateContentHash(content.body),
    sourcesUsed: brief.sources.map(s => s.id)
  };
  
  await publisher.updateTopicIndex(topicIndex);
  
  // 4. Update search index (optional)
  await publisher.updateSearchIndex(contentDoc);
  
  // 5. Trigger revalidation
  await publisher.triggerRevalidation(brief.slug, brief.pageType);
  
  return {
    success: true,
    slug: brief.slug,
    url: generateUrl(brief.pageType, brief.slug)
  };
}
```

### File Naming Convention (if file-based)

```
content/
├── blog/
│   └── {slug}.json
├── species/
│   └── {slug}.json
├── how-to/
│   └── {slug}.json
└── locations/
    └── {state}/
        └── {city}.json
```

### Draft Mode

```typescript
/**
 * Draft content handling
 */
export interface DraftContent extends ContentDoc {
  flags: {
    draft: true;
    noindex: true;
  };
}

// Drafts are:
// - Stored in database/file system
// - Excluded from sitemap
// - Excluded from search index
// - Accessible via preview URL: /preview/{type}/{slug}?token=...
// - Not indexed by search engines (noindex meta tag)
```

---

## Scheduling Strategy

### Publishing Cadence

```typescript
/**
 * Publishing schedule phases
 */
export interface PublishingSchedule {
  startPhase: {
    blogPosts: { perDay: 1 | 2 };
    locationPages: { perWeek: 2 };
    speciesPages: { perWeek: 1 }; // Refreshes
    howToPages: { perWeek: 1 }; // Refreshes
  };
  scalePhase: {
    blogPosts: { perDay: 5 | 10 | 20 }; // With quality gates
    locationPages: { perMonth: 20 };
    speciesPages: { perMonth: 5 }; // New or refreshes
    howToPages: { perMonth: 5 }; // New or refreshes
  };
}
```

### Job Queue System

```typescript
/**
 * Publishing job
 */
export interface PublishingJob {
  jobId: string; // UUID
  type: 'species' | 'how-to' | 'location' | 'blog';
  topicKey: TopicKey;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  priority: number; // 1-10 (higher = more important)
  attempts: number;
  maxAttempts: number;
  lastError?: string;
  scheduledAt: string; // ISO 8601
  runAt?: string; // ISO 8601
  completedAt?: string; // ISO 8601
  outputs?: {
    slug?: string;
    url?: string;
    errors?: string[];
  };
}

/**
 * Job priority rules
 */
function calculatePriority(job: PublishingJob): number {
  // High intent how-to: 10
  // Florida locations: 9
  // Species evergreen: 8
  // Blog clusters: 7
  // Other: 5
  
  if (job.type === 'how-to' && job.topicKey.includes('beginner')) {
    return 10;
  }
  if (job.type === 'location' && job.topicKey.includes('fl')) {
    return 9;
  }
  if (job.type === 'species') {
    return 8;
  }
  return 7;
}

/**
 * Job queue processor
 */
async function processJobQueue(): Promise<void> {
  // 1. Fetch pending jobs (sorted by priority, then scheduledAt)
  // 2. Process jobs in parallel (max 5 concurrent)
  // 3. Update job status
  // 4. Retry on failure (up to maxAttempts)
  // 5. Log results
}
```

### Topic Backlog

```typescript
/**
 * Topic backlog - prioritized list of topics to publish
 */
export interface TopicBacklog {
  topicKey: TopicKey;
  pageType: 'species' | 'how-to' | 'location' | 'blog';
  priority: number;
  searchIntent: 'high' | 'medium' | 'low';
  estimatedValue: number; // SEO value estimate
  addedAt: string; // ISO 8601
}

/**
 * Prioritize backlog
 */
function prioritizeBacklog(backlog: TopicBacklog[]): TopicBacklog[] {
  // Sort by:
  // 1. Priority (descending)
  // 2. Search intent (high > medium > low)
  // 3. Estimated value (descending)
  // 4. Added at (ascending - FIFO for same priority)
  
  return backlog.sort((a, b) => {
    if (a.priority !== b.priority) return b.priority - a.priority;
    if (a.searchIntent !== b.searchIntent) {
      const intentOrder = { high: 3, medium: 2, low: 1 };
      return intentOrder[b.searchIntent] - intentOrder[a.searchIntent];
    }
    if (a.estimatedValue !== b.estimatedValue) {
      return b.estimatedValue - a.estimatedValue;
    }
    return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
  });
}
```

---

## Revalidation & Sitemap Updates

### Revalidation Process

```typescript
/**
 * Trigger revalidation after publish
 */
async function triggerRevalidation(
  slug: string,
  pageType: 'species' | 'how-to' | 'location' | 'blog'
): Promise<void> {
  // 1. Determine route path
  let path: string;
  switch (pageType) {
    case 'species':
      path = `/species/${slug}`;
      break;
    case 'how-to':
      path = `/how-to/${slug}`;
      break;
    case 'location':
      const [state, city] = slug.split('/');
      path = `/locations/${state}/${city}`;
      break;
    case 'blog':
      path = `/blog/${slug}`;
      break;
  }
  
  // 2. Call Next.js revalidation API
  await fetch(`${process.env.NEXT_PUBLIC_URL}/api/revalidate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.REVALIDATION_SECRET}`
    },
    body: JSON.stringify({
      path,
      type: pageType
    })
  });
  
  // 3. Also revalidate index pages
  await revalidatePath(`/${pageType}`);
  await revalidatePath('/sitemap.xml');
}
```

### Sitemap Update

```typescript
/**
 * Update sitemap after publish
 */
async function updateSitemap(content: ContentDoc): Promise<void> {
  // Next.js sitemap.ts automatically reads from database
  // No manual update needed - ISR handles it
  
  // Optional: Ping search engines
  if (process.env.PING_SEARCH_ENGINES === 'true') {
    await pingGoogle(content.url);
    // await pingBing(content.url);
  }
}

/**
 * Ping Google about new content (optional)
 */
async function pingGoogle(url: string): Promise<void> {
  // Use Google Search Console API or sitemap ping
  // https://www.google.com/ping?sitemap={sitemapUrl}
}
```

### Draft Exclusion

```typescript
/**
 * Ensure drafts are not indexed
 */
function ensureDraftExclusion(content: ContentDoc): void {
  if (content.flags.draft) {
    // Add noindex meta tag
    // Exclude from sitemap
    // Exclude from search index
  }
}
```

---

## Monitoring, QA & Rollback

### Monitoring Dashboards

```typescript
/**
 * Publishing metrics
 */
export interface PublishingMetrics {
  // Daily stats
  pagesPublishedToday: number;
  pagesPublishedThisWeek: number;
  pagesPublishedThisMonth: number;
  
  // Quality metrics
  qualityGatePassRate: number; // 0-1
  averageWordCount: number;
  averageInternalLinks: number;
  
  // Duplicate detection
  duplicateRate: number; // 0-1 (duplicates caught / total processed)
  similarityThresholdViolations: number;
  
  // Errors
  publishingErrors: number;
  validationErrors: number;
  revalidationErrors: number;
  
  // Content types
  speciesPages: number;
  howToPages: number;
  locationPages: number;
  blogPosts: number;
}

/**
 * Crawl errors (from GSC - future integration)
 */
export interface CrawlErrors {
  total: number;
  byType: {
    '404': number;
    '500': number;
    'timeout': number;
    'other': number;
  };
}

/**
 * Index coverage (from GSC - future integration)
 */
export interface IndexCoverage {
  indexed: number;
  notIndexed: number;
  excluded: number;
  coverageRate: number; // 0-1
}
```

### Alerting Rules

```typescript
/**
 * Alert conditions
 */
export interface AlertRule {
  id: string;
  name: string;
  condition: (metrics: PublishingMetrics) => boolean;
  severity: 'critical' | 'warning' | 'info';
  action: 'stop_publishing' | 'notify' | 'log';
}

export const ALERT_RULES: AlertRule[] = [
  {
    id: 'alert-001',
    name: '3 Consecutive Failures',
    condition: (metrics) => metrics.publishingErrors >= 3,
    severity: 'critical',
    action: 'stop_publishing'
  },
  {
    id: 'alert-002',
    name: 'High Duplicate Rate',
    condition: (metrics) => metrics.duplicateRate > 0.1, // 10%
    severity: 'warning',
    action: 'notify'
  },
  {
    id: 'alert-003',
    name: 'Low Quality Pass Rate',
    condition: (metrics) => metrics.qualityGatePassRate < 0.8, // 80%
    severity: 'warning',
    action: 'notify'
  },
  {
    id: 'alert-004',
    name: 'Similarity Threshold Violation',
    condition: (metrics) => metrics.similarityThresholdViolations > 0,
    severity: 'critical',
    action: 'stop_publishing'
  }
];

/**
 * Check alerts
 */
function checkAlerts(metrics: PublishingMetrics): Alert[] {
  const alerts: Alert[] = [];
  
  for (const rule of ALERT_RULES) {
    if (rule.condition(metrics)) {
      alerts.push({
        ruleId: rule.id,
        name: rule.name,
        severity: rule.severity,
        action: rule.action,
        timestamp: new Date().toISOString()
      });
      
      // Execute action
      if (rule.action === 'stop_publishing') {
        stopPublishing();
      } else if (rule.action === 'notify') {
        sendNotification(rule.name, rule.severity);
      }
    }
  }
  
  return alerts;
}
```

### Rollback Capability

```typescript
/**
 * Content version history
 */
export interface ContentVersion {
  versionId: string; // UUID
  contentId: string; // Content ID
  slug: string;
  content: ContentDoc;
  publishedAt: string; // ISO 8601
  publishedBy: string; // System or user
}

/**
 * Rollback content
 */
async function rollbackContent(
  slug: string,
  versionId?: string
): Promise<void> {
  // 1. Find content
  const content = await getContentBySlug(slug);
  
  // 2. Get version to rollback to
  const targetVersion = versionId
    ? await getVersion(versionId)
    : await getPreviousVersion(content.id);
  
  if (!targetVersion) {
    throw new Error('No previous version found');
  }
  
  // 3. Mark current as draft + noindex
  await updateContent(content.id, {
    flags: {
      draft: true,
      noindex: true
    }
  });
  
  // 4. Restore previous version
  const restoredContent: ContentDoc = {
    ...targetVersion.content,
    dates: {
      publishedAt: targetVersion.content.dates.publishedAt,
      updatedAt: new Date().toISOString()
    },
    flags: {
      draft: false,
      noindex: false
    }
  };
  
  await updateContent(content.id, restoredContent);
  
  // 5. Trigger revalidation
  await triggerRevalidation(slug, content.pageType);
  
  // 6. Log rollback
  await logRollback({
    contentId: content.id,
    slug,
    fromVersion: content.versionId,
    toVersion: targetVersion.versionId,
    timestamp: new Date().toISOString()
  });
}
```

### Quality Control Dashboard

```typescript
/**
 * Quality control metrics
 */
export interface QualityControlMetrics {
  // Content quality
  averageWordCount: number;
  averageInternalLinks: number;
  averageFAQs: number;
  readabilityScore: number; // Flesch Reading Ease
  
  // Validation
  validationPassRate: number; // 0-1
  commonValidationErrors: Array<{
    rule: string;
    count: number;
  }>;
  
  // Plagiarism
  averagePlagiarismScore: number; // 0-1 (lower is better)
  plagiarismViolations: number; // > 0.15 threshold
  
  // SEO
  averageMetaDescriptionLength: number;
  averageTitleLength: number;
  keywordDensity: number; // 0-1
}
```

---

## Summary

### Pipeline Architecture
- **Source Registry:** Approved sources with rate limits and path restrictions
- **Extraction:** Structured fact extraction, never verbatim copying
- **Deduplication:** URL, content hash, and embedding similarity checks
- **Topic Canonicalization:** One topic = one page via Topic Index
- **Content Generation:** LLM prompts with strict guardrails
- **Internal Linking:** Algorithmic link generation based on content type
- **Publishing:** Schema validation, storage, Topic Index update, revalidation
- **Scheduling:** Prioritized job queue with publishing cadence
- **Monitoring:** Metrics, alerts, quality control, rollback capability

### Key Safety Features
1. **Never Copy-Paste:** All content is original, generated from facts
2. **Quality Gates:** Strict validation before publishing
3. **Deduplication:** Multiple layers prevent duplicates
4. **Topic Canonicalization:** One topic = one page
5. **Plagiarism Detection:** N-gram overlap checking
6. **Alerting:** Automatic stop on quality issues
7. **Rollback:** Version history and rollback capability

### Output Deliverables
1. ✅ Architecture diagram (text-based)
2. ✅ Data structures (TypeScript interfaces)
3. ✅ Step-by-step pipeline stages
4. ✅ Prompt templates (all 4 page types)
5. ✅ Validation checklist rules
6. ✅ Scheduling + job queue plan
7. ✅ Publishing + revalidation plan
8. ✅ Monitoring + rollback plan

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Next Steps:** Implement pipeline components in order (Source Registry → Extraction → Deduplication → Generation → Publishing)


