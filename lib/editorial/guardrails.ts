/**
 * Editorial Guardrails - Hard rules to block bad content
 */

interface GuardrailResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Check for AI patterns
 */
export function detectAIPatterns(content: string): {
  hasRepetitiveStructure: boolean;
  lowLexicalDiversity: boolean;
  uniformParagraphs: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // 1. Check sentence length variance
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length < 10) {
    errors.push('Too few sentences for pattern detection');
    return {
      hasRepetitiveStructure: false,
      lowLexicalDiversity: false,
      uniformParagraphs: false,
      errors,
    };
  }
  
  const lengths = sentences.map(s => s.split(/\s+/).length);
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);
  const hasRepetitiveStructure = stdDev < (avgLength * 0.2);
  
  if (hasRepetitiveStructure) {
    errors.push('Repetitive sentence structure detected (AI pattern)');
  }
  
  // 2. Check lexical diversity
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2); // Filter out very short words
  
  if (words.length < 50) {
    errors.push('Too few words for lexical diversity check');
    return {
      hasRepetitiveStructure,
      lowLexicalDiversity: false,
      uniformParagraphs: false,
      errors,
    };
  }
  
  const uniqueWords = new Set(words);
  const lexicalDiversity = uniqueWords.size / words.length;
  const lowLexicalDiversity = lexicalDiversity < 0.3;
  
  if (lowLexicalDiversity) {
    errors.push(`Low lexical diversity: ${(lexicalDiversity * 100).toFixed(1)}% (minimum 30%)`);
  }
  
  // 3. Check paragraph uniformity
  const paragraphs = content.split(/\n\n/).filter(p => p.trim().length > 0);
  if (paragraphs.length >= 3) {
    const paraLengths = paragraphs.map(p => p.split(/\s+/).length);
    const uniqueLengths = new Set(paraLengths);
    const uniformParagraphs = uniqueLengths.size < 3 && paragraphs.length >= 5;
    
    if (uniformParagraphs) {
      errors.push('Paragraphs are too uniform in length (AI pattern)');
    }
    
    return {
      hasRepetitiveStructure,
      lowLexicalDiversity,
      uniformParagraphs,
      errors,
    };
  }
  
  return {
    hasRepetitiveStructure,
    lowLexicalDiversity,
    uniformParagraphs: false,
    errors,
  };
}

/**
 * Check for forbidden phrases
 */
export function checkForbiddenPhrases(content: string): string[] {
  const forbidden = [
    'ultimate',
    'secret',
    'guaranteed',
    'must-see',
    'you won\'t believe',
    'insane',
    'amazing trick',
    'official regulations',
    'legal advice',
    'always legal',
    'guaranteed to catch',
    'always works',
    'never fails',
    '100% success rate',
  ];
  
  const lowerContent = content.toLowerCase();
  const found: string[] = [];
  
  for (const phrase of forbidden) {
    if (lowerContent.includes(phrase.toLowerCase())) {
      found.push(phrase);
    }
  }
  
  return found;
}

/**
 * Check sentence structure variety
 */
export function checkSentenceVariety(content: string): {
  passed: boolean;
  averageLength: number;
  variance: number;
  error?: string;
} {
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length < 10) {
    return {
      passed: true, // Not enough sentences to check
      averageLength: 0,
      variance: 0,
    };
  }
  
  const lengths = sentences.map(s => s.split(/\s+/).length);
  const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avgLength, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);
  
  // Require at least 20% variance
  const minVariance = avgLength * 0.2;
  const passed = stdDev >= minVariance;
  
  return {
    passed,
    averageLength: avgLength,
    variance: stdDev,
    error: passed ? undefined : `Sentence length variance too low: ${stdDev.toFixed(1)} (minimum: ${minVariance.toFixed(1)})`,
  };
}

/**
 * Run all guardrails
 */
export function runGuardrails(content: string, wordCount: number, h2Count: number, internalLinkCount: number, sourcesCount: number, hasSeasonalContent: boolean): GuardrailResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // 1. AI Pattern Detection
  const aiPatterns = detectAIPatterns(content);
  errors.push(...aiPatterns.errors);
  
  // 2. Forbidden Phrases
  const forbidden = checkForbiddenPhrases(content);
  if (forbidden.length > 0) {
    errors.push(`Forbidden phrases found: ${forbidden.join(', ')}`);
  }
  
  // 3. Sentence Variety
  const sentenceVariety = checkSentenceVariety(content);
  if (!sentenceVariety.passed && sentenceVariety.error) {
    errors.push(sentenceVariety.error);
  }
  
  // 4. Word Count (already checked in validator, but double-check)
  if (wordCount < 900) {
    errors.push(`Word count too low: ${wordCount} (minimum: 900)`);
  }
  
  // 5. H2 Sections
  if (h2Count < 4) {
    errors.push(`H2 sections too few: ${h2Count} (minimum: 4)`);
  }
  
  // 6. Internal Links
  if (internalLinkCount < 3) {
    errors.push(`Internal links too few: ${internalLinkCount} (minimum: 3)`);
  }
  
  // 7. Sources for Seasonal Content
  if (hasSeasonalContent && sourcesCount < 2) {
    errors.push(`Seasonal content requires 2+ sources, found: ${sourcesCount}`);
  }
  
  // 8. Lexical Diversity Warning
  const words = content.toLowerCase().split(/\s+/);
  const uniqueWords = new Set(words);
  const lexicalDiversity = uniqueWords.size / words.length;
  if (lexicalDiversity < 0.35 && lexicalDiversity >= 0.3) {
    warnings.push(`Lexical diversity is low: ${(lexicalDiversity * 100).toFixed(1)}% (recommended: >35%)`);
  }
  
  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
}


