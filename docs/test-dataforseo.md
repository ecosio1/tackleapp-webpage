# Testing DataForSEO Integration

## Prerequisites

1. **Set up environment variables** - Create a `.env.local` file in your project root:

```bash
DATAFORSEO_LOGIN=your_email@example.com
DATAFORSEO_PASSWORD=your_api_password

# Alternative variable names (also supported):
# DATAFORSEO_EMAIL=your_email@example.com
# DATAFORSEO_API_KEY=your_api_password
```

2. **Install dependencies** (if not already installed):

```bash
npm install commander
```

## Test Commands

### 1. Test DataForSEO Connection

This tests if your API credentials work:

```bash
node scripts/run.ts test-dataforseo
```

**Expected Output:**
```
[INFO] Testing DataForSEO connection...
✅ DataForSEO connection successful!
✅ DataForSEO connection test passed!
```

**If it fails**, check:
- Are your credentials correct?
- Are they in `.env.local`?
- Do you have API credits in your DataForSEO account?

### 2. Test Blog Ideation

Generate real blog ideas from keyword research:

```bash
# Basic test - 5 blog ideas for "fishing-tips" category
node scripts/run.ts test-ideation

# With options
node scripts/run.ts test-ideation --category fishing-tips --count 10

# With location filter
node scripts/run.ts test-ideation --category fishing-tips --location florida --count 5

# With filters
node scripts/run.ts test-ideation --min-volume 200 --max-difficulty 40
```

**Available Categories:**
- `fishing-tips`
- `gear-reviews`
- `conditions`
- `species-spotlights`
- `techniques-tactics`

**Expected Output:**
```
[INFO] Testing blog ideation...
[INFO] Category: fishing-tips
[INFO] Location: florida
[INFO] Count: 5
[INFO] Seed keywords: fishing tips, fishing tips florida, fishing tips in florida...
[INFO] Found 87 keywords from DataForSEO
[INFO] Filtered to 42 informational keywords
[INFO] Filtered to 18 keywords matching criteria
[INFO] Generated 5 blog ideas

✅ Generated Blog Ideas:

1. How to Fish Florida: Complete Guide
   Keyword: how to fish florida
   Search Volume: 1200
   Difficulty: 35
   Opportunity Score: 78/100
   Slug: how-to-fish-florida
   Questions: What is the best time to fish in Florida?, Where to fish in Florida?

2. Best Fishing Tips: Complete Guide
   Keyword: best fishing tips
   Search Volume: 890
   Difficulty: 28
   Opportunity Score: 82/100
   Slug: best-fishing-tips
   Questions: What are the best fishing tips for beginners?, How to improve fishing skills?

...
```

## Troubleshooting

### Error: "DataForSEO credentials not found"

**Solution:** Check your `.env.local` file exists and has the correct variable names:
```bash
DATAFORSEO_LOGIN=your_email
DATAFORSEO_PASSWORD=your_password
```

### Error: "DataForSEO API error: 401"

**Solution:** Your credentials are incorrect. Double-check your email and API password in your DataForSEO dashboard.

### Error: "DataForSEO API error: 402"

**Solution:** You're out of API credits. Add credits to your DataForSEO account.

### No keywords returned

**Possible reasons:**
- Seed keywords don't match any search queries
- Filters are too strict (try lowering `--min-volume` or raising `--max-difficulty`)
- Category doesn't have good keyword coverage

**Solution:** Try a different category or adjust filters:
```bash
node scripts/run.ts test-ideation --category gear-reviews --min-volume 50 --max-difficulty 60
```

## Next Steps

Once testing works:

1. **Update seed command** to use DataForSEO instead of placeholder `topic-${i}`
2. **Run seed** to generate real blog ideas: `node scripts/run.ts seed --type blog --count 20`
3. **Process jobs** to generate content: `node scripts/run.ts run --limit 5`
