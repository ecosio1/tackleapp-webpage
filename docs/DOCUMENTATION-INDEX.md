# Documentation Index - Tackle Content System

## Purpose

This index provides a roadmap to all content documentation. Use this to quickly find the right guidelines for your task.

---

## Quick Reference

### For Content Creators

**Creating a blog post?**
1. Read `.claude/blog-content-guidelines.md` - 12-section structure
2. Check `.claude/blog-checklist.md` - Pre-publish checklist
3. Review `docs/EDITORIAL-STANDARDS.md` - Tone, voice, E-E-A-T

**Adding images?**
1. Read `docs/MEDIA_GUIDE.md` - Image specs and requirements
2. Check `.claude/blog-image-structure.md` - Placement guide

**Writing about gear?**
1. Read `docs/EDITORIAL-STANDARDS.md` Section G - Gear review standards
2. Use Template 2 in Section H - Gear review template

### For Developers

**Building content features?**
1. Read `docs/CONTENT-ARCHITECTURE.md` - URL structure, frontmatter schema
2. Read `docs/CONTENT-DATA-MODEL.md` - TypeScript types, database schema
3. Check `docs/CONTENT-VALIDATION-RULES.md` - Validation requirements

**Setting up authors?**
1. Read `docs/AUTHORS.md` - Author requirements and E-E-A-T
2. Review `components/blog/AuthorSection.tsx` - Author component

**Creating PRs?**
1. Use `.github/pull_request_template.md` - PR checklist

### For Automated Pipelines

**Publishing content?**
1. Validate against `docs/CONTENT-VALIDATION-RULES.md`
2. Run quality gates in `scripts/pipeline/quality-gate.ts`
3. Follow ingestion workflow in `docs/CONTENT-DATA-MODEL.md`

---

## Documentation Structure

### Content Guidelines (`.claude/` directory)

**These are the PRIMARY content creation guides:**

| File | Purpose | Use When |
|------|---------|----------|
| `.claude/blog-content-guidelines.md` | Complete 12-section blog post structure, retention best practices | Writing any blog post |
| `.claude/blog-checklist.md` | Quick pre-publish verification checklist | Final QA before publishing |
| `.claude/blog-image-structure.md` | Detailed image placement guide with visual map | Placing images in posts |

### Technical Documentation (`docs/` directory)

**These are for architecture, standards, and system design:**

| File | Purpose | Use When |
|------|---------|----------|
| `docs/CONTENT-ARCHITECTURE.md` | URL structure, frontmatter schema, internal linking, anti-patterns | Building content features, organizing content |
| `docs/CONTENT-VALIDATION-RULES.md` | Non-negotiable validation rules (regulations, CTAs, etc.) | Validating content before publish |
| `docs/CONTENT-DATA-MODEL.md` | TypeScript types, storage strategy, ingestion workflow | Implementing storage, pipelines |
| `docs/EDITORIAL-STANDARDS.md` | Tone, voice, E-E-A-T, automation guardrails, gear reviews, templates | Understanding editorial policy |
| `docs/MEDIA_GUIDE.md` | Image specifications, naming, compression, sources | Managing images and media |
| `docs/AUTHORS.md` | Author requirements, E-E-A-T enforcement, profile templates | Creating author profiles |
| `docs/DONE-DONE-CHECKLIST.md` | System verification checklist | Verifying blog system works end-to-end |

### Process Documentation

| File | Purpose | Use When |
|------|---------|----------|
| `.github/pull_request_template.md` | PR checklist for content quality | Creating content PRs |
| `docs/BLOG-GENERATION-WORKFLOW.md` | Pipeline workflow documentation | Understanding content generation |
| `docs/AUTOMATED-CONTENT-PIPELINE.md` | Complete pipeline architecture | Building/maintaining pipeline |

---

## Content Creation Workflow

### Step 1: Plan
1. Define topic and keyword (check for duplicates)
2. Identify hub page for topic cluster
3. Assign appropriate author
4. Review `docs/CONTENT-ARCHITECTURE.md` for URL/slug rules

### Step 2: Research
1. Gather 2+ authoritative sources
2. Extract facts (don't copy verbatim)
3. Document source URLs and retrieved dates

### Step 3: Write
1. Follow `.claude/blog-content-guidelines.md` structure (12 sections)
2. Apply tone/voice from `docs/EDITORIAL-STANDARDS.md`
3. Include 3-5 internal links
4. Add 2 app CTAs
5. Write 5+ FAQs
6. Add "See local regulations" link (NO specific regulations)

### Step 4: Add Images
1. Select 4+ images from approved sources (`docs/MEDIA_GUIDE.md`)
2. Optimize to specs (WebP, 150KB/100KB limits)
3. Write descriptive alt text (species + location + action)
4. Write actionable captions (what + why + when/how)
5. Place according to `.claude/blog-image-structure.md`

### Step 5: Add Author
1. Assign author following `docs/AUTHORS.md` rules
2. Ensure author profile exists at `/authors/[slug]`
3. Include author block in post

### Step 6: Validate
1. Run through `.claude/blog-checklist.md`
2. Validate against `docs/CONTENT-VALIDATION-RULES.md`
3. Run `npm run pipeline:quality-gate -- --slug [slug]`
4. Fix any errors

### Step 7: Publish
1. Write JSON to `content/blog/[slug].json`
2. Update `content/_system/contentIndex.json`
3. Create PR using `.github/pull_request_template.md`
4. Get review
5. Merge and deploy

---

## Key Policies (Non-Negotiable)

### 🚫 Regulations Policy
**NEVER include:**
- Specific bag limits ("5 fish per day")
- Specific size limits ("18-27 inches")
- Specific seasons ("closed June-August")
- Legal claims ("illegal to...", "must have license")

**ALWAYS include:**
- Generic "See local regulations" link to official source
- Disclaimer: "Regulations change—always verify with official sources"

**Why:** Regulations change frequently and vary by location. Legal liability if wrong.

**Reference:** `docs/CONTENT-VALIDATION-RULES.md` Rule 5

---

### ✅ App CTA Policy
**ALWAYS include:**
- Minimum 2 app CTAs per post
- Value proposition (not just "download our app")
- Link to `/download` or app stores

**Why:** Blog exists to drive app downloads. Every post must convert.

**Reference:** `docs/CONTENT-VALIDATION-RULES.md` Rule 4

---

### 📸 Image Policy
**ALWAYS include:**
- Minimum 4 images per blog post
- Hero image (1200x600px) at top
- 3 inline images (800x600px) at strategic points
- Descriptive alt text and actionable captions

**NEVER use:**
- Generic stock photos (business people, unrelated scenes)
- Images without alt text
- Images without captions

**Why:** Posts without images have 40% higher bounce rates.

**Reference:** `docs/MEDIA_GUIDE.md`, `.claude/blog-image-structure.md`

---

### 👤 Author Policy
**ALWAYS include:**
- Author attribution on every post
- Author profile page at `/authors/[slug]`
- Experience signals in content

**NEVER:**
- Publish without author
- Use pseudonyms or fake authors
- Generic bios ("passionate about fishing")

**Why:** E-E-A-T (Google's quality guidelines) requires real authorship.

**Reference:** `docs/AUTHORS.md`

---

## Templates

### Content Templates

**How-To Article Template:**
- Location: `docs/EDITORIAL-STANDARDS.md` Section H, Template 1
- Use for: Technique guides, step-by-step instructions

**Gear Review Template:**
- Location: `docs/EDITORIAL-STANDARDS.md` Section H, Template 2
- Use for: Product reviews, buyer's guides, gear comparisons

### Schema Templates

**Blog Post JSON:**
- Location: `docs/CONTENT-ARCHITECTURE.md` Section: Content Types & Frontmatter
- Use for: Creating blog post JSON files

**Author Profile JSON:**
- Location: `docs/AUTHORS.md` Section: Author Profile Requirements
- Use for: Creating author data

---

## Validation Tools

### Automated Checks

**Quality Gate:**
```bash
npm run pipeline:quality-gate -- --slug [slug]
```
Checks:
- Word count (min 1500)
- Image count (min 4)
- Internal links (min 3)
- App CTAs (min 1)
- No regulation specifics
- Sources cited (min 2)

**Verification Script:**
```bash
npm run pipeline:verify-done
```
Verifies end-to-end system works.

### Manual Checks

**Pre-Publish Checklist:**
- `.claude/blog-checklist.md` - Quick checklist format
- `.github/pull_request_template.md` - PR template with all checks

---

## Common Questions

### Q: Which doc do I read first?
**A:** For content creation, start with `.claude/blog-content-guidelines.md`

### Q: Where are the gear review standards?
**A:** `docs/EDITORIAL-STANDARDS.md` Section G + Template in Section H

### Q: How do I handle images?
**A:** Primary guide: `docs/MEDIA_GUIDE.md`, Placement guide: `.claude/blog-image-structure.md`

### Q: What about regulations pages?
**A:** We do NOT publish regulations pages. Only generic links to official sources. See `docs/CONTENT-VALIDATION-RULES.md` Rule 5.

### Q: Can I skip the author block?
**A:** No. Every post must have an author. See `docs/AUTHORS.md`.

### Q: What if I can't meet the 4-image minimum?
**A:** You must meet it. Posts without images have 40% higher bounce rates. Use Unsplash if needed.

### Q: How do I know if my slug is good?
**A:** Check `docs/CONTENT-ARCHITECTURE.md` Section: URL Structure & Conventions

### Q: What's the difference between blog-content-guidelines.md and EDITORIAL-STANDARDS.md?
**A:**
- **blog-content-guidelines.md** = How to write a blog post (structure, sections, flow)
- **EDITORIAL-STANDARDS.md** = Editorial policy (tone, voice, E-E-A-T, automation rules)

---

## Related Systems

**Blog System:**
- File-driven (JSON files in `content/blog/`)
- Index at `content/_system/contentIndex.json`
- Components in `components/blog/`
- Pages in `app/blog/`

**Pipeline:**
- Generation scripts in `scripts/pipeline/`
- Quality gates in `scripts/pipeline/quality-gate.ts`
- Publisher in `scripts/pipeline/publisher.ts`

**Images:**
- Stored in `public/images/`
- Organized by purpose (posts/, hubs/, diagrams/)
- See `public/images/README.md`

---

## Getting Help

**For content questions:**
- Check this index first
- Read the specific doc for your task
- Ask team lead if still unclear

**For technical questions:**
- Check `docs/CONTENT-ARCHITECTURE.md`
- Review `docs/CONTENT-DATA-MODEL.md`
- Check pipeline scripts in `scripts/pipeline/`

**For validation errors:**
- Review `docs/CONTENT-VALIDATION-RULES.md`
- Run quality gate: `npm run pipeline:quality-gate -- --slug [slug]`
- Check `.claude/blog-checklist.md`

---

**Last Updated:** 2026-01-14
**Maintained by:** Tackle Engineering Team
