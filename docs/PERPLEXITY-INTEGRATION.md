# Perplexity API Integration

## Overview

Perplexity API integration provides real-time research, fact-checking, and information gathering with citations for the content pipeline.

## Setup

### 1. Get Perplexity API Key

1. Sign up at https://www.perplexity.ai/
2. Navigate to API settings
3. Generate an API key
4. Add to `.env.local`:

```bash
PERPLEXITY_API_KEY=your_api_key_here
```

### 2. Test Connection

```bash
npm run pipeline:test-perplexity
```

## Features

### Research Topics

Get comprehensive research on any topic with citations:

```typescript
import { researchTopic } from './pipeline/perplexity';

const result = await researchTopic('best fishing techniques for redfish in Florida');
console.log(result.answer); // Research answer
console.log(result.citations); // Array of source URLs
```

### Fact-Checking

Verify claims with sources:

```typescript
import { factCheck } from './pipeline/perplexity';

const result = await factCheck('Redfish can grow up to 60 inches in length');
console.log(result.verified); // true/false
console.log(result.explanation); // Why it's verified
console.log(result.sources); // Source URLs
console.log(result.confidence); // 0-1 confidence score
```

### Related Questions

Generate FAQ questions for content:

```typescript
import { getRelatedQuestions } from './pipeline/perplexity';

const questions = await getRelatedQuestions('fishing for redfish');
// Returns: ["What is the best bait for redfish?", "When is redfish season?", ...]
```

### Fishing-Specific Research

Wrapper with fishing context:

```typescript
import { researchFishingTopic } from './pipeline/perplexity';

const result = await researchFishingTopic('redfish habitat', 'Florida');
// Automatically adds fishing context and location
```

## API Models

Available models (in order of capability/cost):

1. **`llama-3.1-sonar-small-128k-online`** (default)
   - Fast, cost-effective
   - Good for general research

2. **`llama-3.1-sonar-large-128k-online`**
   - Better accuracy
   - Use for fact-checking

3. **`llama-3.1-sonar-huge-128k-online`**
   - Best quality
   - Use for complex research

## Options

```typescript
interface PerplexityOptions {
  model?: 'llama-3.1-sonar-small-128k-online' | 'llama-3.1-sonar-large-128k-online' | 'llama-3.1-sonar-huge-128k-online';
  temperature?: number; // 0-1, default: 0.2
  maxTokens?: number; // default: 2000
  searchRecencyFilter?: 'month' | 'week' | 'day' | 'year';
  returnImages?: boolean;
  returnRelatedQuestions?: boolean;
}
```

## Usage in Content Pipeline

### In Content Generation

```typescript
// Research facts before generating content
const research = await researchFishingTopic('redfish spawning season', 'Florida');

// Use in content brief
const brief = {
  facts: extractFactsFromResearch(research.answer),
  sources: research.citations,
  // ...
};
```

### In Validation

```typescript
// Fact-check claims in generated content
const claim = 'Redfish spawn in spring';
const verification = await factCheck(claim);

if (!verification.verified) {
  logger.warn(`Unverified claim: ${claim}`);
  // Flag for review
}
```

### In FAQ Generation

```typescript
// Generate related questions for FAQ section
const questions = await getRelatedQuestions('fishing for redfish in Florida');
// Use in blog post FAQ section
```

## Rate Limits

- Perplexity has rate limits based on your plan
- The integration includes:
  - Automatic batching (3 concurrent requests max)
  - Retry logic with backoff
  - Error handling

## Cost Considerations

- Perplexity charges per API call
- Smaller models are more cost-effective
- Use `llama-3.1-sonar-small-128k-online` for most research
- Use larger models only for critical fact-checking

## Best Practices

1. **Cache Results**: Research results don't change frequently - cache them
2. **Batch Requests**: Use `researchTopics()` for multiple queries
3. **Use Appropriate Models**: Don't use huge model for simple queries
4. **Verify Citations**: Always check that citations are relevant
5. **Combine with DataForSEO**: Use Perplexity for research, DataForSEO for keyword data

## Example: Complete Research Workflow

```typescript
import { researchFishingTopic, getRelatedQuestions, factCheck } from './pipeline/perplexity';

// 1. Research the topic
const research = await researchFishingTopic('redfish fishing techniques', 'Florida');

// 2. Get related questions for FAQ
const questions = await getRelatedQuestions('redfish fishing');

// 3. Fact-check key claims
const claim = 'Redfish prefer shallow water';
const verification = await factCheck(claim);

// 4. Use in content generation
const content = {
  mainContent: research.answer,
  faq: questions,
  sources: research.citations,
  verifiedClaims: verification.verified,
};
```

## Troubleshooting

### Error: "PERPLEXITY_API_KEY not set"
- Add `PERPLEXITY_API_KEY` to `.env.local`
- Restart the pipeline

### Error: "Rate limit exceeded"
- Reduce concurrent requests
- Add delays between batches
- Upgrade Perplexity plan

### Empty citations
- Some queries may not have citations
- Check if query is too specific or too vague
- Try rephrasing the query
