# Combined Workflow Status

## Current Implementation Status

### ✅ **FULLY IMPLEMENTED** - Combined Workflow

The system is now set up according to the **Combined Workflow** you described:

1. **Step 1: Use Perplexity to brainstorm entities** ✅
   - ✅ New module: `scripts/pipeline/entity-discovery.ts`
   - ✅ Uses Perplexity to brainstorm 20 species and 20 gear types
   - ✅ Command: `npm run pipeline:discover-entities -- --species-count 20 --gear-count 20`

2. **Step 2: Use DataForSEO to validate combinations** ✅
   - ✅ Generates ~4,000 combinations from entities (20 × 20 = 400 base, × patterns)
   - ✅ Validates with DataForSEO to find search volume (targeting 200-500/month per keyword)
   - ✅ Filters for informational intent only
   - ✅ Command: `npm run pipeline:generate-matrix -- --use-perplexity --validate`

3. **Step 3: Consolidate into PRD** ✅
   - ✅ Consolidates all discovery data into `MASTER_PIPELINE_PRD.md`
   - ✅ Provides "super structured path" for content generation
   - ✅ Command: `npm run pipeline:generate-prd -- --run-discovery`

---

## How It Works

### The Combined Workflow

**Perplexity → DataForSEO → PRD**

#### Step 1: Perplexity Brainstorms Entities (The "Vibe")

```bash
npm run pipeline:discover-entities -- --species-count 20 --gear-count 20
```

**What it does:**
- Uses Perplexity to brainstorm 20 fish species
- Uses Perplexity to brainstorm 20 gear/lure types
- Returns entities based on SEO value and search potential

**Output:**
- 20 species (e.g., Redfish, Snook, Tarpon, etc.)
- 20 gear types (e.g., Topwater Lures, Soft Plastics, Jigs, etc.)
- **Total potential combinations: 400 (20 × 20)**

#### Step 2: DataForSEO Validates Combinations (The Hard Data)

```bash
npm run pipeline:generate-matrix -- --use-perplexity --validate --max-combinations 400 --min-volume 200 --max-volume 500
```

**What it does:**
- Takes entities from Step 1
- Generates combinations following patterns:
  - "Best {lure} for {species}"
  - "How to catch {species} with {lure}"
  - "Best {lure} for {species} in {location}"
- Validates each combination with DataForSEO:
  - Checks search volume (targeting 200-500/month per keyword)
  - Checks keyword difficulty
  - Filters for informational intent only
  - Gets related questions for FAQ sections

**Output:**
- Validated combinations with search volume data
- Total aggregate volume calculation
- **Goal: 800k-2M searches/month total**

#### Step 3: Consolidate into PRD (The Super Structured Path)

```bash
npm run pipeline:generate-prd -- --run-discovery
```

**What it does:**
- Runs Steps 1 & 2 automatically
- Consolidates all data into `MASTER_PIPELINE_PRD.md`:
  - Discovered entities from Perplexity
  - Validated combinations with DataForSEO metrics
  - Total search volume calculations
  - Opportunity scores
  - Recommended patterns

**Output:**
- Comprehensive PRD document
- Structured strategy for building pages
- Data-backed content roadmap

---

## All-in-One Command

You can run all three steps in one command:

```bash
npm run pipeline:generate-prd -- --run-discovery \
  --species-count 20 \
  --gear-count 20 \
  --matrix-max 400 \
  --min-volume 200 \
  --max-volume 500
```

This will:
1. ✅ Use Perplexity to brainstorm 20 species and 20 gear types
2. ✅ Generate 400 combinations from those entities
3. ✅ Validate with DataForSEO (checking for 200-500 searches/month each)
4. ✅ Consolidate into PRD with total aggregate volume

---

## Key Metrics

**Target per keyword:** 200-500 searches/month
- Individual keywords may have low volume, but thousands aggregate to massive traffic

**Target aggregate:** 800k-2M searches/month
- Example: 2,000 validated keywords × 400 avg volume = 800,000/month
- Example: 4,000 validated keywords × 500 avg volume = 2,000,000/month

**Search intent:** Informational only
- People want guides, not just buying
- Ensures quality traffic

**Keyword difficulty:** 0-70
- Avoid very high competition (70+)

---

## Why This Workflow Works

### Perplexity (The "Vibe" and Strategy)
- **Identifies the "vibe"**: Understands what fishing enthusiasts actually care about
- **Discovers entities**: Generates lists of species/gear that have SEO potential
- **Provides context**: Understands the fishing niche and target audience

### DataForSEO (The Hard Data)
- **Validates demand**: Confirms people actually search for these terms
- **Provides metrics**: Search volume, keyword difficulty, competition
- **Filters by intent**: Ensures we target informational keywords, not just commercial
- **Aggregates opportunities**: Shows that individual keywords (200-500/month) aggregate to 800k-2M/month

### The PRD (The Super Structured Path)
- **Prevents dilution**: Ensures content follows a structured, data-backed plan
- **Guides generation**: Provides clear patterns and metrics for each page
- **Tracks progress**: Shows total volume, opportunities, and recommendations
- **Enables automation**: Makes it easy for Claude Code to build thousands of pages

---

## Example Output

**Step 1: Perplexity Brainstorms**
- Discovered 20 species (Redfish, Snook, Tarpon, etc.)
- Discovered 20 gear types (Topwater Lures, Soft Plastics, etc.)
- **400 potential combinations** (20 × 20)

**Step 2: DataForSEO Validates**
- Generated 2,000 combinations (400 base × 5 patterns)
- Validated 300 combinations with 200-500 searches/month
- **Total aggregate: 120,000 searches/month** (may need more to reach 800k-2M)

**Step 3: PRD Consolidates**
- All validated opportunities
- Total search volume calculations
- Opportunity scores
- Structured content plan

---

## Status

✅ **WORKFLOW IS CORRECTLY SET UP**

The combined workflow is now implemented exactly as you described:
- ✅ Step 1: Perplexity brainstorms entities
- ✅ Step 2: DataForSEO validates combinations
- ✅ Step 3: PRD consolidates everything

See `COMBINED-WORKFLOW-GUIDE.md` for detailed instructions.
