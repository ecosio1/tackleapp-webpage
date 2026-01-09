# Content Validation Rules - Non-Negotiable

## Overview

Every generated blog post MUST pass these validation rules. Posts that fail validation will be rejected and not published.

These rules ensure content is:
- **Safe** - No legal liability
- **Evergreen** - Won't become outdated
- **Valuable** - Practical advice users can act on
- **Aligned** - Drives app downloads

---

## ✅ Rule 1: Clear Search Intent (Informational Only)

**Required:** All blog posts must target informational search queries.

### ✅ Valid Intent
- How to catch [species]
- Best lures for [species]
- [Species] fishing tips
- Fishing techniques for [condition]
- Where to fish for [species] in [location]

### ❌ Invalid Intent
- Buy fishing gear online (transactional)
- Fishing license prices (navigational)
- Fishing charters near me (local)
- Best fishing store (commercial)

**Validation:**
```typescript
// Must have informational keywords
const validPatterns = [
  /how to/i,
  /best/i,
  /guide/i,
  /tips/i,
  /techniques/i,
  /when to/i,
  /where to/i,
  /what/i
];
```

---

## ✅ Rule 2: Location or Species Specificity

**Required:** Posts must target specific locations OR species (ideally both).

### ✅ Valid Specificity
- "Best Lures for **Snook** in **Florida**" ✓
- "How to Catch **Redfish** on **Texas Flats**" ✓
- "**Tarpon** Fishing Tips for **Beginners**" ✓
- "Topwater Techniques for **Bass** in **Spring**" ✓

### ❌ Invalid - Too Generic
- "Best Fishing Lures" ✗ (no species or location)
- "Fishing Tips" ✗ (too broad)
- "How to Catch Fish" ✗ (no specificity)

**Validation:**
```typescript
// Must mention at least one
const hasSpecies = /snook|redfish|tarpon|bass|trout|etc/i.test(content);
const hasLocation = /florida|texas|california|gulf|atlantic|etc/i.test(content);

if (!hasSpecies && !hasLocation) {
  throw new Error('Post must include species or location specificity');
}
```

---

## ✅ Rule 3: Practical, Actionable Fishing Advice

**Required:** Every post must include specific, actionable advice users can implement.

### ✅ Valid - Actionable
```markdown
**Top Picks:**
- DOA CAL Jerkbait (4-5 inch)
- Z-Man Scented Jerkshad

**Technique:** Twitch-pause-twitch retrieve near structure

**Best Conditions:** Dawn, dusk, moving water
```

### ❌ Invalid - Too Generic
```markdown
Snook are great fish to catch. They live in Florida waters
and can be caught year-round. Many anglers enjoy fishing for them.
```

**Requirements:**
- ✅ Specific gear recommendations (brands, sizes, models)
- ✅ Detailed techniques (retrieve styles, presentations)
- ✅ Timing advice (seasons, times of day, tides)
- ✅ Location-specific tips (structures, depths, conditions)
- ✅ Pro tips from experience

---

## ✅ Rule 4: At Least One App Conversion Block

**Required:** Every post MUST include at least one app CTA (Call-to-Action).

### ✅ Valid App CTAs

**Minimum (End of Article):**
```markdown
*Ready to catch more snook? Download the Tackle app to log your
catches, track patterns, and discover hot spots near you.*
```

**Better (Multiple Touchpoints):**
1. End of article CTA (required)
2. Mid-article conversion block (PrimaryCTA component)
3. Contextual mentions: "Track your catches in the Tackle app"

### ❌ Invalid
- No app mention at all ✗
- Generic "download our app" without value prop ✗
- Broken or missing CTA ✗

**Validation:**
```typescript
// Must include app CTA
const hasAppCTA = /tackle app|download tackle/i.test(body);
const hasCTAValue = /log your catches|track patterns|discover hot spots/i.test(body);

if (!hasAppCTA || !hasCTAValue) {
  throw new Error('Post must include app CTA with value proposition');
}
```

---

## ❌ Rule 5: No Specific Regulations

**CRITICAL:** Posts MUST NOT include specific bag limits, size limits, closed seasons, or legal claims.

### ❌ Forbidden Content - NEVER Include

**Bag Limits:**
- ❌ "Bag limit: 1 fish per angler per day"
- ❌ "You can keep up to 5 snook"
- ❌ "Daily limit is 2 fish"

**Size Limits:**
- ❌ "Slot limit: 28-32 inches"
- ❌ "Must be at least 18 inches"
- ❌ "Maximum size 36 inches"

**Closed Seasons:**
- ❌ "Closed seasons: December-January and June-August"
- ❌ "No fishing during spawning (June-July)"
- ❌ "Open season starts April 1st"

**Legal Claims:**
- ❌ "It's illegal to..."
- ❌ "You must have a license to..."
- ❌ "Violations result in fines up to..."

### ✅ Valid - Neutral Regulation Mention

**Only Acceptable Format:**
```markdown
## Regulations

**Always check current regulations before fishing.**

Snook are a protected species with specific size and bag limits
that vary by region and season.

**[See local regulations →](https://myfwc.com/fishing/saltwater/recreational/snook/)**

*Regulations are subject to change. Always verify current rules
with your state wildlife agency before fishing.*
```

**Key Principles:**
1. ✅ Mention that regulations exist
2. ✅ Link to official government source
3. ✅ Disclaimer about changes
4. ❌ Never cite specific numbers
5. ❌ Never claim legal authority

**Why This Matters:**
- Regulations change frequently
- Varies by location, season, license type
- Legal liability if information is wrong
- Better to send users to official source

---

## ✅ Rule 6: Evergreen Content Only

**Required:** Content must remain accurate and useful over time.

### ✅ Evergreen Topics
- Species behavior and habitat
- Fishing techniques and presentations
- Gear selection and usage
- Seasonal patterns (general)
- Location characteristics

### ❌ Time-Sensitive Content
- ❌ Current weather events
- ❌ Specific date ranges
- ❌ Limited-time gear sales
- ❌ Current regulation years
- ❌ Trending topics that will fade

**Validation:**
```typescript
// Avoid time-sensitive phrases
const timeSensitive = [
  /this year/i,
  /currently/i,
  /right now/i,
  /2024|2025|2026/i,
  /recent study/i,
  /new regulation/i
];

if (timeSensitive.some(pattern => pattern.test(body))) {
  throw new Error('Content must be evergreen, avoid time-sensitive references');
}
```

---

## Validation Checklist

Before publishing, every blog post must pass these checks:

### Content Quality
- [ ] Title targets informational search intent
- [ ] Includes species OR location specificity (ideally both)
- [ ] Contains specific, actionable fishing advice
- [ ] At least 800 words of substantive content
- [ ] Well-structured with clear headings

### Required Components
- [ ] App CTA at end of article with value proposition
- [ ] "See local regulations" section with outbound link
- [ ] Disclaimer about regulation changes
- [ ] No specific bag limits, sizes, or seasons
- [ ] No legal claims or regulatory advice

### SEO & Technical
- [ ] Primary keyword in title
- [ ] Meta description (150-160 chars)
- [ ] 3-5 secondary keywords
- [ ] At least 3 H2 headings
- [ ] At least 5 H3 or H4 headings
- [ ] 3-5 FAQs with answers
- [ ] 2+ authoritative sources cited

### Safety & Legal
- [ ] No specific regulations cited
- [ ] No legal advice given
- [ ] Outbound link to government regulations
- [ ] Disclaimer present and prominent
- [ ] No medical or safety claims

---

## Validation Function

```typescript
interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

export function validateBlogPost(post: BlogPost): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Rule 1: Informational Intent
  const hasInformationalIntent = /how to|best|guide|tips|techniques|when to|where to|what/i.test(post.title);
  if (!hasInformationalIntent) {
    errors.push('Title must target informational search intent');
  }

  // Rule 2: Specificity
  const speciesMentioned = /snook|redfish|tarpon|bass|trout|grouper|mahi|wahoo|tuna/i.test(post.body);
  const locationMentioned = /florida|texas|california|gulf|atlantic|pacific|keys|coast/i.test(post.body);
  if (!speciesMentioned && !locationMentioned) {
    errors.push('Post must include species or location specificity');
  }

  // Rule 3: Actionable Advice
  const hasGearRecs = /top picks|recommended|best for/i.test(post.body);
  const hasTechniques = /technique|retrieve|presentation|method/i.test(post.body);
  if (!hasGearRecs && !hasTechniques) {
    warnings.push('Post should include specific gear recommendations or techniques');
  }

  // Rule 4: App CTA
  const hasAppCTA = /tackle app|download tackle/i.test(post.body);
  const hasValueProp = /log your catches|track patterns|discover hot spots|ai fish id/i.test(post.body);
  if (!hasAppCTA) {
    errors.push('Post must include Tackle app CTA');
  }
  if (!hasValueProp) {
    warnings.push('App CTA should include value proposition');
  }

  // Rule 5: No Regulations (CRITICAL)
  const hasBagLimit = /bag limit|daily limit|keep.*fish|harvest limit/i.test(post.body);
  const hasSizeLimit = /slot limit|size limit|minimum.*inch|maximum.*inch|\d+\s*-\s*\d+\s*inch/i.test(post.body);
  const hasClosedSeason = /closed season|open season|no fishing.*\w+\s*-\s*\w+/i.test(post.body);

  if (hasBagLimit) {
    errors.push('CRITICAL: Post contains bag limit information - remove all specific limits');
  }
  if (hasSizeLimit) {
    errors.push('CRITICAL: Post contains size limit information - remove all specific measurements');
  }
  if (hasClosedSeason) {
    errors.push('CRITICAL: Post contains closed season information - remove all specific dates');
  }

  // Must have regulations link
  const hasRegulationsLink = /see local regulations|check.*regulations|official.*regulations/i.test(post.body);
  if (!hasRegulationsLink) {
    errors.push('Post must include "See local regulations" link');
  }

  // Rule 6: Evergreen Content
  const isTimeSensitive = /this year|currently|right now|202\d|recent study|new regulation/i.test(post.body);
  if (isTimeSensitive) {
    warnings.push('Avoid time-sensitive language - keep content evergreen');
  }

  // Word count
  const wordCount = post.body.split(/\s+/).length;
  if (wordCount < 800) {
    errors.push(`Post too short: ${wordCount} words (minimum 800)`);
  }

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}
```

---

## Examples: Valid vs Invalid

### ✅ Example: Valid Blog Post

**Title:** "Best Lures for Snook in Florida: Complete Guide"

**Content Snippet:**
```markdown
# Best Lures for Snook in Florida: Complete Guide

Snook are one of Florida's most prized gamefish, known for their
aggressive strikes and acrobatic fights...

## Top 5 Snook Lures

### 1. Soft Plastic Jerkbaits
**Top Picks:**
- DOA CAL Jerkbait (4-5 inch)
- Z-Man Scented Jerkshad

**Technique:** Twitch-pause-twitch retrieve near structure
**Best Conditions:** Dawn, dusk, moving water

## Regulations

**Always check current regulations before fishing.**

Snook are a protected species with specific size and bag limits.

**[See local regulations →](https://myfwc.com/fishing/...)**

*Regulations are subject to change. Always verify current rules...*

---

*Ready to catch more snook? Download the Tackle app to log your
catches, track patterns, and discover hot spots near you.*
```

**Why Valid:**
- ✅ Informational intent ("Best Lures")
- ✅ Species specific (Snook)
- ✅ Location specific (Florida)
- ✅ Actionable advice (specific lures and techniques)
- ✅ App CTA with value prop
- ✅ Regulations mention WITHOUT specifics
- ✅ Outbound link to official source

---

### ❌ Example: Invalid Blog Post

**Title:** "Fishing in America"

**Content Snippet:**
```markdown
# Fishing in America

Fishing is a popular activity. Many people enjoy fishing.
There are different types of fish...

## Current Regulations

As of 2024, the bag limit for snook is 1 fish per person per day.
The slot limit is 28-32 inches. The closed season runs from
December 1st to January 31st and June 1st to August 31st.

You must have a valid fishing license to fish for snook.
Violations can result in fines.

Check regulations before fishing.
```

**Why Invalid:**
- ❌ Too generic title (no species or location)
- ❌ No informational intent
- ❌ No actionable advice
- ❌ Specific bag limits cited (VIOLATION)
- ❌ Specific size limits cited (VIOLATION)
- ❌ Specific closed seasons cited (VIOLATION)
- ❌ Legal claims made
- ❌ No app CTA
- ❌ Time-sensitive reference ("2024")

---

## Pipeline Integration

The validator runs at multiple stages:

### 1. Pre-Generation
- Validate content brief before generation
- Ensure topic meets specificity requirements
- Confirm search intent is informational

### 2. Post-Generation
- Validate generated content
- Check for regulation violations
- Verify all required components present

### 3. Pre-Publishing
- Final validation before writing to filesystem
- Block publication if validation fails
- Log detailed error messages

### 4. Manual Override
- No manual override allowed for Rule 5 (regulations)
- Critical safety rule cannot be bypassed

---

## Error Handling

### Critical Errors (Block Publication)
1. Contains specific bag limits
2. Contains specific size limits
3. Contains specific closed seasons
4. Missing app CTA
5. No species or location specificity

### Warnings (Allow with Review)
1. Generic advice without specifics
2. Missing FAQs
3. Low word count (800-1000 words)
4. Time-sensitive language
5. Missing secondary keywords

---

## Documentation

All blog posts MUST follow these rules. The pipeline enforces validation automatically.

### For Content Creators
- Review `CONTENT-VALIDATION-RULES.md` before creating content
- Use validator function to check posts
- Never include specific regulations

### For Engineers
- `lib/editorial/guardrails.ts` - Validation function
- `scripts/pipeline/validator.ts` - Pipeline integration
- Tests in `__tests__/validation.test.ts`

---

## Legal Protection

These rules protect Tackle from legal liability:

1. **No Regulatory Advice** - We don't claim legal authority
2. **External Links** - Users go to government sources
3. **Prominent Disclaimers** - Clear about changing regulations
4. **Evergreen Content** - Won't become outdated and wrong

**Remember:** When in doubt, link out. Better to send users to official sources than risk wrong information.

---

## Summary

Every blog post must:
1. ✅ Target informational search intent
2. ✅ Include species OR location specificity
3. ✅ Provide actionable fishing advice
4. ✅ Include app CTA with value prop
5. ❌ **NEVER include specific regulations**
6. ✅ Link to official government sources

These rules are **non-negotiable**. Posts that fail validation will not be published.
