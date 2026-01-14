# Image Directory Structure

This directory contains all images for the Tackle website, organized by purpose.

## Directory Structure

```
public/images/
├── blog/                    # Blog post images (legacy)
│   └── [existing blog images]
├── posts/                   # Organized by post slug (recommended)
│   └── [slug]/
│       ├── hero.webp       # 1200x600px hero image
│       ├── tackle-1.webp   # 800x600px tackle/gear photo
│       ├── location-1.webp # 800x600px structure/habitat photo
│       ├── action-1.webp   # 800x600px technique photo
│       └── metadata.json   # Image metadata (optional)
├── hubs/                    # Hub/pillar page images
│   └── [hub-slug]-hero.webp
└── diagrams/                # Diagrams and illustrations
    └── [diagram-name].svg
```

## Image Specifications

### Hero Images
- **Dimensions:** 1200x600px (2:1 aspect ratio)
- **Format:** WebP (preferred), JPEG fallback
- **Max file size:** 150KB
- **Quality:** 80-85%

### Inline Images
- **Dimensions:** 800x600px (4:3 aspect ratio)
- **Format:** WebP (preferred), JPEG fallback
- **Max file size:** 100KB
- **Quality:** 75-80%

### Thumbnails
- **Dimensions:** 400x300px (4:3 aspect ratio)
- **Format:** WebP (preferred), JPEG fallback
- **Max file size:** 50KB
- **Quality:** 70-75%

## Naming Conventions

### Pattern
`{slug}-{purpose}-{index}.webp`

### Examples
- `best-snook-lures-florida-hero.webp`
- `best-snook-lures-florida-tackle-1.webp`
- `best-snook-lures-florida-location-1.webp`
- `redfish-hero.webp`
- `florida-miami-spot-government-cut.webp`

### Purpose Identifiers
- `hero` - Hero/header image
- `tackle` - Gear/equipment photo
- `location` - Structure/habitat photo
- `action` - Technique/casting photo
- `detail` - Closeup/detail shot
- `spot` - Specific fishing spot
- `diagram` - Illustration/diagram

## Approved Sources

1. **Unsplash** (Primary)
2. **Original Photography** (with license)
3. **UGC** (with signed release)
4. **Commissioned Art** (custom)
5. **Context-Specific AI** (diagrams only, disclosed)

## Documentation

For complete image guidelines, see:
- **Media Guide:** `docs/MEDIA_GUIDE.md`
- **Content Guidelines:** `.claude/blog-content-guidelines.md`
- **Image Structure:** `.claude/blog-image-structure.md`
