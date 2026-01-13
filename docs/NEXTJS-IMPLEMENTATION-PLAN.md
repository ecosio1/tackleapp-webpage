# Next.js App Router Implementation Plan - Tackle SEO Templates

**Version:** 1.0  
**Framework:** Next.js 14+ (App Router)  
**Strategy:** SSG + ISR for scalable content

---

## Table of Contents
1. [Folder Structure](#folder-structure)
2. [Shared Components](#shared-components)
3. [SEO & Schema Helpers](#seo--schema-helpers)
4. [Template Implementations](#template-implementations)
5. [Sitemap & Robots Strategy](#sitemap--robots-strategy)
6. [Data Layer](#data-layer)

---

## Folder Structure

```
app/
├── (marketing)/                    # Marketing pages group
│   ├── page.tsx                    # Home page (/)
│   ├── download/
│   │   └── page.tsx                # /download
│   ├── features/
│   │   └── page.tsx                # /features
│   ├── how-it-works/
│   │   └── page.tsx                # /how-it-works
│   ├── pricing/
│   │   └── page.tsx                # /pricing
│   ├── about/
│   │   └── page.tsx                # /about
│   ├── contact/
│   │   └── page.tsx                # /contact
│   ├── privacy/
│   │   └── page.tsx                # /privacy
│   └── terms/
│       └── page.tsx                # /terms
│
├── species/
│   ├── page.tsx                    # /species (index)
│   ├── [slug]/
│   │   ├── page.tsx                # /species/[slug]
│   │   └── loading.tsx             # Loading state
│   └── layout.tsx                  # Species section layout
│
├── how-to/
│   ├── page.tsx                    # /how-to (index)
│   ├── [slug]/
│   │   ├── page.tsx                # /how-to/[slug]
│   │   └── loading.tsx             # Loading state
│   └── layout.tsx                  # How-to section layout
│
├── locations/
│   ├── page.tsx                    # /locations (index)
│   ├── [state]/
│   │   ├── page.tsx                # /locations/[state] (state index)
│   │   └── [city]/
│   │       ├── page.tsx            # /locations/[state]/[city]
│   │       └── loading.tsx         # Loading state
│   └── layout.tsx                  # Locations section layout
│
├── blog/
│   ├── page.tsx                    # /blog (index)
│   ├── category/
│   │   └── [category]/
│   │       └── page.tsx            # /blog/category/[category]
│   ├── [slug]/
│   │   ├── page.tsx                # /blog/[slug]
│   │   └── loading.tsx             # Loading state
│   └── layout.tsx                  # Blog section layout
│
├── regulations/
│   ├── page.tsx                    # /regulations (index)
│   ├── [state]/
│   │   ├── page.tsx                # /regulations/[state] (state index)
│   │   └── [topic]/
│   │       ├── page.tsx            # /regulations/[state]/[topic]
│   │       └── loading.tsx         # Loading state
│   └── layout.tsx                  # Regulations section layout
│
├── sitemap.ts                      # Dynamic sitemap generation
├── robots.ts                       # Robots.txt generation
├── layout.tsx                      # Root layout
└── globals.css                     # Global styles

components/
├── layout/
│   ├── Header.tsx                  # Main navigation
│   ├── Footer.tsx                  # Footer with link groups
│   ├── Breadcrumbs.tsx            # Breadcrumb navigation
│   └── MobileMenu.tsx              # Mobile hamburger menu
│
├── seo/
│   ├── JsonLd.tsx                  # Generic JSON-LD wrapper
│   ├── ArticleSchema.tsx           # Article schema component
│   ├── HowToSchema.tsx             # HowTo schema component
│   ├── BreadcrumbSchema.tsx        # Breadcrumb schema component
│   ├── FaqSchema.tsx               # FAQ schema component
│   └── CollectionPageSchema.tsx    # CollectionPage schema component
│
├── content/
│   ├── HeroSection.tsx             # Hero with image + intro
│   ├── QuickFactsBox.tsx           # Quick facts (species/location)
│   ├── ContentSection.tsx          # Generic content section
│   ├── RelatedContent.tsx          # Related content module
│   ├── InternalLinkGrid.tsx        # Grid of internal links
│   ├── DownloadCta.tsx             # Download app CTA block
│   ├── FaqSection.tsx               # FAQ accordion section
│   ├── LastUpdated.tsx             # Last updated date component
│   ├── AuthorBio.tsx               # Author bio component
│   ├── RegulationsDisclaimer.tsx   # Legal disclaimer for regulations
│   └── ForecastPlaceholder.tsx     # Fishing forecast placeholder
│
├── ui/                             # Shadcn UI components
│   ├── button.tsx
│   ├── card.tsx
│   ├── accordion.tsx               # For FAQ sections
│   └── ...                         # Other UI components
│
└── shared/
    ├── Image.tsx                   # Optimized Next Image wrapper
    ├── Link.tsx                    # Next Link wrapper with prefetch
    └── Container.tsx               # Page container wrapper

lib/
├── seo/
│   ├── metadata.ts                 # Metadata generation helpers
│   ├── schema.ts                   # Schema generation helpers
│   ├── slugs.ts                    # Slug normalization utilities
│   └── constants.ts                # SEO constants (site name, etc.)
│
├── content/
│   ├── species.ts                  # Species data access
│   ├── how-to.ts                   # How-to data access
│   ├── locations.ts                # Locations data access
│   ├── blog.ts                     # Blog data access
│   ├── regulations.ts              # Regulations data access
│   └── types.ts                    # TypeScript types for content
│
└── utils/
    ├── date.ts                     # Date formatting utilities
    └── url.ts                      # URL utilities

public/
├── images/
│   ├── species/                    # Species images
│   ├── locations/                  # Location images
│   ├── how-to/                     # How-to images
│   └── blog/                       # Blog images
└── og/                             # Open Graph images (generated)

data/                               # Placeholder JSON data (or CMS connection)
├── species.json
├── how-to.json
├── locations.json
├── blog.json
└── regulations.json
```

---

## Shared Components

### Layout Components

#### `components/layout/Header.tsx`
**Responsibilities:**
- Main navigation bar
- Logo + navigation links (Home, Species, How-To, Locations, Blog, Download)
- Mobile hamburger menu integration
- Active route highlighting

**Props:**
```typescript
interface HeaderProps {
  currentPath?: string;
}
```

#### `components/layout/Footer.tsx`
**Responsibilities:**
- 4 footer link groups (Product, Content, Resources, Company)
- Social media links (if applicable)
- Copyright notice
- Legal links (Privacy, Terms)

**Props:**
```typescript
interface FooterProps {
  // No props needed, static content
}
```

#### `components/layout/Breadcrumbs.tsx`
**Responsibilities:**
- Visual breadcrumb trail
- JSON-LD breadcrumb schema (via BreadcrumbSchema component)
- Responsive design

**Props:**
```typescript
interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}
```

### SEO Components

#### `components/seo/JsonLd.tsx`
**Responsibilities:**
- Render JSON-LD script tag
- Escape JSON properly
- Type-safe schema objects

**Props:**
```typescript
interface JsonLdProps {
  data: Record<string, any>;
}
```

#### `components/seo/ArticleSchema.tsx`
**Responsibilities:**
- Generate Article schema JSON-LD
- Handle required fields: headline, description, author, datePublished, dateModified
- Support mainEntityOfPage

**Props:**
```typescript
interface ArticleSchemaProps {
  headline: string;
  description: string;
  author: {
    name: string;
    url?: string;
  };
  datePublished: string; // ISO 8601
  dateModified: string; // ISO 8601
  image?: string;
  url: string;
  mainEntityOfPage?: string;
}
```

#### `components/seo/HowToSchema.tsx`
**Responsibilities:**
- Generate HowTo schema JSON-LD
- Handle step-by-step instructions
- Support tool, supply, totalTime fields

**Props:**
```typescript
interface HowToStep {
  name: string;
  text: string;
  image?: string;
  url?: string;
}

interface HowToSchemaProps {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string; // ISO 8601 duration
  tool?: string[];
  supply?: string[];
  image?: string;
  url: string;
}
```

#### `components/seo/BreadcrumbSchema.tsx`
**Responsibilities:**
- Generate BreadcrumbList schema JSON-LD
- Handle itemListElement array

**Props:**
```typescript
interface BreadcrumbItem {
  name: string;
  item: string; // URL
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}
```

#### `components/seo/FaqSchema.tsx`
**Responsibilities:**
- Generate FAQPage schema JSON-LD
- Handle mainEntity array of Question/Answer pairs

**Props:**
```typescript
interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSchemaProps {
  faqs: FaqItem[];
}
```

#### `components/seo/CollectionPageSchema.tsx`
**Responsibilities:**
- Generate CollectionPage schema JSON-LD
- For category/index pages

**Props:**
```typescript
interface CollectionPageSchemaProps {
  name: string;
  description: string;
  url: string;
  numberOfItems?: number;
}
```

### Content Components

#### `components/content/HeroSection.tsx`
**Responsibilities:**
- Hero image with overlay
- H1 title
- Introduction paragraph(s)
- Optional CTA button

**Props:**
```typescript
interface HeroSectionProps {
  title: string;
  image: string;
  imageAlt: string;
  introduction: string | string[]; // Can be multiple paragraphs
  cta?: {
    text: string;
    href: string;
  };
}
```

#### `components/content/QuickFactsBox.tsx`
**Responsibilities:**
- Quick facts display (species size, habitat, etc.)
- Grid layout
- Icon support

**Props:**
```typescript
interface QuickFact {
  label: string;
  value: string | string[];
  icon?: string;
}

interface QuickFactsBoxProps {
  facts: QuickFact[];
}
```

#### `components/content/ContentSection.tsx`
**Responsibilities:**
- Generic content section with heading
- Rich text content
- Optional image

**Props:**
```typescript
interface ContentSectionProps {
  title?: string;
  content: string | React.ReactNode;
  image?: {
    src: string;
    alt: string;
    position?: 'left' | 'right' | 'full';
  };
  className?: string;
}
```

#### `components/content/RelatedContent.tsx`
**Responsibilities:**
- Display related content modules
- Grid/card layout
- Links to related pages

**Props:**
```typescript
interface RelatedItem {
  title: string;
  href: string;
  description?: string;
  image?: string;
  type?: 'species' | 'how-to' | 'location' | 'blog';
}

interface RelatedContentProps {
  title: string;
  items: RelatedItem[];
  columns?: 3 | 4 | 5;
}
```

#### `components/content/InternalLinkGrid.tsx`
**Responsibilities:**
- Grid of internal links (species, how-to, locations)
- Card-based layout
- Hover effects

**Props:**
```typescript
interface InternalLink {
  title: string;
  href: string;
  description?: string;
  image?: string;
}

interface InternalLinkGridProps {
  title: string;
  links: InternalLink[];
  columns?: 3 | 4 | 5;
}
```

#### `components/content/DownloadCta.tsx`
**Responsibilities:**
- Prominent download CTA block
- App Store badge
- Deep link handling
- Multiple placement options (inline, sidebar, sticky)

**Props:**
```typescript
interface DownloadCtaProps {
  variant?: 'default' | 'inline' | 'sidebar' | 'sticky';
  title?: string;
  description?: string;
  className?: string;
}
```

#### `components/content/FaqSection.tsx`
**Responsibilities:**
- FAQ accordion component
- Integrates with FaqSchema for JSON-LD
- Accessible (ARIA)

**Props:**
```typescript
interface FaqItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  faqs: FaqItem[];
  title?: string;
}
```

#### `components/content/LastUpdated.tsx`
**Responsibilities:**
- Display last updated date
- Format: "Last updated: [Date]"

**Props:**
```typescript
interface LastUpdatedProps {
  date: string; // ISO 8601
  author?: string;
}
```

#### `components/content/AuthorBio.tsx`
**Responsibilities:**
- Author bio section (for blog posts)
- Author name, bio, optional image

**Props:**
```typescript
interface AuthorBioProps {
  name: string;
  bio: string;
  image?: string;
  url?: string;
}
```

#### `components/content/RegulationsDisclaimer.tsx`
**Responsibilities:**
- Legal disclaimer for regulations pages
- Prominent warning box
- Link to official source

**Props:**
```typescript
interface RegulationsDisclaimerProps {
  officialSourceUrl: string;
  lastUpdated: string;
  state: string;
}
```

#### `components/content/ForecastPlaceholder.tsx`
**Responsibilities:**
- Placeholder for future fishing forecast feature
- Link to `/conditions/[state]/[city]` (future route)

**Props:**
```typescript
interface ForecastPlaceholderProps {
  state: string;
  city: string;
}
```

---

## SEO & Schema Helpers

### `lib/seo/metadata.ts`

**Functions:**

```typescript
/**
 * Generate metadata for species pages
 */
export function generateSpeciesMetadata(
  species: Species,
  siteConfig: SiteConfig
): Metadata {
  // Returns Next.js Metadata object
  // Includes: title, description, openGraph, twitter, canonical
}

/**
 * Generate metadata for how-to pages
 */
export function generateHowToMetadata(
  howTo: HowTo,
  siteConfig: SiteConfig
): Metadata {
  // Returns Next.js Metadata object
}

/**
 * Generate metadata for location pages
 */
export function generateLocationMetadata(
  location: Location,
  siteConfig: SiteConfig
): Metadata {
  // Returns Next.js Metadata object
}

/**
 * Generate metadata for blog posts
 */
export function generateBlogMetadata(
  post: BlogPost,
  siteConfig: SiteConfig
): Metadata {
  // Returns Next.js Metadata object
}

/**
 * Generate metadata for regulations pages
 */
export function generateRegulationMetadata(
  regulation: Regulation,
  siteConfig: SiteConfig
): Metadata {
  // Returns Next.js Metadata object
}

/**
 * Generate metadata for category/index pages
 */
export function generateCategoryMetadata(
  category: Category,
  siteConfig: SiteConfig
): Metadata {
  // Returns Next.js Metadata object
}
```

**Metadata Rules:**
- **Title:** `[Page Title] | Tackle - AI Fishing Assistant` (max 60 chars)
- **Description:** 150-160 characters, includes primary keyword + CTA
- **Open Graph:** Title, description, image, url, type
- **Twitter Card:** Summary with large image
- **Canonical:** Absolute URL (no trailing slash)
- **Robots:** `index, follow` (unless specified otherwise)

### `lib/seo/schema.ts`

**Functions:**

```typescript
/**
 * Generate Article schema for species/location/blog pages
 */
export function generateArticleSchema(
  headline: string,
  description: string,
  author: Author,
  datePublished: string,
  dateModified: string,
  url: string,
  image?: string,
  mainEntityOfPage?: string
): ArticleSchema {
  // Returns Article schema object
}

/**
 * Generate HowTo schema for how-to pages
 */
export function generateHowToSchema(
  name: string,
  description: string,
  steps: HowToStep[],
  url: string,
  totalTime?: string,
  tool?: string[],
  supply?: string[],
  image?: string
): HowToSchema {
  // Returns HowTo schema object
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(
  items: BreadcrumbItem[]
): BreadcrumbListSchema {
  // Returns BreadcrumbList schema object
}

/**
 * Generate FAQPage schema
 */
export function generateFaqSchema(
  faqs: FaqItem[]
): FaqPageSchema {
  // Returns FAQPage schema object
}

/**
 * Generate CollectionPage schema for category/index pages
 */
export function generateCollectionPageSchema(
  name: string,
  description: string,
  url: string,
  numberOfItems?: number
): CollectionPageSchema {
  // Returns CollectionPage schema object
}
```

**Schema Field Requirements:**

**Article Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "string (required)",
  "description": "string (required)",
  "author": {
    "@type": "Person",
    "name": "string (required)"
  },
  "datePublished": "ISO 8601 (required)",
  "dateModified": "ISO 8601 (required)",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "URL (required)"
  },
  "image": "URL (optional)",
  "publisher": {
    "@type": "Organization",
    "name": "Tackle",
    "logo": {
      "@type": "ImageObject",
      "url": "logo URL"
    }
  }
}
```

**HowTo Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "string (required)",
  "description": "string (required)",
  "step": [
    {
      "@type": "HowToStep",
      "name": "string (required)",
      "text": "string (required)",
      "image": "URL (optional)",
      "url": "URL (optional)"
    }
  ],
  "totalTime": "ISO 8601 duration (optional)",
  "tool": ["string array (optional)"],
  "supply": ["string array (optional)"],
  "image": "URL (optional)"
}
```

**BreadcrumbList Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "string (required)",
      "item": "URL (required)"
    }
  ]
}
```

**FAQPage Schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "string (required)",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "string (required)"
      }
    }
  ]
}
```

### `lib/seo/slugs.ts`

**Functions:**

```typescript
/**
 * Normalize slug: lowercase, hyphenate, remove special chars
 */
export function normalizeSlug(input: string): string {
  // Convert to lowercase
  // Replace spaces/special chars with hyphens
  // Remove multiple consecutive hyphens
  // Trim hyphens from start/end
  // Example: "Red Fish (Guide)" → "red-fish-guide"
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
  // Check: lowercase, alphanumeric + hyphens only, no leading/trailing hyphens
}
```

### `lib/seo/constants.ts`

```typescript
export const SITE_CONFIG = {
  name: 'Tackle - AI Fishing Assistant',
  url: 'https://tackleapp.ai', // Update with actual domain
  description: 'AI-powered fishing assistant with fish identification, real-time conditions, and expert advice.',
  ogImage: '/og/default.jpg',
  twitterHandle: '@tackleapp', // Update if applicable
} as const;
```

---

## Template Implementations

### 1. Species Pages: `/species/[slug]`

#### File: `app/species/[slug]/page.tsx`

**Required Components (in order):**
1. `Breadcrumbs` - Home > Species > [Species Name]
2. `HeroSection` - Species image + H1 + introduction
3. `QuickFactsBox` - Size, habitat, best season, regulations summary
4. `ContentSection` - "About [Species]" section
5. `InternalLinkGrid` - "How to Catch [Species]" (3-5 how-to guides)
6. `InternalLinkGrid` - "Where to Find [Species]" (5 location pages)
7. `InternalLinkGrid` - "Gear & Tackle" (3 gear guides - placeholder)
8. `ContentSection` - "Regulations" section (if applicable, link to regulations page)
9. `DownloadCta` - After main content, before FAQ
10. `FaqSection` - 5-10 species-specific FAQs
11. `RelatedContent` - Related species, guides, locations
12. `LastUpdated` - Last updated date + author

**Metadata Generation:**
```typescript
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const species = await getSpeciesBySlug(params.slug);
  if (!species) notFound();
  
  return generateSpeciesMetadata(species, SITE_CONFIG);
}
```

**Schema Requirements:**
- `ArticleSchema` - Full article schema
- `BreadcrumbSchema` - Breadcrumb navigation
- `FaqSchema` - FAQ section

**Internal Linking Rules:**
- Link to 3-5 how-to guides (specific to species)
- Link to 5 location pages (where species is common)
- Link to 3 gear guides (placeholder)
- Link to 1 regulations page (if applicable)
- `/download` CTA

**Static Generation:**
```typescript
export async function generateStaticParams() {
  const species = await getAllSpecies();
  return species.map((s) => ({ slug: s.slug }));
}

export const revalidate = 86400; // Revalidate every 24 hours
```

**Implementation Checklist:**
- [ ] Generate metadata with `generateSpeciesMetadata`
- [ ] Add Article schema JSON-LD
- [ ] Add BreadcrumbList schema JSON-LD
- [ ] Add FAQPage schema JSON-LD
- [ ] Include all required components in order
- [ ] Link to 3-5 how-to guides
- [ ] Link to 5 location pages
- [ ] Link to regulations page (if applicable)
- [ ] Include `/download` CTA
- [ ] Add 5-10 FAQs
- [ ] Include last updated date
- [ ] Add related content module
- [ ] Optimize images (WebP, lazy loading)
- [ ] Ensure mobile responsive

---

### 2. How-To Pages: `/how-to/[slug]`

#### File: `app/how-to/[slug]/page.tsx`

**Required Components (in order):**
1. `Breadcrumbs` - Home > How-To Guides > [Guide Name]
2. `HeroSection` - Technique image + H1 + introduction
3. `ContentSection` - "Why This Technique Matters"
4. `ContentSection` - Step-by-step guide (numbered steps with images)
5. `ContentSection` - "Tips & Tricks" section
6. `ContentSection` - "Common Mistakes" section
7. `ContentSection` - "Best Conditions" section
8. `InternalLinkGrid` - "Species for This Technique" (3 species pages)
9. `InternalLinkGrid` - "Best Locations" (3 location pages)
10. `DownloadCta` - In conclusion section
11. `FaqSection` - 5-10 technique-specific FAQs
12. `RelatedContent` - Related how-to guides (3-5 similar techniques)
13. `LastUpdated` - Last updated date + author

**Metadata Generation:**
```typescript
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const howTo = await getHowToBySlug(params.slug);
  if (!howTo) notFound();
  
  return generateHowToMetadata(howTo, SITE_CONFIG);
}
```

**Schema Requirements:**
- `HowToSchema` - If step-by-step instructions exist
- OR `ArticleSchema` - If not a true how-to format
- `BreadcrumbSchema` - Breadcrumb navigation
- `FaqSchema` - FAQ section

**Internal Linking Rules:**
- Link to 3 species pages (relevant to technique)
- Link to 3 location pages (where technique is used)
- `/download` CTA in conclusion
- Link to 3-5 related how-to guides

**Static Generation:**
```typescript
export async function generateStaticParams() {
  const howTos = await getAllHowTos();
  return howTos.map((h) => ({ slug: h.slug }));
}

export const revalidate = 86400; // Revalidate every 24 hours
```

**Implementation Checklist:**
- [ ] Generate metadata with `generateHowToMetadata`
- [ ] Add HowTo schema JSON-LD (if applicable) OR Article schema
- [ ] Add BreadcrumbList schema JSON-LD
- [ ] Add FAQPage schema JSON-LD
- [ ] Include all required components in order
- [ ] Link to 3 species pages
- [ ] Link to 3 location pages
- [ ] Include `/download` CTA in conclusion
- [ ] Add 5-10 FAQs
- [ ] Include last updated date
- [ ] Add related guides module
- [ ] Optimize images
- [ ] Ensure mobile responsive

---

### 3. Location Pages: `/locations/[state]/[city]`

#### File: `app/locations/[state]/[city]/page.tsx`

**Required Components (in order):**
1. `Breadcrumbs` - Home > Locations > [State] > [City]
2. `HeroSection` - Location image + H1 + introduction
3. `QuickFactsBox` - Best season, water type, access points
4. `ContentSection` - "Best Fishing Spots" (5-10 specific spots)
5. `InternalLinkGrid` - "Popular Species Here" (5 species pages)
6. `InternalLinkGrid` - "Fishing Techniques" (5 how-to guides)
7. `ForecastPlaceholder` - "Today's Fishing Forecast" (future automation)
8. `ContentSection` - "Best Times to Fish" (seasonal patterns)
9. `ContentSection` - "Regulations" section (if applicable, link to regulations)
10. `ContentSection` - "Local Tips" section
11. `DownloadCta` - After main content, before FAQ
12. `FaqSection` - 5-10 location-specific FAQs
13. `RelatedContent` - Nearby locations (3-5 nearby cities)
14. `LastUpdated` - Last updated date + author

**Metadata Generation:**
```typescript
export async function generateMetadata(
  { params }: { params: { state: string; city: string } }
): Promise<Metadata> {
  const location = await getLocationBySlug(params.state, params.city);
  if (!location) notFound();
  
  return generateLocationMetadata(location, SITE_CONFIG);
}
```

**Schema Requirements:**
- `ArticleSchema` - Full article schema
- `BreadcrumbSchema` - Breadcrumb navigation
- `FaqSchema` - FAQ section
- Optional: `LocalBusiness` or `Place` schema (if applicable)

**Internal Linking Rules:**
- Link to 5 species pages (common in location)
- Link to 5 how-to guides (relevant techniques)
- Link to forecast placeholder (future: `/conditions/[state]/[city]`)
- Link to 1-2 regulations pages (if applicable)
- `/download` CTA

**Static Generation:**
```typescript
export async function generateStaticParams() {
  const locations = await getAllLocations();
  return locations.map((l) => ({
    state: l.stateSlug,
    city: l.citySlug,
  }));
}

export const revalidate = 86400; // Revalidate every 24 hours
```

**Implementation Checklist:**
- [ ] Generate metadata with `generateLocationMetadata`
- [ ] Add Article schema JSON-LD
- [ ] Add BreadcrumbList schema JSON-LD
- [ ] Add FAQPage schema JSON-LD
- [ ] Include all required components in order
- [ ] Link to 5 species pages
- [ ] Link to 5 how-to guides
- [ ] Include forecast placeholder
- [ ] Link to regulations pages (if applicable)
- [ ] Include `/download` CTA
- [ ] Add 5-10 FAQs
- [ ] Include last updated date
- [ ] Add related locations module
- [ ] Optimize images
- [ ] Ensure mobile responsive

---

### 4. Blog Posts: `/blog/[slug]`

#### File: `app/blog/[slug]/page.tsx`

**Required Components (in order):**
1. `Breadcrumbs` - Home > Blog > [Category] > [Post Title]
2. `HeroSection` - Featured image + H1 + introduction
3. `ContentSection` - Main article content (with H2/H3 subheadings)
4. `InternalLinkGrid` - Inline links to 1 species page (natural context)
5. `InternalLinkGrid` - Inline links to 1 how-to page (natural context)
6. `InternalLinkGrid` - Inline links to 1 location page (if applicable)
7. `ContentSection` - Conclusion with `/download` CTA
8. `FaqSection` - 5-10 topic-specific FAQs
9. `RelatedContent` - Related blog posts (3-5 same category)
10. `AuthorBio` - Author bio (if applicable)
11. `LastUpdated` - Publish date + last updated

**Metadata Generation:**
```typescript
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();
  
  return generateBlogMetadata(post, SITE_CONFIG);
}
```

**Schema Requirements:**
- `ArticleSchema` - Full article schema (BlogPosting type)
- `BreadcrumbSchema` - Breadcrumb navigation

**Internal Linking Rules:**
- Link to 1 species page (in body content)
- Link to 1 how-to page (in body content)
- Link to 1 location page (if applicable, in body content)
- `/download` CTA in conclusion
- Link to 3-5 related blog posts

**Static Generation:**
```typescript
export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export const revalidate = 3600; // Revalidate every hour (for automated posts)
```

**Implementation Checklist:**
- [ ] Generate metadata with `generateBlogMetadata`
- [ ] Add Article schema JSON-LD (BlogPosting type)
- [ ] Add BreadcrumbList schema JSON-LD
- [ ] Include all required components in order
- [ ] Link to 1 species page (natural context)
- [ ] Link to 1 how-to page (natural context)
- [ ] Link to 1 location page (if applicable)
- [ ] Include `/download` CTA in conclusion
- [ ] Add 5-10 FAQs
- [ ] Include author bio (if applicable)
- [ ] Include publish date + last updated
- [ ] Add related posts module
- [ ] Optimize images
- [ ] Ensure mobile responsive

---

### 5. Blog Categories: `/blog/category/[category]`

#### File: `app/blog/category/[category]/page.tsx`

**Required Components (in order):**
1. `Breadcrumbs` - Home > Blog > [Category Name]
2. `HeroSection` - Category image + H1 + category description
3. `ContentSection` - Category introduction
4. `BlogPostGrid` - Grid of blog posts in category (paginated)
5. `RelatedContent` - Other categories (3-5 related categories)

**Metadata Generation:**
```typescript
export async function generateMetadata(
  { params }: { params: { category: string } }
): Promise<Metadata> {
  const category = await getCategoryBySlug(params.category);
  if (!category) notFound();
  
  return generateCategoryMetadata(category, SITE_CONFIG);
}
```

**Schema Requirements:**
- `CollectionPageSchema` - Collection page schema
- `BreadcrumbSchema` - Breadcrumb navigation

**Static Generation:**
```typescript
export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((c) => ({ category: c.slug }));
}

export const revalidate = 86400; // Revalidate every 24 hours
```

**Implementation Checklist:**
- [ ] Generate metadata with `generateCategoryMetadata`
- [ ] Add CollectionPage schema JSON-LD
- [ ] Add BreadcrumbList schema JSON-LD
- [ ] Include all required components
- [ ] Paginate blog posts (if > 20 posts)
- [ ] Optimize images
- [ ] Ensure mobile responsive

---

### 6. Regulations Pages: `/regulations/[state]/[topic]`

#### File: `app/regulations/[state]/[topic]/page.tsx`

**Required Components (in order):**
1. `Breadcrumbs` - Home > Regulations > [State] > [Topic]
2. `RegulationsDisclaimer` - Prominent legal disclaimer at top
3. `HeroSection` - Topic image + H1 + introduction
4. `ContentSection` - Regulations content (size limits, bag limits, seasons)
5. `InternalLinkGrid` - "Affected Species" (3-5 species pages)
6. `InternalLinkGrid` - "Affected Locations" (3-5 location pages)
7. `ContentSection` - Official source link (external, prominent)
8. `DownloadCta` - With note about regulations feature in app
9. `FaqSection` - 5-10 regulation-specific FAQs
10. `LastUpdated` - Last updated date (critical for regulations)

**Metadata Generation:**
```typescript
export async function generateMetadata(
  { params }: { params: { state: string; topic: string } }
): Promise<Metadata> {
  const regulation = await getRegulationBySlug(params.state, params.topic);
  if (!regulation) notFound();
  
  return generateRegulationMetadata(regulation, SITE_CONFIG);
}
```

**Schema Requirements:**
- `ArticleSchema` - Full article schema
- `BreadcrumbSchema` - Breadcrumb navigation
- `FaqSchema` - FAQ section

**Internal Linking Rules:**
- Link to 3-5 species pages (affected by regulations)
- Link to 3-5 location pages (where regulations apply)
- External link to official state agency (prominent)
- `/download` CTA with regulations feature note

**Static Generation:**
```typescript
export async function generateStaticParams() {
  const regulations = await getAllRegulations();
  return regulations.map((r) => ({
    state: r.stateSlug,
    topic: r.topicSlug,
  }));
}

export const revalidate = 86400; // Revalidate every 24 hours
```

**Implementation Checklist:**
- [ ] Generate metadata with `generateRegulationMetadata`
- [ ] Add Article schema JSON-LD
- [ ] Add BreadcrumbList schema JSON-LD
- [ ] Add FAQPage schema JSON-LD
- [ ] Include disclaimer at top (prominent)
- [ ] Include all required components in order
- [ ] Link to official source (external, prominent)
- [ ] Link to 3-5 species pages
- [ ] Link to 3-5 location pages
- [ ] Include `/download` CTA with regulations note
- [ ] Add 5-10 FAQs
- [ ] Include last updated date (critical)
- [ ] Optimize images
- [ ] Ensure mobile responsive

---

## Sitemap & Robots Strategy

### Sitemap: `app/sitemap.ts`

**Strategy:**
- Support thousands of pages
- Split into multiple sitemaps if > 50,000 URLs
- Use `generateStaticParams` data for all dynamic routes
- Include lastmod, changefreq, priority

**Implementation:**
```typescript
import { MetadataRoute } from 'next';
import {
  getAllSpecies,
  getAllHowTos,
  getAllLocations,
  getAllBlogPosts,
  getAllRegulations,
  getAllCategories,
} from '@/lib/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tackleapp.ai'; // Update with actual domain
  
  // Core marketing pages (static)
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/download`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/features`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // ... other static pages
  ];

  // Species pages
  const species = await getAllSpecies();
  const speciesPages: MetadataRoute.Sitemap = species.map((s) => ({
    url: `${baseUrl}/species/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // How-to pages
  const howTos = await getAllHowTos();
  const howToPages: MetadataRoute.Sitemap = howTos.map((h) => ({
    url: `${baseUrl}/how-to/${h.slug}`,
    lastModified: h.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // Location pages
  const locations = await getAllLocations();
  const locationPages: MetadataRoute.Sitemap = locations.map((l) => ({
    url: `${baseUrl}/locations/${l.stateSlug}/${l.citySlug}`,
    lastModified: l.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Blog posts
  const posts = await getAllBlogPosts();
  const blogPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${baseUrl}/blog/${p.slug}`,
    lastModified: p.updatedAt || p.publishedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Blog categories
  const categories = await getAllCategories();
  const categoryPages: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/blog/category/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // Regulations pages
  const regulations = await getAllRegulations();
  const regulationPages: MetadataRoute.Sitemap = regulations.map((r) => ({
    url: `${baseUrl}/regulations/${r.stateSlug}/${r.topicSlug}`,
    lastModified: r.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Index pages
  const indexPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/species`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/how-to`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/locations`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/regulations`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // Combine all sitemaps
  return [
    ...staticPages,
    ...indexPages,
    ...speciesPages,
    ...howToPages,
    ...locationPages,
    ...blogPages,
    ...categoryPages,
    ...regulationPages,
  ];
}
```

**Sitemap Index (if > 50,000 URLs):**
- Split into multiple sitemap files
- Create `sitemap-index.xml` that references all sitemaps
- Use Next.js dynamic sitemap routes if needed

### Robots: `app/robots.ts`

**Implementation:**
```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://tackleapp.ai'; // Update with actual domain
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

**Robots Rules:**
- Allow all public pages
- Disallow API routes, admin, private pages
- Allow Googlebot full access
- Reference sitemap URL

---

## Data Layer

### Function Signatures

#### `lib/content/species.ts`

```typescript
/**
 * Get species by slug
 */
export async function getSpeciesBySlug(slug: string): Promise<Species | null> {
  // Fetch from data source (JSON, CMS, database)
  // Return null if not found
}

/**
 * Get all species (for sitemap/listing)
 */
export async function getAllSpecies(): Promise<Species[]> {
  // Fetch all species
  // Return array sorted by name or priority
}

/**
 * Get related species (for related content module)
 */
export async function getRelatedSpecies(
  currentSpecies: Species,
  limit: number = 5
): Promise<Species[]> {
  // Find species with similar tags, region, or type
  // Exclude current species
  // Return limited results
}
```

**Species Type:**
```typescript
interface Species {
  slug: string;
  name: string;
  scientificName?: string;
  description: string;
  introduction: string; // For hero section
  image: string;
  imageAlt: string;
  quickFacts: {
    size: string;
    habitat: string;
    bestSeason: string;
    regulationsSummary?: string;
  };
  content: {
    about: string; // About section content
    habitat: string;
    behavior: string;
    diet?: string;
  };
  relatedHowTos: string[]; // Array of how-to slugs
  relatedLocations: string[]; // Array of location slugs (state/city)
  relatedGear?: string[]; // Array of gear guide slugs (future)
  regulationsSlug?: string; // Regulations page slug (if applicable)
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  meta: {
    title: string;
    description: string;
    keywords?: string[];
  };
  author: {
    name: string;
    url?: string;
  };
  publishedAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

#### `lib/content/how-to.ts`

```typescript
/**
 * Get how-to guide by slug
 */
export async function getHowToBySlug(slug: string): Promise<HowTo | null> {
  // Fetch from data source
  // Return null if not found
}

/**
 * Get all how-to guides
 */
export async function getAllHowTos(): Promise<HowTo[]> {
  // Fetch all how-to guides
  // Return array sorted by category or priority
}

/**
 * Get related how-to guides
 */
export async function getRelatedHowTos(
  currentHowTo: HowTo,
  limit: number = 5
): Promise<HowTo[]> {
  // Find guides with similar category, technique, or tags
  // Exclude current guide
  // Return limited results
}
```

**HowTo Type:**
```typescript
interface HowTo {
  slug: string;
  title: string;
  description: string;
  introduction: string; // For hero section
  image: string;
  imageAlt: string;
  category: 'beginner' | 'inshore' | 'pier-bank' | 'kayak' | 'advanced';
  steps?: Array<{
    name: string;
    text: string;
    image?: string;
  }>;
  content: {
    whyMatters: string;
    tips: string[];
    commonMistakes: string[];
    bestConditions: string;
  };
  totalTime?: string; // ISO 8601 duration
  tools?: string[];
  supplies?: string[];
  relatedSpecies: string[]; // Array of species slugs
  relatedLocations: string[]; // Array of location slugs
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  meta: {
    title: string;
    description: string;
    keywords?: string[];
  };
  author: {
    name: string;
    url?: string;
  };
  publishedAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

#### `lib/content/locations.ts`

```typescript
/**
 * Get location by state and city slugs
 */
export async function getLocationBySlug(
  state: string,
  city: string
): Promise<Location | null> {
  // Fetch from data source
  // Return null if not found
}

/**
 * Get all locations
 */
export async function getAllLocations(): Promise<Location[]> {
  // Fetch all locations
  // Return array sorted by state, then city
}

/**
 * Get nearby locations
 */
export async function getNearbyLocations(
  currentLocation: Location,
  limit: number = 5
): Promise<Location[]> {
  // Find locations in same state or nearby
  // Exclude current location
  // Return limited results
}
```

**Location Type:**
```typescript
interface Location {
  stateSlug: string;
  stateName: string;
  citySlug: string;
  cityName: string;
  description: string;
  introduction: string; // For hero section
  image: string;
  imageAlt: string;
  quickFacts: {
    bestSeason: string;
    waterType: string;
    accessPoints: string[];
  };
  content: {
    bestSpots: Array<{
      name: string;
      description: string;
      coordinates?: { lat: number; lng: number };
    }>;
    bestTimes: string; // Seasonal patterns
    localTips: string;
  };
  relatedSpecies: string[]; // Array of species slugs
  relatedHowTos: string[]; // Array of how-to slugs
  regulationsSlugs?: string[]; // Array of regulations slugs (if applicable)
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  meta: {
    title: string;
    description: string;
    keywords?: string[];
  };
  author: {
    name: string;
    url?: string;
  };
  publishedAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

#### `lib/content/blog.ts`

```typescript
/**
 * Get blog post by slug
 */
export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  // Fetch from data source
  // Return null if not found
}

/**
 * Get all blog posts
 */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
  // Fetch all blog posts
  // Return array sorted by publishedAt (newest first)
}

/**
 * Get posts by category
 */
export async function getPostsByCategory(
  categorySlug: string,
  limit?: number
): Promise<BlogPost[]> {
  // Fetch posts in category
  // Return array sorted by publishedAt
  // Apply limit if provided
}

/**
 * Get related blog posts
 */
export async function getRelatedPosts(
  currentPost: BlogPost,
  limit: number = 5
): Promise<BlogPost[]> {
  // Find posts with same category or similar tags
  // Exclude current post
  // Return limited results
}

/**
 * Get all categories
 */
export async function getAllCategories(): Promise<Category[]> {
  // Fetch all blog categories
  // Return array with post counts
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(
  slug: string
): Promise<Category | null> {
  // Fetch category
  // Return null if not found
}
```

**BlogPost Type:**
```typescript
interface BlogPost {
  slug: string;
  title: string;
  description: string;
  introduction: string; // For hero section
  featuredImage: string;
  featuredImageAlt: string;
  category: string; // Category slug
  tags?: string[];
  content: string; // Markdown or HTML content
  relatedSpecies?: string; // Species slug (if applicable)
  relatedHowTo?: string; // How-to slug (if applicable)
  relatedLocation?: string; // Location slug (if applicable)
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
  meta: {
    title: string;
    description: string;
    keywords?: string[];
  };
  author: {
    name: string;
    bio?: string;
    image?: string;
    url?: string;
  };
  publishedAt: string; // ISO 8601
  updatedAt?: string; // ISO 8601 (optional, defaults to publishedAt)
}
```

**Category Type:**
```typescript
interface Category {
  slug: string;
  name: string;
  description: string;
  image?: string;
  postCount: number; // Number of posts in category
}
```

#### `lib/content/regulations.ts`

```typescript
/**
 * Get regulation by state and topic slugs
 */
export async function getRegulationBySlug(
  state: string,
  topic: string
): Promise<Regulation | null> {
  // Fetch from data source
  // Return null if not found
}

/**
 * Get all regulations
 */
export async function getAllRegulations(): Promise<Regulation[]> {
  // Fetch all regulations
  // Return array sorted by state, then topic
}

/**
 * Get regulations by state
 */
export async function getRegulationsByState(
  stateSlug: string
): Promise<Regulation[]> {
  // Fetch regulations for specific state
  // Return array sorted by topic
}
```

**Regulation Type:**
```typescript
interface Regulation {
  stateSlug: string;
  stateName: string;
  topicSlug: string;
  topicName: string;
  description: string;
  introduction: string; // For hero section
  image?: string;
  imageAlt?: string;
  officialSourceUrl: string; // External link to state agency
  content: {
    sizeLimits?: string;
    bagLimits?: string;
    seasons?: string;
    closedSeasons?: string;
    specialZones?: string;
    other?: string; // Additional regulation content
  };
  affectedSpecies: string[]; // Array of species slugs
  affectedLocations: string[]; // Array of location slugs
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  meta: {
    title: string;
    description: string;
    keywords?: string[];
  };
  publishedAt: string; // ISO 8601
  updatedAt: string; // ISO 8601 (critical for regulations)
}
```

#### `lib/content/types.ts`

**Shared Types:**
```typescript
export interface Author {
  name: string;
  bio?: string;
  image?: string;
  url?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface MetaData {
  title: string;
  description: string;
  keywords?: string[];
}

export interface SiteConfig {
  name: string;
  url: string;
  description: string;
  ogImage: string;
  twitterHandle?: string;
}
```

### Placeholder Data Structure

**Example: `data/species.json`**
```json
[
  {
    "slug": "redfish",
    "name": "Redfish",
    "scientificName": "Sciaenops ocellatus",
    "description": "Redfish, also known as red drum, are a popular inshore game fish...",
    "introduction": "Redfish are one of the most sought-after inshore species in Florida...",
    "image": "/images/species/redfish.jpg",
    "imageAlt": "Redfish (Red Drum) in shallow water",
    "quickFacts": {
      "size": "18-27 inches (slot limit)",
      "habitat": "Inshore waters, flats, mangroves",
      "bestSeason": "Year-round, best in fall",
      "regulationsSummary": "Slot limit: 18-27 inches, 1 per person"
    },
    "content": {
      "about": "Redfish are known for their distinctive black spot...",
      "habitat": "Redfish prefer shallow inshore waters...",
      "behavior": "Redfish are bottom feeders...",
      "diet": "Redfish feed on crabs, shrimp, and small fish..."
    },
    "relatedHowTos": [
      "catch-redfish-inshore",
      "fish-flats",
      "fish-tide-changes"
    ],
    "relatedLocations": [
      "florida/miami",
      "florida/tampa",
      "florida/key-west",
      "florida/fort-lauderdale",
      "florida/sarasota"
    ],
    "regulationsSlug": "florida/redfish-regulations",
    "faqs": [
      {
        "question": "What is the slot limit for redfish in Florida?",
        "answer": "The slot limit for redfish in Florida is 18-27 inches total length."
      }
    ],
    "meta": {
      "title": "Redfish Fishing Guide: How to Catch Redfish",
      "description": "Complete guide to catching redfish in Florida. Learn about redfish habitat, best techniques, and regulations.",
      "keywords": ["redfish", "red drum", "florida fishing", "inshore fishing"]
    },
    "author": {
      "name": "Tackle Team",
      "url": "/about"
    },
    "publishedAt": "2024-01-15T00:00:00Z",
    "updatedAt": "2024-01-20T00:00:00Z"
  }
]
```

---

## Implementation Checklist Summary

### Phase 1: Setup
- [ ] Create Next.js App Router project structure
- [ ] Set up folder structure (app/, components/, lib/)
- [ ] Install dependencies (Next.js, TypeScript, Tailwind, Shadcn UI)
- [ ] Create shared components (Header, Footer, Breadcrumbs)
- [ ] Set up SEO helpers (metadata.ts, schema.ts, slugs.ts)
- [ ] Create placeholder data files (JSON)

### Phase 2: Core Templates
- [ ] Implement species page template (`/species/[slug]`)
- [ ] Implement how-to page template (`/how-to/[slug]`)
- [ ] Implement location page template (`/locations/[state]/[city]`)
- [ ] Implement blog post template (`/blog/[slug]`)
- [ ] Implement blog category template (`/blog/category/[category]`)
- [ ] Implement regulations page template (`/regulations/[state]/[topic]`)

### Phase 3: Index Pages
- [ ] Implement species index (`/species`)
- [ ] Implement how-to index (`/how-to`)
- [ ] Implement locations index (`/locations`)
- [ ] Implement blog index (`/blog`)
- [ ] Implement regulations index (`/regulations`)

### Phase 4: SEO & Performance
- [ ] Implement sitemap.ts
- [ ] Implement robots.ts
- [ ] Add all schema JSON-LD to templates
- [ ] Optimize images (WebP, lazy loading)
- [ ] Add breadcrumbs to all pages
- [ ] Test metadata generation

### Phase 5: Content & Testing
- [ ] Populate placeholder data (10-20 entries per type)
- [ ] Test all page types render correctly
- [ ] Verify internal linking works
- [ ] Test mobile responsiveness
- [ ] Run SEO audit (Lighthouse, PageSpeed)
- [ ] Test schema markup (Google Rich Results Test)

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Next Steps:** Begin Phase 1 implementation



