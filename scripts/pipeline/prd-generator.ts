/**
 * PRD Generator
 * Consolidates all discovery work (Perplexity concepts, DataForSEO validation, matrix combinations)
 * into a comprehensive Product Requirement Document
 */

import { logger } from './logger';
import { ProgrammaticConcept } from './programmatic-discovery';
import { MatrixCombination } from './matrix';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface PRDData {
  siteSummary: string;
  appSummary: string;
  discoveredConcepts: ProgrammaticConcept[];
  matrixCombinations: MatrixCombination[];
  matrixStats?: {
    totalCombinations: number;
    validatedCount: number;
    totalVolume: number;
    averageDifficulty: number;
    topOpportunities: MatrixCombination[];
    byPattern: Record<string, number>;
  };
  validationCriteria: {
    minVolume: number;
    maxVolume: number;
    intent: string;
  };
  recommendedPatterns: string[];
}

/**
 * Generate comprehensive PRD from all discovery data
 */
export async function generatePRD(data: PRDData): Promise<string> {
  logger.info('Generating Master Pipeline PRD...');
  
  const prd = `# Master Pipeline PRD - Tackle SEO Content Automation

**Generated:** ${new Date().toISOString()}  
**Purpose:** Comprehensive programmatic SEO strategy for Tackle fishing website  
**Goal:** Generate thousands of high-quality, SEO-optimized pages targeting long-tail fishing keywords

---

## Executive Summary

This PRD consolidates all discovery work from:
- **Perplexity MCP**: Programmatic concept discovery
- **DataForSEO MCP**: Keyword validation and metrics
- **Matrix Analysis**: Head-to-head combination opportunities

### Key Metrics

${data.matrixStats ? `
- **Total Matrix Combinations**: ${data.matrixStats.totalCombinations.toLocaleString()}
- **Validated Opportunities**: ${data.matrixStats.validatedCount.toLocaleString()}
- **Total Search Volume**: ${data.matrixStats.totalVolume.toLocaleString()}/month
- **Average Keyword Difficulty**: ${data.matrixStats.averageDifficulty}
- **Estimated Aggregate Traffic**: ${Math.round(data.matrixStats.totalVolume * 0.05).toLocaleString()} - ${Math.round(data.matrixStats.totalVolume * 0.15).toLocaleString()} visits/month
  (Assuming 5-15% CTR from search results)
` : 'Matrix statistics not available'}

---

## 1. Site & App Context

### Site Summary

${data.siteSummary}

### App Summary

${data.appSummary}

---

## 2. Programmatic Concepts Discovered

### Overview

Discovered ${data.discoveredConcepts.length} programmatic SEO concepts using Perplexity MCP.

### Validation Criteria

- **Search Volume**: ${data.validationCriteria.minVolume} - ${data.validationCriteria.maxVolume} searches/month
- **Search Intent**: ${data.validationCriteria.intent} only
- **Rationale**: Individual keywords may have low volume (200-500), but thousands of these pages aggregate into massive traffic (800k - 2M+ searches/month)

### Discovered Concepts

${data.discoveredConcepts.length > 0 ? data.discoveredConcepts.map((concept, index) => `
#### ${index + 1}. ${concept.concept}

**Pattern:** ${concept.pattern}  
**Category:** ${concept.category}  
**Estimated Volume:** ${concept.estimatedVolume}  
**Estimated Difficulty:** ${concept.difficulty}  
**Description:** ${concept.description}

**Example Keywords:**
${concept.exampleKeywords.map(k => `- ${k}`).join('\n')}

${concept.validated ? `
**✅ Validation Results:**
- Validated Keywords: ${concept.validated.keywords.length}
- Total Volume: ${concept.validated.totalVolume.toLocaleString()}/month
- Average Difficulty: ${concept.validated.averageDifficulty}
- Total Opportunity Score: ${concept.validated.totalOpportunity}

**Top Validated Keywords:**
${concept.validated.keywords.slice(0, 5).map(k => `- "${k.keyword}" (vol: ${k.searchVolume}, diff: ${k.keywordDifficulty}, score: ${k.opportunityScore})`).join('\n')}
` : '⚠️ Not yet validated with DataForSEO'}
`).join('\n') : `
*No concepts discovered yet. Run discovery command to populate:*
\`\`\`bash
npm run pipeline:discover-concepts -- --validate
\`\`\`
`}

---

## 3. Head-to-Head Matrix Strategy

### Matrix Overview

The matrix strategy creates programmatic combinations of entities to generate thousands of pages.

### Entity Types

${data.matrixStats ? `
- **Species**: 20+ fish species
- **Lures**: 20+ lure types
- **Locations**: 20+ fishing locations
- **Techniques**: 10+ fishing techniques
- **Seasons**: 4 seasons

**Total Potential Combinations**: ${data.matrixStats.totalCombinations.toLocaleString()}
` : 'Matrix data not available'}

### Matrix Patterns

${data.recommendedPatterns.map((pattern, index) => `${index + 1}. ${pattern}`).join('\n')}

### Top Opportunities by Pattern

${data.matrixStats ? Object.entries(data.matrixStats.byPattern)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([pattern, count]) => `- **${pattern}**: ${count} validated keywords`)
  .join('\n') : 'No pattern data available'}

### Top 20 Matrix Opportunities

${data.matrixStats && data.matrixStats.topOpportunities.length > 0 ? data.matrixStats.topOpportunities.map((combo, index) => `
${index + 1}. **${combo.keyword}**
   - Pattern: ${combo.pattern}
   - Volume: ${combo.searchVolume}/month
   - Difficulty: ${combo.keywordDifficulty}
   - Opportunity Score: ${combo.opportunityScore}/100
   ${combo.relatedQuestions && combo.relatedQuestions.length > 0 ? `- Questions: ${combo.relatedQuestions.slice(0, 3).join(', ')}` : ''}
`).join('\n') : `
*No matrix opportunities available yet. Run matrix generation to populate:*
\`\`\`bash
npm run pipeline:generate-matrix -- --validate
\`\`\`
`}

---

## 4. Content Strategy

### Page Types

1. **Species Guides** (`/species/{species}`)
   - How to catch specific fish
   - Best techniques, lures, locations
   - Regulations and limits

2. **How-To Guides** (`/how-to/{topic}`)
   - Fishing techniques
   - Gear usage
   - Location-specific tips

3. **Location Guides** (`/locations/{state}/{city}`)
   - Best fishing spots
   - Species available
   - Local conditions and regulations

4. **Blog Posts** (`/blog/{slug}`)
   - Gear comparisons (X vs. Y)
   - Technique guides
   - Seasonal tips
   - Species spotlights

### Content Requirements

- **Minimum Word Count**: 1,500 words
- **FAQs**: 5-8 questions per page (from People Also Ask)
- **Internal Links**: 3-6 per page
- **Sources**: Cite authoritative sources (NOAA, FWC, etc.)
- **CTAs**: Include app download CTA on every page
- **Regulations**: Link to official state regulations (never host regulations)
- **Vibe Test**: Every page must include proprietary scoring/insights (see below)
- **Interactive Tools**: Pages should include relevant micro-tools/calculators where applicable
- **Alternative Recommendations**: Every page must include "Alternative Recommendations" section for internal linking loops

### Vibe Test System (Unique Authority Signal)

**Critical Requirement**: Every page must include a "Vibe Test" - proprietary scoring and insights that signal unique authority to search engines and LLM crawlers.

**Why**: Search engines prioritize content showing real testing and human-centric reviews over generic rehashes of public data.

**Components**:

1. **Primary Score** (required):
   - **Species Pages**: Difficulty Rating (0-100)
   - **Lure/Gear Pages**: Catchability Score (0-100)
   - **Technique Pages**: Effectiveness Score (0-100)
   - **Location Pages**: Location Quality Score (0-100)
   - **Comparison Pages**: Scores for both items being compared

2. **Unique Insights** (3-5 items):
   - Proprietary observations from "real-world testing"
   - Insider knowledge not found in generic guides
   - Specific, actionable insights
   - Recent and relevant

3. **Real-World Notes** (2-3 items):
   - Practical observations from actual fishing
   - Things learned "the hard way"
   - Human-centric, relatable experiences
   - Tips that aren't in books

4. **Scoring Factors**:
   - Explain what contributes to each score
   - Show methodology (signals real testing)
   - Include "last updated" date (signals freshness)

**Implementation**:
- Generated automatically for each page using LLM
- Integrated into content body as a dedicated section
- Displayed prominently (not hidden)
- Updated regularly to signal freshness

### Interactive Micro-Tools (Programmatic Components)

**Critical Requirement**: Pages should include interactive micro-tools/calculators where relevant. These are "micro-apps" that provide value beyond text content.

**Why**: High-ranking programmatic pages are more than just text - they're interactive experiences that keep users engaged and signal value to search engines.

**Tool Types**:

1. **Calculators**:
   - Fishing Trip Cost Calculator
   - Tackle Budget Calculator
   - Tide Fishing Window Calculator
   - Fish Size/Weight Converter

2. **Comparators**:
   - Lure Comparison Tool (side-by-side gear comparisons)
   - Species Comparison Tool
   - Technique Comparison Tool

3. **Finders**:
   - Best Fishing Time Finder
   - Fish Size Limit Checker
   - Best Lure Finder (for conditions/species)

4. **Estimators**:
   - Catch Potential Estimator
   - Trip Planning Estimator

**Discovery Process**:
- Use Perplexity to discover tool opportunities
- Validate with DataForSEO (low competition, clear search intent)
- Generate React components automatically
- Embed in relevant pages

**Implementation**:
- Tools are React components (client-side interactive)
- API routes for server-side calculations
- Auto-generated from tool definitions
- Embedded in content body where relevant

### Alternative Recommendations (Internal Linking Loops)

**Critical Requirement**: Every page must include an "Alternative Recommendations" section that suggests related content.

**Why**: Creates internal linking loops that:
- Keep users on site longer
- Distribute page authority
- Help users discover related content
- Improve SEO through strategic internal linking

**Implementation**:
- Generated automatically based on content similarity
- Shows 3-5 alternative pages
- Includes reason for each recommendation
- Links to related species, techniques, locations, or blog posts

**Example**:
- Species page → Recommends related techniques, locations, and blog posts
- Lure comparison → Recommends other lure comparisons and species guides
- Location page → Recommends species available there and local techniques

### Content Quality Standards

- ✅ Original content (never copy-paste)
- ✅ Fact-based (extract facts, write original explanations)
- ✅ Beginner-friendly
- ✅ SEO-optimized (target keyword in title, H1, first paragraph)
- ✅ Structured (H2/H3 headings, bullet points, scannable)
- ✅ Up-to-date (include "Last updated" date)

---

## 5. Implementation Plan

### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up content pipeline infrastructure
- [ ] Create content templates for each page type
- [ ] Build validation and quality gates
- [ ] Test with 10-20 sample pages

### Phase 2: Programmatic Rollout (Weeks 3-8)
- [ ] Start with highest-opportunity matrix combinations
- [ ] Generate 50-100 pages per week
- [ ] Monitor performance and adjust
- [ ] Expand to additional patterns

### Phase 3: Scale (Weeks 9+)
- [ ] Scale to 200+ pages per week
- [ ] Automate content refresh for top performers
- [ ] Expand entity lists (more species, lures, locations)
- [ ] Add new patterns based on performance

### Priority Order

1. **High-Volume, Low-Difficulty Keywords** (Opportunity Score > 70)
2. **Validated Matrix Combinations** (200-500 volume, informational intent)
3. **Programmatic Concepts** (validated patterns)
4. **Long-Tail Opportunities** (lower volume but easier to rank)

---

## 6. Technical Requirements

### Content Pipeline

- **Automation**: Fully automated content generation
- **Validation**: All content must pass quality gates
- **Storage**: Database-backed (Supabase/Postgres) with ISR
- **Revalidation**: On-demand revalidation after publishing
- **Monitoring**: Track performance, errors, and quality metrics

### SEO Requirements

- **Meta Tags**: Title, description, OG tags
- **Schema Markup**: Article, FAQPage, BreadcrumbList
- **Sitemap**: Auto-generated, updated daily
- **Internal Linking**: Strategic linking between related pages
- **Mobile-First**: Responsive design, fast loading

### Quality Gates

- Word count minimums
- Duplicate content detection
- Fact verification
- Source citations
- Internal link requirements
- CTA presence

---

## 7. Success Metrics

### Traffic Goals

- **Month 1-3**: 10,000 - 50,000 organic visits/month
- **Month 4-6**: 100,000 - 300,000 organic visits/month
- **Month 7-12**: 500,000 - 1,000,000+ organic visits/month

### Content Goals

- **Month 1**: 200 pages published
- **Month 3**: 1,000 pages published
- **Month 6**: 3,000 pages published
- **Month 12**: 10,000+ pages published

### Ranking Goals

- **Top 10 Rankings**: 100+ keywords by month 6
- **Top 3 Rankings**: 50+ keywords by month 12
- **Featured Snippets**: 20+ by month 12

---

## 8. Risk Mitigation

### Content Quality

- ✅ Automated quality checks
- ✅ Human review for top-performing pages
- ✅ Regular content audits
- ✅ Fact-checking with authoritative sources

### SEO Risks

- ✅ Avoid keyword stuffing
- ✅ Ensure unique, valuable content
- ✅ Monitor for duplicate content
- ✅ Follow Google guidelines

### Technical Risks

- ✅ Rate limiting for APIs
- ✅ Error handling and retries
- ✅ Backup and recovery
- ✅ Performance monitoring

---

## 9. Next Steps

### Immediate Actions

1. **Review PRD** with team
2. **Prioritize** top opportunities from matrix
3. **Set up** content pipeline infrastructure
4. **Test** with 10-20 sample pages
5. **Monitor** performance and iterate

### Short-Term (Next 30 Days)

1. Generate first 200 pages
2. Monitor rankings and traffic
3. Refine content templates
4. Expand entity lists
5. Add new patterns

### Long-Term (Next 90 Days)

1. Scale to 1,000+ pages
2. Automate content refresh
3. Expand to new content types
4. Build internal linking system
5. Optimize for featured snippets

---

## 10. Appendices

### A. Entity Lists

See matrix.ts for complete entity lists (species, lures, locations, etc.)

### B. Validation Criteria

- Search Volume: ${data.validationCriteria.minVolume} - ${data.validationCriteria.maxVolume}/month
- Search Intent: ${data.validationCriteria.intent}
- Minimum Opportunity Score: 50/100

### C. Content Templates

Templates for each page type are defined in:
- \`scripts/pipeline/generators/blog.ts\`
- \`scripts/pipeline/generators/species.ts\`
- \`scripts/pipeline/generators/howto.ts\`
- \`scripts/pipeline/generators/location.ts\`

### D. API Integrations

- **DataForSEO**: Keyword research and validation
- **Perplexity**: Concept discovery and research
- **OpenAI**: Content generation
- **NOAA/Weather APIs**: Fact verification

---

**End of PRD**

*This document should be reviewed and updated monthly as the pipeline evolves.*
`;

  return prd;
}

/**
 * Load site and app summaries from documentation
 */
export function loadSummaries(): { siteSummary: string; appSummary: string } {
  let siteSummary = 'Tackle is an AI-powered fishing companion iOS app that helps anglers catch more fish.';
  let appSummary = 'Tackle provides AI-powered fishing assistance including species identification, real-time conditions, and personalized advice.';

  try {
    const appDocPath = join(process.cwd(), 'docs', 'TACKLE-APP-DOCUMENTATION.md');
    const appDoc = readFileSync(appDocPath, 'utf-8');
    
    // Extract app summary
    const appMatch = appDoc.match(/## What is Tackle\?\s*\n\n(.+?)(?=\n---|\n##)/s);
    if (appMatch) {
      appSummary = appMatch[1].trim();
    }
    
    // Extract features summary
    const featuresMatch = appDoc.match(/## Core Features\s*\n\n(.+?)(?=\n---|\n##)/s);
    if (featuresMatch) {
      appSummary += '\n\n' + featuresMatch[1].substring(0, 500) + '...';
    }
  } catch (error) {
    logger.warn('Could not load app documentation:', error);
  }

  try {
    const projectPath = join(process.cwd(), 'docs', 'PROJECT-OVERVIEW.md');
    const projectDoc = readFileSync(projectPath, 'utf-8');
    
    // Extract site summary
    const siteMatch = projectDoc.match(/## 🎯 What You're Trying to Do\s*\n\n(.+?)(?=\n---|\n##)/s);
    if (siteMatch) {
      siteSummary = siteMatch[1].trim().substring(0, 1000);
    }
  } catch (error) {
    logger.warn('Could not load project documentation:', error);
  }

  return { siteSummary, appSummary };
}
