# Google Search Console Setup Checklist

## Step 1: Verify Property Type

### Recommendation: **URL-prefix** (Preferred for Next.js)

**Why URL-prefix:**
- Easier to verify (no DNS access required)
- Works with subdomains if needed later
- Faster setup process
- Can add domain property later if needed

**Steps:**
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add Property"
3. Select "URL prefix"
4. Enter: `https://tackleapp.ai` (or your actual domain)
5. Click "Continue"

---

## Step 2: Verify Ownership

### Method 1: HTML File (Recommended for Next.js)

1. Download the HTML verification file from GSC
2. Place it in `/public/` directory of your Next.js project
3. File will be accessible at: `https://tackleapp.ai/google[random].html`
4. Click "Verify" in GSC

### Method 2: HTML Tag (Alternative)

1. Copy the meta tag from GSC
2. Add to `app/layout.tsx` in the `<head>`:
```tsx
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE" />
```
3. Click "Verify" in GSC

### Method 3: DNS TXT Record (If using Domain property)

1. Copy the TXT record from GSC
2. Add to your DNS provider:
   - Type: TXT
   - Name: @ (or root domain)
   - Value: `google-site-verification=YOUR_CODE`
3. Wait for DNS propagation (5-60 minutes)
4. Click "Verify" in GSC

---

## Step 3: Confirm HTTPS Canonical

**Check:**
1. Ensure all pages redirect HTTP → HTTPS
2. Verify canonical URLs use `https://`
3. Check SSL certificate is valid
4. Test: Visit `http://tackleapp.ai` → should redirect to `https://tackleapp.ai`

**Next.js Setup:**
- Ensure `next.config.js` has proper redirects
- Use environment variable: `NEXT_PUBLIC_SITE_URL=https://tackleapp.ai`

---

## Step 4: Submit Sitemaps

### Primary Sitemap (Index)
1. Go to GSC → Sitemaps
2. Enter: `https://tackleapp.ai/sitemap.xml`
3. Click "Submit"

### Additional Sitemaps (Optional but Recommended)
Submit these sitemaps for better organization:
- `https://tackleapp.ai/sitemap-static.xml`
- `https://tackleapp.ai/sitemap-blog.xml`
- `https://tackleapp.ai/sitemap-species.xml`
- `https://tackleapp.ai/sitemap-how-to.xml`
- `https://tackleapp.ai/sitemap-locations.xml`

**Note:** GSC will automatically discover sitemaps listed in robots.txt, but manual submission is faster.

---

## Step 5: Request Indexing for Priority Pages

### Immediate Indexing Requests

Use GSC "URL Inspection" tool to request indexing for:

**Core Pages:**
1. `https://tackleapp.ai/` (Home)
2. `https://tackleapp.ai/download` (Download page)

**First 5 How-To Posts:**
1. `https://tackleapp.ai/how-to/tie-fishing-knots`
2. `https://tackleapp.ai/how-to/read-tides`
3. `https://tackleapp.ai/how-to/choose-fishing-line`
4. `https://tackleapp.ai/how-to/rig-fishing-rod`
5. `https://tackleapp.ai/how-to/understand-moon-phases`

**First 5 Florida Location Pages:**
1. `https://tackleapp.ai/locations/florida/miami`
2. `https://tackleapp.ai/locations/florida/tampa`
3. `https://tackleapp.ai/locations/florida/orlando`
4. `https://tackleapp.ai/locations/florida/key-west`
5. `https://tackleapp.ai/locations/florida/naples`

**How to Request:**
1. Go to GSC → URL Inspection
2. Enter URL
3. Click "Request Indexing"
4. Wait for "URL is on Google" status

---

## Step 6: Set Up Performance Baseline

### Initial Metrics to Monitor

**Queries:**
1. Go to GSC → Performance
2. Set date range: Last 28 days (or since launch)
3. Note:
   - Top queries
   - Average position
   - Click-through rate (CTR)
   - Impressions

**Pages:**
1. Switch to "Pages" tab
2. Note:
   - Top performing pages
   - Pages with impressions but no clicks
   - Pages with high CTR

**Countries:**
1. Switch to "Countries" tab
2. Note:
   - Primary traffic countries
   - Geographic distribution

**Baseline Metrics to Track:**
- Total impressions: [Record number]
- Total clicks: [Record number]
- Average CTR: [Record %]
- Average position: [Record number]
- Top query: [Record query]
- Top page: [Record URL]

---

## Step 7: Set Up Page Indexing Monitoring

### Weekly Routine

**Check Index Coverage:**
1. Go to GSC → Page indexing
2. Review:
   - Valid pages (should increase over time)
   - Excluded pages (should be minimal)
   - Errors (should be 0)

**Common Issues to Monitor:**

1. **Excluded by "noindex" tag:**
   - Check: Pages → Excluded → "Excluded by 'noindex' tag"
   - Action: Ensure only drafts are noindex
   - Fix: Remove noindex from published content

2. **Duplicate, Google chose different canonical:**
   - Check: Pages → Excluded → "Duplicate, Google chose different canonical"
   - Action: Ensure canonical tags are set correctly
   - Fix: Add canonical tags to all pages

3. **Crawled - currently not indexed:**
   - Check: Pages → Excluded → "Crawled - currently not indexed"
   - Action: Request indexing for these pages
   - Fix: Improve content quality, add internal links

4. **Page with redirect:**
   - Check: Pages → Excluded → "Page with redirect"
   - Action: Review redirects, ensure they're intentional
   - Fix: Update internal links to point to final URLs

**URL Inspection Tool Usage:**
1. Use for:
   - Checking if new pages are indexed
   - Testing canonical tags
   - Viewing rendered HTML
   - Checking mobile usability
   - Requesting indexing for new content

2. Weekly tasks:
   - Inspect 5-10 new pages
   - Request indexing for high-priority pages
   - Check for indexing errors

---

## Step 8: Set Up Alerts

### Email Notifications

1. Go to GSC → Settings → Users and permissions
2. Ensure your email is added
3. Go to Settings → Email notifications
4. Enable:
   - Critical issues
   - New security issues
   - Manual actions

### Performance Monitoring

**Weekly Review:**
- Check Performance report for:
  - New queries ranking
  - Position improvements
  - CTR changes
  - New pages getting impressions

**Monthly Review:**
- Compare metrics to previous month
- Identify top-performing content
- Identify underperforming content
- Plan content updates

---

## Step 9: Additional Setup

### Mobile Usability
1. Go to GSC → Mobile Usability
2. Fix any mobile issues
3. Ensure all pages are mobile-friendly

### Core Web Vitals
1. Go to GSC → Core Web Vitals
2. Monitor:
   - LCP (Largest Contentful Paint)
   - FID (First Input Delay)
   - CLS (Cumulative Layout Shift)
3. Fix any "Poor" or "Needs Improvement" pages

### Security Issues
1. Go to GSC → Security Issues
2. Monitor for:
   - Hacked content
   - Malware
   - Social engineering
3. Address immediately if found

---

## Step 10: Ongoing Maintenance

### Daily
- [ ] Check for new indexing errors
- [ ] Request indexing for new high-priority pages

### Weekly
- [ ] Review Performance metrics
- [ ] Check Page indexing status
- [ ] Inspect 5-10 new URLs
- [ ] Review excluded pages

### Monthly
- [ ] Compare performance to previous month
- [ ] Identify content gaps
- [ ] Update sitemaps if structure changes
- [ ] Review and fix any indexing issues

---

## Verification Checklist

Before considering GSC setup complete:

- [ ] Property verified (URL-prefix or Domain)
- [ ] HTTPS canonical confirmed
- [ ] Sitemaps submitted and processed
- [ ] Priority pages requested for indexing
- [ ] Performance baseline recorded
- [ ] Page indexing monitoring routine established
- [ ] Email notifications enabled
- [ ] Mobile usability checked
- [ ] Core Web Vitals monitored
- [ ] Ongoing maintenance schedule set

---

**Last Updated:** 2024  
**Next Review:** After first month of publishing



