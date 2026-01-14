# Author Guidelines - E-E-A-T Compliance

## Purpose

Every piece of content MUST have proper authorship for E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) compliance. This document defines author requirements, profile standards, and content matching rules.

---

## Core Policy

### Non-Negotiable Rules

1. **Every post must have an author** - No exceptions
2. **Author must have a profile page** - `/authors/[author-slug]`
3. **Author must have demonstrable experience** - Real credentials, not generic
4. **Author bio must be specific** - No generic "passionate about fishing"
5. **Author must match content** - Don't assign random authors to content

---

## Standard Author: Tackle Fishing Team

### Default Author Profile

**Name:** Tackle Fishing Team
**URL:** `/authors/tackle-fishing-team`
**Bio:** "The Tackle Fishing Team is a collective of anglers, data scientists, and fishing enthusiasts dedicated to making fishing more accessible and successful for everyone."

**Use Cases:**
- Automated content generation
- General fishing guides
- Location pages
- Species pages
- How-to guides

### Experience Signals to Include

When content is authored by "Tackle Fishing Team", include these trust signals in the content:

**✅ Real-World Context:**
- "In shallow Florida flats, redfish often..."
- "During incoming tides at Key West..."
- "On calm mornings in Tampa Bay..."

**✅ Specific Details:**
- Exact depths (2-6 feet)
- Specific lure weights (1/4 oz)
- Tackle specifications (10-20lb braid)
- Time frames (last 2 hours of incoming tide)

**✅ Conditional Guidance:**
- "If water is clear → X"
- "If wind picks up → Y"
- "When bait is present → Z"

**❌ Generic Statements:**
- "Redfish can be found in shallow water"
- "Use the right tackle"
- "Fish during good conditions"

---

## Author Profile Requirements

### Required Fields

```json
{
  "name": "Author Full Name or Team Name",
  "slug": "author-slug",
  "url": "/authors/author-slug",
  "image": "/images/authors/author-slug.jpg",
  "bio": "2-3 sentence bio describing fishing experience and expertise",
  "experience": [
    "20+ years fishing Florida inshore waters",
    "Specializes in snook and redfish",
    "Former fishing guide in Tampa Bay"
  ],
  "region": "Florida",
  "specialties": ["Inshore Fishing", "Snook", "Redfish", "Tampa Bay"],
  "contact": {
    "email": "author@tackleapp.ai",
    "website": "https://tackleapp.ai"
  },
  "social": {
    "twitter": "@tacklefishing",
    "instagram": "@tacklefishing"
  }
}
```

### Optional Fields

```json
{
  "credentials": [
    "USCG Licensed Captain",
    "Florida Fishing Guide License #12345"
  ],
  "affiliations": [
    "Florida Guides Association",
    "Coastal Conservation Association"
  ],
  "publications": [
    "Contributing writer for Salt Water Sportsman",
    "Featured in Florida Sportsman Magazine"
  ],
  "disclaimer": "Author is an advisor to Tackle App Inc."
}
```

---

## Author Profile Page Template

### File Location
`app/authors/[author-slug]/page.tsx`

### Required Sections

**1. Author Header**
- Name
- Profile image (circular, 200x200px)
- Short bio (1-2 sentences)
- Location/region
- Social links

**2. Experience Section**
- Years of experience
- Specific expertise areas
- Geographic focus
- Species specialization

**3. Approach/Philosophy**
- What the author believes about fishing
- Teaching style
- Unique perspective

**4. Credentials (if applicable)**
- Licenses
- Certifications
- Affiliations
- Publications

**5. Recent Articles**
- List of recent posts by this author
- Sorted by publish date

**6. Disclaimers**
- "Content for educational purposes only"
- "Always verify regulations with official sources"
- Any affiliate relationships

### Example Author Page

```tsx
// app/authors/tackle-fishing-team/page.tsx

import { AuthorHeader } from '@/components/authors/AuthorHeader';
import { AuthorBio } from '@/components/authors/AuthorBio';
import { RecentArticles } from '@/components/authors/RecentArticles';

export default function TackleFishingTeamPage() {
  const author = {
    name: "Tackle Fishing Team",
    slug: "tackle-fishing-team",
    image: "/logo.png",
    bio: "Built by anglers using data-driven fishing insights and real-world experience.",
    experience: [
      "Decades of combined fishing experience in Florida and beyond",
      "Data-driven insights from weather, tides, and fishing patterns",
      "Real-world testing and feedback from anglers",
      "Continuous learning from the fishing community"
    ],
    region: "Florida & Beyond",
    specialties: ["Inshore Fishing", "Species Guides", "Location Tips"],
  };

  return (
    <main className="container mx-auto px-4 py-12">
      <AuthorHeader author={author} />

      <section className="my-12">
        <h2 className="text-2xl font-bold mb-4">Experience</h2>
        <ul className="space-y-2">
          {author.experience.map((exp, i) => (
            <li key={i} className="flex items-start gap-2">
              <span>✓</span>
              <span>{exp}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="my-12">
        <h2 className="text-2xl font-bold mb-4">Approach</h2>
        <div className="prose max-w-none">
          <p><strong>Transparency:</strong> Clear about data sources and AI usage</p>
          <p><strong>Accuracy:</strong> Fact-checked information with proper citations</p>
          <p><strong>Helpfulness:</strong> Focused on solving real angler problems</p>
          <p><strong>Education:</strong> Empowering anglers with knowledge, not hype</p>
        </div>
      </section>

      <section className="my-12">
        <h2 className="text-2xl font-bold mb-4">Disclaimer</h2>
        <p className="text-sm text-muted-foreground">
          Content published by Tackle Fishing Team is for educational purposes only.
          We are not a regulatory authority and do not provide legal or regulatory advice.
          Always verify fishing regulations with official state sources.
        </p>
      </section>

      <section className="my-12">
        <h2 className="text-2xl font-bold mb-4">Recent Articles</h2>
        <RecentArticles authorSlug="tackle-fishing-team" limit={10} />
      </section>
    </main>
  );
}
```

---

## Matching Authors to Content

### Assignment Rules

**DO Match:**
- ✅ Florida guide → Florida location content
- ✅ Snook specialist → Snook fishing posts
- ✅ Inshore expert → Inshore technique guides
- ✅ Tackle Team → General/automated content

**DON'T Match:**
- ❌ Saltwater guide → Freshwater bass fishing
- ❌ Florida expert → Texas fishing content (unless they have Texas experience)
- ❌ Equipment reviewer → Location guides (unless they also fish that area)

### Content Type Author Requirements

**Blog Posts (General):**
- Tackle Fishing Team (default)
- Or specialist author if highly specific topic

**Species Pages:**
- Tackle Fishing Team (covers all species)
- Or specialist who targets that species

**Location Pages:**
- Tackle Fishing Team (covers all locations)
- Or local guide/expert for that specific area

**How-To Guides:**
- Tackle Fishing Team (general techniques)
- Or technique specialist

**Gear Reviews:**
- Must be someone who has actually used the gear
- Must disclose any sponsorships/affiliations

---

## Author Schema Markup

### JSON-LD Schema

Every author page must include:

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Tackle Fishing Team",
  "url": "https://tackleapp.ai/authors/tackle-fishing-team",
  "description": "Built by anglers using data-driven fishing insights and real-world experience.",
  "sameAs": [
    "https://tackleapp.ai/about"
  ],
  "knowsAbout": [
    "Fishing",
    "Inshore Fishing",
    "Florida Fishing",
    "Species Identification",
    "Fishing Techniques"
  ],
  "affiliation": {
    "@type": "Organization",
    "name": "Tackle App",
    "url": "https://tackleapp.ai"
  }
}
```

### Blog Post Author Schema

Every blog post must include author in Article schema:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Best Snook Lures for Florida",
  "author": {
    "@type": "Person",
    "name": "Tackle Fishing Team",
    "url": "https://tackleapp.ai/authors/tackle-fishing-team"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Tackle App",
    "logo": {
      "@type": "ImageObject",
      "url": "https://tackleapp.ai/logo.png"
    }
  }
}
```

---

## Guest Author Guidelines (Future)

If you add guest authors in the future:

### Requirements

1. **Real person with verifiable identity**
   - Full legal name (no pseudonyms)
   - Real photo
   - Verifiable credentials

2. **Demonstrable fishing experience**
   - Years of experience
   - Geographic areas fished
   - Species expertise
   - Licenses/certifications

3. **Content expertise match**
   - Author must have direct experience with content topic
   - No generic assignment of authors

4. **Disclosure of affiliations**
   - Any sponsorships
   - Any gear companies they work with
   - Any guide services they operate
   - Any financial relationships

5. **Signed contributor agreement**
   - Rights to publish content
   - Accuracy attestation
   - Disclosure commitments

### Guest Author Profile Template

```markdown
# [Author Name]

## Bio

[2-3 sentences about fishing experience and expertise]

## Experience

- [Years of experience and specialty]
- [Geographic focus]
- [Species expertise]

## Credentials

- [License/certification 1]
- [License/certification 2]
- [Affiliation 1]

## Approach

[What makes this author's perspective unique]

## Disclosures

- [Any sponsorships]
- [Any affiliations]
- [Any financial relationships]

## Contact

- Email: [email]
- Website: [website]
- Instagram: [@handle]
```

---

## Author Component Integration

### Blog Post Author Section

**Component:** `components/blog/AuthorSection.tsx` (already exists)

**Usage:**
```tsx
import { AuthorSection } from '@/components/blog/AuthorSection';

// In blog post page
<AuthorSection
  author={{
    name: post.author.name,
    url: post.author.url,
    image: post.author.image,
    bio: post.author.bio,
  }}
/>
```

**Placement:**
- After introduction
- Before related content section
- Or in sidebar (for wide layouts)

---

## Author Quality Checklist

Before publishing content with an author:

- [ ] Author has profile page at `/authors/[slug]`
- [ ] Profile includes name, bio, experience
- [ ] Profile includes author photo
- [ ] Bio is specific, not generic
- [ ] Experience signals are included in bio
- [ ] Author matches content topic
- [ ] Author schema markup included
- [ ] Post links to author profile
- [ ] Disclosures included (if applicable)
- [ ] No pseudonyms or fake authors
- [ ] Contact information provided

---

## E-E-A-T Best Practices

### Experience Signals

**In Content:**
- Use first-person plural ("we've found that...")
- Include specific anecdotes
- Reference real locations
- Cite actual conditions

**In Author Bio:**
- Years of experience
- Specific geographic areas
- Target species
- Techniques mastered

### Expertise Signals

**In Content:**
- Technical terminology used correctly
- Detailed instructions
- Conditional guidance
- Troubleshooting tips

**In Author Bio:**
- Credentials listed
- Publications mentioned
- Affiliations noted

### Authoritativeness Signals

**In Content:**
- Cite authoritative sources
- Link to official regulations
- Reference scientific data
- Acknowledge limitations

**In Author Bio:**
- Professional licenses
- Industry recognition
- Published works
- Speaking engagements

### Trustworthiness Signals

**In Content:**
- Transparent about limitations
- Disclose affiliations
- Link to sources
- Update dates shown

**In Author Bio:**
- Real person/team
- Contact information
- Verifiable credentials
- Honest disclaimers

---

## Validation & Enforcement

### Automated Checks

Pipeline validation must check:
- [ ] Author field is present in JSON
- [ ] Author name is not empty
- [ ] Author URL is valid path
- [ ] Author profile page exists

### Manual Review

Before publishing:
- [ ] Author bio is appropriate for content
- [ ] Experience signals are present
- [ ] No generic "passionate about fishing" language
- [ ] Credentials are accurate

---

## Related Documentation

- **Editorial Standards:** `docs/EDITORIAL-STANDARDS.md` - E-E-A-T implementation
- **Content Guidelines:** `.claude/blog-content-guidelines.md` - Content structure
- **Content Architecture:** `docs/CONTENT_ARCHITECTURE.md` - Author frontmatter schema

---

**Last Updated:** 2026-01-14
**Status:** Production-ready
