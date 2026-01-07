# Conversion System - Component Library & Placement Rules

## A) CTA Component Library

### 1. PrimaryCTA

**Props Interface:**
```typescript
interface PrimaryCTAProps {
  title?: string;
  copy?: string;
  buttonText?: 'default' | 'download' | 'get-tackle';
  secondaryLinkText?: string;
  secondaryLinkHref?: string;
  position?: 'above_fold' | 'mid' | 'end';
  pageType: 'blog' | 'species' | 'how-to' | 'location';
  slug: string;
  location?: string;
  species?: string;
  className?: string;
}
```

**Default Copy:**
- Title: "Never Fish Blind Again"
- Copy: "Get real-time conditions, AI fish ID, and expert advice. Download Tackle for iPhone."
- Button (default): "Get Tackle on iPhone"
- Button (download): "Download Tackle"
- Button (get-tackle): "Get Tackle"
- Secondary Link: "See how it works" → `/how-it-works`

**Placement Rules:**
- **Blog Posts:** 1x mid-article, 1x end
- **Species Pages:** 1x above fold, 1x end
- **How-To Pages:** 1x above fold, 1x after steps, 1x end
- **Location Pages:** 1x above fold (customized), 1x end

---

### 2. StickyBottomCTA

**Props Interface:**
```typescript
interface StickyBottomCTAProps {
  pageType: 'blog' | 'species' | 'how-to' | 'location';
  slug: string;
  location?: string;
  species?: string;
  scrollThreshold?: number; // Default: 25%
}
```

**Default Copy:**
- Button: "Get Tackle"
- Small Text: "Personalized fishing advice for your location."

**Placement Rules:**
- **All Pages:** Mobile only, appears after 25% scroll
- **Frequency:** Once per page view
- **Desktop:** Hidden (use PrimaryCTA instead)

---

### 3. ContentUpgradeCTA

**Props Interface:**
```typescript
interface ContentUpgradeCTAProps {
  location?: string;
  pageType: 'blog' | 'species' | 'how-to' | 'location';
  slug: string;
  className?: string;
}
```

**Default Copy:**
- Headline (with location): "Want weekly fishing windows for {location}?"
- Headline (without location): "Want weekly fishing windows delivered to your inbox?"
- Copy: "Get personalized fishing forecasts based on weather, tides, and moon phases."
- Button: "Send me the forecast"
- Consent: "By submitting, you agree to receive weekly fishing forecasts. Unsubscribe anytime."

**Placement Rules:**
- **Location Pages:** After "What's biting" section, end of page
- **How-To Pages:** End of page
- **Blog Posts:** End of article (if location context exists)
- **Species Pages:** Not used (use PrimaryCTA instead)

**Integration:**
- Sends to `/api/email-capture` endpoint
- Webhook placeholder for email service integration

---

### 4. SocialProofModule

**Props Interface:**
```typescript
interface SocialProofModuleProps {
  className?: string;
}
```

**Default Copy:**
- Badge: "Built for Florida anglers"
- Testimonials (rotating):
  - "Tackle helped me catch my first redfish. The conditions forecast was spot on." — Mike T., Tampa
  - "The fish ID feature is incredible. No more guessing what I caught." — Sarah L., Miami
  - "Best fishing app I've used. The AI captain answers all my questions." — John D., Key West
- Benefits:
  - "99% accurate fish identification"
  - "Real-time fishing conditions"
  - "Expert AI advice 24/7"

**Placement Rules:**
- **All Pages:** Sidebar or after main content
- **Frequency:** Once per page
- **A/B Test:** Can be toggled on/off

---

### 5. AppStorePreviewModule

**Props Interface:**
```typescript
interface AppStorePreviewModuleProps {
  className?: string;
}
```

**Default Content:**
- Screenshots (5):
  1. Fish identification feature
  2. Fishing conditions forecast
  3. AI Captain chat
  4. Catch logging
  5. 7-day forecast
- Features List:
  - "AI-powered fish identification (99% accurate)"
  - "Daily fishing score (0-100%) based on conditions"
  - "7-day fishing forecasts"
  - "AI Captain chat for expert advice"
  - "GPS catch logging and mapping"
  - "Works offline and syncs everywhere"

**Placement Rules:**
- **Blog Posts:** Mid-article (after first major section)
- **Species Pages:** After "Best times / best lures" section
- **How-To Pages:** After step-by-step section
- **Location Pages:** After "What's biting" section

---

### 6. RegulationsOutboundLinkBlock

**Props Interface:**
```typescript
interface RegulationsOutboundLinkBlockProps {
  stateCode?: string; // e.g., 'FL', 'TX'
  pageType: 'blog' | 'species' | 'how-to' | 'location';
  slug: string;
  location?: string;
  className?: string;
}
```

**Default Copy:**
- Title: "See local regulations"
- Copy: "Regulations change—always verify with official sources."
- Link: Uses `stateRegLinks` config for location pages, else links to `/locations`

**Placement Rules:**
- **Location Pages:** Required, end of page
- **Species Pages:** End of page (if applicable)
- **How-To Pages:** End of page (if applicable)
- **Blog Posts:** Optional, only if regulations mentioned

---

## B) /download Page Blueprint

### Behavior Logic

**iOS User Agent Detection:**
```typescript
if (isIOSUserAgent()) {
  // Show: "Open in App Store" button
} else {
  // Show: "This app is for iPhone" with:
  // - QR code (App Store URL)
  // - "View in App Store" link
  // - Optional: "Send link to my phone" (SMS)
}
```

**UTM Parameters (Always Appended):**
- `utm_source=website`
- `utm_medium=organic`
- `utm_campaign=seo`
- `utm_content={pageType}:{slug}`

### Content Blocks (Order)

1. **Hero Section**
   - H1: "Tackle — AI Fishing Assistant"
   - Subtitle: "Never fish blind again. Get real-time conditions, AI fish ID, and expert advice."
   - Smart download button (iOS detection)

2. **Value Props (3 bullets)**
   - "99% Accurate Fish ID — Snap a photo, know your catch instantly"
   - "Daily Fishing Score — Get 0-100% conditions based on weather, tides & moon"
   - "AI Captain Chat — Ask 'What bait should I use?' Get expert advice 24/7"

3. **App Screenshots**
   - AppStorePreviewModule component

4. **How It Works (3 steps)**
   - Step 1: "Check Conditions" — Get your daily fishing score and 7-day forecast
   - Step 2: "Identify Fish" — Snap a photo and get instant identification
   - Step 3: "Get Advice" — Ask the AI Captain anything

5. **Social Proof**
   - SocialProofModule component

6. **FAQ (4 questions)**
   - "Is Tackle free to download?"
   - "What permissions does Tackle need?"
   - "Does Tackle work offline?"
   - "Is Tackle available for Android?"

7. **Regulations Notice**
   - RegulationsOutboundLinkBlock component

8. **Footer Links**
   - Privacy Policy
   - Terms of Service
   - Contact

### Trust & Clarity

- ✅ Do NOT claim "official" data sources
- ✅ Mention "Check local regulations" with outbound block
- ✅ Clear permission explanations
- ✅ Honest about Android availability
- ✅ No fake testimonials (use real or placeholders)

---

## C) Conversion Modules per Page Type

### 1. Blog Post Page

**Above Fold:**
- Mini PrimaryCTA (small variant)

**Mid-Article:**
- AppStorePreviewModule (after first major section)

**End of Article:**
- PrimaryCTA
- ContentUpgradeCTA (if location context exists)

**Sidebar/Related:**
- Related content links
- SocialProofModule (optional)

**Copy Templates:**
```typescript
// Above fold
<PrimaryCTA
  title="Never Fish Blind Again"
  copy="Get real-time conditions and AI fish ID. Download Tackle for iPhone."
  buttonText="get-tackle"
  position="above_fold"
  pageType="blog"
  slug={post.slug}
/>

// End of article
<PrimaryCTA
  title="Ready to Catch More Fish?"
  copy="Download Tackle and get personalized fishing advice for your location."
  buttonText="download"
  position="end"
  pageType="blog"
  slug={post.slug}
  location={post.location}
/>

// Email capture (if location exists)
<ContentUpgradeCTA
  location={post.location}
  pageType="blog"
  slug={post.slug}
/>
```

---

### 2. Species Page

**Above Fold:**
- PrimaryCTA

**After "Best times / best lures" section:**
- AppStorePreviewModule

**End:**
- PrimaryCTA
- RegulationsOutboundLinkBlock (if applicable)

**Copy Templates:**
```typescript
// Above fold
<PrimaryCTA
  title={`Catch More ${speciesName} with Tackle`}
  copy={`Get real-time conditions for ${speciesName} fishing. Know when and where to fish.`}
  buttonText="default"
  position="above_fold"
  pageType="species"
  slug={species.slug}
  species={species.name}
/>

// After best times section
<AppStorePreviewModule />

// End
<PrimaryCTA
  title="Track Your Catches"
  copy="Log every ${speciesName} you catch with GPS location and photos."
  buttonText="download"
  position="end"
  pageType="species"
  slug={species.slug}
  species={species.name}
/>

<RegulationsOutboundLinkBlock
  stateCode="FL"
  pageType="species"
  slug={species.slug}
  species={species.name}
/>
```

---

### 3. How-To Page

**Above Fold:**
- PrimaryCTA

**After Step-by-Step Section:**
- "Try this in Tackle" CTA (PrimaryCTA with custom copy)

**End:**
- ContentUpgradeCTA
- PrimaryCTA

**Copy Templates:**
```typescript
// Above fold
<PrimaryCTA
  title="Master This Technique"
  copy="Get step-by-step guidance and real-time conditions. Download Tackle for iPhone."
  buttonText="default"
  position="above_fold"
  pageType="how-to"
  slug={howTo.slug}
/>

// After steps
<PrimaryCTA
  title="Try This in Tackle"
  copy="Get personalized recommendations for this technique based on your location and conditions."
  buttonText="get-tackle"
  position="mid"
  pageType="how-to"
  slug={howTo.slug}
/>

// End
<ContentUpgradeCTA
  pageType="how-to"
  slug={howTo.slug}
/>

<PrimaryCTA
  title="Ready to Improve Your Fishing?"
  copy="Download Tackle and get expert advice for every technique."
  buttonText="download"
  position="end"
  pageType="how-to"
  slug={howTo.slug}
/>
```

---

### 4. Location Page

**Above Fold:**
- PrimaryCTA (customized with location name)

**After "What's biting" section:**
- ContentUpgradeCTA (for weekly windows)

**End:**
- RegulationsOutboundLinkBlock (required)
- PrimaryCTA

**Copy Templates:**
```typescript
// Above fold
<PrimaryCTA
  title={`Fish ${cityName} Like a Local`}
  copy={`Get real-time conditions, best spots, and expert advice for ${cityName} fishing.`}
  buttonText="default"
  position="above_fold"
  pageType="location"
  slug={location.slug}
  location={cityName}
/>

// After what's biting
<ContentUpgradeCTA
  location={cityName}
  pageType="location"
  slug={location.slug}
/>

// End (required)
<RegulationsOutboundLinkBlock
  stateCode={location.stateCode}
  pageType="location"
  slug={location.slug}
  location={cityName}
/>

<PrimaryCTA
  title={`Plan Your ${cityName} Fishing Trip`}
  copy="Download Tackle and get 7-day forecasts, best spots, and conditions for your location."
  buttonText="download"
  position="end"
  pageType="location"
  slug={location.slug}
  location={cityName}
/>
```

---

## D) Event Tracking Plan

### Event Names & Payloads

#### 1. cta_view
**Trigger:** When CTA appears in viewport
```typescript
{
  pageType: 'blog' | 'species' | 'how-to' | 'location',
  slug: string,
  location?: string,
  species?: string,
  position: 'above_fold' | 'mid' | 'end' | 'sticky',
  ctaType: 'primary' | 'sticky_bottom' | 'content_upgrade',
}
```

#### 2. cta_click
**Trigger:** When CTA button is clicked
```typescript
{
  pageType: string,
  slug: string,
  location?: string,
  species?: string,
  position: string,
  ctaType: string,
  buttonText: string,
}
```

#### 3. download_page_view
**Trigger:** When /download page is viewed
```typescript
{
  pageType: 'download',
  slug: 'download',
  isIOS: boolean,
}
```

#### 4. appstore_outbound_click
**Trigger:** When App Store link is clicked
```typescript
{
  pageType: string,
  slug: string,
  isIOS: boolean,
  buttonLocation: 'hero' | 'cta' | 'sticky',
  utm_content: string,
}
```

#### 5. email_capture_view
**Trigger:** When email capture form appears
```typescript
{
  pageType: string,
  slug: string,
  location?: string,
}
```

#### 6. email_capture_submit
**Trigger:** When email is submitted
```typescript
{
  pageType: string,
  slug: string,
  location?: string,
  success: boolean,
}
```

#### 7. regulations_outbound_click
**Trigger:** When regulations link is clicked
```typescript
{
  pageType: string,
  slug: string,
  location?: string,
  stateCode: string,
  linkUrl: string,
}
```

#### 8. related_content_click
**Trigger:** When related content link is clicked
```typescript
{
  pageType: string,
  slug: string,
  targetType: 'species' | 'how-to' | 'location' | 'blog',
  targetSlug: string,
  linkPosition: 'sidebar' | 'inline' | 'related_module',
}
```

### GA4 Implementation

**Setup:**
```typescript
// lib/analytics.ts
export function trackEvent(eventName: string, params: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}
```

**Usage:**
```typescript
import { trackEvent } from '@/lib/analytics';

trackEvent('cta_click', {
  pageType: 'blog',
  slug: 'best-time-fish-florida',
  position: 'end',
  ctaType: 'primary',
});
```

---

## E) A/B Tests

### 1. Button Text Variant
**Test:** "Get Tackle on iPhone" vs "Download Tackle"
**Hypothesis:** Shorter text may increase clicks
**Metric:** Click-through rate
**Duration:** 2 weeks

### 2. CTA Placement Frequency
**Test:** 1 CTA per page vs 2 CTAs per page
**Hypothesis:** More CTAs = more conversions
**Metric:** Conversion rate
**Duration:** 3 weeks

### 3. Sticky CTA Enable/Disable
**Test:** Sticky CTA on vs off
**Hypothesis:** Sticky CTA increases mobile conversions
**Metric:** Mobile conversion rate
**Duration:** 2 weeks

### 4. "Built for Florida Anglers" Badge
**Test:** Badge on vs off
**Hypothesis:** Badge increases trust and conversions
**Metric:** Conversion rate
**Duration:** 2 weeks

### 5. Email Capture Placement
**Test:** Location pages only vs all pages
**Hypothesis:** Location-specific capture has higher conversion
**Metric:** Email capture rate
**Duration:** 3 weeks

### 6. Screenshot Module Position
**Test:** Above fold vs mid-page
**Hypothesis:** Above fold increases engagement
**Metric:** Scroll depth + conversion rate
**Duration:** 2 weeks

### 7. Primary CTA Copy Variant
**Test:** "Never Fish Blind Again" vs "Get Personalized Fishing Advice"
**Hypothesis:** Benefit-focused copy converts better
**Metric:** Click-through rate
**Duration:** 2 weeks

### 8. Regulations Link Placement
**Test:** End of page vs sidebar
**Hypothesis:** Sidebar placement increases visibility
**Metric:** Regulations link clicks
**Duration:** 2 weeks

### A/B Test Implementation

**Simple Method (Cookie-based):**
```typescript
// lib/ab-test.ts
export function getVariant(testName: string): 'A' | 'B' {
  if (typeof window === 'undefined') return 'A';
  
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith(`ab_${testName}=`));
  
  if (cookie) {
    return cookie.split('=')[1] as 'A' | 'B';
  }
  
  // Random assignment
  const variant = Math.random() < 0.5 ? 'A' : 'B';
  document.cookie = `ab_${testName}=${variant}; path=/; max-age=2592000`; // 30 days
  return variant;
}
```

**Usage:**
```typescript
const variant = getVariant('button_text');
const buttonText = variant === 'A' ? 'Get Tackle on iPhone' : 'Download Tackle';
```

---

## Implementation Checklist

- [ ] Create all CTA components
- [ ] Implement /download page
- [ ] Add conversion modules to all page templates
- [ ] Set up event tracking
- [ ] Configure email capture webhook
- [ ] Test iOS detection
- [ ] Test UTM parameters
- [ ] Set up A/B testing infrastructure
- [ ] Monitor conversion funnel in GA4

---

**Last Updated:** 2024  
**Status:** Ready for implementation


