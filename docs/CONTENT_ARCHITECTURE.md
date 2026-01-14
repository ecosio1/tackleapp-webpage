# Content Architecture - Tackle Website

## Purpose

This document defines how content is structured, organized, and interconnected for SEO performance and user experience. All content must follow these architectural patterns.

---

## URL Structure & Conventions

### Blog Posts
**Pattern:** `/blog/[slug]`

**Examples:**
- `/blog/how-to-tie-a-fishing-hook`
- `/blog/best-snook-lures-florida`
- `/blog/inshore-fishing-tips`

**Rules:**
- Slugs use lowercase with hyphens
- Primary keyword should appear in slug
- Keep slugs under 60 characters
- Never use dates in URLs (evergreen)
- Never use special characters except hyphens

### Blog Categories
**Pattern:** `/blog/category/[category-slug]`

**Examples:**
- `/blog/category/fishing-tips`
- `/blog/category/gear-reviews`
- `/blog/category/species-guides`

### Author Pages
**Pattern:** `/authors/[author-slug]`

**Examples:**
- `/authors/tackle-fishing-team`
- `/authors/[future-author-name]`

### Static Pages
- `/about` - About Tackle
- `/features` - App features
- `/how-it-works` - How Tackle works
- `/privacy` - Privacy policy
- `/terms` - Terms of service

---

## Content Types & Frontmatter

### Blog Post JSON Schema

**File location:** `content/blog/[slug].json`

**Required fields:**
```json
{
  "id": "uuid-v4-identifier",
  "slug": "url-safe-slug",
  "title": "Primary Title (50-60 chars)",
  "description": "Meta description (140-155 chars)",
  "heroImage": "https://images.unsplash.com/photo-...",
  "category": "fishing-tips",
  "tags": ["florida", "snook", "inshore"],
  "author": {
    "name": "Tackle Fishing Team",
    "url": "/authors/tackle-fishing-team"
  },
  "publishedAt": "2024-01-15T00:00:00Z",
  "updatedAt": "2024-01-20T00:00:00Z",
  "primaryKeyword": "snook fishing florida",
  "secondaryKeywords": ["snook lures", "florida fishing", "inshore snook"],
  "body": "# Post Title\n\nMarkdown content...",
  "faqs": [
    {
      "question": "What is the best bait for snook?",
      "answer": "Live shrimp, crabs, and mullet are excellent..."
    }
  ],
  "sources": [
    {
      "label": "Florida FWC",
      "url": "https://myfwc.com/fishing/saltwater/recreational/snook/",
      "retrievedAt": "2024-01-15T00:00:00Z"
    }
  ]
}
```

**Optional fields:**
```json
{
  "featuredImage": "Alternative hero image",
  "readingTime": 8,
  "related": {
    "speciesSlugs": ["redfish", "tarpon"],
    "howToSlugs": ["catch-snook-mangroves"],
    "locationSlugs": ["florida/miami"],
    "postSlugs": ["florida-fishing-guide"]
  }
}
```

---

## Internal Linking Strategy

### Required Links Per Post Type

**Blog Posts (minimum 3-5 internal links):**
- Link to hub page for primary topic (if exists)
- Link to 2 related blog posts
- Link to app download page (CTA)
- Link to author page

**Species Guides (minimum 6 internal links):**
- Link to 3-5 how-to guides
- Link to 5 location pages
- Link to 1-2 related blog posts

**How-To Guides (minimum 6 internal links):**
- Link to 3 species pages
- Link to 3 location pages
- Link to related blog posts

**Location Pages (minimum 6 internal links):**
- Link to 5 species pages
- Link to 5 how-to guides
- Link to official regulations source (external)

### Linking Rules

**DO:**
- ✅ Use descriptive anchor text ("how to catch snook in mangroves")
- ✅ Link naturally within content flow
- ✅ Link to hub pages for topic authority
- ✅ Link to related content that adds value
- ✅ Link early in content (first 500 words)

**DON'T:**
- ❌ Use generic anchor text ("click here", "read more")
- ❌ Force more than 5 links per 1000 words
- ❌ Link to competing/off-topic content
- ❌ Create orphan pages (pages with no internal links pointing to them)
- ❌ Create link circles (A→B→A)

### Link Patterns

**Hub → Spoke (Supporting Content):**
```
Hub: "Florida Fishing Guide"
  ↓
Spokes:
  - "Best Snook Lures for Florida"
  - "Florida Redfish Fishing"
  - "Tampa Bay Fishing Spots"
  - "Florida Keys Fishing"
```

**Supporting → Hub + Related:**
```
Supporting Post: "Best Snook Lures for Florida"
  ↓
  - Link back to hub: "Florida Fishing Guide"
  - Link to related: "How to Catch Snook in Mangroves"
  - Link to related: "Miami Snook Fishing Spots"
```

---

## Topic Clusters & Content Hubs

### Cluster Structure

**Hub Page (Pillar Content):**
- Comprehensive guide (2500+ words)
- Covers topic broadly
- Links to all supporting content
- Ranks for head terms
- Example: "Florida Fishing Guide"

**Supporting Pages (Cluster Content):**
- Specific subtopic (1500-2000 words)
- Covers narrow angle
- Links back to hub + 2 related posts
- Ranks for long-tail terms
- Example: "Best Snook Lures for Florida Mangroves"

### Cluster Example: Florida Fishing

**Hub:** `/blog/florida-fishing-guide`
- Topic: Complete Florida fishing overview
- Keywords: "florida fishing", "fishing in florida"
- Links to: All Florida-related supporting posts

**Supporting Posts:**
- `/blog/best-snook-lures-florida` (Species + Location)
- `/blog/tampa-bay-fishing-spots` (Location)
- `/blog/florida-inshore-fishing` (Technique + Location)
- `/blog/florida-fishing-seasons` (Timing + Location)

**Interlinking:**
- Hub links to all 4 supporting posts
- Each supporting post links back to hub
- Each supporting post links to 2 other supporting posts

---

## Folder Structure

### Content Directories

```
content/
├── _system/
│   ├── contentIndex.json       # Master index of all content
│   └── schema-validator.ts     # JSON schema validation
├── blog/                        # Blog post JSON files
│   ├── best-snook-lures-florida.json
│   ├── how-to-tie-a-fishing-hook.json
│   └── inshore-fishing-tips.json
├── species/                     # Future: species pages
├── locations/                   # Future: location pages
└── how-to/                      # Future: how-to guides
```

### Media Directories

```
public/
└── images/
    ├── blog/                    # Blog post images
    │   ├── hero/               # Hero images (1200x600)
    │   ├── inline/             # Inline images (800x600)
    │   └── thumbnails/         # Card thumbnails (400x300)
    ├── posts/                   # Alternative: organized by post slug
    │   └── [slug]/
    │       ├── hero.webp
    │       ├── tackle-1.webp
    │       └── location-1.webp
    ├── hubs/                    # Hub page images
    └── diagrams/                # Diagrams and illustrations
```

---

## Anti-Patterns to Avoid

### ❌ Orphan Posts
**Problem:** Post has no internal links pointing to it
**Fix:** Add link from related post or hub page
**Detection:** Check content index for posts with 0 incoming links

### ❌ Thin Content
**Problem:** Post under 1000 words, lacks depth
**Fix:** Expand sections, add FAQs, add examples
**Detection:** Word count validation in quality gate

### ❌ Duplicate Search Intent
**Problem:** Multiple posts targeting same keyword
**Fix:** Consolidate or differentiate with long-tail modifiers
**Detection:** Keyword collision check before publishing

**Example:**
- ❌ "Best Snook Lures" + "Top Snook Lures" (duplicate)
- ✅ "Best Snook Lures for Florida" + "Best Snook Lures for Mangroves" (differentiated)

### ❌ Missing Authorship
**Problem:** Post published without author attribution
**Fix:** Add author block to all posts
**Detection:** Schema validation requires author field

### ❌ Generic Hero Images
**Problem:** Stock photo with no relevance (person smiling, generic landscape)
**Fix:** Use fishing-specific imagery (tackle, fish, locations)
**Detection:** Manual review or AI image classification

### ❌ Missing Internal Links
**Problem:** Post has fewer than 3 internal links
**Fix:** Add contextual links to related content
**Detection:** Link count validation in quality gate

### ❌ Broken Internal Links
**Problem:** Link points to non-existent page
**Fix:** Update link to correct slug
**Detection:** Link validation script checks all internal links

### ❌ No Clear Hub
**Problem:** Supporting posts don't link to a hub page
**Fix:** Create hub page or identify existing hub
**Detection:** Check if related posts all point to common parent

### ❌ Keyword Stuffing
**Problem:** Primary keyword appears unnaturally (density > 3%)
**Fix:** Rewrite for natural language
**Detection:** Keyword density check

### ❌ No Conversion Path
**Problem:** Post lacks CTA to app or next step
**Fix:** Add app CTA + related content links
**Detection:** CTA validation in quality gate

---

## Canonical URLs

### Rules
- Every page has ONE canonical URL
- Blog posts: `https://tackleapp.ai/blog/[slug]`
- Categories: `https://tackleapp.ai/blog/category/[category]`
- No trailing slashes
- HTTPS only
- No query parameters in canonical

### Implementation
```tsx
// In blog post page
<link rel="canonical" href={`https://tackleapp.ai/blog/${post.slug}`} />
```

---

## Content Index Management

### Index Structure
**File:** `content/_system/contentIndex.json`

```json
{
  "blog": {
    "posts": [
      {
        "slug": "best-snook-lures-florida",
        "title": "Best Snook Lures for Florida: Complete Guide",
        "category": "fishing-tips",
        "publishedAt": "2024-01-15T00:00:00Z",
        "updatedAt": "2024-01-20T00:00:00Z"
      }
    ],
    "categories": [
      {
        "slug": "fishing-tips",
        "name": "Fishing Tips",
        "count": 15
      }
    ]
  },
  "lastUpdated": "2024-01-20T00:00:00Z"
}
```

### Index Update Rules
- Pipeline automatically updates index after publishing
- Index includes all published posts (draft: false)
- Posts sorted by publishedAt (newest first)
- Categories generated from post data

---

## Migration & Versioning

### Content Updates
- **Minor updates:** Update JSON file + `updatedAt` field
- **Major rewrites:** Create new slug, 301 redirect old → new
- **Deletions:** Remove JSON file, add 410 Gone status

### Slug Changes (Avoid if Possible)
If slug must change:
1. Create new JSON file with new slug
2. Add 301 redirect in `next.config.js`
3. Update all internal links pointing to old slug
4. Keep old file for 30 days (for backlinks)
5. After 30 days, delete old file

**Redirect Example:**
```js
// next.config.js
async redirects() {
  return [
    {
      source: '/blog/old-slug',
      destination: '/blog/new-slug',
      permanent: true, // 301
    },
  ];
}
```

---

## Quality Checklist

Before publishing any content:
- [ ] Slug follows naming conventions
- [ ] All required frontmatter fields present
- [ ] Title is 50-60 characters
- [ ] Description is 140-155 characters
- [ ] Hero image specified
- [ ] Author attribution included
- [ ] 3-5 internal links added
- [ ] Links use descriptive anchor text
- [ ] No orphan page (has incoming links)
- [ ] No duplicate search intent
- [ ] Content index updated
- [ ] Canonical URL set correctly

---

## Related Documentation

- **Content Guidelines:** `.claude/blog-content-guidelines.md` - 12-section post structure
- **Content Checklist:** `.claude/blog-checklist.md` - Pre-publish checklist
- **Editorial Standards:** `docs/EDITORIAL-STANDARDS.md` - Tone, E-E-A-T, guardrails
- **Validation Rules:** `docs/CONTENT-VALIDATION-RULES.md` - Non-negotiable rules
- **Media Guide:** `docs/MEDIA_GUIDE.md` - Image specifications

---

**Last Updated:** 2026-01-14
**Status:** Production-ready
