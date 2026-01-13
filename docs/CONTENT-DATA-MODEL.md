# Content Data Model & Storage Strategy - Tackle SEO System

**Version:** 1.0  
**Goal:** Automation-ready content system supporting thousands of pages  
**Exclusions:** No regulations pages (outbound links only)

---

## Table of Contents
1. [Storage Approach Recommendation](#storage-approach-recommendation)
2. [TypeScript Type Definitions](#typescript-type-definitions)
3. [JSON Examples](#json-examples)
4. [Slug Rules & Normalization](#slug-rules--normalization)
5. [Content Quality Gates](#content-quality-gates)
6. [Ingestion Workflow](#ingestion-workflow)
7. [Revalidation Strategy](#revalidation-strategy)
8. [State Regulations Link Strategy](#state-regulations-link-strategy)

---

## Storage Approach Recommendation

### Recommended: **Option D - Database-Backed (Supabase/Postgres) with Caching + ISR**

**Reasoning:**

1. **Automation-Friendly:**
   - Direct API writes via Supabase REST API or PostgREST
   - No git commits required for automated content
   - Webhook triggers for Next.js revalidation
   - Batch operations for bulk content updates

2. **Scalability:**
   - Handles thousands of pages efficiently
   - Indexed queries for fast lookups
   - Supports complex relationships (related content)
   - Can scale horizontally if needed

3. **Versioning:**
   - Built-in `updatedAt` timestamps
   - Can add `version` column for explicit versioning
   - Audit trail via database logs
   - Easy rollback capabilities

4. **Next.js Integration:**
   - ISR (Incremental Static Regeneration) with revalidate
   - On-demand revalidation via API routes
   - Webhook-triggered revalidation
   - Efficient caching strategies

5. **Minimal Operations:**
   - Supabase is fully managed (no server maintenance)
   - Automatic backups
   - Built-in authentication for API access
   - Row-level security for content protection

6. **SEO Performance:**
   - Fast queries with proper indexing
   - ISR generates static pages at build + on-demand
   - No runtime database queries for static pages
   - Edge caching via CDN

**Alternative Consideration:**
- **Option B (JSON files)** could work for smaller scale (< 500 pages) but requires git-based automation which is more complex for true automation pipelines.

**Implementation:**
- Use Supabase Postgres database
- Create tables for each content type (species, how_to, locations, blog_posts, blog_categories)
- Use Next.js API routes to fetch data (with caching)
- Implement ISR with `revalidate` times per content type
- Set up Supabase webhooks to trigger Next.js revalidation on content updates

---

## TypeScript Type Definitions

### Base Types

```typescript
/**
 * Source citation for factual claims
 */
export interface Source {
  label: string; // Display name (e.g., "Florida Fish and Wildlife Conservation Commission")
  url: string; // Source URL
  publisher?: string; // Publisher name
  retrievedAt: string; // ISO 8601 date when source was retrieved
  notes?: string; // Additional context about the source
}

/**
 * Author information
 */
export interface Author {
  name: string; // Author name (e.g., "Tackle Team" or "AI Assistant")
  url?: string; // Optional author profile URL
}

/**
 * Date information
 */
export interface ContentDates {
  publishedAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

/**
 * Content flags
 */
export interface ContentFlags {
  noindex?: boolean; // Exclude from search engines
  draft?: boolean; // Not yet published
}

/**
 * Related content references
 */
export interface RelatedContent {
  speciesSlugs?: string[]; // Array of species slugs
  howToSlugs?: string[]; // Array of how-to slugs
  locationSlugs?: string[]; // Array of location slugs (format: "state/city")
  postSlugs?: string[]; // Array of blog post slugs
}

/**
 * Geographic information
 */
export interface GeoLocation {
  state: string; // Full state name (e.g., "Florida")
  stateCode: string; // State abbreviation (e.g., "FL")
  city: string; // City name (e.g., "Miami")
  lat?: number; // Latitude (optional)
  lon?: number; // Longitude (optional)
}

/**
 * Species-specific metadata
 */
export interface SpeciesMetadata {
  scientificName?: string; // Scientific name (e.g., "Sciaenops ocellatus")
  commonNames?: string[]; // Alternative common names (e.g., ["Red Drum", "Channel Bass"])
  habitats?: string[]; // Habitats (e.g., ["Inshore", "Flats", "Mangroves"])
  targetDepths?: string; // Depth range (e.g., "5-20 feet")
  bestSeasons?: string[]; // Best seasons (e.g., ["Fall", "Winter"])
  bestTides?: string[]; // Best tide conditions (e.g., ["Incoming", "Outgoing"])
  averageSize?: string; // Average size (e.g., "18-27 inches")
  maxSize?: string; // Maximum size (e.g., "50+ inches")
}

/**
 * FAQ item
 */
export interface FaqItem {
  question: string;
  answer: string;
}

/**
 * Heading for table of contents
 */
export interface Heading {
  id: string; // Anchor ID (slugified from text)
  text: string; // Heading text
  level: 2 | 3; // H2 or H3
}
```

### Content Type Definitions

#### SpeciesDoc

```typescript
export interface SpeciesDoc {
  // Identity
  id: string; // UUID v4 (stable identifier)
  slug: string; // URL slug (e.g., "redfish")
  
  // Content
  title: string; // Display title (e.g., "Redfish Fishing Guide")
  description: string; // Meta description (150-160 chars)
  body: string; // Main content (Markdown or HTML)
  heroImage?: string; // Hero image URL (optional)
  
  // Structure
  headings: Heading[]; // Generated from body for TOC
  
  // SEO
  primaryKeyword: string; // Primary keyword (e.g., "redfish fishing")
  secondaryKeywords: string[]; // Secondary keywords (e.g., ["red drum", "inshore fishing"])
  
  // Species-specific
  speciesMeta: SpeciesMetadata;
  
  // Related content
  related: RelatedContent;
  
  // FAQs
  faqs: FaqItem[]; // Minimum 5 FAQs
  
  // Sources
  sources: Source[]; // Citations for factual claims
  
  // Metadata
  author: Author;
  dates: ContentDates;
  flags: ContentFlags;
}
```

#### HowToDoc

```typescript
export interface HowToDoc {
  // Identity
  id: string; // UUID v4
  slug: string; // URL slug (e.g., "catch-redfish-inshore")
  
  // Content
  title: string; // Display title (e.g., "How to Catch Redfish Inshore")
  description: string; // Meta description (150-160 chars)
  body: string; // Main content (Markdown or HTML)
  heroImage?: string; // Hero image URL (optional)
  
  // Structure
  headings: Heading[]; // Generated from body for TOC
  
  // SEO
  primaryKeyword: string; // Primary keyword (e.g., "how to catch redfish")
  secondaryKeywords: string[]; // Secondary keywords
  
  // Category
  category: 'beginner' | 'inshore' | 'pier-bank' | 'kayak' | 'advanced';
  
  // Related content
  related: RelatedContent;
  
  // FAQs
  faqs: FaqItem[]; // Minimum 5 FAQs
  
  // Sources
  sources: Source[]; // Citations for techniques, tips
  
  // Metadata
  author: Author;
  dates: ContentDates;
  flags: ContentFlags;
}
```

#### LocationDoc

```typescript
export interface LocationDoc {
  // Identity
  id: string; // UUID v4
  slug: string; // Combined slug (e.g., "florida/miami")
  stateSlug: string; // State slug (e.g., "florida")
  citySlug: string; // City slug (e.g., "miami")
  
  // Content
  title: string; // Display title (e.g., "Miami, Florida Fishing Guide")
  description: string; // Meta description (150-160 chars)
  body: string; // Main content (Markdown or HTML)
  heroImage?: string; // Hero image URL (optional)
  
  // Structure
  headings: Heading[]; // Generated from body for TOC
  
  // SEO
  primaryKeyword: string; // Primary keyword (e.g., "miami fishing")
  secondaryKeywords: string[]; // Secondary keywords
  
  // Geographic
  geo: GeoLocation;
  
  // Related content
  related: RelatedContent;
  
  // FAQs
  faqs: FaqItem[]; // Minimum 5 FAQs
  
  // Sources
  sources: Source[]; // Citations for location-specific info
  
  // Metadata
  author: Author;
  dates: ContentDates;
  flags: ContentFlags;
}
```

#### BlogPostDoc

```typescript
export interface BlogPostDoc {
  // Identity
  id: string; // UUID v4
  slug: string; // URL slug (e.g., "best-time-fish-florida")
  
  // Content
  title: string; // Display title (e.g., "Best Time to Fish in Florida: Complete Guide")
  description: string; // Meta description (150-160 chars)
  body: string; // Main content (Markdown or HTML)
  featuredImage?: string; // Featured image URL (optional)
  
  // Structure
  headings: Heading[]; // Generated from body for TOC
  
  // SEO
  primaryKeyword: string; // Primary keyword
  secondaryKeywords: string[]; // Secondary keywords
  
  // Category
  categorySlug: string; // Category slug (e.g., "fishing-tips")
  
  // Tags
  tags?: string[]; // Additional tags for organization
  
  // Related content (optional - can be inferred from body)
  related?: RelatedContent;
  
  // FAQs (optional for blog posts)
  faqs?: FaqItem[]; // Optional FAQs
  
  // Sources
  sources: Source[]; // Citations for blog post claims
  
  // Metadata
  author: Author;
  dates: ContentDates;
  flags: ContentFlags;
}
```

#### BlogCategoryDoc

```typescript
export interface BlogCategoryDoc {
  // Identity
  id: string; // UUID v4
  slug: string; // URL slug (e.g., "fishing-tips")
  
  // Content
  name: string; // Display name (e.g., "Fishing Tips")
  description: string; // Category description
  image?: string; // Category image URL (optional)
  
  // Metadata
  postCount: number; // Number of posts in category (computed)
  dates: ContentDates;
  flags: ContentFlags;
}
```

---

## JSON Examples

### SpeciesDoc Example

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "slug": "redfish",
  "title": "Redfish Fishing Guide: How to Catch Redfish",
  "description": "Complete guide to catching redfish in Florida. Learn about redfish habitat, best techniques, regulations, and where to find them.",
  "body": "# About Redfish\n\nRedfish, also known as red drum (*Sciaenops ocellatus*), are one of the most popular inshore game fish in Florida...\n\n## Habitat and Behavior\n\nRedfish prefer shallow inshore waters...\n\n## Best Techniques\n\nWhen targeting redfish, focus on...",
  "heroImage": "/images/species/redfish-hero.jpg",
  "headings": [
    { "id": "about-redfish", "text": "About Redfish", "level": 2 },
    { "id": "habitat-and-behavior", "text": "Habitat and Behavior", "level": 2 },
    { "id": "best-techniques", "text": "Best Techniques", "level": 2 }
  ],
  "primaryKeyword": "redfish fishing",
  "secondaryKeywords": [
    "red drum",
    "inshore fishing",
    "florida redfish",
    "catch redfish"
  ],
  "speciesMeta": {
    "scientificName": "Sciaenops ocellatus",
    "commonNames": ["Red Drum", "Channel Bass", "Red"],
    "habitats": ["Inshore", "Flats", "Mangroves", "Grass Flats"],
    "targetDepths": "2-8 feet",
    "bestSeasons": ["Fall", "Winter", "Spring"],
    "bestTides": ["Incoming", "Outgoing"],
    "averageSize": "18-27 inches",
    "maxSize": "50+ inches"
  },
  "related": {
    "howToSlugs": [
      "catch-redfish-inshore",
      "fish-flats",
      "fish-tide-changes"
    ],
    "locationSlugs": [
      "florida/miami",
      "florida/tampa",
      "florida/key-west",
      "florida/fort-lauderdale",
      "florida/sarasota"
    ],
    "postSlugs": [
      "redfish-complete-guide",
      "inshore-fishing-florida"
    ]
  },
  "faqs": [
    {
      "question": "What is the slot limit for redfish in Florida?",
      "answer": "The slot limit for redfish in Florida is 18-27 inches total length. Anglers are allowed one redfish per person per day within this slot."
    },
    {
      "question": "What is the best time of year to catch redfish?",
      "answer": "Redfish can be caught year-round in Florida, but the best seasons are fall, winter, and spring when water temperatures are cooler and fish are more active in shallow waters."
    },
    {
      "question": "What bait works best for redfish?",
      "answer": "Live shrimp, crabs, and mullet are excellent baits for redfish. Artificial lures like soft plastics, spoons, and topwater lures also work well, especially in shallow water."
    },
    {
      "question": "Where are the best places to catch redfish?",
      "answer": "Redfish are commonly found in shallow inshore waters including grass flats, mangrove shorelines, oyster bars, and around bridges. They prefer areas with structure and moving water."
    },
    {
      "question": "Do redfish have any identifying features?",
      "answer": "Yes, redfish are easily identified by one or more black spots near their tail, which are thought to confuse predators. They have a bronze to reddish coloration and a distinctive drumming sound they make."
    }
  ],
  "sources": [
    {
      "label": "Florida Fish and Wildlife Conservation Commission",
      "url": "https://myfwc.com/fishing/saltwater/recreational/redfish/",
      "publisher": "FWC",
      "retrievedAt": "2024-01-15T00:00:00Z",
      "notes": "Official regulations and species information"
    },
    {
      "label": "National Oceanic and Atmospheric Administration - Red Drum",
      "url": "https://www.fisheries.noaa.gov/species/red-drum",
      "publisher": "NOAA",
      "retrievedAt": "2024-01-15T00:00:00Z",
      "notes": "Species biology and habitat information"
    }
  ],
  "author": {
    "name": "Tackle Team",
    "url": "/about"
  },
  "dates": {
    "publishedAt": "2024-01-15T00:00:00Z",
    "updatedAt": "2024-01-20T00:00:00Z"
  },
  "flags": {
    "noindex": false,
    "draft": false
  }
}
```

### HowToDoc Example

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "slug": "catch-redfish-inshore",
  "title": "How to Catch Redfish Inshore: Complete Guide",
  "description": "Learn how to catch redfish in shallow inshore waters. Step-by-step guide with tips, techniques, and best practices for inshore redfish fishing.",
  "body": "# How to Catch Redfish Inshore\n\nInshore redfish fishing is one of the most exciting forms of fishing in Florida...\n\n## Step 1: Choose the Right Location\n\nLook for shallow grass flats, mangrove shorelines, and oyster bars...\n\n## Step 2: Time Your Trip\n\nRedfish are most active during incoming and outgoing tides...",
  "heroImage": "/images/how-to/catch-redfish-inshore-hero.jpg",
  "headings": [
    { "id": "how-to-catch-redfish-inshore", "text": "How to Catch Redfish Inshore", "level": 2 },
    { "id": "step-1-choose-the-right-location", "text": "Step 1: Choose the Right Location", "level": 2 },
    { "id": "step-2-time-your-trip", "text": "Step 2: Time Your Trip", "level": 2 }
  ],
  "primaryKeyword": "how to catch redfish inshore",
  "secondaryKeywords": [
    "inshore redfish fishing",
    "catch redfish",
    "redfish techniques",
    "shallow water redfish"
  ],
  "category": "inshore",
  "related": {
    "speciesSlugs": ["redfish", "snook", "speckled-trout"],
    "locationSlugs": [
      "florida/miami",
      "florida/tampa",
      "florida/key-west"
    ],
    "postSlugs": [
      "redfish-fishing-secrets",
      "inshore-fishing-tips"
    ]
  },
  "faqs": [
    {
      "question": "What is the best tide for inshore redfish fishing?",
      "answer": "Incoming and outgoing tides are both productive for redfish. Many anglers prefer the last two hours of incoming tide and the first two hours of outgoing tide when water movement is strongest."
    },
    {
      "question": "What depth should I target for inshore redfish?",
      "answer": "Redfish in inshore waters are typically found in 2-6 feet of water, especially on grass flats and around structure. They move into even shallower water (1-3 feet) during high tide."
    },
    {
      "question": "What tackle do I need for inshore redfish?",
      "answer": "A medium to medium-heavy spinning or baitcasting rod (7-8 feet) paired with a 3000-4000 size reel spooled with 10-20 lb braided line is ideal. Use a 20-30 lb fluorocarbon leader."
    },
    {
      "question": "Can I catch redfish from shore?",
      "answer": "Yes, redfish can be caught from shore, especially around bridges, jetties, and public fishing piers. Look for areas with structure and moving water."
    },
    {
      "question": "What time of day is best for inshore redfish?",
      "answer": "Early morning and late afternoon are typically the most productive times, especially during summer. However, redfish can be caught throughout the day, particularly during favorable tide conditions."
    }
  ],
  "sources": [
    {
      "label": "Inshore Fishing Techniques - Salt Water Sportsman",
      "url": "https://www.saltwatersportsman.com/technique/inshore-fishing/",
      "publisher": "Salt Water Sportsman",
      "retrievedAt": "2024-01-18T00:00:00Z",
      "notes": "General inshore fishing techniques and tips"
    }
  ],
  "author": {
    "name": "Tackle Team",
    "url": "/about"
  },
  "dates": {
    "publishedAt": "2024-01-18T00:00:00Z",
    "updatedAt": "2024-01-20T00:00:00Z"
  },
  "flags": {
    "noindex": false,
    "draft": false
  }
}
```

### LocationDoc Example

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "slug": "florida/miami",
  "stateSlug": "florida",
  "citySlug": "miami",
  "title": "Miami, Florida Fishing Guide: Best Spots, Species & Tips",
  "description": "Complete Miami fishing guide with best spots, popular species, techniques, and local tips. Plan your Miami fishing trip with confidence.",
  "body": "# Miami Fishing Guide\n\nMiami offers some of the best inshore and offshore fishing in Florida...\n\n## Best Fishing Spots in Miami\n\n### 1. Government Cut\n\nGovernment Cut is a prime location for...\n\n### 2. Key Biscayne\n\nKey Biscayne provides excellent...",
  "heroImage": "/images/locations/florida/miami-hero.jpg",
  "headings": [
    { "id": "miami-fishing-guide", "text": "Miami Fishing Guide", "level": 2 },
    { "id": "best-fishing-spots-in-miami", "text": "Best Fishing Spots in Miami", "level": 2 },
    { "id": "government-cut", "text": "Government Cut", "level": 3 },
    { "id": "key-biscayne", "text": "Key Biscayne", "level": 3 }
  ],
  "primaryKeyword": "miami fishing",
  "secondaryKeywords": [
    "miami fishing spots",
    "fishing in miami",
    "miami inshore fishing",
    "miami fishing guide"
  ],
  "geo": {
    "state": "Florida",
    "stateCode": "FL",
    "city": "Miami",
    "lat": 25.7617,
    "lon": -80.1918
  },
  "related": {
    "speciesSlugs": [
      "redfish",
      "snook",
      "tarpon",
      "bonefish",
      "permit"
    ],
    "howToSlugs": [
      "catch-redfish-inshore",
      "fish-flats",
      "catch-snook-mangroves",
      "fish-bridges",
      "sight-fishing-techniques"
    ],
    "postSlugs": [
      "miami-fishing-spots",
      "inshore-fishing-florida"
    ]
  },
  "faqs": [
    {
      "question": "What are the best fishing spots in Miami?",
      "answer": "Top spots include Government Cut, Key Biscayne, Biscayne Bay, Haulover Inlet, and the Miami Beach jetties. Each offers different opportunities for inshore and nearshore species."
    },
    {
      "question": "What fish can I catch in Miami?",
      "answer": "Miami offers diverse fishing including redfish, snook, tarpon, bonefish, permit, grouper, snapper, and many more species. Both inshore and offshore opportunities are abundant."
    },
    {
      "question": "Do I need a fishing license in Miami?",
      "answer": "Yes, a Florida saltwater fishing license is required for most fishing activities in Miami. Some exceptions apply for fishing from piers or for residents over 65. Always check current regulations."
    },
    {
      "question": "What is the best time of year to fish in Miami?",
      "answer": "Miami fishing is productive year-round, but peak seasons vary by species. Fall and winter are excellent for many inshore species, while spring and summer offer great offshore opportunities."
    },
    {
      "question": "Can I fish from shore in Miami?",
      "answer": "Yes, there are many excellent shore fishing opportunities in Miami including public piers, jetties, bridges, and beach access points. Government Cut and Key Biscayne are popular shore fishing locations."
    }
  ],
  "sources": [
    {
      "label": "Miami-Dade County Parks - Fishing Locations",
      "url": "https://www.miamidade.gov/parks/fishing.asp",
      "publisher": "Miami-Dade County",
      "retrievedAt": "2024-01-20T00:00:00Z",
      "notes": "Public fishing access points and regulations"
    },
    {
      "label": "Florida Fish and Wildlife Conservation Commission - Miami Area",
      "url": "https://myfwc.com/fishing/saltwater/",
      "publisher": "FWC",
      "retrievedAt": "2024-01-20T00:00:00Z",
      "notes": "General saltwater fishing information"
    }
  ],
  "author": {
    "name": "Tackle Team",
    "url": "/about"
  },
  "dates": {
    "publishedAt": "2024-01-20T00:00:00Z",
    "updatedAt": "2024-01-25T00:00:00Z"
  },
  "flags": {
    "noindex": false,
    "draft": false
  }
}
```

### BlogPostDoc Example

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "slug": "best-time-fish-florida",
  "title": "Best Time to Fish in Florida: Complete Guide by Season",
  "description": "Discover the best times to fish in Florida throughout the year. Learn about seasonal patterns, weather conditions, and species-specific timing for successful fishing trips.",
  "body": "# Best Time to Fish in Florida\n\nFlorida offers year-round fishing opportunities, but timing your trip can make all the difference...\n\n## Spring Fishing in Florida\n\nSpring (March-May) brings warming waters and increased fish activity...\n\n## Summer Fishing in Florida\n\nSummer (June-August) offers excellent fishing despite the heat...",
  "featuredImage": "/images/blog/best-time-fish-florida-featured.jpg",
  "headings": [
    { "id": "best-time-to-fish-in-florida", "text": "Best Time to Fish in Florida", "level": 2 },
    { "id": "spring-fishing-in-florida", "text": "Spring Fishing in Florida", "level": 2 },
    { "id": "summer-fishing-in-florida", "text": "Summer Fishing in Florida", "level": 2 }
  ],
  "primaryKeyword": "best time to fish in florida",
  "secondaryKeywords": [
    "florida fishing seasons",
    "when to fish florida",
    "florida fishing calendar",
    "seasonal fishing florida"
  ],
  "categorySlug": "fishing-tips",
  "tags": [
    "florida",
    "seasonal",
    "timing",
    "fishing-tips"
  ],
  "related": {
    "speciesSlugs": ["redfish", "snook", "tarpon"],
    "locationSlugs": ["florida/miami", "florida/tampa"],
    "howToSlugs": ["read-weather-conditions", "understand-moon-phases"]
  },
  "faqs": [
    {
      "question": "What is the best month to fish in Florida?",
      "answer": "The best months vary by species and region, but generally fall (September-November) and spring (March-May) offer excellent conditions for most species. However, Florida fishing is productive year-round."
    },
    {
      "question": "Is fishing better in the morning or evening in Florida?",
      "answer": "Both morning and evening can be productive, but many anglers prefer early morning (dawn to 10 AM) and late afternoon (4 PM to dusk) when fish are most active, especially during hot summer months."
    }
  ],
  "sources": [
    {
      "label": "Florida Fish and Wildlife Conservation Commission - Fishing Seasons",
      "url": "https://myfwc.com/fishing/saltwater/",
      "publisher": "FWC",
      "retrievedAt": "2024-01-22T00:00:00Z",
      "notes": "Official fishing season information"
    },
    {
      "label": "NOAA - Seasonal Fish Migration Patterns",
      "url": "https://www.fisheries.noaa.gov/",
      "publisher": "NOAA",
      "retrievedAt": "2024-01-22T00:00:00Z",
      "notes": "Fish migration and seasonal patterns"
    }
  ],
  "author": {
    "name": "Tackle Team",
    "url": "/about"
  },
  "dates": {
    "publishedAt": "2024-01-22T00:00:00Z",
    "updatedAt": "2024-01-25T00:00:00Z"
  },
  "flags": {
    "noindex": false,
    "draft": false
  }
}
```

### BlogCategoryDoc Example

```json
{
  "id": "990e8400-e29b-41d4-a716-446655440004",
  "slug": "fishing-tips",
  "name": "Fishing Tips",
  "description": "Expert fishing tips, techniques, and advice to improve your fishing success. Learn from the pros and catch more fish.",
  "image": "/images/blog/categories/fishing-tips.jpg",
  "postCount": 10,
  "dates": {
    "publishedAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-25T00:00:00Z"
  },
  "flags": {
    "noindex": false,
    "draft": false
  }
}
```

---

## Slug Rules & Normalization

### Slug Normalization Rules

1. **Lowercase:** All slugs must be lowercase
2. **Hyphenation:** Spaces and special characters become hyphens
3. **No Special Characters:** Remove all special characters except hyphens
4. **No Leading/Trailing Hyphens:** Trim hyphens from start and end
5. **No Multiple Hyphens:** Replace consecutive hyphens with single hyphen
6. **ASCII Only:** Convert accented characters to ASCII equivalents

### State Slug Rules

**Decision: Use full state names (lowercase, hyphenated)**

- ✅ `florida` (not `fl`)
- ✅ `texas` (not `tx`)
- ✅ `new-york` (not `ny` or `newyork`)
- ✅ `north-carolina` (not `nc`)

**Reasoning:**
- Better for SEO (full words rank better)
- More readable URLs
- Avoids confusion with state abbreviations
- Consistent with city naming

### City Slug Rules

1. **Lowercase + Hyphenated:**
   - `st-petersburg` (not `stpetersburg` or `st. petersburg`)
   - `fort-lauderdale` (not `ftlauderdale` or `fort lauderdale`)
   - `new-orleans` (not `neworleans`)
   - `port-st-lucie` (not `portstlucie`)

2. **Abbreviations:**
   - Keep common abbreviations: `st`, `ft`, `port`
   - Expand when ambiguous: `new-york` (not `ny`)

3. **Special Cases:**
   - `key-west` (not `keywest`)
   - `cocoa-beach` (not `cocoabeach`)
   - `panama-city` (not `panamacity`)

### Species Slug Rules

1. **Common Name (Primary):**
   - `redfish` (not `red-fish` or `red-drum`)
   - `speckled-trout` (not `speckledtrout`)
   - `spanish-mackerel` (not `spanishmackerel`)

2. **Collision Handling:**
   - If collision exists (e.g., "bass" could be largemouth, smallmouth, striped):
     - Use more specific name: `largemouth-bass`, `smallmouth-bass`, `striped-bass`
     - Never use generic `bass` alone

3. **Scientific Names:**
   - Never use scientific names in slugs (use common names only)

### How-To Slug Rules

1. **Action-Oriented:**
   - `catch-redfish-inshore` (not `redfish-inshore-fishing`)
   - `tie-fishing-knots` (not `fishing-knots-guide`)
   - `read-tides` (not `tide-reading`)

2. **Format:** `[action]-[target]-[context]`
   - Action: `catch`, `tie`, `read`, `fish`, `choose`
   - Target: `redfish`, `knots`, `tides`, `bait`
   - Context: `inshore`, `pier`, `kayak` (optional)

### Blog Post Slug Rules

1. **Keyword-Rich:**
   - `best-time-fish-florida` (not `florida-fishing-time`)
   - `top-10-fishing-mistakes` (not `fishing-mistakes-top-10`)

2. **Format:** `[primary-keyword]-[secondary-keyword]-[context]`

### Collision Detection & Resolution

**Process:**
1. Generate normalized slug
2. Check database for existing slug
3. If collision:
   - For species: Use more specific name
   - For locations: Add state prefix if needed (rare)
   - For how-to: Add context (e.g., `catch-bass-largemouth` vs `catch-bass-smallmouth`)
   - For blog: Add year or number suffix only if absolutely necessary

**Example Collision Resolution:**
- `bass` → `largemouth-bass` (more specific)
- `miami` (if multiple states) → `florida/miami` (already handled by location structure)

---

## Content Quality Gates

### Minimum Requirements Per Content Type

#### Species Pages

**Word Count:** Minimum 1,500 words

**Required Sections:**
- [ ] Introduction summary paragraph (100-200 words)
- [ ] At least 4 H2 sections:
  - About [Species]
  - Habitat and Behavior
  - Best Techniques (or How to Catch)
  - Where to Find [Species]
- [ ] At least 5 FAQs
- [ ] Internal links to at least 3 related pages:
  - 3-5 how-to guides
  - 5 location pages
  - Optional: 1-2 blog posts
- [ ] At least 2 sources for:
  - Species biology/behavior claims
  - Habitat information
  - Seasonal patterns (if mentioned)
- [ ] Species metadata (scientificName, habitats, bestSeasons, etc.)
- [ ] Hero image with descriptive alt text
- [ ] Primary keyword in H1 and first paragraph
- [ ] Secondary keywords naturally distributed

**Must Avoid:**
- [ ] Copying source text verbatim (must be rewritten)
- [ ] "Official" claims (e.g., "official guide")
- [ ] Legal/regulatory advice language
- [ ] Unsubstantiated claims without sources

**Disclaimers Required:**
- [ ] "Regulations change—always verify with official sources." (if regulations mentioned)

#### How-To Pages

**Word Count:** Minimum 1,200 words

**Required Sections:**
- [ ] Introduction summary paragraph (100-200 words)
- [ ] At least 4 H2 sections:
  - Why This Technique Matters
  - Step-by-Step Guide (if applicable)
  - Tips & Tricks
  - Best Conditions
  - Common Mistakes
- [ ] At least 5 FAQs
- [ ] Internal links to at least 3 related pages:
  - 3 species pages
  - 3 location pages
- [ ] At least 2 sources for:
  - Technique explanations
  - Tips and best practices
- [ ] Hero image with descriptive alt text
- [ ] Primary keyword in H1 and first paragraph

**Must Avoid:**
- [ ] Copying source text verbatim
- [ ] "Official" claims
- [ ] Legal/regulatory advice
- [ ] Unsubstantiated technique claims

#### Location Pages

**Word Count:** Minimum 2,000 words

**Required Sections:**
- [ ] Introduction summary paragraph (100-200 words)
- [ ] At least 4 H2 sections:
  - Best Fishing Spots (with 5-10 specific spots)
  - Popular Species
  - Fishing Techniques
  - Best Times to Fish
  - Local Tips
- [ ] At least 5 FAQs
- [ ] Internal links to at least 3 related pages:
  - 5 species pages
  - 5 how-to guides
- [ ] At least 2 sources for:
  - Location-specific information
  - Spot recommendations
  - Seasonal patterns
- [ ] Geographic metadata (state, city, lat/lon if available)
- [ ] Hero image with descriptive alt text
- [ ] "See local regulations" outbound link (required)
- [ ] Primary keyword in H1 and first paragraph

**Must Avoid:**
- [ ] Copying source text verbatim
- [ ] "Official" claims
- [ ] Legal/regulatory advice
- [ ] Unsubstantiated location claims

**Disclaimers Required:**
- [ ] "Regulations change—always verify with official sources." (prominent)

#### Blog Posts

**Word Count:** Minimum 1,500 words

**Required Sections:**
- [ ] Introduction summary paragraph (100-200 words)
- [ ] At least 4 H2 sections (topic-dependent)
- [ ] Optional FAQs (recommended but not required)
- [ ] Internal links to at least 1 related page:
  - 1 species page (if applicable)
  - 1 how-to page (if applicable)
  - 1 location page (if applicable)
- [ ] At least 2 sources for:
  - Factual claims
  - Statistics
  - Seasonal/weather information
- [ ] Featured image with descriptive alt text
- [ ] Primary keyword in H1 and first paragraph
- [ ] Category assignment

**Must Avoid:**
- [ ] Copying source text verbatim
- [ ] "Official" claims
- [ ] Legal/regulatory advice
- [ ] Unsubstantiated claims

### Universal Quality Gates

**All Content Types:**
- [ ] No duplicate content (check against existing content)
- [ ] Proper grammar and spelling
- [ ] Natural keyword usage (no keyword stuffing)
- [ ] Readable content (Flesch Reading Ease > 60)
- [ ] Mobile-friendly formatting
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] Images optimized (WebP format, < 200KB)
- [ ] All external links use `rel="nofollow"` (except official sources)
- [ ] All internal links use proper anchor text
- [ ] Meta description is 150-160 characters
- [ ] Title is 50-60 characters
- [ ] No broken internal links
- [ ] `updatedAt` date is set correctly
- [ ] Author information is included

---

## Ingestion Workflow

### Step-by-Step Content Ingestion Process

#### 1. Scrape/Collect
- **Source:** Web scraping, API feeds, manual input, or AI generation
- **Output:** Raw content data (text, images, metadata)
- **Storage:** Temporary staging area (S3, local files, or database staging table)

#### 2. Parse
- **Extract:** Title, body, images, metadata from raw content
- **Normalize:** Convert to consistent format (Markdown, HTML, or structured JSON)
- **Detect:** Content type (species, how-to, location, blog)
- **Output:** Parsed content object

#### 3. Normalize
- **Slug Generation:**
  - Apply slug normalization rules
  - Check for collisions
  - Resolve collisions if needed
- **Metadata Extraction:**
  - Extract primary keyword from title/content
  - Generate secondary keywords
  - Extract headings for TOC
  - Identify related content (via keywords/tags)
- **Output:** Normalized content with slug and metadata

#### 4. Dedupe
- **Check:** Database for existing content with:
  - Same slug (exact match)
  - Similar title (fuzzy match > 80% similarity)
  - Similar content (text similarity > 70%)
- **Action:**
  - If exact duplicate: Skip or update existing
  - If similar: Flag for manual review
  - If unique: Continue to enrichment
- **Output:** Deduplicated content (or skip flag)

#### 5. Enrich
- **Add Related Content:**
  - Match species mentions → add to `related.speciesSlugs`
  - Match location mentions → add to `related.locationSlugs`
  - Match technique mentions → add to `related.howToSlugs`
  - Match blog topics → add to `related.postSlugs`
- **Generate FAQs:**
  - Extract questions from content (if present)
  - Generate FAQs via AI (if needed)
  - Ensure minimum 5 FAQs
- **Add Sources:**
  - Extract source URLs from content
  - Add source metadata (label, publisher, retrievedAt)
  - Set `retrievedAt` to current timestamp
- **Add Geographic Data:**
  - For location pages: Geocode city/state → add lat/lon
  - For species pages: Add species metadata (scientificName, habitats, etc.)
- **Output:** Enriched content with related links, FAQs, sources

#### 6. Generate Content
- **AI Enhancement (if applicable):**
  - Expand sections to meet word count minimums
  - Improve readability
  - Add missing sections (Tips, Common Mistakes, etc.)
- **Format:**
  - Convert to Markdown or HTML
  - Add proper heading hierarchy
  - Insert internal links naturally
- **Output:** Final content ready for validation

#### 7. Validate Against Schema + Quality Gates
- **Schema Validation:**
  - Check all required fields present
  - Validate data types
  - Check slug format
  - Validate dates (ISO 8601)
- **Quality Gate Checks:**
  - Word count minimum met
  - Required sections present (H2 count)
  - FAQ count met (minimum 5)
  - Internal links count met (minimum 3)
  - Sources count met (minimum 2 for factual claims)
  - No verbatim source copying (plagiarism check)
  - No "official" claims
  - No legal/regulatory advice language
  - Readability score acceptable
- **Output:** Validation report (pass/fail with errors)

#### 8. Write to Storage
- **If Validation Passes:**
  - Insert/update record in Supabase database
  - Store images in Supabase Storage (or CDN)
  - Set `publishedAt` (if new) or `updatedAt` (if update)
  - Set `flags.draft = false` (if publishing)
- **If Validation Fails:**
  - Store in "draft" or "needs-review" status
  - Log validation errors
  - Notify content team (if manual review needed)
- **Output:** Content stored in database

#### 9. Trigger Revalidation
- **Webhook Trigger:**
  - Send webhook to Next.js revalidation endpoint
  - Include content type and slug
  - Next.js API route handles on-demand revalidation
- **Alternative (if webhook fails):**
  - Queue revalidation job
  - Retry mechanism
- **Output:** Revalidation triggered

#### 10. Update Sitemap
- **Automatic:**
  - Next.js `sitemap.ts` reads from database
  - Sitemap regenerated on next build or ISR revalidation
  - No manual sitemap update needed
- **Output:** Sitemap includes new/updated content

### Source Citation Storage

**Where Sources Are Stored:**
- In `sources[]` array within each content document
- Each source includes:
  - `label`: Display name
  - `url`: Source URL
  - `publisher`: Publisher name (optional)
  - `retrievedAt`: ISO 8601 timestamp (set during enrichment step)
  - `notes`: Additional context (optional)

**`retrievedAt` Setting:**
- Set automatically during enrichment step (Step 5)
- Use current timestamp when source is added: `new Date().toISOString()`
- Represents when the source was retrieved/verified, not when content was published
- Important for tracking source freshness

### Error Handling

**Validation Failures:**
- Content stored with `flags.draft = true`
- Validation errors logged
- Notification sent to content team
- Content can be manually reviewed and fixed

**Revalidation Failures:**
- Retry mechanism (3 attempts with exponential backoff)
- Fallback to manual revalidation trigger
- Log errors for monitoring

---

## Revalidation Strategy

### ISR Revalidation Times Per Content Type

#### Blog Posts
- **Revalidation:** 7 days (604,800 seconds)
- **Reasoning:** Blog content may be updated more frequently, especially automated conditions posts
- **Code:**
```typescript
export const revalidate = 604800; // 7 days
```

#### Species Pages (Evergreen)
- **Revalidation:** 30 days (2,592,000 seconds)
- **Reasoning:** Species information is relatively stable, but may be updated with new techniques or locations
- **Code:**
```typescript
export const revalidate = 2592000; // 30 days
```

#### How-To Pages (Evergreen)
- **Revalidation:** 30 days (2,592,000 seconds)
- **Reasoning:** Techniques are stable but may be updated with new tips or gear
- **Code:**
```typescript
export const revalidate = 2592000; // 30 days
```

#### Location Pages
- **Revalidation:** 7 days (604,800 seconds)
- **Reasoning:** Location information may change (new spots, conditions, access points)
- **Code:**
```typescript
export const revalidate = 604800; // 7 days
```

#### Blog Categories
- **Revalidation:** 30 days (2,592,000 seconds)
- **Reasoning:** Category pages change when new posts are added
- **Code:**
```typescript
export const revalidate = 2592000; // 30 days
```

### On-Demand Revalidation

**Trigger Mechanism:**
1. **Webhook from Supabase:**
   - Supabase database trigger fires on content insert/update
   - Webhook calls Next.js API route: `/api/revalidate`
   - API route validates webhook secret
   - API route calls `revalidatePath()` for specific content
   - Response sent back to Supabase

2. **API Route Implementation:**
```typescript
// app/api/revalidate/route.ts
export async function POST(request: Request) {
  const { secret, type, slug } = await request.json();
  
  // Validate webhook secret
  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ error: 'Invalid secret' }, { status: 401 });
  }
  
  // Revalidate based on content type
  if (type === 'species') {
    revalidatePath(`/species/${slug}`);
  } else if (type === 'how-to') {
    revalidatePath(`/how-to/${slug}`);
  } else if (type === 'location') {
    const [state, city] = slug.split('/');
    revalidatePath(`/locations/${state}/${city}`);
  } else if (type === 'blog') {
    revalidatePath(`/blog/${slug}`);
  }
  
  // Also revalidate index pages
  revalidatePath(`/${type}`);
  revalidatePath('/sitemap.xml');
  
  return Response.json({ revalidated: true });
}
```

3. **Supabase Database Trigger:**
```sql
-- Create function to call webhook
CREATE OR REPLACE FUNCTION notify_revalidation()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://tackleapp.ai/api/revalidate',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := json_build_object(
      'secret', 'your-secret-key',
      'type', TG_TABLE_NAME,
      'slug', NEW.slug
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on content tables
CREATE TRIGGER species_revalidation
  AFTER INSERT OR UPDATE ON species
  FOR EACH ROW
  WHEN (NEW.flags->>'draft' = 'false')
  EXECUTE FUNCTION notify_revalidation();
```

### Picking Up New/Updated Content Without Full Redeploy

**Mechanism:**
1. **New Content:**
   - Content inserted into database with `flags.draft = false`
   - Database trigger fires webhook
   - Next.js API route receives webhook
   - `revalidatePath()` called for new content path
   - Next.js regenerates page on next request (ISR)
   - Page is now live without redeploy

2. **Updated Content:**
   - Content updated in database
   - `updatedAt` timestamp updated
   - Database trigger fires webhook
   - Next.js API route receives webhook
   - `revalidatePath()` called for updated content path
   - Next.js regenerates page on next request
   - Updated content is live without redeploy

3. **Bulk Updates:**
   - For bulk content updates, use batch revalidation
   - API route accepts array of paths to revalidate
   - All paths revalidated in single request
   - Sitemap revalidated after bulk update

**Fallback:**
- If webhook fails, content is still in database
- Next ISR revalidation cycle will pick up changes
- Maximum delay: revalidation time (7-30 days)
- For urgent updates, manual revalidation via admin panel

---

## State Regulations Link Strategy

### Configuration Object

**Location:** `lib/content/state-regulations.ts`

```typescript
export interface StateRegulationLink {
  label: string; // Display text (e.g., "Florida Fish and Wildlife Conservation Commission")
  url: string; // Official regulations URL
  description?: string; // Optional description
}

export const STATE_REGULATION_LINKS: Record<string, StateRegulationLink> = {
  FL: {
    label: "Florida Fish and Wildlife Conservation Commission",
    url: "https://myfwc.com/fishing/saltwater/",
    description: "Official Florida saltwater fishing regulations"
  },
  TX: {
    label: "Texas Parks and Wildlife Department",
    url: "https://tpwd.texas.gov/regulations/outdoor-annual/fishing/",
    description: "Official Texas fishing regulations"
  },
  CA: {
    label: "California Department of Fish and Wildlife",
    url: "https://wildlife.ca.gov/Fishing",
    description: "Official California fishing regulations"
  },
  NY: {
    label: "New York State Department of Environmental Conservation",
    url: "https://www.dec.ny.gov/outdoor/fishing.html",
    description: "Official New York fishing regulations"
  },
  // Add more states as needed
  LA: {
    label: "Louisiana Department of Wildlife and Fisheries",
    url: "https://www.wlf.louisiana.gov/page/fishing",
    description: "Official Louisiana fishing regulations"
  },
  NC: {
    label: "North Carolina Division of Marine Fisheries",
    url: "https://www.deq.nc.gov/about/divisions/marine-fisheries",
    description: "Official North Carolina fishing regulations"
  },
  SC: {
    label: "South Carolina Department of Natural Resources",
    url: "https://www.dnr.sc.gov/fish.html",
    description: "Official South Carolina fishing regulations"
  },
  GA: {
    label: "Georgia Department of Natural Resources",
    url: "https://gadnr.org/fishing",
    description: "Official Georgia fishing regulations"
  },
  AL: {
    label: "Alabama Department of Conservation and Natural Resources",
    url: "https://www.outdooralabama.com/fishing",
    description: "Official Alabama fishing regulations"
  },
  MS: {
    label: "Mississippi Department of Marine Resources",
    url: "https://dmr.ms.gov/fishing/",
    description: "Official Mississippi fishing regulations"
  }
};
```

### Rendering Strategy

#### Location Pages

**Required Component:** `components/content/RegulationsLink.tsx`

```typescript
interface RegulationsLinkProps {
  stateCode: string; // e.g., "FL"
  className?: string;
}

export function RegulationsLink({ stateCode, className }: RegulationsLinkProps) {
  const regulationLink = STATE_REGULATION_LINKS[stateCode];
  
  if (!regulationLink) {
    return null; // No link if state not configured
  }
  
  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground mb-2">
        Regulations change—always verify with official sources.
      </p>
      <a
        href={regulationLink.url}
        target="_blank"
        rel="nofollow noopener noreferrer"
        className="inline-flex items-center gap-2 text-primary hover:underline"
      >
        <ExternalLinkIcon className="w-4 h-4" />
        See local regulations: {regulationLink.label}
      </a>
      {regulationLink.description && (
        <p className="text-xs text-muted-foreground mt-1">
          {regulationLink.description}
        </p>
      )}
    </div>
  );
}
```

**Usage in Location Pages:**
- Render in "Regulations" section
- Use `stateCode` from `location.geo.stateCode`
- Place after main content, before FAQs

#### Species Pages

**Strategy:** Link to general regulations page OR state selector

**Option 1: General Regulations Page**
- Create `/regulations` page that lists all states
- Link: "See local regulations" → `/regulations`
- User selects state from list

**Option 2: State Selector**
- Show state selector dropdown
- Link to appropriate state regulations URL
- Default to most common state (e.g., FL for Florida species)

**Component:** `components/content/RegulationsLinkSpecies.tsx`

```typescript
interface RegulationsLinkSpeciesProps {
  commonStates?: string[]; // e.g., ["FL", "TX", "LA"]
  className?: string;
}

export function RegulationsLinkSpecies({ 
  commonStates = ["FL"], 
  className 
}: RegulationsLinkSpeciesProps) {
  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground mb-2">
        Regulations change—always verify with official sources.
      </p>
      <div className="flex flex-wrap gap-2">
        {commonStates.map((stateCode) => {
          const link = STATE_REGULATION_LINKS[stateCode];
          if (!link) return null;
          
          return (
            <a
              key={stateCode}
              href={link.url}
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <ExternalLinkIcon className="w-4 h-4" />
              {stateCode} Regulations
            </a>
          );
        })}
      </div>
    </div>
  );
}
```

#### How-To Pages

**Strategy:** Same as species pages
- Link to general regulations page OR
- Show state selector if technique is state-specific

#### Blog Posts

**Strategy:** Optional regulations link
- Only include if post discusses regulations
- Link to general regulations page
- Or link to specific state if post is state-specific

### Disclaimer Text

**Standard Disclaimer:**
```
"Regulations change—always verify with official sources."
```

**Placement:**
- Always above regulations link
- Smaller, muted text
- Required on all location pages
- Recommended on species/how-to pages if regulations mentioned

### Example Implementation

**Location Page Example:**
```tsx
// In app/locations/[state]/[city]/page.tsx
<ContentSection title="Regulations">
  <RegulationsLink 
    stateCode={location.geo.stateCode}
    className="my-4"
  />
  <p className="text-sm text-muted-foreground">
    Always check current regulations before fishing. 
    Size limits, bag limits, and seasons may change.
  </p>
</ContentSection>
```

**Species Page Example:**
```tsx
// In app/species/[slug]/page.tsx
<ContentSection title="Regulations">
  <RegulationsLinkSpecies 
    commonStates={["FL", "TX", "LA"]} // Based on species distribution
    className="my-4"
  />
  <p className="text-sm text-muted-foreground">
    Regulations vary by state. Always check current regulations 
    for your fishing location.
  </p>
</ContentSection>
```

---

## Summary

### Storage: Database-Backed (Supabase/Postgres)
- Best for automation, scalability, and Next.js integration
- ISR with on-demand revalidation via webhooks

### Content Types: 5 Types Defined
- SpeciesDoc, HowToDoc, LocationDoc, BlogPostDoc, BlogCategoryDoc
- All include sources, related content, FAQs, metadata

### Quality Gates: Strict Validation
- Word count minimums, required sections, internal links, sources
- No verbatim copying, no "official" claims, no legal advice

### Automation-Ready: Complete Workflow
- Scrape → Parse → Normalize → Dedupe → Enrich → Generate → Validate → Write → Revalidate

### Regulations: Outbound Links Only
- State-specific configuration
- Disclaimer required
- No hosted regulation content

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Next Steps:** Implement database schema and content ingestion pipeline



