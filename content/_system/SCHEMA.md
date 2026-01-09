# Blog Content Schema

## Single Source of Truth
All blog posts are stored as JSON files in `content/blog/`. The central index at `content/_system/blogIndex.json` registers all published posts.

## Blog Post JSON Schema

Each blog post is a JSON file: `content/blog/{slug}.json`

```typescript
interface BlogPost {
  // Core Metadata
  id: string;                    // UUID
  slug: string;                  // URL-friendly identifier
  status: 'published' | 'draft' | 'archived';

  // Content
  title: string;                 // H1 title
  description: string;           // Meta description (155-160 chars)
  body: string;                  // Markdown or HTML content
  excerpt?: string;              // Short summary for cards

  // SEO
  primaryKeyword: string;        // Main target keyword
  secondaryKeywords: string[];   // Additional target keywords
  heroImage?: string;            // Featured image URL or path

  // Organization
  category: string;              // e.g., 'gear-reviews', 'techniques', 'species'
  tags?: string[];               // Additional tags

  // Author & Dates
  author: {
    name: string;
    url?: string;
  };
  publishedAt: string;           // ISO 8601
  updatedAt: string;             // ISO 8601

  // Structure
  headings: Array<{
    level: 1 | 2 | 3;
    text: string;
    id?: string;
  }>;

  // FAQs (for schema markup)
  faqs: Array<{
    question: string;
    answer: string;
  }>;

  // Sources & Citations
  sources: Array<{
    label: string;
    url: string;
    retrievedAt: string;
  }>;

  // Related Content (internal linking)
  related: {
    speciesSlugs?: string[];
    howToSlugs?: string[];
    locationSlugs?: string[];
    postSlugs?: string[];
  };

  // Advanced Features
  vibeTest?: {
    primaryScore: {
      name: string;
      value: number;              // 0-100
      explanation: string;
      factors: string[];
      lastUpdated: string;
    };
    uniqueInsights: string[];
    realWorldNotes: string[];
  };

  embeddedTools?: Array<{
    name: string;
    type: string;
    componentPath: string;
  }>;

  alternativeRecommendations?: Array<{
    title: string;
    slug: string;
    reason: string;
    relevanceScore: number;
  }>;

  // Publishing Metadata
  contentHash?: string;          // SHA-256 for change detection
  wordCount?: number;
  readingTimeMinutes?: number;
}
```

## Blog Index Schema

Central registry at `content/_system/blogIndex.json`:

```typescript
interface BlogIndex {
  version: string;               // Schema version
  lastUpdated: string;           // ISO 8601
  totalPosts: number;
  posts: Array<{
    slug: string;
    title: string;
    category: string;
    publishedAt: string;
    status: 'published' | 'draft' | 'archived';
    filePath: string;            // Relative path to JSON file
  }>;
}
```

## Example Blog Post

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "slug": "best-lures-for-snook-florida",
  "status": "published",
  "title": "Best Lures for Snook in Florida: Complete Guide",
  "description": "Discover the top-performing lures for catching snook in Florida waters. Expert-tested recommendations with proven results.",
  "excerpt": "The ultimate guide to selecting lures for Florida snook fishing.",
  "body": "# Best Lures for Snook in Florida\n\nSnook are one of Florida's most prized gamefish...",
  "primaryKeyword": "best lures for snook florida",
  "secondaryKeywords": ["snook fishing lures", "florida snook lures", "snook bait"],
  "heroImage": "/images/blog/snook-fishing-florida.jpg",
  "category": "gear-reviews",
  "tags": ["snook", "lures", "florida", "inshore"],
  "author": {
    "name": "Tackle Fishing Team",
    "url": "/authors/tackle-fishing-team"
  },
  "publishedAt": "2026-01-09T12:00:00Z",
  "updatedAt": "2026-01-09T12:00:00Z",
  "headings": [
    {
      "level": 1,
      "text": "Best Lures for Snook in Florida: Complete Guide",
      "id": "best-lures-for-snook-florida"
    },
    {
      "level": 2,
      "text": "Top 5 Snook Lures",
      "id": "top-5-snook-lures"
    }
  ],
  "faqs": [
    {
      "question": "What is the best lure for snook in Florida?",
      "answer": "Soft plastic jerkbaits are consistently the most effective lure for Florida snook..."
    }
  ],
  "sources": [
    {
      "label": "Florida Fish and Wildlife Commission",
      "url": "https://myfwc.com",
      "retrievedAt": "2026-01-09T10:00:00Z"
    }
  ],
  "related": {
    "speciesSlugs": ["snook"],
    "howToSlugs": ["how-to-catch-snook-florida"],
    "locationSlugs": ["florida/miami", "florida/tampa"]
  },
  "wordCount": 2500,
  "readingTimeMinutes": 10
}
```

## Frontend Integration

The frontend reads from these JSON files:

1. **Blog Index Page** (`/blog`): Reads `blogIndex.json` to list all posts
2. **Individual Blog Post** (`/blog/[slug]`): Reads `content/blog/{slug}.json`
3. **No Database Required**: All content is file-based, cached, and deployed with app

## Content Pipeline

The pipeline generates and publishes blog posts:

1. **Generate**: Creates JSON file at `content/blog/{slug}.json`
2. **Register**: Adds entry to `blogIndex.json`
3. **Validate**: Ensures schema compliance
4. **Publish**: Triggers revalidation for `/blog` and `/blog/[slug]`

## Benefits

- **Single Source of Truth**: All content in JSON files
- **Version Control**: Git tracks every change
- **No Database**: Content deployed with app
- **Type Safe**: TypeScript interfaces ensure correctness
- **Cache Friendly**: Static files are CDN-optimized
- **Scalable**: Can generate thousands of posts
