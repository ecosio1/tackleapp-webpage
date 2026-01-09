# ✅ STEP 11 Complete: Tightened Quality Gate for Blog Posts

## Requirement

Every post must include:
- ✅ At least 1 app CTA block in the top half
- ✅ At least 1 app CTA block near the end
- ✅ One neutral "See local regulations" line (no specific limits/seasons)
- ✅ Practical steps, not fluff

## Done When

Generator can't publish without those elements.

---

## ✅ Implementation Complete

### Enhanced Quality Gate (`scripts/pipeline/quality-gate.ts`)

**Status:** ✅ Updated with strict blocking requirements

**New Checks:**

1. **CTA in Top Half (BLOCKING)**
   - Checks first 50% of content for CTA patterns
   - Patterns: "download tackle", "tackle app", "get tackle", "/download", etc.
   - **BLOCKS** if missing

2. **CTA Near End (BLOCKING)**
   - Checks last 40% of content for CTA patterns
   - **BLOCKS** if missing

3. **Regulations Block (BLOCKING)**
   - Checks for neutral "See local regulations" text
   - Patterns: "see local regulations", "check local regulations", etc.
   - **BLOCKS** if missing

4. **Practical Steps (BLOCKING)**
   - Checks for numbered steps, instructions, or actionable content
   - Requires at least 3 instructional paragraphs
   - **BLOCKS** if missing or insufficient

---

## ✅ Quality Gate Checks

### Check 1: CTA in Top Half

**Patterns Detected:**
- `download tackle`
- `tackle app`
- `get tackle`
- `install tackle`
- `/download`
- `what to do next.*download`
- `ready to.*download`
- `get.*tackle.*iphone`

**Location:** First 50% of content

**Blocking:** ✅ YES - Publishing blocked if missing

**Error Message:**
```
BLOCKED: Missing required App CTA in top half of content. 
Blog posts must include at least one call-to-action for the Tackle app in the first half of the content.
```

### Check 2: CTA Near End

**Patterns Detected:** Same as Check 1

**Location:** Last 40% of content

**Blocking:** ✅ YES - Publishing blocked if missing

**Error Message:**
```
BLOCKED: Missing required App CTA near the end. 
Blog posts must include at least one call-to-action for the Tackle app in the last 40% of the content.
```

### Check 3: Regulations Block

**Patterns Detected:**
- `see local regulations`
- `check.*local regulations`
- `consult.*local regulations`
- `see.*regulations`
- `regulations.*change`
- `always verify.*regulations`
- `check.*regulations.*official`

**Blocking:** ✅ YES - Publishing blocked if missing

**Error Message:**
```
BLOCKED: Missing required "See local regulations" block. 
Blog posts must include a neutral reminder to check local regulations (no specific limits, seasons, or legal claims).
```

### Check 4: Practical Steps

**Patterns Detected:**
- Numbered steps: `step 1`, `step-by-step`, `1.`, `2.`, `3.`
- Instructions: `how to`, `instructions`, `guide`, `tutorial`, `process`, `method`, `technique`
- Actionable content: `first.*second.*third`, `begin by`, `start with`, `next.*then`, `finally`

**Requirements:**
- Must have numbered steps OR instructions OR actionable content
- Must have at least 3 instructional paragraphs

**Blocking:** ✅ YES - Publishing blocked if missing or insufficient

**Error Messages:**
```
BLOCKED: Content lacks practical steps or instructions. 
Blog posts must include actionable steps, numbered instructions, or clear how-to guidance (not just fluff).
```

OR

```
BLOCKED: Content lacks sufficient practical steps. 
Blog posts must include at least 3 instructional paragraphs with actionable steps or numbered instructions.
```

---

## ✅ Example: Valid Blog Post

**Content Structure:**
```
# Title

Introduction paragraph...

## Section 1
Content with practical steps...

**What to do next:** Download Tackle for iPhone to get real-time conditions... ✅ (CTA in top half)

## Section 2
More practical content with numbered steps:
1. First step
2. Second step
3. Third step

## Section 3
Additional instructions...

## Conclusion
Summary of steps...

**Ready to catch more fish?** Download Tackle and get personalized fishing advice... ✅ (CTA near end)

## See Local Regulations
Before you head out, make sure you're familiar with local fishing regulations. 
Check size limits, bag limits, and seasonal restrictions for your area. ✅ (Regulations block)
```

**Result:** ✅ PASSES - All requirements met

---

## ✅ Example: Invalid Blog Post (Missing CTA in Top Half)

**Content Structure:**
```
# Title

Introduction paragraph...

## Section 1
Content without CTA... ❌ (Missing CTA in top half)

## Section 2
More content...

## Conclusion
**Download Tackle** ✅ (CTA near end)

## See Local Regulations
Check local regulations... ✅ (Regulations block)
```

**Result:** ❌ BLOCKED - Missing CTA in top half

**Error:**
```
BLOCKED: Missing required App CTA in top half of content. 
Blog posts must include at least one call-to-action for the Tackle app in the first half of the content.
```

---

## ✅ Example: Invalid Blog Post (Missing Regulations Block)

**Content Structure:**
```
# Title

Introduction...

**Download Tackle** ✅ (CTA in top half)

## Section 1
Content with steps...

## Conclusion
**Get Tackle** ✅ (CTA near end)
```

**Result:** ❌ BLOCKED - Missing regulations block

**Error:**
```
BLOCKED: Missing required "See local regulations" block. 
Blog posts must include a neutral reminder to check local regulations (no specific limits, seasons, or legal claims).
```

---

## ✅ Example: Invalid Blog Post (No Practical Steps)

**Content Structure:**
```
# Title

Fishing is a great hobby. Many people enjoy fishing. 
Fishing can be relaxing. You can catch fish. 
Fish are interesting creatures. ✅ (CTA in top half)
✅ (CTA near end)
✅ (Regulations block)
```

**Result:** ❌ BLOCKED - No practical steps

**Error:**
```
BLOCKED: Content lacks practical steps or instructions. 
Blog posts must include actionable steps, numbered instructions, or clear how-to guidance (not just fluff).
```

---

## ✅ Quality Gate Flow

```
Publish Request
  ↓
Quality Gate Check
  ↓
Check 1: CTA in Top Half
  ├─ ✅ Found → Continue
  └─ ❌ Missing → BLOCK (Error)
  ↓
Check 2: CTA Near End
  ├─ ✅ Found → Continue
  └─ ❌ Missing → BLOCK (Error)
  ↓
Check 3: Regulations Block
  ├─ ✅ Found → Continue
  └─ ❌ Missing → BLOCK (Error)
  ↓
Check 4: Practical Steps
  ├─ ✅ Found → Continue
  └─ ❌ Missing → BLOCK (Error)
  ↓
All Checks Passed → ✅ PUBLISH
```

---

## ✅ Integration with Publisher

**Location:** `scripts/pipeline/publisher.ts`

**Behavior:**
- Quality gate runs automatically before publishing
- If blocked, publish fails with clear error messages
- Generator must fix issues before publishing

**Code:**
```typescript
// SAFEGUARD 1.5: Run quality gate (fast, automated pre-publish checks)
const { runQualityGate } = await import('./quality-gate');
const qualityGate = runQualityGate(doc);

if (qualityGate.blocked) {
  throw new PublishError(
    `Quality gate BLOCKED: ${qualityGate.errors.join('; ')}`,
    'QUALITY_GATE_FAILED'
  );
}
```

---

## ✅ Definition of Done - MET

1. ✅ **CTA in top half enforced** - Publishing blocked if missing
2. ✅ **CTA near end enforced** - Publishing blocked if missing
3. ✅ **Regulations block enforced** - Publishing blocked if missing
4. ✅ **Practical steps enforced** - Publishing blocked if missing or insufficient
5. ✅ **Generator can't publish without elements** - All checks are blocking

---

## 📊 Quality Gate Summary

### Blocking Checks (Must Pass)

| Check | Location | Pattern | Blocking |
|-------|----------|---------|----------|
| CTA in Top Half | First 50% | `download tackle`, `tackle app`, etc. | ✅ YES |
| CTA Near End | Last 40% | `download tackle`, `tackle app`, etc. | ✅ YES |
| Regulations Block | Anywhere | `see local regulations`, etc. | ✅ YES |
| Practical Steps | Throughout | Numbered steps, instructions, etc. | ✅ YES |

### Warning Checks (Non-Blocking)

| Check | Pattern | Blocking |
|-------|---------|----------|
| Value Proposition | `real-time`, `AI fish ID`, etc. | ⚠️ WARNING |

---

## 🎯 Summary

Quality gate is now **fully tightened** for blog posts:

- ✅ CTA in top half (BLOCKING)
- ✅ CTA near end (BLOCKING)
- ✅ Regulations block (BLOCKING)
- ✅ Practical steps (BLOCKING)
- ✅ Generator cannot publish without these elements
- ✅ Clear error messages guide fixes

**The generator now enforces all required elements before publishing!**
