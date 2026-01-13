/**
 * 12-Section Retention-Focused Blog Template
 * Enforces the structure defined in .claude/blog-content-guidelines.md
 */

import { OutlineItem } from './types';

/**
 * Generate 12-section retention-focused outline
 * This outline is passed to the LLM to ensure consistent structure
 */
export function generateRetentionOutline(brief: {
  title: string;
  primaryKeyword: string;
  speciesFocus?: string;
  locationFocus?: string;
  pageType: string;
}): OutlineItem[] {
  const species = brief.speciesFocus || 'target species';
  const location = brief.locationFocus || 'your area';

  return [
    {
      title: 'Above the Fold (5-Second Decision)',
      description: `Start with a 1-sentence promise, "Best for: [skill level]", "What you need: [2-4 items]", and a **DO THIS FIRST** callout with the single highest-leverage action. This prevents bounce.`,
    },
    {
      title: 'Quick Answer (Instant Value)',
      description: `Provide 3-6 bullets that directly answer the query: lure/bait choice, where to fish it, retrieve pattern, and best conditions (tide/time/wind). NO long intro before this section.`,
    },
    {
      title: 'Tackle Box Snapshot (Copyable Setup)',
      description: `Give a complete "grab-and-go" setup: lure/bait options (3-5 specific products), hook/jig weights by depth, line/leader setup, retrieve patterns for each type, and target depth/structure. Make it copyable. **END WITH IMAGE**: After this section, include an image of tackle/gear laid out with caption.`,
    },
    {
      title: 'Step-by-Step (The Actual How-To)',
      description: `Provide 5 numbered steps: (1) Where to start (structure + position), (2) First casts (angle + distance with measurements), (3) Retrieve cadence (what to feel for), (4) Hookset and landing tips with technique details, (5) What to change after 10-15 minutes with no bites. Be specific with distances, depths, and times. **END WITH IMAGE**: Include image of angler/casting technique after this section.`,
    },
    {
      title: 'Decision Tree (Conditions + Adjustments)',
      description: `Create "If this... do that" blocks for 6 real conditions: (1) If water is clear, (2) If water is stained, (3) If windy, (4) If cold front/pressure drop, (5) If bait is present, (6) If no bait visible. Each should have specific adjustments (colors, retrieve speed, depth, lure size). This prevents "it didn't work for me" bounce.`,
    },
    {
      title: 'Spot Playbook (How Fish Relate to Structure)',
      description: `Describe best structure types for ${species} with specific depth ranges. Explain where fish stage (edges, current seams, shadows, drop-offs) and approach strategies (stealth, distance, angle). Include strike zone explanation. Make it feel real with specific details. **END WITH IMAGE**: Include image of structure/habitat (mangroves, docks, etc.) after this section.`,
    },
    {
      title: 'Mistakes That Kill the Bite (High Engagement)',
      description: `List 10-12 specific mistakes with consequences: too fast retrieve, wrong depth, noisy approach, working lure too much, wrong angle to current, not pausing long enough, changing spots too quickly, setting hook on topwater explosion, fishing wrong tide stage, using dull hooks, leader too short, ignoring shadow lines. Each bullet should explain WHY it's a mistake. **OPTIONAL IMAGE BEFORE THIS SECTION**: Include fish/detail closeup.`,
    },
    {
      title: 'Frequently Asked Questions',
      description: `Answer 5-8 real questions anglers ask. Each answer should be 2-4 sentences with specific, actionable information. Include questions about best lures/techniques, colors, timing, sizing, conditions, and common concerns.`,
    },
    {
      title: '1-Minute Action Plan (Closure)',
      description: `Provide a tight checklist format: (1) Rig to tie on (exact setup), (2) 2 places to try first (specific locations/structure), (3) First retrieve cadence (exact pattern), (4) One adjustment if no bites (what to change). Give a "try this tomorrow" plan.`,
    },
    {
      title: 'Next Steps: Keep Learning',
      description: `Frame 3-5 internal links as contextual choices using "If you're..." format: "If you're fishing mangroves next...", "If you need the right rod setup...", "If you want to learn knots...", "If you're targeting [other species]...". Not random related posts.`,
    },
    {
      title: 'Always Check Current Regulations',
      description: `Single neutral reminder ONLY: "Fishing regulations vary by location and change regularly. Always verify current rules with local authorities before fishing." Link to official FWC or relevant government source. CRITICAL: Do NOT mention ANY specific regulations, limits, sizes, or seasons - only include this generic reminder.`,
    },
  ];
}

// Image placement instructions are built dynamically in generateRetentionPrompt()

/**
 * Generate complete retention-focused prompt for blog generation
 */
export function generateRetentionPrompt(brief: {
  title: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  speciesFocus?: string;
  locationFocus?: string;
  internalLinks: string[];
  keyFacts: string[];
  sources: Array<{ label: string; url: string }>;
  minWordCount: number;
}): string {
  const outline = generateRetentionOutline({
    title: brief.title,
    primaryKeyword: brief.primaryKeyword,
    speciesFocus: brief.speciesFocus,
    locationFocus: brief.locationFocus,
    pageType: 'blog',
  });

  return `Write an SEO-optimized fishing blog post using the 12-SECTION RETENTION STRUCTURE.

TITLE: ${brief.title}
PRIMARY KEYWORD: ${brief.primaryKeyword}
SECONDARY KEYWORDS: ${brief.secondaryKeywords.join(', ')}

=== CRITICAL STRUCTURE REQUIREMENTS ===

You MUST follow this exact 12-section structure (non-negotiable):

IMPORTANT: Use clean section titles WITHOUT parenthetical labels in your headings. The labels like "(Instant Value)" and "(Copyable Setup)" are for internal guidance only - do NOT include them in the published content.

${outline.map((section, i) => {
  // Remove parenthetical labels from title for published content
  const cleanTitle = section.title.replace(/\s*\([^)]+\)\s*/g, '');
  return `
${i + 1}. ${cleanTitle}
   ${section.description}
`;
}).join('\n')}

=== IMAGE REQUIREMENTS ===

Include 4 images using these exact markdown formats:

After Section 3 (Tackle Box):
![Fishing tackle and lures laid out](IMAGE_TACKLE)
*Caption describing the complete setup and scenarios it covers*

After Section 4 (Step-by-Step):
![Angler casting or fishing technique demonstration](IMAGE_TECHNIQUE)
*Caption explaining the technique and why it matters*

After Section 6 (Spot Playbook):
![Fishing structure or habitat photo](IMAGE_STRUCTURE)
*Caption with depth, conditions, and when to target this spot*

Before Section 7 (Mistakes) - OPTIONAL:
![Fish or detail closeup](IMAGE_DETAIL)
*Caption highlighting successful technique or important detail*

=== WRITING STYLE REQUIREMENTS ===

✅ DO:
- Use specific measurements (depths, weights, distances, times)
- Include brand names and product specifics
- Write in 2nd person ("you should cast...")
- Use short sentences (max 4-5 lines per paragraph)
- Include realistic constraints ("this works best when...")
- Mention common mistakes throughout

❌ DON'T (CRITICAL - WILL CAUSE REJECTION):
- Use generic AI phrases ("dive into", "explore", "unlock")
- Create walls of text without images
- Give vague advice ("use topwater" without when/where/how)
- Include ANY regulatory information:
  ❌ NO bag limits ("5 fish per day", "daily limit")
  ❌ NO size limits ("12-15 inches", "minimum 18 inches", "slot limit")
  ❌ NO fishing seasons ("open April-October", "closed season")
  ❌ NO specific license costs or requirements
- Copy content verbatim from sources

=== CONTENT REQUIREMENTS ===

- MINIMUM ${brief.minWordCount} words (strict requirement)
- 5-8 FAQs with detailed answers (2-4 sentences each)
- Use ALL ${brief.internalLinks.length} internal links naturally
- **REQUIRED CTA**: You MUST include a "Tackle app" call-to-action in the body text. Include it naturally in Section 9 (1-Minute Action Plan) or Section 10 (Next Steps). Example: "Ready to catch more fish? Download the Tackle app to log your catches, track patterns, and discover hot spots near you." The text must include the phrase "Tackle app" or "download Tackle" somewhere in the body.
- Cite all facts from sources but paraphrase with original insights

=== KEY FACTS TO INCLUDE ===
${brief.keyFacts.map(f => `- ${f}`).join('\n')}

=== INTERNAL LINKS (USE ALL) ===
${brief.internalLinks.join('\n')}

=== SOURCES (CITE AT END) ===
${brief.sources.map(s => `- ${s.label}: ${s.url}`).join('\n')}

=== VALIDATION CHECKLIST ===
Before submitting, verify:
✓ All 12 sections present in order
✓ 4 image placeholders included
✓ ${brief.minWordCount}+ words
✓ 5-8 FAQs
✓ All internal links used
✓ "DO THIS FIRST" callout in Section 1
✓ Decision tree with 6 conditions in Section 5
✓ 10-12 mistakes in Section 7
✓ 1-minute action plan in Section 9
✓ NO bag limits, size limits, seasons, or license costs mentioned ANYWHERE

Write the complete blog post now in markdown format:`;
}

/**
 * Post-process generated content to add real image URLs
 */
export function addImagesToPost(
  body: string,
  speciesFocus?: string,
  locationFocus?: string
): string {
  const species = (speciesFocus || 'fishing').toLowerCase();
  const location = (locationFocus || '').toLowerCase();

  // Replace image placeholders with real Unsplash URLs
  let processedBody = body;

  // Image 1: Tackle/gear
  processedBody = processedBody.replace(
    /!\[([^\]]+)\]\(IMAGE_TACKLE\)/g,
    `![$1](https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=800&h=600&fit=crop)`
  );

  // Image 2: Technique/action
  processedBody = processedBody.replace(
    /!\[([^\]]+)\]\(IMAGE_TECHNIQUE\)/g,
    `![$1](https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=800&h=600&fit=crop)`
  );

  // Image 3: Structure/habitat
  processedBody = processedBody.replace(
    /!\[([^\]]+)\]\(IMAGE_STRUCTURE\)/g,
    `![$1](https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop)`
  );

  // Image 4: Detail/fish
  processedBody = processedBody.replace(
    /!\[([^\]]+)\]\(IMAGE_DETAIL\)/g,
    `![$1](https://images.unsplash.com/photo-1592329347327-27c7e288b5f6?w=800&h=600&fit=crop)`
  );

  return processedBody;
}

/**
 * Validate that post follows retention structure
 */
export function validateRetentionStructure(body: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check for required sections
  const requiredSections = [
    'DO THIS FIRST',
    'Quick Answer',
    'Tackle Box Snapshot',
    'Step-by-Step',
    'Decision Tree',
    'Spot Playbook',
    'Mistakes That Kill',
    'Frequently Asked Questions',
    '1-Minute Action Plan',
    'Next Steps',
    'Check Current Regulations',
  ];

  for (const section of requiredSections) {
    if (!body.toLowerCase().includes(section.toLowerCase())) {
      errors.push(`Missing required section: ${section}`);
    }
  }

  // Check for images (should have at least 3)
  const imageCount = (body.match(/!\[.*?\]\(.*?\)/g) || []).length;
  if (imageCount < 3) {
    errors.push(`Insufficient images: found ${imageCount}, need at least 3`);
  }

  // Check for decision tree conditions
  const decisionTreePatterns = [
    /if water is clear/i,
    /if water is stained/i,
    /if windy/i,
    /if cold front/i,
    /if bait/i,
  ];
  const foundConditions = decisionTreePatterns.filter(pattern =>
    pattern.test(body)
  ).length;
  if (foundConditions < 4) {
    errors.push(
      `Decision tree incomplete: found ${foundConditions}/6 conditions`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
