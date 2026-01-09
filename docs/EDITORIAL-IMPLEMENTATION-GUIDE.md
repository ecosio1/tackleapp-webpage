# Editorial Governance - Implementation Guide

## Quick Reference

### Editorial Rules Checklist

**Every page must:**
- [ ] Use hedging language ("generally", "often", "typically")
- [ ] Include intro paragraph (2-3 sentences)
- [ ] Include table of contents (auto-generated)
- [ ] Include minimum 4 H2 sections
- [ ] Include 5-8 FAQs
- [ ] Include "Last updated" date
- [ ] Include author attribution
- [ ] Include sources (minimum 2 for seasonal content)
- [ ] Include CTA to /download
- [ ] Avoid forbidden phrases
- [ ] Have varied sentence structure
- [ ] Have lexical diversity > 30%

**Every page must NOT:**
- [ ] Use hype words ("ultimate", "secret", "guaranteed")
- [ ] Provide legal/regulatory advice
- [ ] Copy content verbatim from sources
- [ ] Have repetitive sentence structure
- [ ] Have low lexical diversity
- [ ] Have uniform paragraph lengths

---

## Component Integration

### 1. Add Author Schema to Page Template

```tsx
// In your page component
import { AuthorSchema } from '@/components/seo/AuthorSchema';

export default function Page({ doc }: { doc: GeneratedDoc }) {
  return (
    <>
      <AuthorSchema
        author={{
          name: 'Tackle Fishing Team',
          url: '/authors/tackle-fishing-team',
        }}
      />
      {/* Rest of page */}
    </>
  );
}
```

### 2. Add Sources Section

```tsx
import { SourcesSection } from '@/components/content/SourcesSection';

<SourcesSection
  sources={doc.sources}
  className="my-8"
/>
```

### 3. Add Last Updated Date

```tsx
import { LastUpdated } from '@/components/content/LastUpdated';

<LastUpdated
  date={doc.dates.updatedAt}
  author={doc.author.name}
/>
```

---

## Guardrails Integration

### In Publisher

```typescript
import { runGuardrails } from '@/lib/editorial/guardrails';

// Before publishing
const guardrailResult = runGuardrails(
  doc.body,
  wordCount,
  h2Count,
  internalLinkCount,
  doc.sources.length,
  hasSeasonalContent
);

if (!guardrailResult.passed) {
  throw new Error(`Guardrails failed: ${guardrailResult.errors.join(', ')}`);
}
```

---

## Content Refresh Workflow

### Check Refresh Needs

```typescript
import { needsRefresh, getRefreshPriority } from '@/lib/editorial/refresh-policy';

if (needsRefresh(doc)) {
  const priority = getRefreshPriority(doc);
  // Schedule refresh job with priority
}
```

### Refresh Process

1. Re-run fact extraction
2. Update outdated information
3. Update seasonal language
4. Update `updatedAt` date
5. Trigger revalidation
6. Update sitemap

---

## Pruning Workflow

### Identify Candidates

```typescript
import { identifyPruningCandidates } from '@/lib/editorial/refresh-policy';

const candidates = identifyPruningCandidates(docs, gscData);

for (const candidate of candidates) {
  if (candidate.action === 'noindex') {
    // Set noindex flag
  } else if (candidate.action === 'redirect') {
    // Create 301 redirect
  }
}
```

---

## Testing Checklist

- [ ] About page renders correctly
- [ ] Author page renders correctly
- [ ] Author schema appears on all pages
- [ ] Sources section displays correctly
- [ ] Guardrails block bad content
- [ ] Forbidden phrases are caught
- [ ] AI patterns are detected
- [ ] Refresh policy functions work
- [ ] Pruning candidates identified correctly

---

**Last Updated:** 2024  
**Status:** Ready for integration



