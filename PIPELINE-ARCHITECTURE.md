# Pipeline Architecture - Separation of Concerns

## Overview

The content pipeline consists of **4 independent systems** with clear boundaries:

1. **Ideation System** (Upstream) - Traffic engine
2. **Generation System** (Downstream) - Content creator
3. **Validation System** (Quality Gate) - Content validator
4. **Publishing System** (Downstream) - Content publisher

Each system has **one responsibility** and **cannot** do another system's job.

### Critical Handoff Point: Content Brief

Between ideation and generation, there is a **Content Brief** layer that transforms raw blog opportunities into structured content specifications. This brief defines:

- Target keyword and secondary keywords
- Location or species focus
- User intent (informational, navigational, transactional)
- Content angle (beginner, seasonal, gear-focused, etc.)
- Outline, facts, sources, and internal links
- Required sections and guardrails

**Why this matters:**
- Generator stays focused (no guessing at angle or scope)
- Content stays consistent (same brief structure for all posts)
- Easy to debug or re-run (brief is saved with each generation)

See **CONTENT-BRIEF.md** for full documentation.

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                      IDEATION SYSTEM                           │
│                   (Upstream - Locked Role)                     │
│                                                                │
│  Responsibility: Discover & Rank Blog Opportunities            │
│                                                                │
│  Input:                                                        │
│    • Niche (fishing)                                           │
│    • Location (optional: florida, texas)                       │
│    • Filters (volume, difficulty, intent)                      │
│                                                                │
│  Process:                                                      │
│    1. Query DataForSEO for keyword data                        │
│    2. Filter by volume (200-500/month)                         │
│    3. Filter by difficulty (< 50)                              │
│    4. Filter by intent (informational only)                    │
│    5. Calculate opportunity scores                             │
│    6. Rank by score (volume / difficulty)                      │
│                                                                │
│  Output:                                                       │
│    • BlogIdea[] - Ranked list of opportunities                 │
│    • keyword, searchVolume, difficulty, score                  │
│                                                                │
│  Does NOT:                                                     │
│    ❌ Generate content                                         │
│    ❌ Decide formatting                                        │
│    ❌ Handle publishing                                        │
│                                                                │
│  File: scripts/pipeline/ideation.ts                            │
│  Docs: IDEATION-SYSTEM.md                                      │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                             ↓
                 (Handoff: Blog Opportunities)
                             ↓
┌────────────────────────────────────────────────────────────────┐
│                    CONTENT BRIEF BUILDER                       │
│                  (Handoff Layer - Critical)                    │
│                                                                │
│  Responsibility: Transform Opportunities → Structured Specs    │
│                                                                │
│  Input:                                                        │
│    • BlogIdea from ideation                                    │
│    • keyword, volume, difficulty                               │
│                                                                │
│  Process:                                                      │
│    1. Extract location & species focus                         │
│    2. Determine user intent & content angle                    │
│    3. Build structured outline                                 │
│    4. Select key facts & sources                               │
│    5. Choose internal links                                    │
│    6. Apply guardrails & requirements                          │
│                                                                │
│  Output:                                                       │
│    • ContentBrief (complete specification)                     │
│    • Includes: focus, angle, intent, outline, facts           │
│                                                                │
│  File: scripts/pipeline/briefBuilder.ts                        │
│  Docs: CONTENT-BRIEF.md                                        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                             ↓
                  (Handoff: Content Brief)
                             ↓
┌────────────────────────────────────────────────────────────────┐
│                    GENERATION SYSTEM                           │
│                     (Downstream)                               │
│                                                                │
│  Responsibility: Generate Blog Content                         │
│                                                                │
│  Input:                                                        │
│    • ContentBrief from brief builder                           │
│    • Complete specification with all context                   │
│                                                                │
│  Process:                                                      │
│    1. Receive ContentBrief with:                               │
│       - Target keywords & focus                                │
│       - User intent & content angle                            │
│       - Structured outline                                     │
│       - Key facts & sources                                    │
│       - Internal links & guardrails                            │
│    2. Generate blog post content (OpenAI)                      │
│       - Follow outline structure                               │
│       - Include key facts naturally                            │
│       - Add FAQs, sources, headings                            │
│    3. Format as JSON (BlogPost)                                │
│                                                                │
│  Output:                                                       │
│    • BlogPost (JSON) - Draft content                           │
│    • All fields populated per schema                           │
│                                                                │
│  Does NOT:                                                     │
│    ❌ Discover keywords                                        │
│    ❌ Validate content quality                                 │
│    ❌ Publish content                                          │
│                                                                │
│  File: scripts/pipeline/generators/blog.ts                     │
│  Docs: content/_system/SCHEMA.md                               │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                             ↓
                  (Handoff: Draft Content)
                             ↓
┌────────────────────────────────────────────────────────────────┐
│                   VALIDATION SYSTEM                            │
│                    (Quality Gate)                              │
│                                                                │
│  Responsibility: Enforce Content Rules                         │
│                                                                │
│  Input:                                                        │
│    • BlogPost (JSON) from generation system                    │
│                                                                │
│  Process:                                                      │
│    1. Check informational search intent                        │
│    2. Verify species/location specificity                      │
│    3. Validate actionable fishing advice                       │
│    4. Require app CTA with value prop                          │
│    5. BLOCK specific regulations (CRITICAL)                    │
│       ❌ No bag limits                                         │
│       ❌ No size limits                                        │
│       ❌ No closed seasons                                     │
│    6. Check for evergreen content                              │
│    7. Calculate quality score (0-100)                          │
│                                                                │
│  Output:                                                       │
│    • ValidationResult                                          │
│      - passed: boolean                                         │
│      - errors: string[]                                        │
│      - warnings: string[]                                      │
│      - score: number                                           │
│                                                                │
│  Decision:                                                     │
│    • If passed: Handoff to publishing                          │
│    • If failed: BLOCK publication, log errors                  │
│                                                                │
│  Does NOT:                                                     │
│    ❌ Generate content                                         │
│    ❌ Discover keywords                                        │
│    ❌ Publish content                                          │
│                                                                │
│  Files:                                                        │
│    • lib/editorial/content-validator.ts                        │
│    • scripts/pipeline/validator.ts                             │
│  Docs: CONTENT-VALIDATION-RULES.md                             │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                             ↓
                (Handoff: Validated Content)
                             ↓
┌────────────────────────────────────────────────────────────────┐
│                   PUBLISHING SYSTEM                            │
│                     (Downstream)                               │
│                                                                │
│  Responsibility: Publish Validated Content                     │
│                                                                │
│  Input:                                                        │
│    • BlogPost (JSON) - Validated and approved                  │
│                                                                │
│  Process:                                                      │
│    1. Write JSON file to content/blog/{slug}.json              │
│    2. Update content/_system/blogIndex.json                    │
│       - Add entry with slug, title, category                   │
│       - Increment totalPosts count                             │
│    3. Trigger Next.js revalidation                             │
│       - Revalidate /blog                                       │
│       - Revalidate /blog/{slug}                                │
│       - Revalidate /blog/category/{category}                   │
│    4. Log publication success                                  │
│                                                                │
│  Output:                                                       │
│    • Published blog post (live on website)                     │
│    • Updated blog index                                        │
│    • Revalidated pages                                         │
│                                                                │
│  Does NOT:                                                     │
│    ❌ Generate content                                         │
│    ❌ Validate content                                         │
│    ❌ Discover keywords                                        │
│                                                                │
│  File: scripts/pipeline/publisher.ts                           │
│  Docs: content/README.md                                       │
│                                                                │
└────────────────────────────────────────────────────────────────┘
                             ↓
                   (Result: Live Blog Post)
```

---

## Workflow: End-to-End

### 1. Ideation Phase (Upstream)
```bash
# Discover blog opportunities
npm run pipeline test-ideation \
  --category fishing-tips \
  --location florida \
  --count 20 \
  --min-volume 200 \
  --max-difficulty 50
```

**Output:** Ranked list of 20 blog opportunities

**File Created:** None (output to console or saved manually)

**Next Step:** Select top opportunities for generation

---

### 2. Selection Phase (Manual or Automated)
```typescript
// Option A: Manual selection
const topOpportunities = ideationOutput.opportunities.slice(0, 10);

// Option B: Automated queue
for (const opportunity of topOpportunities) {
  await addJob({
    type: 'blog',
    topicKey: `blog::${slugify(opportunity.keyword)}`,
    priority: calculatePriority(opportunity.opportunityScore),
    metadata: opportunity,
  });
}
```

**Output:** Jobs queued for generation

**File Created:** `content/_system/jobQueue.json` (updated)

**Next Step:** Process generation queue

---

### 3. Generation Phase (Downstream)
```bash
# Process queued jobs
npm run pipeline run --limit 10
```

**Process:**
1. Fetch next job from queue
2. Build content brief from blog opportunity
3. Research facts from sources
4. Generate blog post content
5. Format as JSON

**Output:** Draft blog post (JSON)

**File Created:** None yet (validation first)

**Next Step:** Automatic validation

---

### 4. Validation Phase (Quality Gate)
```typescript
// Runs automatically in pipeline
const validation = validateDoc(doc);

if (!validation.passed) {
  throw new Error('Validation failed - blocking publication');
}
```

**Checks:**
- ✅ Informational intent
- ✅ Species/location specificity
- ✅ Actionable advice
- ✅ App CTA present
- ❌ NO specific regulations (CRITICAL)
- ✅ Evergreen content

**Output:** Pass/Fail + validation report

**Decision:**
- If **passed**: Continue to publishing
- If **failed**: BLOCK publication, log errors

**Next Step:** Publishing (if passed)

---

### 5. Publishing Phase (Downstream)
```typescript
// Runs automatically after validation passes
await publishDoc(validatedPost);
```

**Process:**
1. Write `content/blog/{slug}.json`
2. Update `content/_system/blogIndex.json`
3. Trigger Next.js revalidation

**Output:** Published blog post (live)

**Files Created:**
- `content/blog/{slug}.json`
- `content/_system/blogIndex.json` (updated)

**Result:** Blog post live on website

---

## Handoff Points

### Handoff 1: Ideation → Brief Builder
```typescript
// Ideation outputs opportunities
interface BlogIdea {
  keyword: string;
  searchVolume: number;
  keywordDifficulty: number;
  opportunityScore: number;
  relatedKeywords: string[];
  relatedQuestions: string[];
}

// Brief builder transforms opportunity into structured brief
const opportunity = ideationOutput.opportunities[0];
const brief = await buildBrief({
  pageType: 'blog',
  topicKey: `blog::${slugify(opportunity.keyword)}`,
  slug: slugify(opportunity.keyword),
  title: generateTitle(opportunity.keyword),
  primaryKeyword: opportunity.keyword,
  secondaryKeywords: opportunity.relatedKeywords,
  facts: [], // Research facts
  sources: [], // Sources
});
```

### Handoff 2: Brief Builder → Generation
```typescript
// Brief builder outputs complete content specification
interface ContentBrief {
  pageType: 'blog';
  slug: string;
  title: string;
  primaryKeyword: string;
  secondaryKeywords: string[];

  // Focus & Strategy (NEW in Step 6)
  locationFocus?: string;      // e.g., "Florida"
  speciesFocus?: string;        // e.g., "Snook"
  userIntent: 'informational';  // Search intent
  angle: 'gear-focused';        // Content angle

  // Structure
  outline: OutlineItem[];
  keyFacts: Fact[];
  sources: Source[];
  internalLinksToInclude: {...};

  // Guardrails
  disclaimers: string[];
  minWordCount: number;
  requiredSections: string[];
}

// Generator receives complete specification
const draft = await generateBlogPost(brief);
```

### Handoff 3: Selection → Generation (Legacy - Deprecated)
```typescript
// Queue job with metadata
await addJob({
  type: 'blog',
  topicKey: `blog::${slug}`,
  metadata: {
    keyword: opportunity.keyword,
    volume: opportunity.searchVolume,
    difficulty: opportunity.keywordDifficulty,
    relatedKeywords: opportunity.relatedKeywords,
    relatedQuestions: opportunity.relatedQuestions,
  },
});

// Generator receives job
const job = await getNextJob();
const draft = await generateBlogPost(job);
```

### Handoff 4: Generation → Validation
```typescript
// Generator outputs draft
const draft: BlogPost = await generateBlogPost(brief);

// Validator checks draft
const validation = validateDoc(draft);

// Decision point
if (validation.passed) {
  // Continue to publishing
} else {
  // Block and report errors
  throw new Error(validation.errors.join('\n'));
}
```

### Handoff 5: Validation → Publishing
```typescript
// Validated content ready
const validatedPost: BlogPost = draft;

// Publisher writes files
await publishDoc(validatedPost);

// Result: Live blog post
```

---

## File Structure

```
scripts/pipeline/
├── ideation.ts              ← Ideation System (upstream)
├── generators/
│   └── blog.ts              ← Generation System (downstream)
├── validator.ts             ← Validation System (quality gate)
└── publisher.ts             ← Publishing System (downstream)

lib/editorial/
└── content-validator.ts     ← Validation logic (quality gate)

content/
├── blog/
│   └── {slug}.json          ← Published blog posts
└── _system/
    ├── blogIndex.json       ← Central registry
    └── jobQueue.json        ← Generation queue
```

---

## System Boundaries (Locked)

| System | Can Do | Cannot Do |
|--------|--------|-----------|
| **Ideation** | Discover queries, Validate metrics, Rank opportunities | Generate content, Build briefs, Decide formatting, Publish |
| **Brief Builder** | Extract focus/angle, Build outline, Select facts/links, Apply guardrails | Discover keywords, Generate content, Validate, Publish |
| **Generation** | Receive brief, Generate content, Format JSON | Discover keywords, Build briefs, Validate quality, Publish |
| **Validation** | Check rules, Block violations, Score quality | Discover keywords, Build briefs, Generate content, Publish |
| **Publishing** | Write files, Update index, Trigger revalidation | Discover keywords, Build briefs, Generate content, Validate quality |

**NEVER mix responsibilities between systems.**

**NEW in Step 6:** Brief Builder sits between Ideation and Generation as the critical handoff layer. It transforms raw blog opportunities (BlogIdea) into structured content specifications (ContentBrief).

---

## Commands by System

### Ideation Commands
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

# Generate matrix combinations
npm run pipeline generate-matrix \
  --patterns "Best {lure} for {species}" \
  --validate
```

### Generation Commands
```bash
# Generate single blog post
npm run pipeline publish \
  --topicKey "blog::best-lures-for-snook-florida"

# Process generation queue
npm run pipeline run --limit 10

# Seed queue
npm run pipeline seed --type blog --count 50
```

### Validation Commands
```bash
# Validation runs automatically
# Test standalone:
npm run test:validation
```

### Publishing Commands
```bash
# Publishing runs automatically
# Force publish:
npm run pipeline publish --topicKey "blog::slug" --force
```

---

## Why Separation Matters

### 1. Single Responsibility
Each system has **one job** only:
- Ideation: Discover opportunities
- Generation: Create content
- Validation: Enforce rules
- Publishing: Publish content

### 2. Scalability
Systems scale independently:
- Run ideation once, generate 1000 opportunities
- Process generation queue at any pace
- Validation gates bad content automatically
- Publishing happens only when ready

### 3. Maintainability
Changes don't cascade:
- Swap DataForSEO for Ahrefs → Only update ideation
- Change generation prompts → Only update generation
- Add validation rules → Only update validation
- Change publishing format → Only update publishing

### 4. Quality Control
Multiple gates prevent bad content:
- Ideation filters low-quality keywords
- Generation creates quality content
- Validation enforces strict rules
- Publishing only approved content

---

## Testing Each System

### Test Ideation
```bash
npm run pipeline test-ideation --category fishing-tips --count 10
```

**Verify:**
- ✅ Returns ranked opportunities
- ✅ Filters by volume/difficulty
- ❌ Does NOT generate content
- ❌ Does NOT write files

### Test Generation
```bash
npm run pipeline publish --topicKey "blog::test-slug"
```

**Verify:**
- ✅ Generates blog post content
- ✅ Formats as JSON
- ❌ Does NOT discover keywords
- ❌ Validation blocks bad content

### Test Validation
```typescript
const result = validateBlogPost(post);
console.log(result.passed); // true/false
console.log(result.errors); // []
```

**Verify:**
- ✅ Catches regulation violations
- ✅ Requires app CTA
- ✅ Blocks bad content
- ❌ Does NOT generate content

### Test Publishing
```bash
npm run pipeline publish --topicKey "blog::slug" --force
```

**Verify:**
- ✅ Writes JSON file
- ✅ Updates blog index
- ✅ Triggers revalidation
- ❌ Does NOT validate (assumes valid)

---

## Quick Reference

| Phase | System | Input | Output | File |
|-------|--------|-------|--------|------|
| 1. Discovery | Ideation | Niche + filters | Ranked opportunities | `ideation.ts` |
| 2. Brief Building | Brief Builder | Blog opportunities | Content briefs | `briefBuilder.ts` |
| 3. Selection | Manual/Auto | Content briefs | Queued jobs | `scheduler.ts` |
| 4. Creation | Generation | Content brief | Draft content | `blog.ts` |
| 5. Quality Check | Validation | Draft content | Pass/Fail | `validator.ts` |
| 6. Publishing | Publishing | Valid content | Live post | `publisher.ts` |

**Boundaries:** LOCKED - Do not mix system responsibilities

**NEW in Step 6:** Brief Builder (Phase 2) transforms opportunities into structured content specifications with focus, angle, intent, and guardrails.

**Documentation:**
- `IDEATION-SYSTEM.md` - Ideation boundaries
- `CONTENT-BRIEF.md` - Content brief layer (NEW)
- `CONTENT-VALIDATION-RULES.md` - Validation rules
- `content/README.md` - Content system
- `PIPELINE-ARCHITECTURE.md` - This file
