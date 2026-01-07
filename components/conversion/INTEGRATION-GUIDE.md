# Conversion Components - Integration Guide

## Quick Start

### 1. Add to Blog Post Template

```tsx
// app/blog/[slug]/page.tsx
import { PrimaryCTA } from '@/components/conversion/PrimaryCTA';
import { StickyBottomCTA } from '@/components/conversion/StickyBottomCTA';
import { AppStorePreviewModule } from '@/components/conversion/AppStorePreviewModule';
import { ContentUpgradeCTA } from '@/components/conversion/ContentUpgradeCTA';

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  
  return (
    <article>
      {/* Above fold - Mini CTA */}
      <PrimaryCTA
        title="Never Fish Blind Again"
        copy="Get real-time conditions and AI fish ID. Download Tackle for iPhone."
        buttonText="get-tackle"
        position="above_fold"
        pageType="blog"
        slug={post.slug}
        className="mb-8"
      />
      
      {/* Main content */}
      <div dangerouslySetInnerHTML={{ __html: post.body }} />
      
      {/* Mid-article - App Preview */}
      <AppStorePreviewModule className="my-12" />
      
      {/* End - Primary CTA + Email Capture */}
      <PrimaryCTA
        title="Ready to Catch More Fish?"
        copy="Download Tackle and get personalized fishing advice for your location."
        buttonText="download"
        position="end"
        pageType="blog"
        slug={post.slug}
        location={post.location}
        className="my-12"
      />
      
      {post.location && (
        <ContentUpgradeCTA
          location={post.location}
          pageType="blog"
          slug={post.slug}
          className="my-8"
        />
      )}
      
      {/* Sticky CTA (mobile only) */}
      <StickyBottomCTA
        pageType="blog"
        slug={post.slug}
        location={post.location}
      />
    </article>
  );
}
```

### 2. Add to Species Page Template

```tsx
// app/species/[slug]/page.tsx
import { PrimaryCTA } from '@/components/conversion/PrimaryCTA';
import { AppStorePreviewModule } from '@/components/conversion/AppStorePreviewModule';
import { RegulationsOutboundLinkBlock } from '@/components/conversion/RegulationsOutboundLinkBlock';
import { StickyBottomCTA } from '@/components/conversion/StickyBottomCTA';

export default async function SpeciesPage({ params }: { params: { slug: string } }) {
  const species = await getSpeciesBySlug(params.slug);
  
  return (
    <article>
      {/* Above fold */}
      <PrimaryCTA
        title={`Catch More ${species.name} with Tackle`}
        copy={`Get real-time conditions for ${species.name} fishing. Know when and where to fish.`}
        buttonText="default"
        position="above_fold"
        pageType="species"
        slug={species.slug}
        species={species.name}
        className="mb-8"
      />
      
      {/* Main content */}
      <div dangerouslySetInnerHTML={{ __html: species.body }} />
      
      {/* After best times section */}
      <AppStorePreviewModule className="my-12" />
      
      {/* End */}
      <PrimaryCTA
        title="Track Your Catches"
        copy={`Log every ${species.name} you catch with GPS location and photos.`}
        buttonText="download"
        position="end"
        pageType="species"
        slug={species.slug}
        species={species.name}
        className="my-12"
      />
      
      <RegulationsOutboundLinkBlock
        stateCode="FL"
        pageType="species"
        slug={species.slug}
        species={species.name}
        className="my-8"
      />
      
      <StickyBottomCTA
        pageType="species"
        slug={species.slug}
        species={species.name}
      />
    </article>
  );
}
```

### 3. Add to How-To Page Template

```tsx
// app/how-to/[slug]/page.tsx
import { PrimaryCTA } from '@/components/conversion/PrimaryCTA';
import { ContentUpgradeCTA } from '@/components/conversion/ContentUpgradeCTA';
import { StickyBottomCTA } from '@/components/conversion/StickyBottomCTA';

export default async function HowToPage({ params }: { params: { slug: string } }) {
  const howTo = await getHowToBySlug(params.slug);
  
  return (
    <article>
      {/* Above fold */}
      <PrimaryCTA
        title="Master This Technique"
        copy="Get step-by-step guidance and real-time conditions. Download Tackle for iPhone."
        buttonText="default"
        position="above_fold"
        pageType="how-to"
        slug={howTo.slug}
        className="mb-8"
      />
      
      {/* Step-by-step content */}
      <div dangerouslySetInnerHTML={{ __html: howTo.body }} />
      
      {/* After steps - "Try this in Tackle" */}
      <PrimaryCTA
        title="Try This in Tackle"
        copy="Get personalized recommendations for this technique based on your location and conditions."
        buttonText="get-tackle"
        position="mid"
        pageType="how-to"
        slug={howTo.slug}
        className="my-12"
      />
      
      {/* End */}
      <ContentUpgradeCTA
        pageType="how-to"
        slug={howTo.slug}
        className="my-8"
      />
      
      <PrimaryCTA
        title="Ready to Improve Your Fishing?"
        copy="Download Tackle and get expert advice for every technique."
        buttonText="download"
        position="end"
        pageType="how-to"
        slug={howTo.slug}
        className="my-12"
      />
      
      <StickyBottomCTA
        pageType="how-to"
        slug={howTo.slug}
      />
    </article>
  );
}
```

### 4. Add to Location Page Template

```tsx
// app/locations/[state]/[city]/page.tsx
import { PrimaryCTA } from '@/components/conversion/PrimaryCTA';
import { ContentUpgradeCTA } from '@/components/conversion/ContentUpgradeCTA';
import { RegulationsOutboundLinkBlock } from '@/components/conversion/RegulationsOutboundLinkBlock';
import { StickyBottomCTA } from '@/components/conversion/StickyBottomCTA';

export default async function LocationPage({ 
  params 
}: { 
  params: { state: string; city: string } 
}) {
  const location = await getLocationBySlug(params.state, params.city);
  const cityName = location.geo.city;
  
  return (
    <article>
      {/* Above fold - Customized */}
      <PrimaryCTA
        title={`Fish ${cityName} Like a Local`}
        copy={`Get real-time conditions, best spots, and expert advice for ${cityName} fishing.`}
        buttonText="default"
        position="above_fold"
        pageType="location"
        slug={location.slug}
        location={cityName}
        className="mb-8"
      />
      
      {/* Main content */}
      <div dangerouslySetInnerHTML={{ __html: location.body }} />
      
      {/* After "What's biting" section */}
      <ContentUpgradeCTA
        location={cityName}
        pageType="location"
        slug={location.slug}
        className="my-12"
      />
      
      {/* End - Required regulations block */}
      <RegulationsOutboundLinkBlock
        stateCode={location.geo.stateCode}
        pageType="location"
        slug={location.slug}
        location={cityName}
        className="my-8"
      />
      
      <PrimaryCTA
        title={`Plan Your ${cityName} Fishing Trip`}
        copy="Download Tackle and get 7-day forecasts, best spots, and conditions for your location."
        buttonText="download"
        position="end"
        pageType="location"
        slug={location.slug}
        location={cityName}
        className="my-12"
      />
      
      <StickyBottomCTA
        pageType="location"
        slug={location.slug}
        location={cityName}
      />
    </article>
  );
}
```

---

## Styling Notes

All components use semantic class names. Add CSS/Tailwind styles:

```css
.primary-cta {
  /* Your styles */
}

.sticky-bottom-cta {
  /* Fixed bottom, mobile only */
}

.content-upgrade-cta {
  /* Email form styles */
}

.social-proof-module {
  /* Trust signals styles */
}

.app-store-preview-module {
  /* Screenshot gallery styles */
}

.regulations-link-block {
  /* Outbound link styles */
}
```

---

## Environment Variables

Add to `.env.local`:

```bash
NEXT_PUBLIC_APP_STORE_ID=your_app_store_id
NEXT_PUBLIC_GA4_ID=your_ga4_id
EMAIL_WEBHOOK_URL=your_webhook_url  # Optional
```

---

## Testing Checklist

- [ ] All CTAs render correctly
- [ ] iOS detection works on /download
- [ ] QR code generates correctly
- [ ] Email capture form submits
- [ ] Events track in GA4
- [ ] UTM parameters appear in App Store links
- [ ] Sticky CTA appears on mobile after scroll
- [ ] Regulations links use correct state config


