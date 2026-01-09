# Analytics Events - SEO → Download Funnel

## Event Tracking Plan

### Recommended Setup

**Primary:** Google Analytics 4 (GA4)  
**Optional:** Plausible Analytics (privacy-friendly alternative)

---

## Core Events

### 1. View Download Page

**Event Name:** `view_download_page`

**Trigger:** When user visits `/download` page

**Properties:**
- `page_path`: `/download`
- `page_title`: "Download Tackle - AI Fishing Assistant"
- `source`: `organic` | `direct` | `referral` | `social`
- `medium`: `organic` | `none` | `referral` | `social`
- `campaign`: (if UTM present)

**GA4 Setup:**
```javascript
gtag('event', 'view_download_page', {
  page_path: '/download',
  page_title: 'Download Tackle',
  source: 'organic',
  medium: 'organic'
});
```

---

### 2. Click App Store Download

**Event Name:** `click_appstore_download`

**Trigger:** When user clicks App Store download button

**Properties:**
- `button_location`: `hero` | `sidebar` | `footer` | `inline`
- `page_path`: Current page path
- `page_type`: `home` | `species` | `how-to` | `location` | `blog`
- `source`: Traffic source
- `medium`: Traffic medium

**GA4 Setup:**
```javascript
// On download button click
gtag('event', 'click_appstore_download', {
  button_location: 'hero',
  page_path: window.location.pathname,
  page_type: 'home',
  source: 'organic',
  medium: 'organic'
});
```

**UTM Strategy for App Store Link:**
```
https://apps.apple.com/app/tackle/id[APP_ID]?utm_source=website&utm_medium=organic&utm_campaign=seo
```

---

### 3. Click Regulations Outbound Link

**Event Name:** `click_regulations_outbound`

**Trigger:** When user clicks "See local regulations" link

**Properties:**
- `state_code`: `FL` | `TX` | `CA` | etc.
- `page_path`: Current page path
- `page_type`: `species` | `how-to` | `location` | `blog`
- `link_text`: "See local regulations"

**GA4 Setup:**
```javascript
gtag('event', 'click_regulations_outbound', {
  state_code: 'FL',
  page_path: window.location.pathname,
  page_type: 'location',
  link_text: 'See local regulations'
});
```

---

### 4. Click Related Content

**Event Name:** `click_related_content`

**Trigger:** When user clicks any related content link

**Properties:**
- `content_type`: `species` | `how-to` | `location` | `blog`
- `target_slug`: Target page slug
- `source_page`: Current page path
- `source_type`: Current page type
- `link_position`: `sidebar` | `inline` | `footer` | `related_module`

**GA4 Setup:**
```javascript
gtag('event', 'click_related_content', {
  content_type: 'species',
  target_slug: 'redfish',
  source_page: '/how-to/catch-redfish-inshore',
  source_type: 'how-to',
  link_position: 'related_module'
});
```

---

### 5. Internal Search (if implemented)

**Event Name:** `search_internal`

**Trigger:** When user uses site search

**Properties:**
- `search_term`: User's search query
- `results_count`: Number of results
- `has_results`: `true` | `false`

**GA4 Setup:**
```javascript
gtag('event', 'search_internal', {
  search_term: 'redfish',
  results_count: 15,
  has_results: true
});
```

---

## Conversion Funnel Events

### Funnel Steps

1. **Page View** (automatic in GA4)
2. **View Download Page** (`view_download_page`)
3. **Click App Store Download** (`click_appstore_download`)
4. **App Store Visit** (tracked via UTM)

### Funnel Analysis

**GA4 Funnel Setup:**
1. Go to GA4 → Explore → Funnel exploration
2. Create funnel:
   - Step 1: Page view (any page)
   - Step 2: `view_download_page`
   - Step 3: `click_appstore_download`

**Key Metrics:**
- Conversion rate: Step 1 → Step 2
- Download click rate: Step 2 → Step 3
- Overall conversion: Step 1 → Step 3

---

## Additional Recommended Events

### Content Engagement

**Event:** `scroll_depth`
- Track when user scrolls 25%, 50%, 75%, 100%
- Helps identify engaging content

**Event:** `time_on_page`
- Track time spent on page
- Segment by page type

**Event:** `read_article`
- Track when user reads full article (scroll to bottom)
- Helps identify high-value content

### Navigation Events

**Event:** `click_breadcrumb`
- Track breadcrumb navigation
- Helps understand user journey

**Event:** `click_category`
- Track category page visits
- Helps understand content preferences

---

## Implementation Guide

### GA4 Setup

1. **Install GA4:**
```tsx
// app/layout.tsx
import Script from 'next/script';

<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA4_ID}`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${process.env.NEXT_PUBLIC_GA4_ID}');
  `}
</Script>
```

2. **Create Event Helper:**
```typescript
// lib/analytics.ts
export function trackEvent(eventName: string, params: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}
```

3. **Use in Components:**
```tsx
import { trackEvent } from '@/lib/analytics';

<button onClick={() => {
  trackEvent('click_appstore_download', {
    button_location: 'hero',
    page_path: '/download',
  });
  window.open(appStoreUrl);
}}>
  Download
</button>
```

---

## UTM Strategy for App Store

### App Store Link Format

```
https://apps.apple.com/app/tackle/id[APP_ID]?utm_source=website&utm_medium=organic&utm_campaign=seo
```

### UTM Parameters

- `utm_source`: `website` (always)
- `utm_medium`: `organic` | `social` | `email` | `paid`
- `utm_campaign`: `seo` | `blog` | `social` | `email`
- `utm_content`: (optional) specific page or button
- `utm_term`: (optional) keyword if from search

### Tracking in App Store Connect

App Store Connect will show UTM parameters in:
- App Analytics → Sources
- Campaign performance
- Attribution data

---

## Reporting & Analysis

### Key Reports to Monitor

1. **Conversion Funnel:**
   - Page views → Download page views → Download clicks
   - Conversion rate by traffic source
   - Conversion rate by page type

2. **Top Converting Pages:**
   - Which pages drive most download clicks
   - Which content types convert best

3. **Traffic Sources:**
   - Organic search performance
   - Top referring pages
   - Search queries driving traffic

4. **Content Performance:**
   - Most viewed content
   - Highest engagement content
   - Content with best conversion rates

---

## Privacy Considerations

- **GDPR Compliance:** Use cookie consent if required
- **IP Anonymization:** Enable in GA4 settings
- **Data Retention:** Set to 14 months (default)
- **User Consent:** Implement consent management if needed

---

## Summary

**Core Events:**
1. ✅ `view_download_page`
2. ✅ `click_appstore_download`
3. ✅ `click_regulations_outbound`
4. ✅ `click_related_content`
5. ✅ `search_internal` (if implemented)

**UTM Strategy:**
- App Store links include UTM parameters
- Track source, medium, campaign

**Funnel Analysis:**
- Set up GA4 funnel exploration
- Monitor conversion rates
- Optimize based on data



