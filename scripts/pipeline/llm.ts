/**
 * LLM Client - Generates content using OpenAI
 */

import { logger } from './logger';
import { LLM_CONFIG } from './config';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  logger.warn('OPENAI_API_KEY not set - LLM generation will fail');
}

/**
 * Retry with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = LLM_CONFIG.maxRetries,
  delayMs: number = LLM_CONFIG.retryDelayMs
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const waitTime = delayMs * Math.pow(2, attempt);
        logger.warn(`LLM call failed, retrying in ${waitTime}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }
  
  throw lastError || new Error('LLM call failed after retries');
}

/**
 * Generate content with LLM
 */
export async function generateWithLLM(input: {
  prompt: string;
  jsonSchema?: any;
  systemPrompt?: string;
}): Promise<any> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  
  const systemPrompt = input.systemPrompt || `You are a helpful fishing content writer. 
Generate original, SEO-optimized content based on the provided facts and outline.
Never copy text verbatim from sources - always write original explanations.
Include all required sections, FAQs, and internal links as specified.`;
  
  return retryWithBackoff(async () => {
    logger.info('Calling OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: LLM_CONFIG.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input.prompt },
        ],
        temperature: LLM_CONFIG.temperature,
        max_tokens: LLM_CONFIG.maxTokens,
        response_format: input.jsonSchema ? { type: 'json_schema', json_schema: input.jsonSchema } : undefined,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${error}`);
    }
    
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }
    
    // Parse JSON if schema was provided
    if (input.jsonSchema) {
      try {
        return JSON.parse(content);
      } catch (error) {
        logger.error('Failed to parse JSON response:', content);
        throw new Error('Invalid JSON response from LLM');
      }
    }
    
    return content;
  });
}

/**
 * Generate structured content (with JSON schema)
 */
export async function generateStructuredContent<T>(input: {
  prompt: string;
  jsonSchema: any;
  systemPrompt?: string;
}): Promise<T> {
  return generateWithLLM(input) as Promise<T>;
}

/**
 * Generate markdown content
 */
export async function generateMarkdownContent(input: {
  prompt: string;
  systemPrompt?: string;
}): Promise<string> {
  return generateWithLLM(input) as Promise<string>;
}



