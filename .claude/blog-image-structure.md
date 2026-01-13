# Blog Post Image Structure

## Required: 4 Images Per Post (MINIMUM)

Every blog post MUST have images strategically placed to break up text and improve retention.

---

## Image Placement Map

```
┌─────────────────────────────────────────────────────────────────┐
│ HERO IMAGE (Auto-rendered at top from heroImage field)         │
│ • 1200x600px                                                    │
│ • Fishing action, species, or location                         │
└─────────────────────────────────────────────────────────────────┘

Section 1: Above the Fold
Section 2: Quick Answer

┌─────────────────────────────────────────────────────────────────┐
│ Section 3: Tackle Box Snapshot                                 │
│                                                                 │
│ [Lure list, weights, line setup, retrieve patterns...]         │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ IMAGE 1: TACKLE/GEAR PHOTO                              │   │
│ │ Shows: Lures, rigs, line, leader laid out               │   │
│ │ Caption: "This tackle setup covers all scenarios..."    │   │
│ └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Section 4: Step-by-Step (5 numbered steps)                     │
│                                                                 │
│ 1. Where to start                                              │
│ 2. First casts                                                 │
│ 3. Retrieve cadence                                            │
│ 4. Hookset and landing                                         │
│ 5. What to change                                              │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ IMAGE 2: ACTION/TECHNIQUE PHOTO                         │   │
│ │ Shows: Angler casting, fishing technique                │   │
│ │ Caption: "Cast parallel to structure..."                │   │
│ └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

Section 5: Decision Tree (if/then conditions)

┌─────────────────────────────────────────────────────────────────┐
│ Section 6: Spot Playbook                                       │
│                                                                 │
│ [Structure types, where fish stage, approach tips...]          │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ IMAGE 3: STRUCTURE/LOCATION PHOTO                       │   │
│ │ Shows: Mangroves, docks, bridges, habitat               │   │
│ │ Caption: "Target mangrove edges with 2-6 feet..."       │   │
│ └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────────────────────┐   │
│ │ IMAGE 4: CLOSEUP/DETAIL PHOTO (Optional)                │   │
│ │ Shows: Fish with lure, hook placement, knot detail      │   │
│ │ Caption: "Notice the hook placement..."                 │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│ Section 7: Mistakes That Kill the Bite                         │
└─────────────────────────────────────────────────────────────────┘

Section 8: App CTA
Section 9: FAQs
Section 10: 1-Minute Action Plan
Section 11: Next Steps
Section 12: Regulations
```

---

## Why This Structure Works

### Image 1: After Tackle Box (Section 3)
**Psychology**: Readers just read equipment list—now they see it visually
**Benefit**: Reinforces copyable setup, breaks text after list
**Retention**: Prevents bounce after dense equipment info

### Image 2: After Step-by-Step (Section 4)
**Psychology**: Technique explanation → visual demonstration
**Benefit**: Shows HOW to do what was just described
**Retention**: Long instructional text needs visual break

### Image 3: After Spot Playbook (Section 6)
**Psychology**: WHERE to fish explanation → visual context
**Benefit**: Reinforces structure behavior with habitat photo
**Retention**: Mid-post engagement boost, prevents drop-off

### Image 4: Before Mistakes (Section 7) - Optional
**Psychology**: Positive example before negative list
**Benefit**: Shows successful outcome, reinforces teaching
**Retention**: Extra visual for longest section

---

## Image Markdown Format

```markdown
![Alt text with species + location + action](https://images.unsplash.com/photo-ID?w=800&h=600&fit=crop)
*Caption with what you see + why it matters + when/how to apply it.*
```

### Examples:

```markdown
![Soft plastic jerkbaits and fishing tackle for snook](https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=800&h=600&fit=crop)
*This tackle setup covers all snook scenarios—soft plastics for mangroves, topwater for flats, and jigs for bridges.*
```

```markdown
![Angler casting parallel to mangrove shoreline for snook](https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=800&h=600&fit=crop)
*Cast parallel to structure, not directly at it—this keeps your lure in the strike zone longer.*
```

```markdown
![Mangrove shoreline with snook habitat in Florida](https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop)
*Target mangrove edges with 2-6 feet of water, undercut roots, and shade during incoming tide.*
```

---

## Quick Unsplash Photo IDs

Copy these into URLs: `https://images.unsplash.com/photo-[ID]?w=800&h=600&fit=crop`

- **Fishing action**: `1544552866-d3ed42536cfd`
- **Tackle/lures**: `1515023115689-589c33041d3c`
- **Mangroves**: `1559827260-dc66d52bef19`
- **Angler casting**: `1592329347327-27c7e288b5f6`
- **Fish closeup**: `1559827260-dc66d52bef19`
- **Boat fishing**: `1534943441045-1974ee2171e7`
- **Rods/reels**: `1544552866-d3ed42536cfd`

---

## Where NOT to Put Images

❌ Between Section 1 and 2 (delays quick answer)
❌ In the middle of numbered steps (breaks flow)
❌ Between FAQs (disrupts Q&A rhythm)
❌ Right before regulations (wrong tone)

---

## Caption Formula

**What you see** + **Why it matters** + **When/how to apply it**

❌ Bad: "Fishing lures"
✅ Good: "This lure profile works best in 2-4ft of water over grass flats"

❌ Bad: "Mangrove shoreline"
✅ Good: "Target the shaded pockets where mangrove roots meet the water during incoming tide"

---

## Testing Checklist

Before publishing, verify:
- [ ] Hero image shows at top
- [ ] 3-4 inline images placed correctly
- [ ] All images have alt text
- [ ] All images have italic captions
- [ ] Images use ?w=800&h=600&fit=crop
- [ ] Mobile: images stack properly
- [ ] No broken image links

---

**Last Updated**: 2026-01-13
