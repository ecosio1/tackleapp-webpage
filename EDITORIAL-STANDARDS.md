# Editorial Standards - Tackle Content Guidelines

## A) Editorial Standards (Hard Requirements)

### 1. Tone & Voice

**Required Tone:**
- **Clear:** Easy to understand, no jargon without explanation
- **Instructional:** Step-by-step guidance, actionable advice
- **Calm:** No urgency, no pressure, no hype
- **Confident:** Authoritative but not arrogant
- **Helpful:** Focus on solving angler problems

**Target Audience:**
- **Primary:** Beginners and intermediate anglers
- **Secondary:** Advanced anglers seeking specific information
- **Always:** Assume reader may be new to fishing

**Tone Examples:**

✅ **Good:**
- "Redfish are commonly found in shallow inshore waters during incoming tides."
- "Many anglers find success using live shrimp or soft plastic lures."
- "In Florida, redfish can be caught year-round, though fall and winter often provide the best conditions."

❌ **Bad:**
- "ULTIMATE SECRET to catching redfish!" (hype)
- "Guaranteed to catch redfish every time!" (false promise)
- "You MUST use this technique!" (too aggressive)

---

### 2. Structure Requirements (Every Page)

**Required Elements:**

1. **Introductory Paragraph**
   - Summarizes the answer/topic in 2-3 sentences
   - Includes primary keyword naturally
   - Sets expectations for what reader will learn

2. **Table of Contents (Auto-Generated)**
   - Generated from H2/H3 headings
   - Links to sections
   - Helps with navigation and SEO

3. **Scannable H2/H3 Sections**
   - Minimum 4 H2 sections
   - Use H3 for subsections
   - Clear, descriptive headings
   - Each section should be 200-400 words

4. **Practical Content**
   - Step-by-step instructions (for how-to)
   - Specific examples (for species/locations)
   - Actionable tips
   - Real-world context

5. **FAQs (5-8 Questions)**
   - Address common questions
   - Use natural language
   - Provide helpful answers
   - Include in FAQPage schema

6. **Clear CTA to Tackle App**
   - At least one CTA per page
   - Natural placement (not intrusive)
   - Value-focused messaging

7. **"Last Updated" Date**
   - Visible on every page
   - Uses `updatedAt` from content doc
   - Shows content freshness

**Structure Template:**

```markdown
# [Title]

[Intro paragraph - 2-3 sentences summarizing the topic]

## Table of Contents
- [Section 1](#section-1)
- [Section 2](#section-2)
- [Section 3](#section-3)

## [Section 1]
[Content - 200-400 words]

## [Section 2]
[Content - 200-400 words]

## [Section 3]
[Content - 200-400 words]

## Frequently Asked Questions
[5-8 FAQs]

## What to Do Next
[CTA to /download]

## Sources Consulted
[Source citations]
```

---

### 3. Language Rules

#### Words/Phrases to AVOID:

**Hype/Clickbait:**
- "ultimate"
- "secret"
- "guaranteed"
- "must-see"
- "you won't believe"
- "insane"
- "amazing trick"

**Legal/Regulatory:**
- "official regulations" (unless linking to official source)
- "legal advice"
- "always legal"
- "guaranteed legal"

**Over-Promising:**
- "guaranteed to catch"
- "always works"
- "never fails"
- "100% success rate"

#### Words/Phrases to PREFER:

**Hedging Language:**
- "generally"
- "often"
- "in many conditions"
- "typically"
- "commonly"
- "usually"
- "may"
- "can"

**Helpful Language:**
- "consider"
- "try"
- "experiment with"
- "many anglers find"
- "some anglers prefer"

**Examples:**

✅ **Good:**
- "Redfish are generally more active during incoming tides."
- "Many anglers find success using live shrimp."
- "In Florida, redfish can typically be caught year-round."

❌ **Bad:**
- "Redfish are ALWAYS active during incoming tides."
- "You MUST use live shrimp to catch redfish."
- "Redfish are GUARANTEED to be caught year-round in Florida."

---

### 4. Content Quality Checklist

**Every page must:**

- [ ] Have clear, descriptive title (50-60 characters)
- [ ] Include intro paragraph summarizing topic
- [ ] Have minimum word count (blog: 900, species: 1200, how-to: 1200, location: 1000)
- [ ] Include minimum 4 H2 sections
- [ ] Include 5-8 FAQs
- [ ] Include at least 3 internal links
- [ ] Include "Last updated" date
- [ ] Include author attribution
- [ ] Include sources (minimum 2 for factual claims)
- [ ] Include CTA to /download
- [ ] Use natural, varied sentence structure
- [ ] Avoid forbidden phrases
- [ ] Use hedging language appropriately
- [ ] Include practical, actionable advice

---

## B) E-E-A-T Signals Implementation

### 1. Author Identity

**Standard Author:**
- **Name:** "Tackle Fishing Team"
- **Bio:** "Built by anglers using data-driven fishing insights and real-world experience."
- **URL:** `/authors/tackle-fishing-team`

**Implementation:**
- Every page includes author in metadata
- Author schema on every page
- Link to author bio page
- Consistent attribution across all content

**Author Schema:**
```json
{
  "@type": "Person",
  "name": "Tackle Fishing Team",
  "url": "https://tackleapp.ai/authors/tackle-fishing-team"
}
```

---

### 2. About Page Blueprint

**File:** `app/about/page.tsx`

**Content Structure:**

**H1:** "About Tackle"

**Section 1: Our Mission**
- Explain what Tackle is
- Who it's for (anglers of all levels)
- What problem it solves

**Section 2: How We Generate Fishing Insights**
- Weather data integration
- Tide and solunar data
- Seasonal pattern analysis
- AI summarization (transparent)
- Real-world angler feedback

**Section 3: What Tackle Is (and Isn't)**
- ✅ What it is: Educational tool, fishing assistant, conditions tracker
- ❌ What it isn't: Official regulations source, guaranteed catch tool, legal advice

**Section 4: Data & AI Transparency**
- How data is collected
- How AI is used (summarization, not generation from scratch)
- Source attribution
- Update frequency

**Section 5: Contact & Feedback**
- Link to contact page
- Feedback mechanism
- Community engagement

**Disclaimers:**
- "Tackle provides educational information only. Always verify regulations with official sources."
- "Fishing conditions are estimates based on available data. Actual conditions may vary."

---

### 3. Experience Signals

**Language Patterns:**

**Real-World Context:**
- "In shallow Florida flats, redfish often..."
- "On calm mornings in Tampa Bay..."
- "During incoming tides at Key West..."

**Contextual Details:**
- Wind conditions
- Water clarity
- Structure types
- Time of day
- Seasonal patterns

**Examples:**

✅ **Good (Experience Signal):**
- "In shallow Florida flats, redfish often feed along grass edges during incoming tides. On calm mornings, you can spot their tails in 2-3 feet of water."

❌ **Bad (Generic):**
- "Redfish can be found in shallow water. They feed during tides."

---

### 4. Trust Signals

**Required Elements:**

1. **Contact Page** (`/contact`)
   - Email address
   - Contact form
   - Response time commitment

2. **Privacy Policy** (`/privacy`)
   - Data collection
   - Usage policies
   - User rights

3. **Terms of Service** (`/terms`)
   - Usage terms
   - Disclaimers
   - Liability

4. **Brand Consistency**
   - Logo in header/footer
   - Consistent branding
   - Professional design

5. **Transparency**
   - About page
   - Author pages
   - Source citations

---

## C) Automation Guardrails (Non-Negotiable)

### 1. AI Pattern Detection

**Heuristic Checks:**

**Sentence Structure Variance:**
- Calculate average sentence length
- Check for repetitive patterns
- Require variance > 20%

**Lexical Diversity:**
- Calculate unique word ratio
- Require > 0.3 (30% unique words)
- Check for overuse of synonyms

**Paragraph Length Variance:**
- Check paragraph length distribution
- Reject if too uniform (all same length)

**Implementation:**
```typescript
function detectAIPatterns(content: string): {
  hasRepetitiveStructure: boolean;
  lowLexicalDiversity: boolean;
  uniformParagraphs: boolean;
} {
  // Check sentence length variance
  const sentences = content.split(/[.!?]+/);
  const lengths = sentences.map(s => s.split(/\s+/).length);
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
  const hasRepetitiveStructure = variance < (avgLength * 0.2);
  
  // Check lexical diversity
  const words = content.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  const lexicalDiversity = uniqueWords.size / words.length;
  const lowLexicalDiversity = lexicalDiversity < 0.3;
  
  // Check paragraph uniformity
  const paragraphs = content.split(/\n\n/);
  const paraLengths = paragraphs.map(p => p.split(/\s+/).length);
  const uniformParagraphs = new Set(paraLengths).size < 3;
  
  return {
    hasRepetitiveStructure,
    lowLexicalDiversity,
    uniformParagraphs,
  };
}
```

**Blocking Rules:**
- If `hasRepetitiveStructure` → REJECT
- If `lowLexicalDiversity` → REJECT
- If `uniformParagraphs` → REJECT

---

### 2. Duplication Protection

**Similarity Threshold:**
- Content similarity > 85% → REJECT
- Topic Key already exists → REJECT (unless updating)

**Implementation:**
- Use embedding similarity (from Step 4)
- Check Topic Index before publishing
- Compare against existing content hashes

---

### 3. Thin Content Protection

**Hard Requirements:**

**Word Count:**
- Blog: Minimum 900 words
- Species: Minimum 1200 words
- How-to: Minimum 1200 words
- Location: Minimum 1000 words

**H2 Sections:**
- Minimum 4 H2 sections
- Each section minimum 200 words

**Internal Links:**
- Blog: Minimum 3 links
- Species/How-to/Location: Minimum 6 links

**Blocking Rules:**
- If word count < minimum → REJECT
- If H2 count < 4 → REJECT
- If internal links < minimum → REJECT

---

### 4. Source Integrity

**Requirements:**

**Minimum Sources:**
- Seasonal patterns: 2+ sources
- Behavioral claims: 2+ sources
- Habitat information: 1+ source
- Size/biology: 1+ source

**Source Quality:**
- Must be relevant to claim
- Must be high-authority (NOAA, FWC, etc.)
- Must have retrieved date
- No source dumping (only cite what's used)

**Blocking Rules:**
- If seasonal content and sources < 2 → REJECT
- If behavioral claims and sources < 2 → REJECT
- If sources are irrelevant → REJECT

---

## D) Author + About Pages Blueprint

### 1. About Page (`/about`)

**File:** `app/about/page.tsx`

**Content:**

```markdown
# About Tackle

## Our Mission

Tackle is an AI-powered fishing assistant designed to help anglers of all levels catch more fish and enjoy their time on the water. We combine real-time weather data, tide information, and fishing insights to provide personalized recommendations for your location and target species.

## How We Generate Fishing Insights

Tackle uses multiple data sources to provide accurate fishing conditions and advice:

- **Weather Data:** Real-time weather conditions from NOAA and other trusted sources
- **Tide Information:** Tide predictions and solunar data for optimal fishing times
- **Seasonal Patterns:** Historical data and angler-reported patterns
- **AI Summarization:** Our AI helps organize and present information clearly, but all insights are based on real data and fishing knowledge
- **Angler Feedback:** Real-world experience from Florida anglers informs our recommendations

## What Tackle Is (and Isn't)

### What Tackle Is:
- ✅ An educational fishing tool
- ✅ A conditions and forecast assistant
- ✅ A fish identification aid
- ✅ A catch logging and tracking system
- ✅ A source of fishing tips and techniques

### What Tackle Isn't:
- ❌ An official regulations source (always verify with state agencies)
- ❌ A guaranteed catch tool (fishing success varies)
- ❌ Legal or regulatory advice
- ❌ A replacement for local knowledge and experience

## Data & AI Transparency

**How We Use Data:**
- Weather and tide data from public sources (NOAA, etc.)
- Species information from scientific databases
- Fishing patterns from aggregated angler data
- AI is used to organize and present information, not to generate facts

**Source Attribution:**
- All factual claims are sourced
- Sources are cited on every page
- We never copy content verbatim from sources

**Update Frequency:**
- Conditions: Updated daily
- Species pages: Reviewed every 6-12 months
- Location pages: Reviewed every 3-6 months
- Blog posts: Updated as needed

## Contact & Feedback

Have questions or feedback? [Contact us](/contact).

Want to learn more? [See how Tackle works](/how-it-works).

## Disclaimers

- Tackle provides educational information only. Always verify regulations with official sources.
- Fishing conditions are estimates based on available data. Actual conditions may vary.
- Fishing success depends on many factors beyond conditions. No guarantees are made.
```

---

### 2. Author Page (`/authors/tackle-fishing-team`)

**File:** `app/authors/tackle-fishing-team/page.tsx`

**Content:**

```markdown
# Tackle Fishing Team

## About

The Tackle Fishing Team is a collective of anglers, data scientists, and fishing enthusiasts dedicated to making fishing more accessible and successful for everyone.

## Experience

Our team combines:
- Decades of combined fishing experience in Florida and beyond
- Data-driven insights from weather, tides, and fishing patterns
- Real-world testing and feedback from anglers
- Continuous learning from the fishing community

## Approach

We believe in:
- **Transparency:** Clear about data sources and AI usage
- **Accuracy:** Fact-checked information with proper citations
- **Helpfulness:** Focused on solving real angler problems
- **Education:** Empowering anglers with knowledge, not hype

## Disclaimer

Content published by Tackle Fishing Team is for educational purposes only. We are not a regulatory authority and do not provide legal or regulatory advice. Always verify fishing regulations with official state sources.

## Contact

Questions or feedback? [Contact us](/contact).
```

**Schema:**
```json
{
  "@type": "Person",
  "name": "Tackle Fishing Team",
  "description": "Built by anglers using data-driven fishing insights and real-world experience.",
  "url": "https://tackleapp.ai/authors/tackle-fishing-team",
  "sameAs": [
    "https://tackleapp.ai/about"
  ]
}
```

---

### 3. Guest Authors (Future)

**Requirements:**
- Real name (no pseudonyms)
- Bio with fishing experience
- Expertise description
- Contact information
- Disclosure of any affiliations

**Template:**
```markdown
# [Author Name]

## Bio

[2-3 sentences about fishing experience and expertise]

## Expertise

- [Area 1]
- [Area 2]
- [Area 3]

## Contact

[Email or contact method]
```

---

## E) Citations & Sources Strategy

### Rules

1. **Sources are Informational, Not Copied**
   - Extract facts only
   - Never copy text verbatim
   - Create original explanations

2. **Source Requirements**
   - Must be relevant to content
   - Must be high-authority (NOAA, FWC, scientific sources)
   - Must have retrieved date
   - Must be cited where used

3. **Source Format**

**Standard Format:**
```
[Label] – [Brief description] (retrieved [Month Year])
```

**Examples:**
- "NOAA Fisheries – General species behavior overview (retrieved Jan 2024)"
- "Florida Fish and Wildlife Conservation Commission – Habitat information (retrieved Jan 2024)"
- "NOAA Tides & Currents – Tide prediction data (retrieved Jan 2024)"

4. **Source Placement**

**On Every Page:**
- "Sources Consulted" section near bottom
- Before FAQs or after main content
- List all sources used
- No long quotes, just citations

**Example Section:**
```markdown
## Sources Consulted

The following sources were consulted in creating this guide:

- NOAA Fisheries – Species biology and habitat information (retrieved Jan 2024)
- Florida Fish and Wildlife Conservation Commission – Regional fishing patterns (retrieved Jan 2024)
- Salt Water Sportsman – General fishing techniques (retrieved Jan 2024)

*Note: Information is summarized and explained in our own words. Always verify current regulations with official sources.*
```

5. **Source Quality Standards**

**High-Authority Sources:**
- Government agencies (NOAA, FWC, state agencies)
- Scientific databases (FishBase, etc.)
- Established fishing publications (with attribution)

**Avoid:**
- Unverified blogs
- Forums (unless cited as "angler reports")
- Commercial sites with no authority

---

## F) Content Review + Refresh Policy

### 1. Initial Publish

**Requirements:**
- Must pass all quality gates
- Must have `publishedAt` date
- Must have `updatedAt` date (same as publishedAt initially)
- Must be indexed in Topic Index
- Must be included in sitemap

---

### 2. Scheduled Refresh

**Refresh Schedule:**

**Species Pages:**
- **Frequency:** Every 6-12 months
- **Trigger:** Seasonal changes, new techniques, updated data
- **Process:** Re-run fact extraction, update content, update `updatedAt`

**How-To Pages:**
- **Frequency:** Every 6-12 months
- **Trigger:** New techniques, gear updates, feedback
- **Process:** Review steps, update tips, refresh content

**Location Pages:**
- **Frequency:** Every 3-6 months
- **Trigger:** Seasonal changes, new spots, access changes
- **Process:** Update spots, refresh conditions, update seasonal patterns

**Blog Posts:**
- **Top 20% Performers:** Quarterly refresh
- **Others:** As needed (when data becomes outdated)
- **Process:** Update facts, refresh examples, update `updatedAt`

---

### 3. Refresh Process

**Steps:**

1. **Re-run Fact Extraction**
   - Fetch latest sources
   - Extract updated facts
   - Compare with existing content

2. **Update Content**
   - Refresh outdated information
   - Add new insights
   - Update seasonal language
   - Keep slug stable (never change)

3. **Update Metadata**
   - Update `updatedAt` date
   - Keep `publishedAt` original
   - Update lastmod in sitemap

4. **Revalidate**
   - Trigger Next.js revalidation
   - Update sitemap
   - Notify search engines (optional)

**Refresh Checklist:**
- [ ] Facts still accurate
- [ ] Sources still valid
- [ ] Seasonal language current
- [ ] Internal links still working
- [ ] Content still meets quality gates
- [ ] UpdatedAt date changed

---

### 4. Pruning Policy

**Criteria for Pruning:**

1. **No Impressions After 6-9 Months**
   - Check GSC for impressions
   - If zero impressions → consider pruning
   - Exception: Evergreen content (keep longer)

2. **Superseded by Better Content**
   - If better page covers same topic
   - If content is outdated and not worth refreshing
   - If duplicate of another page

**Pruning Options:**

**Option 1: Merge**
- Combine content with better page
- Redirect old URL to new
- Preserve any valuable content

**Option 2: NoIndex**
- Keep page but exclude from search
- Use for outdated but still useful content
- Set `flags.noindex = true`

**Option 3: Redirect**
- 301 redirect to better page
- Preserve link equity
- Update internal links

**Option 4: Delete**
- Only if truly obsolete
- Remove from sitemap
- Return 410 Gone status

**Pruning Process:**

1. Identify candidate pages
2. Analyze performance (GSC data)
3. Decide on action (merge/noindex/redirect/delete)
4. Execute action
5. Update Topic Index
6. Update sitemap
7. Monitor for issues

---

## Implementation Checklist

### Editorial Standards
- [ ] Tone guidelines documented
- [ ] Structure template created
- [ ] Language rules enforced in validator
- [ ] Quality checklist implemented

### E-E-A-T Signals
- [ ] Author identity established
- [ ] About page created
- [ ] Author page created
- [ ] Author schema on all pages
- [ ] Trust signals (contact, privacy, terms) in place

### Automation Guardrails
- [ ] AI pattern detection implemented
- [ ] Duplication protection active
- [ ] Thin content protection enforced
- [ ] Source integrity checks in place

### Citations & Sources
- [ ] Source format standardized
- [ ] Source placement rules defined
- [ ] Source quality standards documented

### Content Review Policy
- [ ] Refresh schedule defined
- [ ] Refresh process documented
- [ ] Pruning policy established
- [ ] Monitoring system in place

---

**Last Updated:** 2024  
**Status:** Ready for implementation


