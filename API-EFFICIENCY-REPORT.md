# API Efficiency Audit Report

## Current API Usage Per Blog Generation

### 1. **Perplexity API** (Ideation Phase)
- **Calls:** 1 per ideation
- **Model:** `llama-3.1-sonar-small-128k-online`
- **Tokens:** ~1,500 max tokens
- **Cost:** ~$0.001 per call
- **Status:** ✅ **EFFICIENT** - Only called once during ideation
- **Recommendation:** Keep as-is

---

### 2. **DataForSEO API** (SEO Research Phase)
#### Primary Call - Keywords For Keywords
- **Calls:** 1 per ideation
- **Endpoint:** `/v3/keywords_data/google_ads/keywords_for_keywords/live`
- **Limit:** 100 keywords per call
- **Seeds:** 10 seed keywords
- **Returns:** ~3,800-4,700 keywords
- **Cost:** ~$0.10-0.20 per call
- **Status:** ✅ **EFFICIENT** - Good return on investment

#### Secondary Call - Bulk Keyword Difficulty
- **Calls:** 1 per ideation (only if primary doesn't have difficulty)
- **Endpoint:** `/v3/dataforseo_labs/google/bulk_keyword_difficulty/live`
- **Limit:** 100 keywords
- **Cost:** ~$0.05 per call
- **Status:** ✅ **EFFICIENT** - Only called when needed

#### Failing Call - DataForSEO Labs (WASTE)
- **Calls:** 1 per ideation (ALWAYS FAILS)
- **Endpoint:** `/v3/dataforseo_labs/google/keywords_for_keywords/live`
- **Error:** "Not Found. (40400)"
- **Cost:** $0 (fails immediately)
- **Status:** ⚠️ **WASTE** - Account doesn't have Labs API access
- **Recommendation:** ✅ Skip this endpoint entirely

#### Failing Call - Search Intent API (WASTE)
- **Calls:** 1 per ideation (ALWAYS FAILS)
- **Error:** "Search Intent API failed"
- **Cost:** ~$0.05 per call (wasted)
- **Status:** ❌ **MAJOR WASTE** - Costing money for failed calls
- **Recommendation:** ✅ Remove or add proper error handling

**DataForSEO WASTE:** ~$0.05-0.10 per blog (failed API calls)

---

### 3. **OpenAI API** (Content Generation Phase)
#### Main Content Generation
- **Calls:** 1 per blog
- **Model:** gpt-4o (from config)
- **Tokens:** ~8,000-12,000 tokens (input + output)
- **Cost:** ~$0.15-0.25 per blog
- **Status:** ✅ **EFFICIENT** - Core feature

#### Vibe Test - Effectiveness Score (FAILING & WASTING)
- **Calls:** 1 per blog (ALWAYS FAILS)
- **Error:** "Missing required parameter: 'response_format.json_schema.name'"
- **Retries:** 3 attempts per failure (3x waste!)
- **Cost:** ~$0.05 × 3 = **$0.15 wasted per blog**
- **Status:** ❌ **CRITICAL WASTE** - JSON schema missing `name` field
- **Recommendation:** ✅ Fix JSON schema format OR disable feature

#### Vibe Test - Unique Insights
- **Calls:** 1 per blog
- **Tokens:** ~2,000-3,000 tokens
- **Cost:** ~$0.05-0.08 per blog
- **Status:** ✅ **WORKS** - Adds value

#### Vibe Test - Real World Notes
- **Calls:** 1 per blog
- **Tokens:** ~2,000-3,000 tokens
- **Cost:** ~$0.05-0.08 per blog
- **Status:** ✅ **WORKS** - Adds value

#### Alternative Recommendations (FAILING & WASTING)
- **Calls:** 1 per blog (ALWAYS FAILS)
- **Error:** "TypeError: loadSiteIndex is not a function"
- **Cost:** ~$0.03 per blog (partial execution)
- **Status:** ❌ **WASTE** - Feature broken
- **Recommendation:** ✅ Fix or disable

**OpenAI WASTE:** ~$0.18-0.20 per blog (failed calls + retries)

---

## Total Cost Per Blog

### Current State (WITH WASTE)
```
Perplexity:           $0.001
DataForSEO (working): $0.15
DataForSEO (waste):   $0.05    ← WASTE
OpenAI (working):     $0.38
OpenAI (waste):       $0.18    ← WASTE
────────────────────────────
TOTAL PER BLOG:       $0.76
WASTE PER BLOG:       $0.23    (30% waste!)
```

### Optimized State (AFTER FIX)
```
Perplexity:           $0.001
DataForSEO (working): $0.15
OpenAI (working):     $0.38
────────────────────────────
TOTAL PER BLOG:       $0.53
SAVINGS PER BLOG:     $0.23   (30% reduction!)
```

### At Scale
- **10 blogs/month:** Save $2.30/month ($27.60/year)
- **50 blogs/month:** Save $11.50/month ($138/year)
- **100 blogs/month:** Save $23/month ($276/year)

---

## Critical Issues to Fix

### 🔴 CRITICAL: OpenAI JSON Schema Error (HIGH WASTE)
**File:** `scripts/pipeline/llm.ts:79`
**Problem:** JSON schema missing required `name` field
**Impact:** $0.15 wasted per blog (3 retry attempts)
**Fix:**
```typescript
response_format: input.jsonSchema ? {
  type: 'json_schema',
  json_schema: {
    name: 'response_schema',  // ← ADD THIS
    strict: true,
    schema: input.jsonSchema
  }
} : undefined
```

### 🔴 CRITICAL: Search Intent API Failing (MEDIUM WASTE)
**File:** `scripts/pipeline/ideation.ts` (search intent call)
**Problem:** API endpoint not available in your plan
**Impact:** $0.05 wasted per blog
**Fix:** Add proper error handling or remove call entirely

### 🟡 MEDIUM: DataForSEO Labs Endpoint (LOW WASTE)
**File:** `scripts/pipeline/ideation.ts:395`
**Problem:** Account doesn't have Labs API access
**Impact:** $0 (fails fast) but adds latency
**Fix:** Remove endpoint from retry list

### 🟡 MEDIUM: Alternative Recommendations Broken (LOW WASTE)
**File:** `scripts/pipeline/generators/blog.ts:122`
**Problem:** Missing `loadSiteIndex` function
**Impact:** $0.03 per blog
**Fix:** Fix import or disable feature

---

## Optimization Recommendations

### Priority 1: Fix Waste (30% cost reduction)
1. ✅ Fix OpenAI JSON schema format
2. ✅ Remove/fix Search Intent API call
3. ✅ Remove DataForSEO Labs endpoint
4. ✅ Fix or disable Alternative Recommendations

### Priority 2: Fine-tune Limits
- **DataForSEO limit:** Currently 100 keywords
  - **Recommendation:** Keep at 100 (good balance)
- **Perplexity tokens:** Currently 1,500 max
  - **Recommendation:** Reduce to 1,000 (still enough for 15 topics)
  - **Savings:** $0.0003 per blog

### Priority 3: Batch Operations
- **Current:** 1 API call per blog for keyword difficulty
- **Opportunity:** Batch multiple blog generations
  - Generate 5 blogs → 1 ideation call → 5 blog generations
  - **Savings:** $0.15 per additional blog

---

## Recommended Limits

### DataForSEO
```typescript
limit: 100  // ✅ Keep - good ROI
seedKeywords.slice(0, 10)  // ✅ Keep - 10 seeds is optimal
```

### Perplexity
```typescript
maxTokens: 1000  // Change from 1500 (sufficient for 15 topics)
```

### OpenAI
```typescript
maxTokens: 10000  // ✅ Keep - needed for full blog content
temperature: 0.7  // ✅ Keep - good balance
```

---

## Action Items

### Immediate Fixes (30 minutes, saves 30%)
1. Fix OpenAI JSON schema in `llm.ts`
2. Remove failing DataForSEO Labs endpoint
3. Add try-catch for Search Intent API
4. Fix or disable Alternative Recommendations

### Cost Tracking (15 minutes)
1. Add API call logging with costs
2. Track actual costs per blog
3. Monitor DataForSEO credit usage

### Future Optimizations (2 hours)
1. Implement batch blog generation
2. Cache DataForSEO results (24hr TTL)
3. Reduce Perplexity token limit

---

## Summary

**Current Waste:** 30% ($0.23 per blog)
**Quick Win:** Fix 4 issues → 30% cost reduction
**Effort:** ~30 minutes
**ROI:** Immediate savings on every blog

Your API usage is generally efficient, but **3 failing API calls** are wasting ~30% of your budget on retries and errors.
