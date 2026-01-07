# Implementation Notes

## Completed Components

All core pipeline components have been implemented:

1. ✅ **Types** (`types.ts`) - All TypeScript interfaces
2. ✅ **Config** (`config.ts`) - Configuration constants
3. ✅ **Source Registry** (`sourceRegistry.ts`) - Approved sources with rate limiting
4. ✅ **Fetcher** (`fetcher.ts`) - URL fetching with rate limits
5. ✅ **Extractor** (`extractor.ts`) - Fact extraction (lightweight, no verbatim copying)
6. ✅ **Dedupe** (`dedupe.ts`) - Content deduplication
7. ✅ **Topic Index** (`topicIndex.ts`) - Persistent topic tracking
8. ✅ **Brief Builder** (`briefBuilder.ts`) - Content brief generation
9. ✅ **Internal Links** (`internalLinks.ts`) - Internal link generation
10. ✅ **LLM Client** (`llm.ts`) - OpenAI integration with retries
11. ✅ **Generators** (`generators/*.ts`) - Page generators for all 4 types
12. ✅ **Validator** (`validator.ts`) - Quality gate validation
13. ✅ **Publisher** (`publisher.ts`) - Content publishing to storage
14. ✅ **Scheduler** (`scheduler.ts`) - Job queue management
15. ✅ **Revalidation API** (`app/api/revalidate/route.ts`) - Next.js revalidation endpoint
16. ✅ **CLI Runner** (`scripts/run.ts`) - Command-line interface

## Missing Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "commander": "^11.0.0"
  }
}
```

Then run: `npm install`

## Implementation Gaps

### 1. Full Job Processing Pipeline

The `processJob` function in `scripts/run.ts` is a placeholder. It needs to:

1. Fetch sources (using `fetcher.ts`)
2. Extract facts (using `extractor.ts`)
3. Check deduplication (using `dedupe.ts`)
4. Build brief (using `briefBuilder.ts`)
5. Generate content (using generators)
6. Validate (using `validator.ts`)
7. Publish (using `publisher.ts`)
8. Trigger revalidation

### 2. Source Fetching Logic

The `fetcher.ts` currently has basic fetch logic. You may want to add:

- HTML parsing (consider using `cheerio` for better extraction)
- RSS feed parsing (for RSS sources)
- Better error handling
- Retry logic

### 3. Fact Extraction Enhancement

The `extractor.ts` uses simple heuristics. Consider:

- Using an LLM for better fact extraction
- Named Entity Recognition (NER) for better entity extraction
- Better quality scoring

### 4. Content Index Building

The `internalLinks.ts` needs a way to build the initial content index. Consider:

- Scanning existing content files
- Building from database if using DB storage
- Updating index on every publish

### 5. Topic Generation

The seed command creates placeholder topics. You need to:

- Generate real topics from your content strategy
- Use search intent data
- Prioritize high-value topics

## Storage Adapter

Currently implemented for **file-based storage** (JSON files). If using database:

1. Create adapter functions in `publisher.ts`
2. Update `topicIndex.ts` to use database
3. Update `internalLinks.ts` to query database
4. Update `scheduler.ts` to use database for job queue

## Testing

To test the pipeline:

1. **Set environment variables** (see README.md)
2. **Seed jobs**: `node scripts/run.ts seed --type blog --count 5`
3. **Run jobs**: `node scripts/run.ts run --limit 5`
4. **Check output**: Look in `content/` directory
5. **Verify revalidation**: Check Next.js logs

## Next Steps

1. Implement full `processJob` function
2. Add HTML parsing library (cheerio) if needed
3. Enhance fact extraction with LLM
4. Build content index from existing content
5. Add monitoring/alerting
6. Add rollback capability
7. Test end-to-end pipeline

## Important Notes

- **No Regulations Pages**: System does NOT create regulations pages
- **Outbound Links Only**: Pages include "See local regulations" links via config
- **Fact Extraction Only**: Sources used for facts, not verbatim copying
- **Quality Gates**: All content validated before publishing
- **Daily Cap**: Default 20 pages/day (configurable)


