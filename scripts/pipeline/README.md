# Content Pipeline - Setup & Usage

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional (for revalidation)
REVALIDATION_SECRET=your_secret_token_here
NEXT_PUBLIC_URL=https://your-domain.com

# Optional (for debugging)
DEBUG=true
```

## Installation

```bash
# Install dependencies (if not already installed)
npm install

# Install CLI dependencies
npm install commander
```

## Usage

### Seed Job Queue

Create initial jobs for content generation:

```bash
# Seed 20 blog posts
node scripts/run.ts seed --type blog --count 20

# Seed 10 species pages
node scripts/run.ts seed --type species --count 10

# Seed 5 how-to guides
node scripts/run.ts seed --type how-to --count 5

# Seed 10 location pages
node scripts/run.ts seed --type location --count 10
```

### Run Jobs

Process pending jobs from the queue:

```bash
# Process up to 5 jobs
node scripts/run.ts run --limit 5

# Process up to 20 jobs
node scripts/run.ts run --limit 20
```

### Force Publish

Force publish a specific topic:

```bash
node scripts/run.ts publish --topicKey "blog::best-time-fish-florida"
node scripts/run.ts publish --topicKey "species::redfish"
node scripts/run.ts publish --topicKey "location::fl::miami"
```

### Check Status

View job queue status:

```bash
node scripts/run.ts status
```

### Rebuild Index

Rebuild content index from published files:

```bash
node scripts/run.ts rebuild-index
```

## Confirming Content Written

### Check Files

Content is written to:

- Blog posts: `content/blog/{slug}.json`
- Species: `content/species/{slug}.json`
- How-to: `content/how-to/{slug}.json`
- Locations: `content/locations/{state}/{city}.json`

### Check Topic Index

Topic index is stored at: `content/_system/topicIndex.json`

### Check Job Queue

Job queue is stored at: `content/_system/jobQueue.json`

## Revalidation Logs

Revalidation is triggered automatically after publishing. Check:

1. **API Route Logs**: Check Next.js server logs for `/api/revalidate` requests
2. **Pipeline Logs**: Check console output when running `node scripts/run.ts run`
3. **Next.js Logs**: Check Next.js build/server logs for revalidation messages

## Troubleshooting

### OpenAI API Errors

- Ensure `OPENAI_API_KEY` is set correctly
- Check API quota/limits
- Verify API key has access to GPT-4

### Revalidation Errors

- Ensure `REVALIDATION_SECRET` matches in `.env.local` and API route
- Check `NEXT_PUBLIC_URL` is set correctly
- Verify Next.js server is running

### Content Not Appearing

- Check topic index for published status
- Verify files exist in `content/` directory
- Check Next.js build logs for errors
- Ensure revalidation was triggered

### Job Failures

- Check job queue status: `node scripts/run.ts status`
- Review error messages in `content/_system/jobQueue.json`
- Check consecutive failures (pipeline stops after 3)

## File Structure

```
content/
├── _system/
│   ├── topicIndex.json      # Topic tracking
│   ├── jobQueue.json        # Job queue
│   └── contentIndex.json   # Content index for linking
├── blog/
│   └── {slug}.json
├── species/
│   └── {slug}.json
├── how-to/
│   └── {slug}.json
└── locations/
    └── {state}/
        └── {city}.json
```

## Notes

- **No Regulations Pages**: The pipeline does NOT create regulations pages
- **Outbound Links Only**: Pages include "See local regulations" outbound links via config
- **Fact Extraction Only**: Sources are used for fact extraction, not verbatim copying
- **Quality Gates**: All content must pass validation before publishing
- **Daily Cap**: Default is 20 pages per day (configurable)


