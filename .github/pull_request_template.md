# Pull Request: Content Quality Checklist

## Description
<!-- Briefly describe what this PR adds/changes -->

**Content Type:**
- [ ] Blog Post
- [ ] Species Guide
- [ ] Location Page
- [ ] How-To Guide
- [ ] Gear Review
- [ ] Other: ___________

**Related Issue:** #
**Content URL:** `/blog/[slug]` or other path

---

## Content Architecture

- [ ] **Cluster + Hub Assigned** - Content is part of a topic cluster with clear hub page
- [ ] **URL/Slug Follows Conventions** - Lowercase, hyphenated, keyword-rich
- [ ] **Frontmatter Complete** - All required JSON fields present (see `docs/CONTENT_ARCHITECTURE.md`)
- [ ] **No Orphan Content** - Has incoming links from related content or hub page
- [ ] **Internal Links Added** - Minimum 3-5 contextual internal links
- [ ] **Canonical URL Set** - Proper canonical tag included

---

## Author & E-E-A-T

- [ ] **Author Block Present** - Every post has author attribution
- [ ] **Author Profile Exists** - `/authors/[author-slug]` page is live
- [ ] **Author Matches Content** - Author has expertise in content topic
- [ ] **Experience Signals** - Content includes specific details, conditions, real-world context
- [ ] **Sources Cited** - Minimum 2 authoritative sources for factual claims
- [ ] **No Generic Language** - Avoids "passionate about fishing" and other generic phrases

---

## Images & Media

- [ ] **Required Images Included** - Minimum 4 images for blog posts (hero + 3 inline)
- [ ] **No Generic Stock Photos** - All images are fishing-specific and contextual
- [ ] **Hero Image Specs** - 1200x600px, WebP format, under 150KB
- [ ] **Inline Image Specs** - 800x600px, WebP format, under 100KB
- [ ] **All Images Have Alt Text** - Descriptive alt text with species + location + action
- [ ] **All Images Have Captions** - Actionable captions following "what + why + when/how" formula
- [ ] **Image Placement Correct** - Follows placement guide (after Tackle Box, Step-by-Step, Spot Playbook)
- [ ] **Image Sources Documented** - Metadata file created for custom images

---

## Content Quality

- [ ] **12-Section Structure** - Follows blog post structure (see `.claude/blog-content-guidelines.md`)
- [ ] **Quick Answer Section** - 3-6 bullets answering query upfront
- [ ] **"Do This First" Callout** - Single highest-leverage action highlighted
- [ ] **Decision Tree Included** - If/then conditional guidance present
- [ ] **Common Mistakes Section** - 5-10 bullets of mistakes to avoid
- [ ] **FAQs Included** - Minimum 5 FAQs with actionable answers
- [ ] **Word Count Met** - Minimum 1500 words (blog), 1200 (how-to), 2000 (location)
- [ ] **Readability Checked** - No paragraphs longer than 5 lines
- [ ] **No AI Slop Language** - Avoids "dive into", "unlock", "explore", etc.

---

## SEO & Metadata

- [ ] **Title Length** - 50-60 characters including primary keyword
- [ ] **Meta Description** - 140-155 characters with action + benefit
- [ ] **Primary Keyword in H1** - Primary keyword appears in title
- [ ] **Primary Keyword in Intro** - Keyword in first paragraph
- [ ] **H2/H3 Structure** - Proper heading hierarchy (minimum 4 H2 sections)
- [ ] **Secondary Keywords** - 3-5 secondary keywords used naturally
- [ ] **Schema Markup** - Article/FAQPage/Author schema included

---

## Legal & Safety

- [ ] **NO Specific Regulations** - No bag limits, size limits, or season dates
- [ ] **Regulations Link Present** - Generic "See local regulations" link included
- [ ] **No Legal Claims** - No "illegal to", "must have license", etc.
- [ ] **Disclaimer Included** - "Regulations change—always verify" present
- [ ] **No Medical/Safety Claims** - No health advice or unqualified safety claims
- [ ] **Affiliate Disclosures** - (If gear review) Affiliate relationships disclosed

---

## Conversion & CTAs

- [ ] **2 App CTAs Present** - One top half, one bottom half
- [ ] **CTAs Are Helpful** - Value-focused, not salesy
- [ ] **Related Content Block** - 3-5 contextual "next step" links included
- [ ] **Clear Next Action** - User knows what to do after reading

---

## Technical Validation

- [ ] **No Broken Links** - All internal and external links work
- [ ] **Mobile Preview** - Looks good on mobile devices
- [ ] **Images Load Properly** - All images display correctly
- [ ] **No TypeScript Errors** - Build completes without errors
- [ ] **Content Index Updated** - `content/_system/contentIndex.json` includes new content
- [ ] **Sitemap Generated** - New content appears in sitemap

---

## Gear Review Specific (if applicable)

- [ ] **Testing Documented** - Testing methodology section included
- [ ] **Disclosure at Top** - Affiliate/sponsorship disclosure present
- [ ] **Pros/Cons Format** - Structured pros/cons for each product
- [ ] **First-Hand Testing** - Author has actually used the gear
- [ ] **Price Transparency** - Current prices or price ranges shown
- [ ] **Comparison Table** - Side-by-side comparison included
- [ ] **Buying Guide Section** - What to look for guidance included

---

## Pre-Publish Final Checks

- [ ] **Ran Quality Gate** - `npm run pipeline:quality-gate -- --slug [slug]` passes
- [ ] **No Duplicate Content** - Checked against existing content for similarity
- [ ] **No Keyword Cannibalization** - Not targeting same keyword as existing post
- [ ] **Reviewed on Staging** - Preview deployed and reviewed
- [ ] **Team Approval** - At least one team member has reviewed

---

## Automated Validation Results

**Paste output from quality gate:**
```
# Run: npm run pipeline:quality-gate -- --slug [slug]
[Paste results here]
```

---

## Additional Notes
<!-- Any additional context, decisions made, or exceptions to guidelines -->

---

## Reviewer Checklist

**For the reviewer:**
- [ ] Content follows `.claude/blog-content-guidelines.md` structure
- [ ] Images meet standards in `docs/MEDIA_GUIDE.md`
- [ ] No violations of `docs/CONTENT-VALIDATION-RULES.md`
- [ ] Author attribution follows `docs/AUTHORS.md` requirements
- [ ] Content architecture follows `docs/CONTENT_ARCHITECTURE.md`

---

**Related Documentation:**
- **Content Guidelines:** `.claude/blog-content-guidelines.md`
- **Content Checklist:** `.claude/blog-checklist.md`
- **Editorial Standards:** `docs/EDITORIAL-STANDARDS.md`
- **Validation Rules:** `docs/CONTENT-VALIDATION-RULES.md`
- **Media Guide:** `docs/MEDIA_GUIDE.md`
- **Content Architecture:** `docs/CONTENT_ARCHITECTURE.md`
- **Authors:** `docs/AUTHORS.md`
