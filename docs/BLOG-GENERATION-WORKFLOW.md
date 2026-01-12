# Blog Generation Workflow & Duplicate Prevention

## Complete Workflow

### Step 1: Ideation (Optional)
- **Perplexity**: Discovers 15 blog topic opportunities
- **DataForSEO**: Validates search volume and difficulty
- **Filtering**: Applies intent, volume, and difficulty filters
- **Ranking**: Sorts by opportunity score (0-100)

### Step 2: Build Content Brief
- Converts `BlogIdea` → `ContentBrief`
- Extracts facts from related questions
- Generates internal link suggestions
- Determines content angle and user intent

### Step 3: Generate Blog Post
- **LLM**: OpenAI GPT-4o generates content
- **Requirements**:
  - Minimum 1000 words
  - 5-8 FAQs
  - Includes "Tackle app" mentions
  - Uses internal links naturally
- **Extras**: Vibe Test, Alternative Recommendations, Structured CTAs

### Step 4: Validation
- Word count check (min 1000)
- H2 sections check (min 3)
- FAQ count check (5-8)
- Internal links check (min 3)
- Forbidden phrases check
- Regulations check (no bag limits, size limits, seasons)
- Sources check
- App CTA check

### Step 5: Quality Gate
- Missing CTA blocks (BLOCKS)
- Regulations specifics (BLOCKS)
- Thin content (BLOCKS)
- Keyword stuffing (WARNING)

### Step 6: Publish
- **Duplicate Check**: `topicKeyExists()` - prevents duplicate topic keys
- **Slug Check**: Checks content index for existing slugs
- **File Check**: Verifies file doesn't already exist
- **Atomic Write**: Temp file → verify → rename
- **Index Update**: Updates content index and topic index atomically
- **Revalidation**: Triggers Next.js ISR

### Step 7: Verification
- File: `content/blog/{slug}.json`
- Index: `content/_system/contentIndex.json`
- Topic Index: `content/_system/topicIndex.json`
- Page: `http://localhost:3000/blog/{slug}`

---

## Duplicate Prevention System

### Multiple Layers of Protection

1. **Generate-Blog Command** (Line 1105)
   ```typescript
   const topicKey = `blog::${idea.slug}`;
   if (await topicKeyExists(topicKey)) {
     logger.warn(`Blog post already exists: ${idea.slug}`);
     process.exit(1);
   }
   ```

2. **Batch-Publish Command** (Line 120-128)
   ```typescript
   const topicKey = `blog::${idea.slug}`;
   if (await topicKeyExists(topicKey)) {
     logger.warn(`Already exists, skipping`);
     continue; // Skip to next idea
   }
   ```

3. **Publisher** (Line 243-304)
   - Checks if file exists
   - Checks if slug in content index
   - Checks if topicKey already published
   - Prevents overwriting finished posts
   - Detects conflicts (different topicKey with same slug)

### Topic Index System

- **Storage**: `content/_system/topicIndex.json`
- **Tracks**: 
  - `topicKey`: Unique identifier (e.g., `blog::best-bass-lures`)
  - `slug`: URL slug (e.g., `best-bass-lures`)
  - `status`: `published` | `pending` | `failed`
  - `contentHash`: SHA-256 hash of content
  - `lastPublishedAt`: Timestamp

### How It Prevents Duplicates

1. **Topic Key Check**: `topicKeyExists()` checks if `blog::{slug}` already exists
2. **Content Hash**: Tracks content hashes to detect near-duplicates
3. **Slug Collision**: `resolveSlugCollision()` handles slug conflicts
4. **Idempotent Publishing**: Re-running same job is safe (won't duplicate)

### Current Published Posts

From `content/_system/contentIndex.json`:
- `best-fishing-rods-florida`
- `best-lures-for-snook-florida`
- `how-to-tie-a-fishing-hook`

These are tracked in the topic index and will be skipped if ideation suggests them again.

---

## Commands

### Generate Single Blog Post
```bash
# Auto-generate idea
npm run pipeline:generate-blog -- --min-volume 100 --min-score 70

# Use specific topic
npm run pipeline:generate-blog -- --slug "best-fishing-spots" --title "Best Fishing Spots" --keyword "best fishing spots" --category fishing-tips
```

### Batch Publish
```bash
npm run pipeline:batch-publish -- --max-posts 5 --min-score 70 --min-volume 100
```

### Test Ideation
```bash
npm run pipeline:test-ideation -- --max-ideas 10 --min-volume 50
```

---

## Notes

- **Ideation doesn't filter existing topics** (by design - allows for topic variations)
- **Duplicate prevention happens at generation/publish stage** (multiple checks)
- **Topic index is the source of truth** for what's been published
- **Content index is for frontend** (listing pages, not duplicate prevention)
