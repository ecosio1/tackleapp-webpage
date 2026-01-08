/**
 * Core data types for the content pipeline
 */

export type PageType = 'blog' | 'species' | 'how-to' | 'location';
export type TopicKey = string; // Format: "type::identifier" or "type::identifier1::identifier2"
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Raw document extracted from source
 */
export interface RawDocument {
  sourceId: string;
  url: string;
  fetchedAt: string; // ISO 8601
  title: string;
  html?: string;
  text: string;
  headings: Heading[];
  extractedFacts: Fact[];
  entities: Entity[];
  locationHints: string[];
  speciesHints: string[];
  tags: string[];
  contentType: 'article' | 'guide' | 'data' | 'unknown';
  language: string;
  wordCount: number;
  qualityScore: number; // 0-1
}

/**
 * Heading extracted from content
 */
export interface Heading {
  level: 1 | 2 | 3;
  text: string;
  id?: string;
}

/**
 * Extracted fact from source
 */
export interface Fact {
  claim: string; // Short paraphrased summary
  confidence: number; // 0-1
  supportingSources: string[]; // Source URLs
  observedAt: string; // ISO 8601
  scope: 'global' | 'regional' | 'seasonal' | 'location-specific';
  category: 'habitat' | 'behavior' | 'diet' | 'size' | 'season' | 'technique' | 'weather' | 'other';
  entities?: string[]; // Related entities
}

/**
 * Named entity extracted from content
 */
export interface Entity {
  text: string;
  type: 'species' | 'location' | 'technique' | 'gear' | 'other';
  confidence: number; // 0-1
  normalized?: string;
}

/**
 * Content brief for LLM generation
 */
export interface ContentBrief {
  pageType: PageType;
  slug: string;
  topicKey: TopicKey;
  title: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  outline: OutlineItem[];
  keyFacts: Fact[];
  sources: Source[];
  internalLinksToInclude: {
    speciesSlugs?: string[];
    howToSlugs?: string[];
    locationSlugs?: string[];
    postSlugs?: string[];
  };
  disclaimers: string[];
  minWordCount: number;
  requiredSections: string[];
}

/**
 * Outline item for content structure
 */
export interface OutlineItem {
  level: 2 | 3;
  title: string;
  description: string;
  keyFacts?: Fact[];
}

/**
 * Source citation
 */
export interface Source {
  id?: string;
  label: string;
  url: string;
  publisher?: string;
  retrievedAt: string; // ISO 8601
  notes?: string;
}

/**
 * Topic Index record
 */
export interface TopicIndexRecord {
  topicKey: TopicKey;
  pageType: PageType;
  slug: string;
  status: 'published' | 'draft' | 'failed' | 'archived';
  contentHash: string; // SHA-256
  sourcesUsed: string[]; // Source IDs or URLs
  lastPublishedAt?: string; // ISO 8601
  lastUpdatedAt: string; // ISO 8601
  lastError?: string;
  attempts?: number;
}

/**
 * Publishing job
 */
export interface Job {
  jobId: string; // UUID
  type: PageType;
  topicKey: TopicKey;
  status: JobStatus;
  priority: number; // 1-10
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
 * Base content document structure
 */
export interface VibeTest {
  primaryScore: {
    name: string; // e.g., "Catchability Score", "Difficulty Rating"
    value: number; // 0-100
    explanation: string;
    factors: string[];
    lastUpdated: string;
  };
  secondaryScores?: Array<{
    name: string;
    value: number;
    explanation: string;
    factors: string[];
    lastUpdated: string;
  }>;
  uniqueInsights: string[];
  realWorldNotes: string[];
  comparisonContext?: string;
}

export interface BaseDoc {
  id: string; // UUID
  slug: string;
  title: string;
  description: string;
  body: string; // Markdown or HTML
  heroImage?: string;
  headings: Heading[];
  primaryKeyword: string;
  secondaryKeywords: string[];
  faqs: FaqItem[];
  sources: Source[];
  related: {
    speciesSlugs?: string[];
    howToSlugs?: string[];
    locationSlugs?: string[];
    postSlugs?: string[];
  };
  author: {
    name: string;
    url?: string;
  };
  dates: {
    publishedAt: string; // ISO 8601
    updatedAt: string; // ISO 8601
  };
  flags: {
    draft: boolean;
    noindex: boolean;
  };
  vibeTest?: VibeTest; // Unique authority signal - proprietary scoring & insights
  alternativeRecommendations?: Array<{
    title: string;
    slug: string;
    reason: string;
    relevanceScore: number;
  }>; // Internal linking loop - alternative recommendations
  embeddedTools?: Array<{
    name: string;
    type: string;
    componentPath: string;
  }>; // Interactive micro-tools embedded in page
}

/**
 * Blog post document
 */
export interface BlogPostDoc extends BaseDoc {
  pageType: 'blog';
  categorySlug: string;
  tags?: string[];
  featuredImage?: string;
}

/**
 * Species document
 */
export interface SpeciesDoc extends BaseDoc {
  pageType: 'species';
  speciesMeta: {
    scientificName?: string;
    commonNames?: string[];
    habitats?: string[];
    targetDepths?: string;
    bestSeasons?: string[];
    bestTides?: string[];
    averageSize?: string;
    maxSize?: string;
  };
}

/**
 * How-to document
 */
export interface HowToDoc extends BaseDoc {
  pageType: 'how-to';
  category: 'beginner' | 'inshore' | 'pier-bank' | 'kayak' | 'advanced';
}

/**
 * Location document
 */
export interface LocationDoc extends BaseDoc {
  pageType: 'location';
  stateSlug: string;
  citySlug: string;
  geo: {
    state: string;
    stateCode: string;
    city: string;
    lat?: number;
    lon?: number;
  };
}

/**
 * Union type for all generated documents
 */
export type GeneratedDoc = BlogPostDoc | SpeciesDoc | HowToDoc | LocationDoc;

/**
 * Source registry entry
 */
export interface SourceRegistryEntry {
  id: string;
  name: string;
  homepage: string;
  allowedPaths: string[]; // URL patterns (regex or glob)
  disallowedPaths: string[]; // URL patterns to exclude
  rateLimitPerMin: number;
  fetchMethod: 'rss' | 'html' | 'api';
  apiKey?: string;
  headers?: Record<string, string>;
  tags: string[]; // Content categories
  notes: string;
  lastFetchedAt?: string; // ISO 8601
  status: 'active' | 'paused' | 'deprecated';
}

/**
 * FAQ item
 */
export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Site content index (for internal linking)
 */
export interface SiteIndex {
  species: Array<{ slug: string; keywords: string[]; tags?: string[] }>;
  howTo: Array<{ slug: string; keywords: string[]; tags?: string[] }>;
  locations: Array<{ slug: string; state: string; city: string; keywords: string[] }>;
  blogPosts: Array<{ slug: string; category: string; keywords: string[]; tags?: string[] }>;
}



