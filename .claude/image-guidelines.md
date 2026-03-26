# Image Guidelines for Tackle Blog

## Folder Structure

```
public/images/blog/
├── shared/                    # Reusable images across posts
│   ├── tackle-layout.jpg      # Gear/tackle flatlay
│   ├── casting-technique.jpg  # Angler casting
│   ├── fish-closeup.jpg       # Fish detail shot
│   └── water-structure.jpg    # Docks, mangroves, etc.
│
└── {post-slug}/               # Per-post images
    ├── hero.jpg               # Featured image (1200x600)
    ├── step-1.jpg             # Article images
    └── creator-catch.jpg      # Social media content
```

## Image Specifications

| Type | Dimensions | Format | Max Size |
|------|------------|--------|----------|
| Hero | 1200x600 | JPG/WebP | 200KB |
| In-article | 1200x675 | JPG/WebP | 150KB |
| Thumbnails | 600x400 | JPG/WebP | 50KB |

## Adding Image Credits to Blog Posts

### 1. In Blog JSON Schema

Add an `imageCredits` field to your blog post JSON:

```json
{
  "slug": "best-bass-lures",
  "heroImage": "/images/blog/best-bass-lures/hero.jpg",
  "imageCredits": {
    "hero": {
      "id": "hero",
      "src": "/images/blog/best-bass-lures/hero.jpg",
      "alt": "Angler holding largemouth bass at sunset",
      "license": "permission",
      "source": "instagram",
      "creator": {
        "name": "John Smith",
        "handle": "johnfishes",
        "platform": "instagram",
        "url": "https://instagram.com/johnfishes"
      },
      "permission": {
        "granted": true,
        "date": "2026-01-15",
        "method": "dm",
        "notes": "DM conversation saved in /docs/permissions/"
      }
    },
    "article": [
      {
        "id": "tackle-setup",
        "src": "/images/blog/shared/tackle-layout.jpg",
        "alt": "Bass fishing tackle laid out",
        "license": "owned",
        "source": "original"
      }
    ]
  }
}
```

### 2. License Types

| License | Attribution Required | Usage |
|---------|---------------------|-------|
| `owned` | No | Your own photos |
| `permission` | Yes | Social media with permission |
| `unsplash` | No (but nice to credit) | Unsplash downloads |
| `pexels` | Appreciated | Pexels downloads |
| `creative-commons` | Check specific license | CC content |
| `licensed` | No | Paid stock images |
| `embed` | N/A | Social embeds (not downloaded) |

### 3. Getting Permission from Creators

**DM Template:**
```
Hi [Name]! 👋

Love your fishing content! I'm with Tackle, a fishing app
that helps anglers find the best conditions.

Would you be open to us featuring your [photo/video] in a
blog post about [topic]? We'd include full credit linking
to your profile.

Let me know! 🎣
```

**Track permissions in:** `/docs/permissions/{handle}-{date}.txt`

## Using the BlogImage Component

```tsx
import { BlogImage } from '@/components/blog/BlogImage';

// Without credit (owned/unsplash)
<BlogImage
  src="/images/blog/my-post/hero.jpg"
  alt="Description"
  caption="Optional caption"
/>

// With credit (social media permission)
<BlogImage
  src="/images/blog/my-post/creator-catch.jpg"
  alt="Angler with redfish"
  caption="Beautiful redfish caught in Tampa Bay"
  credit={{
    id: "creator-catch",
    src: "/images/blog/my-post/creator-catch.jpg",
    alt: "Angler with redfish",
    license: "permission",
    source: "instagram",
    creator: {
      name: "Jane Doe",
      handle: "janefishes",
      platform: "instagram",
      url: "https://instagram.com/janefishes"
    },
    permission: {
      granted: true,
      date: "2026-01-20",
      method: "dm"
    }
  }}
/>
```

## Workflow: Adding Social Media Images

1. **Find content** - Search relevant hashtags
2. **DM creator** - Use template above
3. **Wait for response** - Don't use without permission
4. **Save permission** - Screenshot or save conversation
5. **Download image** - Save to `/public/images/blog/{slug}/`
6. **Add to JSON** - Include full credit object
7. **Test locally** - Verify attribution displays correctly

## Quick Reference: Local vs External

| Scenario | Use Local | Use External URL |
|----------|-----------|------------------|
| App screenshots | ✅ | |
| Permitted social content | ✅ | |
| Original photography | ✅ | |
| Unsplash (new posts) | ✅ | |
| Existing Unsplash posts | | ✅ (migrate over time) |
| Instagram embeds | | ✅ (use embed code) |

## Migration Plan

1. **New posts**: Always use local images
2. **Existing posts**: Migrate when updating content
3. **Broken images**: Replace immediately with local
4. **Priority**: Hero images first, then in-article
