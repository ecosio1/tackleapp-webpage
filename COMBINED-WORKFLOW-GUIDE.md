# Combined Workflow Guide

## Overview

This guide explains the **Combined Workflow** for programmatic SEO, which uses a conversation-style back-and-forth between Perplexity and DataForSEO to generate validated blog ideas and content strategies.

## The Workflow

The successful strategy involves a "conversation" between tools rather than a single prompt:

### Step 1: Use Perplexity to Brainstorm Entities

**Purpose:** Generate the seed entities (species, gear types) that will be combined into keywords.

**Command:**
```bash
npm run pipeline:discover-entities -- --species-count 20 --gear-count 20
```

**What it does:**
- Uses Perplexity to brainstorm 20 fish species
- Uses Perplexity to brainstorm 20 gear/lure types
- Returns validated entities based on search value and SEO potential

**Output:**
- List of 20 species (e.g., Redfish, Snook, Tarpon, etc.)
- List of 20 gear types (e.g., Topwater Lures, Soft Plastics, Jigs, etc.)
- **Total potential combinations: 400 (20 × 20)**

### Step 2: Use DataForSEO to Validate Combinations

**Purpose:** Run the 400 potential combinations through DataForSEO to see which ones actually have search volume, targeting an aggregate of 800k to 2M searches/month.

**Command:**
```bash
npm run pipeline:generate-matrix -- --use-perplexity --max-combinations 400 --min-volume 200 --max-volume 500
```

**What it does:**
- Takes the entities from Step 1 (or uses hardcoded if `--use-perplexity` is not set)
- Generates combinations following patterns like:
  - "Best {lure} for {species}"
  - "How to catch {species} with {lure}"
  - "Best {lure} for {species} in {location}"
- Validates each combination with DataForSEO:
  - Checks search volume (targeting 200-500 searches/month per keyword)
  - Checks keyword difficulty
  - Filters for informational intent only
  - Gets related questions for FAQ sections

**Output:**
- Validated combinations with search volume data
- Filtered list of opportunities (e.g., "Best topwater lures for Redfish in Florida" = 450 searches/month)
- Total aggregate volume calculation

**Goal:** Find combinations that aggregate to **800k-2M searches/month** total.

### Step 3: Consolidate into PRD

**Purpose:** Consolidate all discovery data into a Master Pipeline PRD, which provides the "super structured path" for content generation.

**Command:**
```bash
npm run pipeline:generate-prd -- --run-discovery
```

**What it does:**
- Runs Steps 1 & 2 automatically (if `--run-discovery` is set)
- Consolidates all data into `MASTER_PIPELINE_PRD.md`:
  - Discovered entities
  - Validated combinations with metrics
  - Total search volume calculations
  - Opportunity scores
  - Recommended patterns

**Output:**
- Comprehensive PRD document (`MASTER_PIPELINE_PRD.md`)
- Structured strategy for building pages
- Data-backed content roadmap

## All-in-One Command

You can run all three steps in one command:

```bash
npm run pipeline:generate-prd -- --run-discovery --species-count 20 --gear-count 20 --matrix-max 400 --min-volume 200 --max-volume 500
```

This will:
1. ✅ Use Perplexity to brainstorm 20 species and 20 gear types
2. ✅ Generate 400 combinations from those entities
3. ✅ Validate with DataForSEO (checking for 200-500 searches/month each)
4. ✅ Consolidate into PRD with total aggregate volume

## Why This Workflow Works

### Perplexity (The "Vibe" and Strategy)
- **Identifies the "vibe"**: Understands what fishing enthusiasts actually care about
- **Discovers patterns**: Finds scalable content opportunities
- **Brainstorms entities**: Generates lists of species/gear that have SEO potential
- **Provides context**: Understands the fishing niche and target audience

### DataForSEO (The Hard Data)
- **Validates demand**: Confirms people actually search for these terms
- **Provides metrics**: Search volume, keyword difficulty, competition
- **Filters by intent**: Ensures we target informational keywords, not just commercial
- **Aggregates opportunities**: Shows that while individual keywords may have 200-500 searches/month, thousands of these pages aggregate to 800k-2M searches/month

### The PRD (The Super Structured Path)
- **Prevents dilution**: Ensures content follows a structured, data-backed plan
- **Guides generation**: Provides clear patterns and metrics for each page
- **Tracks progress**: Shows total volume, opportunities, and recommendations
- **Enables automation**: Makes it easy for Claude Code to build thousands of pages

## Example: Full Workflow

```bash
# Step 1: Brainstorm entities
npm run pipeline:discover-entities -- --species-count 20 --gear-count 20

# Step 2: Generate and validate combinations
npm run pipeline:generate-matrix -- --use-perplexity --max-combinations 400 --min-volume 200 --max-volume 500

# Step 3: Generate PRD
npm run pipeline:generate-prd -- --run-discovery
```

**Expected Output:**
- **Step 1:** 20 species + 20 gear types = 400 potential combinations
- **Step 2:** ~300 validated combinations with 200-500 searches/month each = **60k-150k searches/month** (may need more combinations to reach 800k-2M goal)
- **Step 3:** PRD with all validated opportunities and structured content plan

## Key Metrics

**Target per keyword:** 200-500 searches/month
- Too low (< 200): Not enough demand
- Too high (> 500): May be too competitive

**Target aggregate:** 800k-2M searches/month
- Calculate: (validated combinations × average volume) ≥ 800,000
- Example: 2,000 validated keywords × 400 avg volume = 800,000/month
- Example: 4,000 validated keywords × 500 avg volume = 2,000,000/month

**Keyword difficulty:** 0-70 (avoid very high competition)

**Search intent:** Informational only (people want guides, not just buying)

## Troubleshooting

### Not reaching 800k-2M aggregate volume?

1. **Increase entity counts:**
   ```bash
   --species-count 30 --gear-count 30
   ```
   This creates 900 potential combinations (30 × 30)

2. **Expand patterns:**
   Add more patterns in `matrix.ts` to generate more combinations

3. **Include locations:**
   ```bash
   --location florida
   ```
   This creates location-specific combinations

4. **Adjust volume range:**
   ```bash
   --min-volume 100 --max-volume 800
   ```
   This widens the acceptable range

### Perplexity not returning entities?

- Check that `PERPLEXITY_API_KEY` is set in `.env.local`
- The system will fallback to hardcoded entities if Perplexity fails
- Check logs for Perplexity API errors

### DataForSEO returning "Payment Required"?

- Your DataForSEO account may need credits or a subscription upgrade
- Check your DataForSEO dashboard for available APIs
- Some features may require Labs API access

## Next Steps

After generating the PRD:

1. **Review the PRD:** Check `MASTER_PIPELINE_PRD.md` for validated opportunities
2. **Prioritize pages:** Focus on highest opportunity score combinations first
3. **Generate content:** Use the PRD as input for content generation
4. **Track progress:** Monitor which pages are built and their performance

---

**Status:** ✅ **Workflow Implemented** - The combined workflow is now set up and ready to use!
