/**
 * Perplexity API Integration
 * Used for research, fact-checking, and getting up-to-date information with citations
 */

import { logger } from './logger';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

if (!PERPLEXITY_API_KEY) {
  logger.warn('PERPLEXITY_API_KEY not set - Perplexity research features will be unavailable');
}

export interface PerplexityResponse {
  answer: string;
  citations: string[];
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface PerplexityOptions {
  model?: 'llama-3.1-sonar-small-128k-online' | 'llama-3.1-sonar-large-128k-online' | 'llama-3.1-sonar-huge-128k-online';
  temperature?: number;
  maxTokens?: number;
  searchRecencyFilter?: 'month' | 'week' | 'day' | 'year';
  returnImages?: boolean;
  returnRelatedQuestions?: boolean;
}

/**
 * Default options for Perplexity API
 */
const DEFAULT_OPTIONS: Required<Omit<PerplexityOptions, 'searchRecencyFilter'>> = {
  model: 'llama-3.1-sonar-small-128k-online',
  temperature: 0.2,
  maxTokens: 2000,
  returnImages: false,
  returnRelatedQuestions: true,
};

/**
 * Research a topic using Perplexity API
 * Returns answer with citations
 */
export async function researchTopic(
  query: string,
  options: PerplexityOptions = {}
): Promise<PerplexityResponse> {
  if (!PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY environment variable is required');
  }

  // Try to use provided model, fallback to common Perplexity models if invalid
  const requestedModel = options.model || DEFAULT_OPTIONS.model;
  const temperature = options.temperature ?? DEFAULT_OPTIONS.temperature;
  const maxTokens = options.maxTokens || DEFAULT_OPTIONS.maxTokens;

  logger.info(`Researching topic with Perplexity: "${query}"`);

  // List of models to try (from most capable to least)
  // Common Perplexity models: sonar-pro, sonar, llama-3.1-sonar-large-128k-online, etc.
  const modelsToTry = [
    requestedModel, // Try requested/default first
    'sonar-pro', // Pro model (if available)
    'sonar', // Generic sonar model
    'llama-3.1-sonar-large-128k-online',
    'llama-3.1-sonar-huge-128k-online',
    'llama-3.1-sonar-small-128k-online',
    'llama-3.1-70b-instruct',
    'llama-3.1-8b-instruct',
  ];

  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      logger.debug(`Trying Perplexity model: ${model}`);
      
      const response = await fetch(PERPLEXITY_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'You are a helpful research assistant. Provide accurate, well-sourced information with citations. Focus on factual, verifiable information.',
            },
            {
              role: 'user',
              content: query,
            },
          ],
          temperature,
          max_tokens: maxTokens,
          search_recency_filter: options.searchRecencyFilter,
          return_images: options.returnImages || false,
          return_related_questions: options.returnRelatedQuestions !== false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // If it's a model error (400 with "Invalid model"), try next model
        if (response.status === 400 && errorText.includes('model') && errorText.includes('Invalid')) {
          logger.debug(`Model ${model} is invalid, trying next...`);
          lastError = new Error(`Perplexity API error: ${response.status} - ${errorText}`);
          continue;
        }
        
        // Otherwise, throw the error
        throw new Error(`Perplexity API error: ${response.status} - ${errorText}`);
      }

      // Success! Parse response
      logger.info(`✅ Successfully used Perplexity model: ${model}`);
      const data = await response.json();

      // Extract answer
      const answer = data.choices[0]?.message?.content || '';
      
      // Extract citations from response
      const citations: string[] = [];
      
      // Perplexity includes citations in the response metadata
      if (data.citations && Array.isArray(data.citations)) {
        citations.push(...data.citations);
      }
      
      // Also extract URLs from the answer text (Perplexity often includes [1], [2] style citations)
      const citationMatches = answer.matchAll(/\[(\d+)\]/g);
      for (const match of citationMatches) {
        // Try to find corresponding URL in citations array
        const citationIndex = parseInt(match[1]) - 1;
        if (data.citations && data.citations[citationIndex]) {
          // Already added
        }
      }

      // Extract URLs from answer text directly
      const urlMatches = answer.matchAll(/https?:\/\/[^\s\)]+/g);
      for (const match of urlMatches) {
        const url = match[0].replace(/[.,;!?]+$/, ''); // Remove trailing punctuation
        if (!citations.includes(url)) {
          citations.push(url);
        }
      }

      const result: PerplexityResponse = {
        answer,
        citations: [...new Set(citations)], // Deduplicate
        model: data.model || model,
        usage: data.usage,
      };

      logger.info(`Perplexity research completed. Citations: ${result.citations.length}`);
      return result;
      
    } catch (error) {
      // If this is the last model to try, throw the error
      if (model === modelsToTry[modelsToTry.length - 1]) {
        logger.error('All Perplexity models failed. Last error:', error);
        throw lastError || (error instanceof Error ? error : new Error(String(error)));
      }
      
      // Otherwise, continue to next model
      lastError = error instanceof Error ? error : new Error(String(error));
      continue;
    }
  }

  // Should never reach here, but just in case
  throw lastError || new Error('All Perplexity models failed');
}

/**
 * Research multiple topics in parallel
 */
export async function researchTopics(
  queries: string[],
  options: PerplexityOptions = {}
): Promise<PerplexityResponse[]> {
  logger.info(`Researching ${queries.length} topics in parallel...`);
  
  // Limit concurrent requests to avoid rate limits
  const batchSize = 3;
  const results: PerplexityResponse[] = [];
  
  for (let i = 0; i < queries.length; i += batchSize) {
    const batch = queries.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(query => researchTopic(query, options).catch(error => {
        logger.error(`Failed to research "${query}":`, error);
        return {
          answer: `Research failed: ${error instanceof Error ? error.message : String(error)}`,
          citations: [],
          model: options.model || DEFAULT_OPTIONS.model,
        };
      }))
    );
    results.push(...batchResults);
    
    // Small delay between batches to avoid rate limits
    if (i + batchSize < queries.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

/**
 * Fact-check a claim using Perplexity
 */
export async function factCheck(claim: string): Promise<{
  verified: boolean;
  explanation: string;
  sources: string[];
  confidence: number;
}> {
  logger.info(`Fact-checking: "${claim}"`);
  
  const query = `Fact-check this claim and provide sources: "${claim}". Respond with whether it's true, false, or partially true, and explain why with citations.`;
  
  const response = await researchTopic(query, {
    model: 'llama-3.1-sonar-large-128k-online', // Use larger model for fact-checking
    temperature: 0.1, // Lower temperature for more factual responses
  });
  
  // Analyze response to determine verification status
  const answerLower = response.answer.toLowerCase();
  let verified = false;
  let confidence = 0.5;
  
  if (answerLower.includes('true') && !answerLower.includes('false') && !answerLower.includes('not true')) {
    verified = true;
    confidence = 0.8;
  } else if (answerLower.includes('false') || answerLower.includes('incorrect') || answerLower.includes('not true')) {
    verified = false;
    confidence = 0.8;
  } else if (answerLower.includes('partially') || answerLower.includes('mostly')) {
    verified = true; // Partially true is still true
    confidence = 0.6;
  }
  
  return {
    verified,
    explanation: response.answer,
    sources: response.citations,
    confidence,
  };
}

/**
 * Get related questions for a topic (useful for FAQ generation)
 */
export async function getRelatedQuestions(topic: string): Promise<string[]> {
  logger.info(`Getting related questions for: "${topic}"`);
  
  const query = `What are common questions people ask about "${topic}"? List 5-8 specific questions.`;
  
  const response = await researchTopic(query, {
    returnRelatedQuestions: true,
  });
  
  // Extract questions from response
  const questions: string[] = [];
  
  // Look for numbered lists or bullet points
  const questionPatterns = [
    /^\d+\.\s+(.+?)(?:\n|$)/gm,
    /^[-•]\s+(.+?)(?:\n|$)/gm,
    /^(.+\?)\s*$/gm,
  ];
  
  for (const pattern of questionPatterns) {
    const matches = response.answer.matchAll(pattern);
    for (const match of matches) {
      const question = match[1]?.trim();
      if (question && question.length > 10 && question.length < 200) {
        if (!question.endsWith('?')) {
          questions.push(`${question}?`);
        } else {
          questions.push(question);
        }
      }
    }
  }
  
  // If no structured questions found, try to extract from text
  if (questions.length === 0) {
    const sentences = response.answer.split(/[.!?]+/);
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      if (trimmed.includes('?') && trimmed.length > 15 && trimmed.length < 150) {
        questions.push(trimmed);
      }
    }
  }
  
  // Deduplicate and limit
  const uniqueQuestions = Array.from(new Set(questions)).slice(0, 8);
  
  logger.info(`Extracted ${uniqueQuestions.length} related questions`);
  return uniqueQuestions;
}

/**
 * Research fishing-specific information
 * Wrapper that adds fishing context to queries
 */
export async function researchFishingTopic(
  topic: string,
  location?: string
): Promise<PerplexityResponse> {
  let query = topic;
  
  if (location) {
    query = `${topic} in ${location}`;
  }
  
  // Add fishing context
  query = `Fishing information: ${query}. Focus on practical, accurate information for anglers.`;
  
  return researchTopic(query, {
    model: 'llama-3.1-sonar-small-128k-online',
    searchRecencyFilter: 'year', // Fishing info doesn't change too frequently
  });
}

/**
 * Test Perplexity connection
 */
export async function testPerplexityConnection(): Promise<boolean> {
  if (!PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY environment variable is required');
  }
  
  logger.info('Testing Perplexity API connection...');
  
  try {
    const response = await researchTopic('What is fishing?', {
      maxTokens: 100, // Short response for test
    });
    
    if (response.answer && response.answer.length > 0) {
      logger.info('✅ Perplexity API connection successful!');
      logger.info(`Test response length: ${response.answer.length} characters`);
      return true;
    }
    
    throw new Error('Empty response from Perplexity API');
    
  } catch (error) {
    logger.error('❌ Perplexity API connection failed:', error);
    throw error;
  }
}
