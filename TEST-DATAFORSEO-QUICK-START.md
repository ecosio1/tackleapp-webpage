# Quick Start: Test DataForSEO

## Step 1: Set Up Environment Variables

Create a `.env.local` file in your project root (same directory as `package.json`):

```bash
DATAFORSEO_LOGIN=your_email@example.com
DATAFORSEO_PASSWORD=your_api_password
```

**Note:** Use the email and password from your DataForSEO account dashboard.

## Step 2: Install Dependencies

```bash
npm install
```

This will install `commander` and `dotenv` which are needed for the test commands.

## Step 3: Test Connection

Test if your DataForSEO credentials work:

```bash
# Using npm script (recommended)
npm run pipeline:test-connection

# Or directly with tsx
npx tsx scripts/run.ts test-dataforseo
```

**Expected Success Output:**
```
[INFO] Testing DataForSEO connection...
✅ DataForSEO connection successful!
✅ DataForSEO connection test passed!
```

**If you see errors:**
- ❌ "DataForSEO credentials not found" → Check your `.env.local` file exists and has the right variable names
- ❌ "401 Unauthorized" → Your credentials are wrong, double-check your email/password
- ❌ "402 Payment Required" → You're out of API credits, add credits to your DataForSEO account

## Step 4: Test Blog Ideation

Generate real blog ideas from keyword research:

```bash
# Basic test - 5 blog ideas (using npm script)
npm run pipeline:test-ideation

# Or directly with tsx
npx tsx scripts/run.ts test-ideation

# Generate 10 ideas for fishing tips
npx tsx scripts/run.ts test-ideation --category fishing-tips --count 10

# Generate 5 ideas for Florida fishing
npx tsx scripts/run.ts test-ideation --category fishing-tips --location florida --count 5

# With filters (min 200 searches, max 40 difficulty)
npx tsx scripts/run.ts test-ideation --min-volume 200 --max-difficulty 40
```

**Available Categories:**
- `fishing-tips` (default)
- `gear-reviews`
- `conditions`
- `species-spotlights`
- `techniques-tactics`

**Expected Output:**
```
[INFO] Testing blog ideation...
[INFO] Category: fishing-tips
[INFO] Location: none
[INFO] Count: 5
[INFO] Seed keywords: fishing tips, how to fish, fishing techniques...
[INFO] Found 87 keywords from DataForSEO
[INFO] Filtered to 42 informational keywords
[INFO] Filtered to 18 keywords matching criteria
[INFO] Generated 5 blog ideas

✅ Generated Blog Ideas:

1. How to Fish: Complete Guide
   Keyword: how to fish
   Search Volume: 1200
   Difficulty: 35
   Opportunity Score: 78/100
   Slug: how-to-fish

2. Best Fishing Tips: Complete Guide
   Keyword: best fishing tips
   Search Volume: 890
   Difficulty: 28
   Opportunity Score: 82/100
   Slug: best-fishing-tips

...

✅ Successfully generated 5 blog ideas!
```

## What Happens Next?

Once testing works, you can:

1. **Use these ideas in your seed command** (we'll update that next)
2. **Generate real blog posts** from these researched keywords
3. **Scale to hundreds of blog ideas** automatically

## Troubleshooting

### Issue: "Cannot find module 'commander'"

**Solution:**
```bash
npm install commander dotenv
```

### Issue: "Cannot find module 'dotenv'"

**Solution:**
```bash
npm install dotenv
```

### Issue: Environment variables not loading

**Solution:** Make sure `.env.local` is in your project root (same folder as `package.json`), not in `scripts/` or `app/`.

### Issue: No keywords returned

**Possible causes:**
- Filters too strict (try `--min-volume 50 --max-difficulty 60`)
- Category has no keywords (try `--category gear-reviews`)
- API credits exhausted (check your DataForSEO dashboard)

**Solution:**
```bash
# Try with looser filters
node scripts/run.ts test-ideation --min-volume 50 --max-difficulty 70

# Try a different category
node scripts/run.ts test-ideation --category gear-reviews
```

## Cost Estimate

Each test call costs approximately:
- **Connection test:** ~$0.02 (1 API call)
- **Ideation test (5 ideas):** ~$0.50-1.00 (keyword research + filtering)

This is very affordable for testing. Once working, each blog idea costs ~$0.10.
