# Google Search Console Verification Checklist

## Step 1: Verify Domain Property

### Option A: Domain Property (Recommended)
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add Property"
3. Select "Domain" property type
4. Enter: `tackleapp.ai` (or your domain)
5. Choose verification method:
   - **DNS TXT Record** (Recommended)
     - Add TXT record to your DNS provider
     - Record name: `@` or root domain
     - Record value: (provided by GSC)
     - TTL: 3600 (or default)
   - Wait for DNS propagation (can take up to 48 hours)
   - Click "Verify" in GSC

### Option B: URL Prefix Property
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add Property"
3. Select "URL prefix" property type
4. Enter: `https://tackleapp.ai` (or your domain)
5. Choose verification method:
   - **HTML file upload**
   - **HTML tag** (add to `<head>`)
   - **Google Analytics**
   - **Google Tag Manager**

### Verification Status
- [ ] Property added to GSC
- [ ] Verification method chosen
- [ ] Verification completed
- [ ] Property shows as "Verified" in GSC

---

## Step 2: Submit Sitemap

### Sitemap URLs to Submit

**Primary Sitemap Index:**
```
https://tackleapp.ai/sitemap.xml
```

**Individual Sitemaps (Optional - GSC will discover via index):**
```
https://tackleapp.ai/sitemap-static.xml
https://tackleapp.ai/sitemap-blog.xml
https://tackleapp.ai/sitemap-species.xml
https://tackleapp.ai/sitemap-how-to.xml
https://tackleapp.ai/sitemap-locations.xml
```

### Submission Steps

1. **In Google Search Console:**
   - Go to "Sitemaps" in left sidebar
   - Enter sitemap URL: `sitemap.xml`
   - Click "Submit"
   - Wait for processing (usually within minutes)

2. **Verify Sitemap Status:**
   - Check "Status" column
   - Should show "Success" with number of URLs discovered
   - If errors, review and fix

3. **Check Discovered URLs:**
   - Click on sitemap to see details
   - Verify all expected pages are included
   - Check for any errors or warnings

### Sitemap Verification Checklist
- [ ] Sitemap index accessible at `/sitemap.xml`
- [ ] Sitemap returns valid XML
- [ ] All sub-sitemaps accessible
- [ ] Sitemap submitted to GSC
- [ ] GSC shows "Success" status
- [ ] Expected number of URLs discovered
- [ ] No errors in sitemap

---

## Step 3: Request Indexing for Priority Pages

### Pages to Request Indexing

**Priority Pages:**
1. Home page: `https://tackleapp.ai/`
2. How-to page 1: `https://tackleapp.ai/how-to/best-fishing-times`
3. How-to page 2: `https://tackleapp.ai/how-to/how-tides-affect-fishing`
4. Location page 1: `https://tackleapp.ai/locations/fl/naples`
5. Location page 2: `https://tackleapp.ai/locations/fl/tampa`

### Request Indexing Steps

1. **For Each Page:**
   - Go to "URL Inspection" tool in GSC
   - Enter full URL (e.g., `https://tackleapp.ai/`)
   - Click "Test Live URL"
   - Wait for test to complete
   - If page is indexable, click "Request Indexing"
   - Wait for confirmation

2. **Verify Indexing Status:**
   - Check "Coverage" report in GSC
   - Look for "Valid" pages
   - Monitor "Indexing requested" status

### Indexing Request Checklist
- [ ] Home page requested
- [ ] 2 how-to pages requested
- [ ] 2 location pages requested
- [ ] All pages show as "Indexing requested" or "Indexed"
- [ ] No "Excluded" or "Error" status

---

## Step 4: Verify Pages Are Indexable

### Pre-Flight Checks

**Run Verification Script:**
```bash
npx tsx scripts/verify-indexing.ts
```

**Manual Checks:**

1. **Check robots.txt:**
   - Visit: `https://tackleapp.ai/robots.txt`
   - Verify pages are not disallowed
   - Check sitemap references are present

2. **Check Page Source:**
   - Visit each priority page
   - View page source (Ctrl+U or Cmd+U)
   - Search for `noindex` - should NOT be present
   - Search for `canonical` - should be present
   - Search for `<title>` - should be present
   - Search for `<meta name="description">` - should be present

3. **Check Meta Tags:**
   - No `<meta name="robots" content="noindex">`
   - Has `<link rel="canonical">` tag
   - Has proper `<title>` tag
   - Has `<meta name="description">` tag

### Indexability Checklist
- [ ] Verification script passes
- [ ] robots.txt allows crawling
- [ ] No noindex tags on priority pages
- [ ] Canonical tags present
- [ ] Title tags present
- [ ] Meta descriptions present
- [ ] Pages load correctly
- [ ] No 404 errors

---

## Step 5: Monitor Initial Indexing

### First 24-48 Hours

1. **Check Coverage Report:**
   - Go to "Coverage" in GSC
   - Monitor "Valid" pages count
   - Check for any errors

2. **Check Performance:**
   - Go to "Performance" in GSC
   - Look for initial impressions
   - Monitor click-through rates

3. **Check URL Inspection:**
   - Re-test priority pages
   - Verify indexing status
   - Check for any issues

### Monitoring Checklist
- [ ] Coverage report shows pages
- [ ] No critical errors
- [ ] Pages appear in "Valid" status
- [ ] Performance data starts appearing (may take days/weeks)
- [ ] No unexpected exclusions

---

## Troubleshooting

### Sitemap Not Discovered

**Possible Issues:**
- Sitemap URL incorrect
- Sitemap returns 404
- Sitemap has XML errors
- robots.txt blocks sitemap

**Solutions:**
- Verify sitemap URL is accessible
- Check sitemap XML is valid
- Ensure robots.txt references sitemap
- Re-submit sitemap

### Pages Not Indexing

**Possible Issues:**
- Pages have noindex tag
- Pages blocked in robots.txt
- Pages return errors (404, 500)
- Canonical points elsewhere
- Duplicate content issues

**Solutions:**
- Remove noindex tags
- Check robots.txt
- Fix any errors
- Verify canonical URLs
- Ensure unique content

### Pages Excluded

**Common Reasons:**
- "Duplicate, Google chose different canonical"
- "Crawled - currently not indexed"
- "Discovered - currently not indexed"
- "Excluded by 'noindex' tag"

**Solutions:**
- Fix canonical issues
- Improve content quality
- Remove noindex if unintended
- Request indexing after fixes

---

## Quick Verification Commands

### Check Sitemap Accessibility
```bash
curl https://tackleapp.ai/sitemap.xml
```

### Check robots.txt
```bash
curl https://tackleapp.ai/robots.txt
```

### Check Page for noindex
```bash
curl https://tackleapp.ai/ | grep -i noindex
```

### Check Canonical Tag
```bash
curl https://tackleapp.ai/ | grep -i canonical
```

---

## Success Criteria

✅ **GSC Setup Complete When:**
- Domain property verified
- Sitemap submitted and showing "Success"
- Priority pages requested for indexing
- Verification script passes
- No noindex tags on priority pages
- Pages appear in Coverage report

✅ **Indexing Successful When:**
- Pages show as "Indexed" in URL Inspection
- Pages appear in Coverage as "Valid"
- No critical errors in Coverage report
- Performance data starts appearing (may take time)

---

## Next Steps After Verification

1. **Monitor Coverage Report Weekly**
   - Check for new pages indexed
   - Monitor for errors
   - Review excluded pages

2. **Monitor Performance Report**
   - Track impressions
   - Monitor click-through rates
   - Review top queries

3. **Fix Any Issues Promptly**
   - Address errors quickly
   - Fix excluded pages
   - Improve underperforming pages

4. **Continue Publishing**
   - New pages will be discovered via sitemap
   - Request indexing for high-priority pages
   - Monitor indexing status

---

**Last Updated:** 2024  
**Status:** Ready for GSC verification



