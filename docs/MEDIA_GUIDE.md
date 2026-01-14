# Media Guide - Tackle Website

## Purpose

This document defines strict media standards for all content. Images are critical for retention - posts without images have 40% higher bounce rates. Every image must serve a purpose and meet technical specifications.

---

## Image Requirements by Content Type

### Blog Posts (MINIMUM 4 Images Required)

**Mandatory:**
1. **Hero image** (1200x600px) - Fishing action, target species, or location
2. **Tackle/gear photo** (800x600px) - After Section 3 (Tackle Box Snapshot)
3. **Structure/location photo** (800x600px) - After Section 6 (Spot Playbook)
4. **Action/technique photo** (800x600px) - After Section 4 (Step-by-Step)

**Optional:**
5. **Detail/closeup photo** (800x600px) - Within Mistakes or FAQ sections

### Species Pages (MINIMUM 3 Images)
- 1 hero image (species in habitat)
- 2 supporting images (tackle, locations)

### How-To Guides (MINIMUM 3 Images)
- 1 hero image (technique demonstration)
- 2 step-by-step images (process illustrations)

### Location Pages (MINIMUM 4 Images)
- 1 hero image (location overview)
- 3 spot-specific images (individual fishing locations)

---

## Image Sizing Standards

### Hero Images
**Dimensions:** 1200x600px (2:1 aspect ratio)
**Format:** WebP (preferred), JPEG fallback
**Max file size:** 150KB
**Quality:** 80-85%

**Usage:**
- Blog post top
- Species page header
- Location page header

### Inline Images (Supporting)
**Dimensions:** 800x600px (4:3 aspect ratio)
**Format:** WebP (preferred), JPEG fallback
**Max file size:** 100KB
**Quality:** 75-80%

**Usage:**
- After Tackle Box section
- After Step-by-Step section
- After Spot Playbook section
- Within content body

### Thumbnails (Card Images)
**Dimensions:** 400x300px (4:3 aspect ratio)
**Format:** WebP (preferred), JPEG fallback
**Max file size:** 50KB
**Quality:** 70-75%

**Usage:**
- Blog index cards
- Related content cards
- Category page cards

### Diagrams & Illustrations
**Dimensions:** Variable (maintain readability)
**Format:** SVG (preferred), PNG fallback
**Max file size:** 75KB

**Usage:**
- Technique diagrams
- Spot maps
- Gear setup illustrations

---

## Image Naming Conventions

### Pattern
`{slug}-{purpose}-{index}.webp`

### Examples
**Blog Posts:**
- `best-snook-lures-florida-hero.webp`
- `best-snook-lures-florida-tackle-1.webp`
- `best-snook-lures-florida-location-1.webp`
- `best-snook-lures-florida-action-1.webp`

**Species Pages:**
- `redfish-hero.webp`
- `redfish-habitat-1.webp`
- `redfish-tackle-1.webp`

**Location Pages:**
- `florida-miami-hero.webp`
- `florida-miami-spot-government-cut.webp`
- `florida-miami-spot-key-biscayne.webp`

### Purpose Identifiers
- `hero` - Hero/header image
- `tackle` - Gear/equipment photo
- `location` - Structure/habitat photo
- `action` - Technique/casting photo
- `detail` - Closeup/detail shot
- `spot` - Specific fishing spot
- `diagram` - Illustration/diagram

---

## Alt Text Formula

### Pattern
`[subject] + [location/context] + [action/state]`

### Examples
**Good Alt Text:**
- ✅ `"Angler casting for snook in Florida mangroves at sunrise"`
- ✅ `"Soft plastic jerkbaits and fishing tackle for snook fishing"`
- ✅ `"Mangrove shoreline with snook habitat in Florida inshore waters"`
- ✅ `"Snook with lure showing proper hook placement"`

**Bad Alt Text:**
- ❌ `"Fishing"` (too vague)
- ❌ `"Image123.jpg"` (technical, not descriptive)
- ❌ `"Best snook lures for Florida"` (keyword stuffing)
- ❌ `""` (empty alt text)

### Alt Text Rules
- **Length:** 125 characters maximum
- **Keywords:** Include 1-2 relevant keywords naturally
- **Specificity:** Describe what's actually visible
- **No redundancy:** Don't repeat caption or surrounding text
- **Accessibility:** Describe for someone who can't see the image

---

## Image Caption Formula

### Pattern
`[What you see] + [Why it matters] + [When/how to apply]`

### Examples
**Good Captions:**
- ✅ `"This tackle setup covers all snook scenarios—soft plastics for mangroves, topwater for flats, and jigs for bridges."`
- ✅ `"Target mangrove edges with 2-6 feet of water and undercut roots during incoming tide."`
- ✅ `"Cast parallel to structure, not directly at it—this keeps your lure in the strike zone longer."`

**Bad Captions:**
- ❌ `"Fishing lures"` (no value)
- ❌ `"Mangrove shoreline"` (no context)
- ❌ `"Angler fishing"` (no takeaway)

### Caption Rules
- **Required:** Every image must have a caption
- **Length:** 1-2 sentences, ~100-150 characters
- **Value:** Provide actionable insight
- **Format:** Italic text below image in markdown

---

## Approved Image Sources

### 1. Unsplash (Primary Source)
**URL Format:**
```
https://images.unsplash.com/photo-[PHOTO_ID]?w=800&h=600&fit=crop
```

**Required Parameters:**
- `w=800` - Width
- `h=600` - Height (optional for hero: h=600 for 1200x600)
- `fit=crop` - Crop to fit dimensions

**Search Terms:**
- `fishing`, `angler`, `fishing rod`, `casting`
- Species: `snook`, `bass fishing`, `redfish`, `trout fishing`
- Gear: `fishing lures`, `fishing tackle`, `fishing reels`
- Locations: `mangrove fishing`, `bridge fishing`, `flats fishing`
- Action: `fly fishing`, `casting`, `fishing boat`

**Common Photo IDs:**
- Fishing action: `1544552866-d3ed42536cfd`
- Tackle/lures: `1515023115689-589c33041d3c`
- Mangroves: `1559827260-dc66d52bef19`
- Angler casting: `1592329347327-27c7e288b5f6`

### 2. Original Photography
- Must be owned by Tackle or have commercial license
- Provide source/license information
- Store in `public/images/originals/`

### 3. UGC (User-Generated Content)
- Only with explicit permission
- Must have signed release
- Credit photographer in caption
- Store metadata: `{image}_metadata.json`

### 4. Commissioned Art/Diagrams
- Custom illustrations for techniques
- Diagrams for spot maps
- Created specifically for Tackle
- SVG format preferred

### 5. Context-Specific AI-Generated
- ONLY for diagrams/illustrations
- NEVER for hero images
- Must disclose in metadata
- Label: "Illustration created for Tackle"

---

## Image Metadata

### Metadata File Pattern
`{image-name}_metadata.json`

### Required Fields
```json
{
  "filename": "best-snook-lures-florida-hero.webp",
  "source": "unsplash",
  "sourceUrl": "https://unsplash.com/photos/1544552866-d3ed42536cfd",
  "photographer": "John Doe",
  "license": "Unsplash License",
  "retrievedAt": "2024-01-15T00:00:00Z",
  "aiGenerated": false,
  "dimensions": "1200x600",
  "fileSize": "145KB",
  "format": "webp"
}
```

### Optional Fields
```json
{
  "altText": "Angler casting for snook in Florida mangroves",
  "caption": "Cast parallel to structure to keep lure in strike zone",
  "credit": "Photo by John Doe",
  "location": "Florida Keys",
  "species": ["snook"],
  "tags": ["casting", "mangroves", "florida"]
}
```

---

## Compression & Format Rules

### Compression Guidelines

**WebP Format (Preferred):**
- Hero images: 80-85% quality, target 150KB
- Inline images: 75-80% quality, target 100KB
- Thumbnails: 70-75% quality, target 50KB

**JPEG Format (Fallback):**
- Hero images: 85% quality, target 200KB
- Inline images: 80% quality, target 125KB
- Thumbnails: 75% quality, target 75KB

**PNG Format (Rare - Diagrams Only):**
- Only for diagrams with transparency
- Optimize with tools like TinyPNG
- Target under 100KB

### Optimization Tools
- **Squoosh** (https://squoosh.app/) - Manual optimization
- **Sharp** (Node.js) - Automated pipeline optimization
- **Next.js Image** - Automatic optimization on-the-fly

---

## Image Placement Rules

### Where TO Place Images

**✅ After Tackle Box Section (Section 3)**
- Shows gear/lures laid out
- Reinforces equipment list
- Breaks up text after dense info

**✅ After Step-by-Step Section (Section 4)**
- Demonstrates technique
- Shows action/casting
- Visual break after instructions

**✅ After Spot Playbook Section (Section 6)**
- Shows structure/habitat
- Provides location context
- Mid-post engagement boost

**✅ Before Mistakes Section (Section 7) - Optional**
- Detail/closeup shot
- Reinforces teaching point
- Extra visual for longest section

### Where NOT to Place Images

**❌ Between Section 1 and Section 2**
- Delays quick answer
- Hurts immediate value delivery

**❌ In the Middle of Numbered Steps**
- Breaks instructional flow
- Disrupts step-by-step reading

**❌ Between FAQs**
- Disrupts Q&A rhythm
- Reduces scannability

**❌ Right Before Regulations Line**
- Wrong tone
- Detracts from important disclaimer

---

## Image Markdown Syntax

### Standard Format
```markdown
![Alt text describing the image](https://images.unsplash.com/photo-ID?w=800&h=600&fit=crop)
*Caption providing actionable context or teaching point.*
```

### Examples

**Tackle Image:**
```markdown
![Soft plastic jerkbaits and fishing tackle for snook](https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=800&h=600&fit=crop)
*This tackle setup covers all snook scenarios—soft plastics for mangroves, topwater for flats, and jigs for bridges.*
```

**Action Image:**
```markdown
![Angler casting parallel to mangrove shoreline for snook](https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=800&h=600&fit=crop)
*Cast parallel to structure, not directly at it—this keeps your lure in the strike zone longer.*
```

**Location Image:**
```markdown
![Mangrove shoreline with snook habitat in Florida](https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop)
*Target mangrove edges with 2-6 feet of water, undercut roots, and shade during incoming tide.*
```

---

## Image Folder Structure

### Recommended Structure

```
public/images/
├── blog/
│   ├── hero/                          # Hero images (1200x600)
│   │   ├── best-snook-lures-florida-hero.webp
│   │   └── how-to-tie-a-fishing-hook-hero.webp
│   ├── inline/                        # Inline images (800x600)
│   │   ├── best-snook-lures-florida-tackle-1.webp
│   │   ├── best-snook-lures-florida-location-1.webp
│   │   └── best-snook-lures-florida-action-1.webp
│   └── thumbnails/                    # Card thumbnails (400x300)
│       ├── best-snook-lures-florida-thumb.webp
│       └── how-to-tie-a-fishing-hook-thumb.webp
├── posts/                             # Alternative: organized by slug
│   ├── best-snook-lures-florida/
│   │   ├── hero.webp
│   │   ├── tackle-1.webp
│   │   ├── location-1.webp
│   │   ├── action-1.webp
│   │   └── metadata.json
│   └── how-to-tie-a-fishing-hook/
│       ├── hero.webp
│       ├── step-1.webp
│       ├── step-2.webp
│       └── metadata.json
├── hubs/                              # Hub page images
│   ├── florida-fishing-guide-hero.webp
│   └── species-guides-hero.webp
└── diagrams/                          # Diagrams and illustrations
    ├── knot-diagram-palomar.svg
    ├── knot-diagram-uni.svg
    └── spot-map-tampa-bay.svg
```

---

## Prohibited Image Types

### ❌ NEVER Use:
- **Generic stock photos** - Business people, unrelated activities
- **Low-resolution images** - Pixelated, blurry, or stretched
- **Watermarked images** - Unless it's our watermark
- **Unrelated images** - Not fishing-specific
- **Copyrighted without license** - Must have usage rights
- **Offensive content** - Anything inappropriate
- **Poor composition** - Out of focus, bad lighting
- **Text overlays** - Keep images clean (captions are separate)

---

## Image Review Checklist

Before publishing any content with images:
- [ ] Minimum image count met (4 for blog posts)
- [ ] All images have descriptive alt text
- [ ] All images have actionable captions
- [ ] Hero image is 1200x600px (or appropriate size)
- [ ] Inline images are 800x600px
- [ ] All images under file size limits
- [ ] WebP format used (with JPEG fallback)
- [ ] Images use approved sources
- [ ] Metadata file created (if needed)
- [ ] Image placement follows guidelines
- [ ] No generic stock photos used
- [ ] Mobile: images stack/display properly
- [ ] No broken image links
- [ ] Proper markdown syntax used

---

## Technical Implementation

### Next.js Image Component
```tsx
import Image from 'next/image';

// For hero images
<Image
  src="/images/blog/hero/post-slug-hero.webp"
  alt="Descriptive alt text"
  width={1200}
  height={600}
  priority // For hero images only
  className="rounded-lg"
/>

// For inline images
<Image
  src="/images/blog/inline/post-slug-tackle-1.webp"
  alt="Descriptive alt text"
  width={800}
  height={600}
  loading="lazy" // Default for non-hero
  className="rounded-lg"
/>
```

### Automatic Optimization
Next.js Image component handles:
- Format conversion (WebP, AVIF)
- Responsive sizing
- Lazy loading
- Placeholder blur

### Pipeline Integration
```bash
# Image optimization in pipeline
npm run pipeline:optimize-images -- --source content/blog/post-slug
```

---

## Related Documentation

- **Content Guidelines:** `.claude/blog-content-guidelines.md` - Image placement in 12-section structure
- **Image Structure:** `.claude/blog-image-structure.md` - Detailed placement guide
- **Content Architecture:** `docs/CONTENT_ARCHITECTURE.md` - Folder structure

---

**Last Updated:** 2026-01-14
**Status:** Production-ready
