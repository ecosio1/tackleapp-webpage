# DataForSEO API Troubleshooting

## Error: 40400 "Not Found"

This error means the API endpoint path doesn't exist or your account doesn't have access to it.

### What We're Testing

The test function now tries **3 different endpoints**:

1. **SERP API** (`/v3/serp/google/organic/live/advanced`)
   - Most commonly available
   - Used for SERP analysis

2. **Keywords Data API** (`/v3/keywords_data/google_ads/keywords_for_keywords/live`)
   - Standard keyword research
   - Requires Google Ads API access

3. **DataForSEO Labs API** (`/v3/dataforseo_labs/google/keywords_for_keywords/live`)
   - Advanced features
   - May require Labs access

### Next Steps

**Run the test again:**
```bash
npm run pipeline:test-connection
```

The improved version will:
- ✅ Try all 3 endpoints automatically
- ✅ Show which one works
- ✅ Give you detailed error messages for each

### If All Endpoints Fail

1. **Check Your DataForSEO Account:**
   - Log into https://dataforseo.com/
   - Go to your API dashboard
   - Verify which APIs you have access to
   - Check your API credits balance

2. **Verify Credentials:**
   - Make sure `.env.local` has:
     ```
     DATAFORSEO_LOGIN=your_email@example.com
     DATAFORSEO_PASSWORD=your_api_password
     ```
   - **Note:** Use the password from your DataForSEO dashboard, NOT your account login password

3. **Check API Documentation:**
   - Visit: https://docs.dataforseo.com/
   - Look for the exact endpoint paths available to your account
   - Some accounts only have access to specific API sets

4. **Contact DataForSEO Support:**
   - If credentials are correct but endpoints still fail
   - They can tell you which endpoints your account has access to

### Alternative: Manual Endpoint Testing

If you know which endpoint works, we can hardcode it. Just run the test and share which endpoint succeeds (if any), and I'll update the code to use that one.
