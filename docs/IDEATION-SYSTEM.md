# Ideation System - Traffic Engine (Locked)

## Overview

The ideation system is a **separate upstream system** that serves as the traffic engine for blog content. Its role is **locked** and must not change.

**ONE JOB ONLY:** Discover, validate, and rank blog opportunities.

---

## What the Ideation System DOES

### ✅ Discover Low-Competition Queries
- Search for informational fishing queries
- Target 200-500 monthly search volume (sweet spot)
- Filter by keyword difficulty (prefer < 50)
- Focus on long-tail keywords

### ✅ Validate Search Volume & Difficulty
- Use DataForSEO API for accurate metrics
- Check search intent (must be informational)
- Verify keyword difficulty is realistic
- Analyze SERP competition

### ✅ Output Ranked Blog Opportunities
- Generate list of validated blog ideas
- Rank by opportunity score (volume / difficulty)
- Include primary keyword, search volume, difficulty
- Provide related keywords and questions

---

## What the Ideation System DOES NOT DO

### ❌ Generate Content
- Does NOT write blog posts
- Does NOT create outlines
- Does NOT generate body text
- **Reason:** Content generation is a separate system

### ❌ Decide Formatting
- Does NOT choose headings structure
- Does NOT design page layout
- Does NOT determine visual elements
- **Reason:** Formatting is handled by generators

### ❌ Handle Publishing
- Does NOT write JSON files
- Does NOT update blog index
- Does NOT trigger deployments
- **Reason:** Publishing is a separate system

---

## System Boundaries

```
┌─────────────────────────────────────────────────────────────┐
│                    IDEATION SYSTEM                          │
│                  (Upstream - Locked Role)                   │
│                                                             │
│  Input:  Niche, location, filters                          │
│  ↓                                                          │
│  Process:                                                   │
│    1. Query DataForSEO for keywords                         │
│    2. Filter by volume (200-500/month)                      │
│    3. Filter by difficulty (< 50)                           │
│    4. Filter by intent (informational only)                 │
│    5. Rank by opportunity score                             │
│  ↓                                                          │
│  Output: Ranked list of blog opportunities                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
                  (Handoff: Blog Ideas)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   GENERATION SYSTEM                         │
│                  (Downstream - Separate)                    │
│                                                             │
│  Input:  Blog opportunity from ideation                     │
│  ↓                                                          │
│  Process:                                                   │
│    1. Build content brief                                   │
│    2. Research facts and sources                            │
│    3. Generate blog post content                            │
│    4. Format as JSON                                        │
│  ↓                                                          │
│  Output: Draft blog post (JSON)                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
                  (Handoff: Draft Content)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   VALIDATION SYSTEM                         │
│                  (Quality Gate - Separate)                  │
│                                                             │
│  Input:  Draft blog post                                    │
│  ↓                                                          │
│  Process:                                                   │
│    1. Validate against content rules                        │
│    2. Check for regulation violations                       │
│    3. Verify app CTA present                                │
│    4. Score quality (0-100)                                 │
│  ↓                                                          │
│  Output: Pass/Fail + Validation Report                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
                  (Handoff: Validated Content)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   PUBLISHING SYSTEM                         │
│                  (Downstream - Separate)                    │
│                                                             │
│  Input:  Validated blog post                                │
│  ↓                                                          │
│  Process:                                                   │
│    1. Write JSON file to content/blog/                      │
│    2. Update blog index                                     │
│    3. Trigger revalidation                                  │
│  ↓                                                          │
│  Output: Published blog post (live)                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Ideation Output Format

The ideation system outputs a **ranked list of blog opportunities**:

```typescript
interface BlogOpportunity {
  // SEO Data (from DataForSEO)
  keyword: string;              // Primary keyword
  searchVolume: number;         // Monthly search volume
  keywordDifficulty: number;    // 0-100
  intent: 'informational';      // Always informational

  // Ranking
  opportunityScore: number;     // volume / difficulty * 10
  rank: number;                 // Position in ranked list

  // Additional Data
  relatedKeywords: string[];    // Secondary keywords
  relatedQuestions: string[];   // People Also Ask questions

  // Meta (for tracking)
  discoveredAt: string;         // ISO 8601 timestamp
  source: 'dataforseo' | 'perplexity' | 'manual';
}

interface IdeationOutput {
  niche: string;                // e.g., "fishing"
  location?: string;            // e.g., "florida" (optional)
  filters: {
    minVolume: number;          // e.g., 200
    maxVolume: number;          // e.g., 500
    maxDifficulty: number;      // e.g., 50
    intent: 'informational';
  };
  opportunities: BlogOpportunity[];  // Ranked list
  totalFound: number;           // Total keywords discovered
  totalValidated: number;       // After filtering
  generatedAt: string;          // ISO 8601 timestamp
}
```

### Example Output

```json
{
  "niche": "fishing",
  "location": "florida",
  "filters": {
    "minVolume": 200,
    "maxVolume": 500,
    "maxDifficulty": 50,
    "intent": "informational"
  },
  "opportunities": [
    {
      "keyword": "best lures for snook florida",
      "searchVolume": 480,
      "keywordDifficulty": 35,
      "intent": "informational",
      "opportunityScore": 13.7,
      "rank": 1,
      "relatedKeywords": [
        "snook fishing lures",
        "florida snook lures",
        "best snook bait florida"
      ],
      "relatedQuestions": [
        "What is the best lure for snook in Florida?",
        "What color lures work best for snook?",
        "When is the best time to fish for snook?"
      ],
      "discoveredAt": "2026-01-09T12:00:00Z",
      "source": "dataforseo"
    },
    {
      "keyword": "how to catch redfish in florida",
      "searchVolume": 420,
      "keywordDifficulty": 42,
      "intent": "informational",
      "opportunityScore": 10.0,
      "rank": 2,
      "relatedKeywords": [
        "redfish fishing tips",
        "florida redfish",
        "sight fishing redfish"
      ],
      "relatedQuestions": [
        "What is the best bait for redfish?",
        "Where can I catch redfish in Florida?",
        "How do you sight fish for redfish?"
      ],
      "discoveredAt": "2026-01-09T12:00:00Z",
      "source": "dataforseo"
    }
  ],
  "totalFound": 150,
  "totalValidated": 42,
  "generatedAt": "2026-01-09T12:00:00Z"
}
```

---

## Workflow: End-to-End

### Step 1: Ideation (Upstream)
```bash
# Run ideation to discover blog opportunities
npm run pipeline test-ideation --category fishing-tips --location florida

# Output: Ranked list of 20+ blog opportunities
# Saved to: ideation-output.json
```

**Ideation System:**
- ✅ Discovers keywords
- ✅ Validates search volume
- ✅ Ranks opportunities
- ❌ Does NOT generate content

### Step 2: Selection (Manual or Automated)
```typescript
// Select top opportunities from ideation output
const topOpportunities = ideationOutput.opportunities.slice(0, 10);

// Queue for generation
for (const opportunity of topOpportunities) {
  await addJob({
    type: 'blog',
    topicKey: `blog::${slugify(opportunity.keyword)}`,
    priority: calculatePriority(opportunity.opportunityScore),
    metadata: {
      primaryKeyword: opportunity.keyword,
      searchVolume: opportunity.searchVolume,
      difficulty: opportunity.keywordDifficulty,
      relatedKeywords: opportunity.relatedKeywords,
      relatedQuestions: opportunity.relatedQuestions,
    },
  });
}
```

### Step 3: Generation (Downstream)
```bash
# Process queued jobs (generation)
npm run pipeline run --limit 10

# Generation System:
# 1. Takes blog opportunity
# 2. Builds content brief
# 3. Generates blog post
# 4. Outputs JSON file
```

**Generation System:**
- ✅ Receives blog opportunity
- ✅ Generates content
- ✅ Formats as JSON
- ❌ Does NOT do ideation

### Step 4: Validation (Quality Gate)
```typescript
// Validation runs automatically in pipeline
const validation = validateDoc(doc);

if (!validation.passed) {
  throw new Error('Validation failed - blocking publication');
}
```

**Validation System:**
- ✅ Validates content quality
- ✅ Checks for violations
- ✅ Blocks bad content
- ❌ Does NOT generate content

### Step 5: Publishing (Downstream)
```typescript
// Publishing runs automatically after validation
await publishDoc(doc);

// Publishing System:
// 1. Writes JSON file
// 2. Updates blog index
// 3. Triggers revalidation
```

**Publishing System:**
- ✅ Publishes validated content
- ✅ Updates index
- ✅ Triggers revalidation
- ❌ Does NOT generate content

---

## Separation of Concerns

### Why These Systems Must Stay Separate

**1. Single Responsibility Principle**
- Each system has ONE job
- Easier to maintain and debug
- Changes don't cascade

**2. Scalability**
- Ideation can run independently (discover 1000 opportunities)
- Generation can process queue at its own pace
- Systems scale independently

**3. Quality Control**
- Validation gates between systems
- Bad ideas don't become bad content
- Failed content doesn't get published

**4. Flexibility**
- Can swap DataForSEO for different tool
- Can change generation prompts
- Can update validation rules
- Systems don't affect each other

---

## Commands by System

### Ideation System (Upstream)
```bash
# Discover blog opportunities
npm run pipeline test-ideation \
  --category fishing-tips \
  --location florida \
  --count 20

# Discover programmatic concepts
npm run pipeline discover-concepts \
  --niche fishing \
  --count 15 \
  --validate

# Discover micro-tools
npm run pipeline discover-tools \
  --count 10 \
  --validate

# Generate matrix combinations
npm run pipeline generate-matrix \
  --patterns "Best {lure} for {species}" \
  --validate \
  --max-combinations 500
```

### Generation System (Downstream)
```bash
# Generate single blog post from opportunity
npm run pipeline publish \
  --topicKey "blog::best-lures-for-snook-florida"

# Process queue (generation + validation + publishing)
npm run pipeline run --limit 10

# Seed queue with opportunities
npm run pipeline seed \
  --type blog \
  --count 50
```

### Validation System (Quality Gate)
```bash
# Validation runs automatically in pipeline
# But can be tested standalone:
npm run test:validation
```

### Publishing System (Downstream)
```bash
# Publishing happens automatically after validation
# But can force publish:
npm run pipeline publish \
  --topicKey "blog::your-slug" \
  --force
```

---

## Ideation System Implementation

### Current Implementation

**File:** `scripts/pipeline/ideation.ts`

**Function:** `generateBlogIdeas()`

**Input:**
```typescript
{
  category: 'fishing-tips',
  location?: 'florida',
  maxIdeas: 10,
  minSearchVolume: 200,
  maxDifficulty: 50
}
```

**Output:**
```typescript
BlogOpportunity[] // Ranked list
```

**Process:**
1. Query DataForSEO keywords API
2. Filter by search volume (200-500)
3. Filter by keyword difficulty (< 50)
4. Filter by search intent (informational only)
5. Rank by opportunity score (volume / difficulty)
6. Return ranked list

**Does NOT:**
- ❌ Generate blog content
- ❌ Create outlines
- ❌ Write JSON files
- ❌ Publish anything

---

## Integration Points (Handoffs Only)

### Handoff 1: Ideation → Selection
```typescript
// Ideation outputs opportunities
const opportunities: BlogOpportunity[] = await generateBlogIdeas({...});

// Selection (can be manual or automated)
const selected = opportunities.slice(0, 10); // Top 10

// Handoff to generation system
for (const opp of selected) {
  await queueForGeneration(opp);
}
```

### Handoff 2: Selection → Generation
```typescript
// Queue opportunity for generation
await addJob({
  type: 'blog',
  topicKey: `blog::${slugify(opportunity.keyword)}`,
  metadata: {
    keyword: opportunity.keyword,
    volume: opportunity.searchVolume,
    difficulty: opportunity.keywordDifficulty,
  },
});

// Generation system picks up job
const job = await getNextJob();
await generateBlogPost(job);
```

### Handoff 3: Generation → Validation
```typescript
// Generator outputs draft
const draft = await generateBlogPost(brief);

// Validation system checks draft
const validation = validateDoc(draft);

// Pass/fail decision
if (validation.passed) {
  // Handoff to publishing
  await publishDoc(draft);
} else {
  // Block publication
  throw new Error('Validation failed');
}
```

### Handoff 4: Validation → Publishing
```typescript
// Validated content ready for publishing
const validatedPost = draft;

// Publishing system writes files
await publishDoc(validatedPost);

// Updates index
await updateBlogIndex(validatedPost);

// Done
```

---

## Rules for Adding Features

### Can Add to Ideation System:
- ✅ New keyword sources (Ahrefs, SEMrush, etc.)
- ✅ Better ranking algorithms
- ✅ More sophisticated filters
- ✅ Additional validation metrics
- ✅ Trend detection

### Cannot Add to Ideation System:
- ❌ Content generation
- ❌ Outline creation
- ❌ JSON formatting
- ❌ Publishing logic
- ❌ Validation rules

### If You Need To:
**Generate outlines** → Add to generation system
**Format content** → Add to generation system
**Validate quality** → Add to validation system
**Publish content** → Add to publishing system

**Never blur the boundaries between systems.**

---

## Testing Ideation System

### Test Command
```bash
# Test ideation with real DataForSEO API
npm run pipeline test-ideation \
  --category fishing-tips \
  --location florida \
  --count 10 \
  --min-volume 200 \
  --max-difficulty 50
```

### Expected Output
```
✅ DataForSEO connection test passed!

🎯 Discovered 10 Blog Opportunities:

1. best lures for snook florida
   Volume: 480/month | Difficulty: 35 | Score: 13.7

2. how to catch redfish in florida
   Volume: 420/month | Difficulty: 42 | Score: 10.0

[... 8 more opportunities ...]

✅ Ideation complete!
Total Discovered: 150 keywords
Total Validated: 42 opportunities
Top 10 Ranked by Opportunity Score
```

### What to Verify
- ✅ Connects to DataForSEO
- ✅ Returns ranked opportunities
- ✅ Filters by volume/difficulty
- ✅ Includes related keywords/questions
- ❌ Does NOT generate content
- ❌ Does NOT write files
- ❌ Does NOT publish anything

---

## Documentation Structure

```
IDEATION-SYSTEM.md          ← You are here
  ↓
  Defines: What ideation DOES and DOES NOT do
  Outputs: Ranked blog opportunities only

CONTENT-VALIDATION-RULES.md
  ↓
  Defines: What makes valid content
  Used by: Validation system (downstream)

scripts/pipeline/ideation.ts
  ↓
  Implements: Ideation system
  Outputs: BlogOpportunity[]

scripts/pipeline/generators/blog.ts
  ↓
  Implements: Generation system (downstream)
  Takes: BlogOpportunity
  Outputs: BlogPost (JSON)

lib/editorial/content-validator.ts
  ↓
  Implements: Validation system (quality gate)
  Takes: BlogPost
  Outputs: Pass/Fail

scripts/pipeline/publisher.ts
  ↓
  Implements: Publishing system (final step)
  Takes: Validated BlogPost
  Outputs: Published content
```

---

## Summary

### Ideation System Role (LOCKED)

**ONE JOB:**
> Discover low-competition, high-intent informational queries,
> validate search volume and difficulty,
> output ranked blog opportunities.

**THREE THINGS IT DOES:**
1. ✅ Discover queries
2. ✅ Validate metrics
3. ✅ Rank opportunities

**THREE THINGS IT DOES NOT DO:**
1. ❌ Generate content
2. ❌ Decide formatting
3. ❌ Handle publishing

**WHY THIS MATTERS:**
- Clear separation of concerns
- Each system has one job
- Scalable and maintainable
- Easy to debug and improve

**NEVER MIX:**
- Ideation with generation
- Discovery with content creation
- Ranking with formatting

Keep the ideation system **upstream** and **separate**. It is the traffic engine that feeds the content pipeline, nothing more.

---

## Quick Reference

| System | Input | Output | Responsibility |
|--------|-------|--------|----------------|
| **Ideation** | Niche, filters | Ranked blog opportunities | Discover & validate queries |
| **Generation** | Blog opportunity | Draft blog post (JSON) | Create content |
| **Validation** | Draft post | Pass/Fail + report | Enforce quality rules |
| **Publishing** | Validated post | Live blog post | Write files, update index |

**Handoffs:** Ideation → Selection → Generation → Validation → Publishing

**Boundaries:** NEVER allow one system to do another's job.
