# Content System - Single Source of Truth

This directory contains all blog content as structured JSON files. This is the **single source of truth** for all blog posts on the Tackle fishing website.

## Architecture

### Directory Structure

```
content/
├── _system/                    # System files (gitignored)
│   ├── blogIndex.json         # Central blog post registry
│   └── SCHEMA.md              # Full schema documentation
├── blog/                       # Blog posts (JSON files)
│   └── {slug}.json            # Individual blog post
└── README.md                   # This file
```

### Why JSON Files?

1. **Version Control**: Every change is tracked in Git
2. **No Database**: Content deploys with the application
3. **Type Safety**: TypeScript interfaces ensure correctness
4. **Performance**: Static files are CDN-optimized
5. **Scalability**: Can generate thousands of posts
6. **Deterministic**: Same input = same output every time

## Blog Post Structure

Each blog post is a JSON file at `content/blog/{slug}.json`:

```json
{
  "id": "uuid",
  "slug": "best-lures-for-snook-florida",
  "status": "published",
  "title": "Best Lures for Snook in Florida",
  "description": "Meta description...",
  "body": "# Markdown content...",
  "primaryKeyword": "best lures for snook florida",
  "secondaryKeywords": ["snook fishing lures", "..."],
  "category": "gear-reviews",
  "author": {
    "name": "Tackle Fishing Team",
    "url": "/authors/tackle-fishing-team"
  },
  "publishedAt": "2026-01-09T12:00:00Z",
  "updatedAt": "2026-01-09T12:00:00Z",
  "headings": [...],
  "faqs": [...],
  "sources": [...],
  "related": {...},
  "wordCount": 1250,
  "readingTimeMinutes": 6
}
```

See `_system/SCHEMA.md` for the complete schema.

## Central Blog Index

`content/_system/blogIndex.json` maintains a registry of all published posts:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-01-09T12:00:00Z",
  "totalPosts": 1,
  "posts": [
    {
      "slug": "best-lures-for-snook-florida",
      "title": "Best Lures for Snook in Florida: Complete Guide",
      "category": "gear-reviews",
      "publishedAt": "2026-01-09T12:00:00Z",
      "status": "published",
      "filePath": "content/blog/best-lures-for-snook-florida.json"
    }
  ]
}
```

## Content Loading

The frontend reads from these JSON files using `lib/content/blog.ts`:

```typescript
import { loadBlogPost, loadAllBlogPosts } from '@/lib/content/blog';

// Load a single post
const post = loadBlogPost('best-lures-for-snook-florida');

// Load all published posts
const allPosts = loadAllBlogPosts();
```

### Available Functions

- `loadBlogPost(slug)` - Load single post
- `loadAllBlogPosts()` - Load all published posts
- `loadBlogPostsByCategory(category)` - Filter by category
- `loadFeaturedBlogPosts(limit)` - Get recent posts
- `getAllBlogCategories()` - Get all categories with counts
- `getRelatedBlogPosts(slug, limit)` - Get related posts
- `searchBlogPosts(query)` - Search posts

## Adding New Blog Posts

### Option 1: Manual Creation

1. Create a new JSON file at `content/blog/{slug}.json`
2. Follow the schema in `_system/SCHEMA.md`
3. Add entry to `content/_system/blogIndex.json`
4. Commit to Git

### Option 2: Automated Pipeline

Use the content pipeline to generate posts automatically:

```bash
# Generate a specific blog post
npm run pipeline publish --topicKey "blog::best-lures-for-snook-florida"

# Generate multiple posts from queue
npm run pipeline run --limit 5
```

See `scripts/pipeline/README.md` for pipeline documentation.

## Frontend Integration

### Blog Index Page (`/blog`)

Displays all blog posts by reading from the blog index:

```typescript
// app/blog/page.tsx
import { loadAllBlogPosts, getAllBlogCategories } from '@/lib/content/blog';

export default function BlogIndexPage() {
  const blogPosts = loadAllBlogPosts();
  const categories = getAllBlogCategories();

  return (
    <div>
      {blogPosts.map(post => (
        <BlogCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
```

### Individual Blog Post (`/blog/[slug]`)

Loads the specific JSON file for the requested slug:

```typescript
// app/blog/[slug]/page.tsx
import { loadBlogPost } from '@/lib/content/blog';

export default async function BlogPostPage({ params }) {
  const post = loadBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  return <article>{post.body}</article>;
}
```

## SEO Features

Each blog post includes complete SEO metadata:

- **Primary & Secondary Keywords**: Targeted SEO optimization
- **FAQs**: Structured data for rich snippets
- **Sources**: Citations for E-A-T signals
- **Headings**: Proper H1, H2, H3 structure
- **Related Content**: Internal linking strategy
- **Last Updated**: Freshness signals

## Benefits

1. **Reliability**: Files are the source of truth
2. **Performance**: No database queries, instant loads
3. **Scalability**: Generate unlimited posts
4. **Maintainability**: Easy to update, version controlled
5. **Portability**: Can migrate entire site by copying files
6. **Debugging**: Can inspect JSON files directly

## Maintenance

### Updating a Post

1. Edit the JSON file at `content/blog/{slug}.json`
2. Update the `updatedAt` timestamp
3. Commit changes to Git
4. Redeploy (or trigger revalidation)

### Archiving a Post

1. Change `status` from `"published"` to `"archived"`
2. Update in `blogIndex.json`
3. Commit changes

### Deleting a Post

1. Delete the JSON file
2. Remove entry from `blogIndex.json`
3. Commit changes

## Content Pipeline Integration

The content pipeline automatically:

1. **Fetches Data**: Gathers facts from authoritative sources
2. **Generates Content**: Creates blog posts using LLM
3. **Validates**: Ensures quality and schema compliance
4. **Publishes**: Writes JSON files to `content/blog/`
5. **Indexes**: Updates `blogIndex.json`
6. **Revalidates**: Triggers Next.js revalidation

See pipeline documentation for details.

## Example: First Blog Post

We've included a sample blog post to demonstrate the system:

**File**: `content/blog/best-lures-for-snook-florida.json`

**Title**: "Best Lures for Snook in Florida: Complete Guide"

**Features**:
- Comprehensive lure recommendations
- Seasonal considerations
- Color selection guide
- Pro tips and tackle setup
- FAQs with structured data
- Related content linking

**View**: Visit `/blog/best-lures-for-snook-florida` to see it live

## Questions?

See `_system/SCHEMA.md` for the complete JSON schema and additional documentation.
