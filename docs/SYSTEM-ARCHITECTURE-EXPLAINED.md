# Complete Autoblogging System Architecture - Deep Dive

## Table of Contents
1. [System Overview](#system-overview)
2. [Complete Flow: Idea to Published Post](#complete-flow-idea-to-published-post)
3. [Core Components](#core-components)
4. [Data Storage Architecture](#data-storage-architecture)
5. [Safety Mechanisms](#safety-mechanisms)
6. [Concurrency & Locking](#concurrency--locking)
7. [Quality Gates](#quality-gates)
8. [Index Management](#index-management)
9. [Frontend Integration](#frontend-integration)
10. [Observability & Monitoring](#observability--monitoring)
11. [Error Handling & Recovery](#error-handling--recovery)

---

## System Overview

### What This System Does

This is a **fully automated content publishing pipeline** for the Tackle fishing app website. It:

1. **Discovers** blog opportunities using Perplexity AI and DataForSEO
2. **Generates** SEO-optimized blog posts using LLM (Claude/OpenAI)
3. **Validates** content against strict quality gates
4. **Publishes** posts to the file system
5. **Indexes** posts for fast frontend retrieval
6. **Revalidates** Next.js pages so posts appear immediately
7. **Tracks** metrics for observability

### Architecture Pattern

**File-Based Content System** (not database-driven):
- Content stored as JSON files in `content/blog/`
- Index stored as JSON in `content/_system/contentIndex.json`
- Frontend reads from files (Next.js SSG/ISR)
- No database required - fully static

**Why This Approach:**
- ✅ Simple deployment (just files)
- ✅ Version control friendly (Git tracks content)
- ✅ Fast reads (no DB queries)
- ✅ Scales to thousands of posts
- ✅ Works with Next.js static generation

---

## Complete Flow: Idea to Published Post

### Phase 1: Ideation (Discovery)

**Command:** `npm run pipeline:batch-publish`

**Step 1.1: Generate Blog Ideas**
```
Location: scripts/pipeline/ideation.ts
Process:
  1. Perplexity AI discovers topics
     - Uses TACKLE-APP-DOCUMENTATION.md for context
     - Finds patterns: "X vs Y", "How to catch X in Y"
     - Returns 20+ seed concepts
     
  2. DataForSEO validates keywords
     - Checks search volume (target: 200-500/month)
     - Checks keyword difficulty (target: <70)
     - Filters for informational intent
     - Gets related questions for FAQs
     
  3. Calculates opportunity score
     - Formula: (searchVolume * 0.4) + ((100 - difficulty) * 0.6)
     - Ranks ideas by score
     
  4. Returns BlogIdea[] array
     - Each idea has: keyword, volume, difficulty, intent, questions, score
```

**Step 1.2: Apply Cadence Controls**
```
Location: scripts/pipeline/cadence-controls.ts
Process:
  1. Check daily limit
     - Reads from topicIndex.json
     - Counts posts published today
     - Blocks if over limit (default: 10/day)
     
  2. Filter by opportunity score
     - Default min: 50/100
     - Rejects low-opportunity ideas
     
  3. Filter by intent
     - Default: only 'informational'
     - Rejects commercial/transactional
     
  4. Filter by category
     - Can allow/block specific categories
     - Default: all categories allowed
     
  5. Returns filtered ideas
```

**Output:** Array of validated `BlogIdea` objects ready for generation

---

### Phase 2: Content Generation

**Step 2.1: Convert Idea to Brief**
```
Location: scripts/pipeline/blog-brief-builder.ts
Process:
  1. Takes BlogIdea
  2. Builds ContentBrief object:
     - slug: Generated from keyword
     - title: Generated from keyword + intent
     - primaryKeyword: From idea
     - secondaryKeywords: From DataForSEO suggestions
     - sources: Fetched from source registry
     - internalLinksToInclude: Related species/locations/how-to
     - faqs: From related questions
```

**Step 2.2: Generate Blog Post**
```
Location: scripts/pipeline/generators/blog.ts
Process:
  1. Build LLM prompt
     - Includes brief, sources, app context
     - Instructions for tone, structure, CTAs
     
  2. Call LLM (Claude/OpenAI)
     - Generates markdown body
     - Includes headings, FAQs, internal links
     - Must include CTAs and regulations block
     
  3. Parse generated content
     - Extracts headings
     - Extracts FAQs
     - Validates structure
     
  4. Generate Vibe Test (optional)
     - For comparison/lure/technique posts
     - Adds proprietary scoring (e.g., "Catchability Score")
     
  5. Generate Alternative Recommendations
     - Finds related species/locations/how-to
     - Creates internal linking suggestions
     
  6. Returns BlogPostDoc
     - Complete document with all fields
     - Ready for validation
```

**Output:** `BlogPostDoc` object (not yet published)

---

### Phase 3: Validation

**Step 3.1: Document Validation**
```
Location: scripts/pipeline/validator.ts
Process:
  1. Validates required fields
     - id, slug, title, body, keywords, etc.
     
  2. Validates structure
     - Headings array
     - FAQs array (min 5)
     - Sources array (min 1)
     
  3. Validates content quality
     - Word count (min 900 for blog)
     - No placeholder text
     - No broken markdown
```

**Step 3.2: Quality Gate**
```
Location: scripts/pipeline/quality-gate.ts
Process:
  1. CTA Check (BLOCKING for blog posts)
     - Must have CTA in first 50% of content
     - Must have CTA in last 40% of content
     - Patterns: "download tackle", "get tackle", "/download"
     
  2. Regulations Block Check (BLOCKING)
     - Must have "See local regulations" text
     - Must be neutral (no specific limits/seasons)
     
  3. Practical Steps Check (BLOCKING)
     - Must have numbered steps OR instructions
     - Must have at least 3 instructional paragraphs
     
  4. Regulations Specifics Check (BLOCKING)
     - Blocks if contains bag limits, size limits, seasons
     - Blocks if makes legal claims
     
  5. Thin Content Check (BLOCKING)
     - Minimum 900 words
     - Must have substantial paragraphs
     
  6. Keyword Stuffing Check (BLOCKING)
     - Primary keyword density < 3%
     - No excessive repetition
     
  7. Returns QualityGateResult
     - passed: boolean
     - blocked: boolean
     - errors: string[]
     - warnings: string[]
```

**If Blocked:** Publishing stops, error logged, metrics recorded

**If Passed:** Proceeds to publishing

---

### Phase 4: Publishing

**Location:** `scripts/pipeline/publisher.ts`

**Step 4.1: Pre-Publish Safeguards**
```
1. Validate Required Fields
   - Checks all required fields exist
   - Throws PublishError if missing
   
2. Quality Gate (already checked, but double-check)
   - Runs again as final check
   - Blocks if fails
   
3. Check for Duplicate Slug
   - Checks if file already exists
   - Throws PublishError if duplicate
   
4. Check for Duplicate Topic Key
   - Checks topicIndex.json
   - Prevents re-publishing same content
   - Uses content hash for deduplication
```

**Step 4.2: Write Content File**
```
1. Generate file path
   - content/blog/{slug}.json
   
2. Validate JSON structure
   - Ensures document is valid JSON
   
3. Atomic write
   - Write to temp file: {slug}.json.tmp
   - Verify written content matches
   - Atomic rename: temp → final
   - Prevents corruption if process crashes mid-write
```

**Step 4.3: Update Topic Index**
```
Location: scripts/pipeline/topicIndex.ts
Process:
  1. Load topicIndex.json
  2. Create/update record:
     - topicKey: "blog::{slug}"
     - status: "published"
     - contentHash: SHA-256 of body
     - sourcesUsed: Array of source URLs
     - lastPublishedAt: Current timestamp
  3. Atomic write (temp → rename)
```

**Step 4.4: Update Content Index (WITH LOCKING)**
```
Location: scripts/pipeline/publisher.ts → atomicIndexUpdate()
Process:
  1. Acquire Index Lock
     - Creates .index.lock file exclusively
     - Waits if another process has lock (max 30s)
     - Detects stale locks (>5min old)
     
  2. Load content index
     - Reads contentIndex.json
     - If corrupted, attempts recovery
     
  3. Add blog post entry
     - Creates BlogPostIndexEntry:
       - slug, title, description, category
       - publishedAt, updatedAt
       - keywords, tags, wordCount
       - flags (draft, noindex)
     - Validates no duplicate slug
     
  4. Atomic write
     - Write to temp file
     - Verify JSON is valid
     - Atomic rename
     
  5. Release lock
     - Verifies lock ownership
     - Deletes .index.lock file
```

**Step 4.5: On-Demand Revalidation**
```
Location: lib/content/revalidation.ts
Process:
  1. Determine paths to revalidate:
     - /blog (blog index page)
     - /blog/{slug} (new post page)
     - /blog/category/{category} (category page, if applicable)
     - /sitemap.xml
     - /sitemap-blog.xml
     
  2. Call Next.js revalidation API
     - POST /api/revalidate
     - Authorization: Bearer {REVALIDATION_SECRET}
     - Body: { paths: [...] }
     
  3. Next.js revalidates pages
     - Regenerates pages on next request
     - Posts appear immediately
```

**Step 4.6: Record Metrics**
```
Location: scripts/pipeline/metrics.ts
Process:
  1. Calculate duration
     - startTime recorded at publish start
     - durationMs = Date.now() - startTime
     
  2. Record attempt
     - status: 'success' or 'failure'
     - durationMs
     - failureReason (if failed)
     - failureCode (if failed)
     
  3. Update metrics file
     - content/_system/publish-metrics.json
     - Atomic write (temp → rename)
     - Updates:
       - totalAttempts++
       - totalSuccesses++ (if success)
       - totalFailures++ (if failure)
       - Categorizes failure by type
       - Updates average publish time
       - Adds to recentPublishes array
```

**Step 4.7: Rollback on Failure**
```
If any step fails:
  1. Delete written file (if exists)
  2. Topic index update is atomic (either succeeds or doesn't write)
  3. Content index update is atomic (either succeeds or doesn't write)
  4. Re-throw error (metrics already recorded)
```

**Output:** Published post at `/blog/{slug}`

---

## Core Components

### 1. Ideation System (`scripts/pipeline/ideation.ts`)

**Purpose:** Discover and validate blog opportunities

**Key Functions:**
- `discoverBlogIdeasWithPerplexity()` - Uses Perplexity AI to find topics
- `fetchKeywordSuggestionsWithMetrics()` - Gets search volume/difficulty from DataForSEO
- `generateBlogIdeas()` - Combines Perplexity + DataForSEO, ranks by opportunity

**Input:** Category, location (optional), max ideas
**Output:** `BlogIdea[]` with search metrics

**Dependencies:**
- Perplexity API (for topic discovery)
- DataForSEO API (for keyword validation)

---

### 2. Content Generator (`scripts/pipeline/generators/blog.ts`)

**Purpose:** Generate blog post content from brief

**Key Functions:**
- `generateBlogPost()` - Main generation function
- `buildPrompt()` - Constructs LLM prompt
- `extractHeadings()` - Parses headings from markdown

**Input:** `ContentBrief`
**Output:** `BlogPostDoc`

**Dependencies:**
- LLM API (Claude/OpenAI)
- Vibe Test generator (optional)
- Alternative recommendations generator

---

### 3. Quality Gate (`scripts/pipeline/quality-gate.ts`)

**Purpose:** Block bad content before publishing

**Key Checks:**
1. CTA placement (top half + near end)
2. Regulations block (neutral reminder)
3. Practical steps (not fluff)
4. No regulations specifics (no bag limits, etc.)
5. Minimum word count (900+)
6. Keyword stuffing detection

**Input:** `GeneratedDoc`
**Output:** `QualityGateResult` (passed/blocked)

**Blocking:** If any check fails, publishing is blocked

---

### 4. Publisher (`scripts/pipeline/publisher.ts`)

**Purpose:** Safely publish content to file system

**Key Functions:**
- `publishDoc()` - Main publish function
- `atomicIndexUpdate()` - Update index with locking
- `validateRequiredFields()` - Pre-publish validation

**Safeguards:**
1. Required field validation
2. Quality gate check
3. Duplicate slug check
4. Duplicate topic key check
5. Atomic file writes
6. Atomic index updates (with locking)
7. Rollback on failure

**Input:** `GeneratedDoc`
**Output:** `{ routePath, slug }`

---

### 5. Index Manager (`lib/content/index.ts`)

**Purpose:** Manage content index for fast frontend reads

**Key Functions:**
- `loadContentIndex()` - Load index with recovery
- `loadContentDoc()` - Load individual post file

**Index Structure:**
```typescript
{
  version: "1.0.0",
  lastUpdated: "2024-12-15T...",
  blogPosts: [
    {
      slug: "how-to-tie-a-fishing-hook",
      title: "How to Tie a Fishing Hook...",
      description: "...",
      category: "fishing-tips",
      publishedAt: "2024-12-15T...",
      keywords: ["fishing knots", "tying hooks"],
      wordCount: 1200,
      // ... minimal data for listing
    }
  ],
  species: [...],
  howTo: [...],
  locations: [...]
}
```

**Recovery:** If index corrupted, attempts:
1. Load backup (`contentIndex.json.backup`)
2. Rebuild from files (scan `content/blog/*.json`)

---

### 6. Index Lock (`lib/content/index-lock.ts`)

**Purpose:** Prevent concurrent index updates

**Mechanism:**
- File-based locking using exclusive file creation
- Lock file: `content/_system/.index.lock`
- Contains unique lock ID
- Timeout: 30 seconds
- Stale lock detection: 5 minutes

**Usage:**
```typescript
await withIndexLock(async () => {
  // Update index here
  // Only one process can be here at a time
});
```

**Why Needed:** Prevents race conditions when multiple publishes happen simultaneously

---

### 7. Revalidation (`lib/content/revalidation.ts`)

**Purpose:** Trigger Next.js ISR revalidation after publish

**Process:**
1. Determines paths to revalidate
2. Calls Next.js API: `POST /api/revalidate`
3. Next.js regenerates pages on next request

**Paths Revalidated:**
- `/blog` (index page)
- `/blog/{slug}` (new post)
- `/blog/category/{category}` (category page)
- `/sitemap.xml` (sitemap)

**Non-Blocking:** Failures don't block publishing

---

### 8. Metrics (`scripts/pipeline/metrics.ts`)

**Purpose:** Track publishing health

**Tracks:**
- Total attempts, successes, failures
- Failure breakdown (validation, quality gate, API, write, index)
- Average publish time
- Recent publishes (last 100)

**Storage:** `content/_system/publish-metrics.json`

**View:** `npm run pipeline:metrics`

---

## Data Storage Architecture

### File Structure

```
content/
├── blog/
│   ├── how-to-tie-a-fishing-hook.json
│   ├── best-fishing-times.json
│   └── ... (one file per post)
│
└── _system/
    ├── contentIndex.json          # Main index (for frontend)
    ├── contentIndex.json.backup   # Automatic backup
    ├── topicIndex.json            # Topic tracking (for deduplication)
    ├── publish-metrics.json       # Observability metrics
    └── .index.lock                # Lock file (temporary)
```

### Content File Format

**Location:** `content/blog/{slug}.json`

**Structure:**
```json
{
  "id": "uuid",
  "pageType": "blog",
  "slug": "how-to-tie-a-fishing-hook",
  "title": "How to Tie a Fishing Hook...",
  "description": "...",
  "body": "# Markdown content...",
  "headings": [
    { "level": 2, "text": "Section 1", "id": "section-1" }
  ],
  "primaryKeyword": "how to tie a fishing hook",
  "secondaryKeywords": ["fishing knots", "tying hooks"],
  "categorySlug": "fishing-tips",
  "tags": ["knots", "beginner"],
  "faqs": [
    { "question": "...", "answer": "..." }
  ],
  "sources": [
    { "label": "...", "url": "...", "retrievedAt": "..." }
  ],
  "related": {
    "speciesSlugs": ["redfish"],
    "locationSlugs": ["fl/miami"],
    "howToSlugs": ["best-fishing-knots"],
    "postSlugs": ["fishing-basics"]
  },
  "author": {
    "name": "Tackle Fishing Team",
    "url": "https://..."
  },
  "dates": {
    "publishedAt": "2024-12-15T...",
    "updatedAt": "2024-12-15T..."
  },
  "flags": {
    "draft": false,
    "noindex": false
  },
  "vibeTest": { ... },  // Optional
  "alternativeRecommendations": [ ... ]  // Optional
}
```

### Index File Format

**Location:** `content/_system/contentIndex.json`

**Structure:**
```json
{
  "version": "1.0.0",
  "lastUpdated": "2024-12-15T...",
  "blogPosts": [
    {
      "slug": "how-to-tie-a-fishing-hook",
      "title": "How to Tie a Fishing Hook...",
      "description": "...",
      "category": "fishing-tips",
      "publishedAt": "2024-12-15T...",
      "updatedAt": "2024-12-15T...",
      "keywords": ["how to tie a fishing hook", "fishing knots"],
      "wordCount": 1200,
      "author": "Tackle Fishing Team",
      "flags": {
        "draft": false,
        "noindex": false
      }
    }
  ],
  "species": [],
  "howTo": [],
  "locations": []
}
```

**Key Point:** Index contains **minimal data** for listing. Full content is in individual files.

---

## Safety Mechanisms

### 1. Duplicate Prevention

**Multiple Layers:**

**Layer 1: Topic Key Deduplication**
```
Location: scripts/pipeline/dedupe.ts
Process:
  1. Generate topicKey: "blog::{slug}"
  2. Check topicIndex.json
  3. If exists → Block publish
  4. Uses content hash for near-duplicate detection
```

**Layer 2: Slug Collision Detection**
```
Location: scripts/pipeline/publisher.ts
Process:
  1. Check if file exists: content/blog/{slug}.json
  2. If exists → Throw PublishError
  3. Prevents overwriting existing posts
```

**Layer 3: Index Duplicate Check**
```
Location: scripts/pipeline/publisher.ts → atomicIndexUpdate()
Process:
  1. Before adding to index, check if slug exists
  2. If exists → Throw PublishError
  3. Prevents duplicate entries in index
```

### 2. Atomic Writes

**All File Writes Use Atomic Pattern:**
```
1. Write to temp file: {file}.tmp
2. Verify written content
3. Atomic rename: temp → final
4. If process crashes, temp file remains (can be cleaned up)
5. Final file is never partially written
```

**Files Using Atomic Writes:**
- Content files (`content/blog/{slug}.json`)
- Content index (`content/_system/contentIndex.json`)
- Topic index (`content/_system/topicIndex.json`)
- Metrics (`content/_system/publish-metrics.json`)

### 3. Index Corruption Recovery

**Automatic Recovery:**
```
Location: lib/content/index-recovery.ts
Process:
  1. Attempt to load contentIndex.json
  2. If fails (corrupted/missing):
     a. Try to load backup: contentIndex.json.backup
     b. If backup fails, rebuild from files:
        - Scan content/blog/*.json
        - Validate each file
        - Build new index
     c. Save recovered index
  3. Return recovered index
```

**Backup Creation:**
- Automatic backup before every index update
- Backup path: `contentIndex.json.backup`
- Overwrites previous backup (only one backup kept)

### 4. Schema Validation

**Runtime Validation:**
```
Location: lib/content/schema-validator.ts
Process:
  1. Validates document structure
  2. Checks required fields
  3. Checks field types
  4. If invalid → Quarantine (return null)
  5. Logs validation errors
```

**Quarantined Posts:**
- Invalid posts are excluded from index
- Logged for debugging
- Don't break frontend rendering

### 5. Rollback on Failure

**If Publish Fails:**
```
1. Delete written file (if exists)
2. Topic index update is atomic (either succeeds or doesn't write)
3. Content index update is atomic (either succeeds or doesn't write)
4. No partial state left behind
```

---

## Concurrency & Locking

### Problem: Race Conditions

**Scenario:**
- Process A starts publishing post1
- Process B starts publishing post2
- Both try to update index simultaneously
- Index gets corrupted (partial updates)

### Solution: File-Based Locking

**Mechanism:**
```
1. Process A acquires lock
   - Creates .index.lock file exclusively
   - Contains unique lock ID
   
2. Process B tries to acquire lock
   - Sees .index.lock exists
   - Waits (checks every 100ms)
   - Max wait: 30 seconds
   
3. Process A updates index
   - Loads index
   - Adds entry
   - Writes atomically
   - Releases lock
   
4. Process B acquires lock
   - Proceeds with update
```

**Lock Features:**
- Exclusive file creation (`wx` flag)
- Unique lock ID (timestamp + random)
- Timeout (30 seconds)
- Stale lock detection (5 minutes)
- Automatic cleanup

**Lock File:** `content/_system/.index.lock`

**Usage:**
```typescript
await withIndexLock(async () => {
  // Only one process can be here
  await updateIndex();
});
```

---

## Quality Gates

### Purpose

Block bad content before it's published. Quality gates are **strict** - they block publishing if requirements aren't met.

### Checks (All Blocking for Blog Posts)

**1. CTA Placement**
- Must have CTA in first 50% of content
- Must have CTA in last 40% of content
- Patterns: "download tackle", "get tackle", "/download"

**2. Regulations Block**
- Must have "See local regulations" text
- Must be neutral (no specific limits/seasons)

**3. Practical Steps**
- Must have numbered steps OR instructions
- Must have at least 3 instructional paragraphs
- Blocks fluff content

**4. No Regulations Specifics**
- Blocks bag limits (e.g., "5 fish per day")
- Blocks size limits (e.g., "minimum 14 inches")
- Blocks seasons (e.g., "closed in January")
- Blocks legal claims

**5. Minimum Word Count**
- Blog posts: 900 words minimum
- Blocks thin content

**6. Keyword Stuffing**
- Primary keyword density < 3%
- Blocks excessive repetition

**7. Content Quality**
- No placeholder text
- No broken markdown
- Must have substantial paragraphs

### Quality Gate Flow

```
publishDoc() called
  ↓
runQualityGate(doc)
  ↓
Check 1: CTA placement
  ├─ Pass → Continue
  └─ Fail → BLOCK (return errors)
  ↓
Check 2: Regulations block
  ├─ Pass → Continue
  └─ Fail → BLOCK
  ↓
Check 3: Practical steps
  ├─ Pass → Continue
  └─ Fail → BLOCK
  ↓
... (all checks)
  ↓
All passed → Return { passed: true, blocked: false }
```

**If Blocked:**
- Publishing stops immediately
- Error logged
- Metrics recorded (failure)
- User sees clear error message

---

## Index Management

### Two Indexes

**1. Content Index (`contentIndex.json`)**
- Purpose: Fast frontend reads
- Contains: Minimal data for listing (slug, title, description, category)
- Updated: Every publish
- Read by: Frontend pages (`/blog`, `/blog/category/[category]`)

**2. Topic Index (`topicIndex.json`)**
- Purpose: Deduplication and tracking
- Contains: Topic keys, status, content hashes
- Updated: Every publish
- Read by: Publisher (to check duplicates)

### Index Update Process

**Step 1: Acquire Lock**
```
- Create .index.lock file exclusively
- Wait if another process has lock
```

**Step 2: Load Index**
```
- Read contentIndex.json
- If corrupted → Attempt recovery
- Parse JSON
```

**Step 3: Update**
```
- Add new entry (blog post)
- Validate no duplicate slug
- Update lastUpdated timestamp
```

**Step 4: Atomic Write**
```
- Write to temp file
- Verify JSON is valid
- Atomic rename: temp → final
```

**Step 5: Release Lock**
```
- Verify lock ownership
- Delete .index.lock
```

### Index Recovery

**If Index Corrupted:**
```
1. Try to load backup
   - contentIndex.json.backup
   - If valid → Use it
   
2. If backup fails, rebuild from files
   - Scan content/blog/*.json
   - Validate each file
   - Build new index
   - Save to contentIndex.json
   
3. Return recovered index
```

**Recovery is Automatic:**
- Happens on every `loadContentIndex()` call
- Frontend never sees corruption
- System self-heals

---

## Frontend Integration

### Blog Index Page (`/blog`)

**Location:** `app/blog/page.tsx`

**Process:**
```
1. Load content index
   - Reads contentIndex.json ONLY
   - Never reads individual post files
   
2. Filter posts
   - Exclude drafts
   - Exclude noindex
   
3. Sort by publishedAt (newest first)
   
4. Paginate
   - Default: 24 posts per page
   - Uses index entries only
   
5. Render
   - ModernBlogCard components
   - Pagination component
```

**Performance:**
- Reads 1 file (index) regardless of post count
- Scales to thousands of posts
- Fast page load

### Blog Post Page (`/blog/[slug]`)

**Location:** `app/blog/[slug]/page.tsx`

**Process:**
```
1. Generate static params
   - Reads all slugs from index
   - Pre-renders at build time
   
2. Load post
   - Reads content/blog/{slug}.json
   - Validates schema
   - Quarantines if invalid
   
3. Render
   - Markdown body (ReactMarkdown)
   - AppCTA components (top + end)
   - RegulationsBlock component
   - FAQs, sources, related links
```

**Components Added:**
- `<AppCTA position="top">` - After first section
- `<AppCTA position="end">` - At end
- `<RegulationsBlock>` - Safe regulations reminder

### Category Pages (`/blog/category/[category]`)

**Location:** `app/blog/category/[category]/page.tsx`

**Process:**
```
1. Load content index
2. Filter by category
3. Render posts
```

**Performance:** Index-only (no file reads)

---

## Observability & Monitoring

### Metrics System

**Location:** `scripts/pipeline/metrics.ts`

**Tracks:**
- Total attempts, successes, failures
- Failure breakdown:
  - Validation errors
  - Quality gate failures
  - API errors
  - Write errors
  - Index update errors
  - Other errors
- Average publish time
- Recent publishes (last 100)

**Storage:** `content/_system/publish-metrics.json`

**View:** `npm run pipeline:metrics`

**Output:**
```
📊 Publishing Metrics Summary

📈 Overall Stats:
   Total Attempts: 25
   ✅ Successes: 20
   ❌ Failures: 4
   🚫 Quarantined: 1
   📊 Success Rate: 80.0%
   ⏱️  Average Publish Time: 2340ms (2.34s)

❌ Failure Breakdown:
   Validation: 1
   Quality Gate: 2
   API: 0
   Write: 0
   Index Update: 1
   Other: 0

✅ System appears healthy - publishing is working.
```

### Health Check

**Criteria:**
- Healthy: Failures < Successes * 2
- Unhealthy: Failures >= Successes * 2

**Time to Check:** < 5 seconds

---

## Error Handling & Recovery

### Error Types

**1. PublishError**
- Custom error class with code
- Codes: `VALIDATION_ERROR`, `QUALITY_GATE_FAILED`, `DUPLICATE_SLUG`, etc.
- Used for expected failures

**2. System Errors**
- File system errors
- Network errors
- JSON parse errors
- Caught and logged

### Error Logging

**Structured Logging:**
```
[CONTENT_LOAD_ERROR] timestamp - Failed to load content
  slug="how-to-tie-a-fishing-hook"
  filePath="content/blog/how-to-tie-a-fishing-hook.json"
  reason="Invalid JSON - failed to parse"
  error="SyntaxError: Unexpected token..."
```

**All Errors Logged:**
- Content load errors
- Validation errors
- Publish errors
- Index errors

### Recovery Mechanisms

**1. Index Corruption Recovery**
- Automatic backup before updates
- Recovery from backup
- Rebuild from files if backup fails

**2. Stale Lock Recovery**
- Detects locks older than 5 minutes
- Automatically removes stale locks
- Allows system to continue

**3. Quarantine Invalid Content**
- Invalid posts excluded from index
- Don't break frontend
- Logged for debugging

---

## Complete End-to-End Example

### Scenario: Publish "How to Tie a Fishing Hook"

**Step 1: Generate Idea**
```bash
npm run pipeline:batch-publish
```

**Process:**
1. Perplexity discovers: "how to tie a fishing hook"
2. DataForSEO validates: 12,100 searches/month, difficulty 70
3. Opportunity score: 72/100
4. Passes cadence controls

**Step 2: Generate Content**
1. Convert idea to brief
2. LLM generates 1,200-word post
3. Includes CTAs, regulations block, steps
4. Returns `BlogPostDoc`

**Step 3: Validate**
1. Document validation: ✅ Pass
2. Quality gate:
   - CTA in top half: ✅ Found
   - CTA near end: ✅ Found
   - Regulations block: ✅ Found
   - Practical steps: ✅ Found
   - No regulations specifics: ✅ Pass
   - Word count: ✅ 1,200 words
   - Keyword stuffing: ✅ Pass
3. Quality gate: ✅ Pass

**Step 4: Publish**
1. Check duplicate slug: ✅ Not exists
2. Check duplicate topic: ✅ Not exists
3. Write file: `content/blog/how-to-tie-a-fishing-hook.json`
4. Update topic index: ✅ Success
5. Acquire index lock: ✅ Success
6. Update content index: ✅ Success
7. Release lock: ✅ Success
8. Revalidate pages: ✅ Success
9. Record metrics: ✅ Success

**Step 5: Frontend**
1. User visits `/blog`
2. Page reads `contentIndex.json`
3. Sees new post in list
4. Clicks post
5. Page reads `content/blog/how-to-tie-a-fishing-hook.json`
6. Renders with CTAs and regulations block

**Total Time:** ~2-3 seconds

---

## Key Design Decisions

### 1. File-Based (Not Database)

**Why:**
- Simple deployment
- Version control friendly
- Fast reads
- No DB setup required
- Works with Next.js SSG

**Trade-offs:**
- No complex queries
- Manual backup needed
- File system limits

### 2. Index-Only Listing

**Why:**
- `/blog` page reads 1 file (not 1000)
- Fast page loads
- Scales to thousands of posts

**Trade-offs:**
- Index must stay in sync
- Rebuild needed if index corrupted

### 3. Atomic Writes Everywhere

**Why:**
- Prevents corruption
- Safe if process crashes
- No partial state

**Trade-offs:**
- Slightly slower (temp file step)
- More disk I/O

### 4. Strict Quality Gates

**Why:**
- Ensures consistent quality
- Prevents bad content
- Protects brand

**Trade-offs:**
- Some valid content might be blocked
- Requires generator to follow rules

### 5. Locking (Not Single-Threaded)

**Why:**
- Better throughput
- File operations can be parallel
- Only index updates serialized

**Trade-offs:**
- More complex
- Lock timeout needed

---

## System Health Indicators

### Green (Healthy)
- Success rate > 70%
- Average publish time < 5s
- No index corruption
- No stale locks
- Quality gate pass rate > 80%

### Yellow (Warning)
- Success rate 50-70%
- Quality gate pass rate 60-80%
- Some failures in recent publishes

### Red (Unhealthy)
- Success rate < 50%
- Quality gate pass rate < 60%
- Index corruption detected
- Stale locks present

**Check Health:** `npm run pipeline:metrics`

---

## Summary

This is a **production-ready autoblogging system** that:

1. **Discovers** opportunities using AI and keyword research
2. **Generates** high-quality, SEO-optimized content
3. **Validates** content against strict quality gates
4. **Publishes** safely with atomic writes and locking
5. **Indexes** for fast frontend reads
6. **Revalidates** Next.js pages for immediate visibility
7. **Tracks** metrics for observability
8. **Recovers** from errors automatically

**Key Strengths:**
- ✅ Safe (atomic writes, locking, rollback)
- ✅ Fast (index-only reads, pagination)
- ✅ Scalable (handles thousands of posts)
- ✅ Observable (metrics, logging)
- ✅ Self-healing (recovery mechanisms)
- ✅ Quality-focused (strict gates)

**The system is ready for production use.**
