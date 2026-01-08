# Indexing Controls & Canonical Rules

## Canonical Rules

### Implementation

Every page must set a canonical tag to its absolute URL.

**For Next.js App Router:**

1. **In `generateMetadata` function:**
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const canonical = absoluteUrl(`/species/${params.slug}`);
  
  return {
    // ... other metadata
    alternates: {
      canonical,
    },
  };
}
```

2. **Or use component:**
```tsx
import { CanonicalTag } from '@/components/seo/CanonicalTag';

<CanonicalTag path={`/species/${slug}`} />
```

### Rules

- **Primary URL Only:** Canonical must point to the primary slug route
- **Absolute URLs:** Always use absolute URLs (https://tackleapp.ai/...)
- **No Duplicates:** If content is accessible via multiple paths, canonical must point to ONE primary path
- **Self-Referencing:** Canonical should point to the page itself (not a different page)

### Examples

**Species Page:**
- URL: `/species/redfish`
- Canonical: `https://tackleapp.ai/species/redfish`

**Location Page:**
- URL: `/locations/florida/miami`
- Canonical: `https://tackleapp.ai/locations/florida/miami`

**Blog Post:**
- URL: `/blog/best-time-fish-florida`
- Canonical: `https://tackleapp.ai/blog/best-time-fish-florida`

---

## NoIndex Rules

### Implementation

Draft content must render noindex meta tag.

**Component:**
```tsx
import { NoIndexTag } from '@/components/seo/NoIndexTag';

<NoIndexTag isDraft={doc.flags.draft} noindex={doc.flags.noindex} />
```

**In Metadata:**
```typescript
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doc = await getDoc(params.slug);
  
  return {
    robots: {
      index: !doc.flags.draft && !doc.flags.noindex,
      follow: true,
    },
  };
}
```

### Rules

- **Drafts:** All draft content must have `noindex,nofollow`
- **Exclude from Sitemap:** Drafts are automatically excluded from sitemaps
- **Preview Routes:** Any `/preview/` routes should be noindex
- **Admin Routes:** Any `/admin/` routes should be noindex

---

## Pagination (Optional)

If pagination exists, add rel="next/prev" links:

```tsx
<link rel="prev" href={prevPageUrl} />
<link rel="next" href={nextPageUrl} />
```

---

## 404 Handling

### Implementation

Non-existent slugs must return 404 status.

**Next.js App Router:**
```typescript
import { notFound } from 'next/navigation';

export default async function Page({ params }: Props) {
  const doc = await getDoc(params.slug);
  
  if (!doc) {
    notFound(); // Returns 404
  }
  
  // ... render page
}
```

### Rules

- **404 Status:** Return proper 404 HTTP status
- **404 Page:** Show helpful 404 page with navigation
- **No Indexing:** 404 pages should not be indexed
- **Internal Links:** Fix broken internal links immediately

---

## Breadcrumbs

### Implementation

All content pages must include breadcrumbs in:
1. JSON-LD schema
2. On-page navigation

**JSON-LD Schema:**
```typescript
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://tackleapp.ai"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Species",
      "item": "https://tackleapp.ai/species"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Redfish",
      "item": "https://tackleapp.ai/species/redfish"
    }
  ]
}
```

**On-Page Navigation:**
```tsx
<nav aria-label="Breadcrumb">
  <ol>
    <li><Link href="/">Home</Link></li>
    <li><Link href="/species">Species</Link></li>
    <li>Redfish</li>
  </ol>
</nav>
```

### Breadcrumb Patterns

**Species Pages:**
- Home > Species > [Species Name]

**How-To Pages:**
- Home > How-To Guides > [Guide Name]

**Location Pages:**
- Home > Locations > [State] > [City]

**Blog Posts:**
- Home > Blog > [Category] > [Post Title]

---

## Summary Checklist

For every page:

- [ ] Canonical tag set to absolute URL
- [ ] Noindex tag if draft/noindex flag
- [ ] Breadcrumbs in JSON-LD
- [ ] Breadcrumbs in on-page navigation
- [ ] 404 handling for non-existent content
- [ ] Excluded from sitemap if draft/noindex



