/**
 * Alternative Recommendations Generator
 * Creates internal linking loops with "Alternative Recommendations" sections
 * Helps users discover related content and improves internal linking
 */

import { logger } from './logger';
import { ContentBrief } from './types';

export interface AlternativeRecommendation {
  title: string;
  slug: string;
  reason: string; // Why this is an alternative
  relevanceScore: number; // 0-100
}

/**
 * Generate alternative recommendations for a page
 */
export async function generateAlternativeRecommendations(
  brief: ContentBrief,
  availableContent: Array<{ slug: string; title: string; keywords: string[]; type: string }>
): Promise<AlternativeRecommendation[]> {
  logger.info(`Generating alternative recommendations for: ${brief.slug}`);
  
  // Extract key terms from current page
  const currentKeywords = [
    brief.primaryKeyword,
    ...brief.secondaryKeywords,
  ].map(k => k.toLowerCase());
  
  // Find related content
  const recommendations: AlternativeRecommendation[] = [];
  
  for (const content of availableContent) {
    // Skip if it's the same page
    if (content.slug === brief.slug) continue;
    
    // Calculate relevance score
    const relevanceScore = calculateRelevanceScore(
      currentKeywords,
      content.keywords.map(k => k.toLowerCase()),
      brief.pageType,
      content.type
    );
    
    // Only include if relevance is above threshold
    if (relevanceScore >= 30) {
      const reason = generateReason(brief, content, relevanceScore);
      recommendations.push({
        title: content.title,
        slug: content.slug,
        reason,
        relevanceScore,
      });
    }
  }
  
  // Sort by relevance and limit to top 5
  recommendations.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  logger.info(`Generated ${recommendations.length} alternative recommendations`);
  return recommendations.slice(0, 5);
}

/**
 * Calculate relevance score between current page and alternative
 */
function calculateRelevanceScore(
  currentKeywords: string[],
  alternativeKeywords: string[],
  currentType: string,
  alternativeType: string
): number {
  let score = 0;
  
  // Keyword overlap (max 40 points)
  const overlap = currentKeywords.filter(k => 
    alternativeKeywords.some(ak => ak.includes(k) || k.includes(ak))
  ).length;
  score += Math.min(overlap * 10, 40);
  
  // Type compatibility (max 30 points)
  if (currentType === alternativeType) {
    score += 30; // Same type = high relevance
  } else if (areCompatibleTypes(currentType, alternativeType)) {
    score += 20; // Compatible types
  } else {
    score += 10; // Different types but still related
  }
  
  // Semantic similarity (max 30 points)
  // Check for related concepts
  const relatedConcepts = [
    ['species', 'how-to', 'location'],
    ['lure', 'technique', 'gear'],
    ['location', 'species', 'how-to'],
  ];
  
  for (const group of relatedConcepts) {
    if (group.includes(currentType) && group.includes(alternativeType)) {
      score += 20;
      break;
    }
  }
  
  return Math.min(score, 100);
}

/**
 * Check if two page types are compatible
 */
function areCompatibleTypes(type1: string, type2: string): boolean {
  const compatiblePairs: [string, string][] = [
    ['species', 'how-to'], // Species guides link to how-to guides
    ['species', 'location'], // Species guides link to locations
    ['how-to', 'species'], // How-to guides link to species
    ['location', 'species'], // Locations link to species
    ['blog', 'species'], // Blog posts link to species
    ['blog', 'how-to'], // Blog posts link to how-to
  ];
  
  return compatiblePairs.some(([a, b]) => 
    (a === type1 && b === type2) || (a === type2 && b === type1)
  );
}

/**
 * Generate reason for recommendation
 */
function generateReason(
  current: ContentBrief,
  alternative: { title: string; slug: string; type: string },
  score: number
): string {
  const reasons: string[] = [];
  
  // Type-based reasons
  if (current.pageType === 'species' && alternative.type === 'how-to') {
    reasons.push(`Learn specific techniques for catching this fish`);
  } else if (current.pageType === 'species' && alternative.type === 'location') {
    reasons.push(`Find the best locations to target this species`);
  } else if (current.pageType === 'how-to' && alternative.type === 'species') {
    reasons.push(`Apply this technique to other species`);
  } else if (current.pageType === 'location' && alternative.type === 'species') {
    reasons.push(`Discover other species available in this area`);
  } else if (alternative.type === 'blog') {
    reasons.push(`Related tips and strategies`);
  }
  
  // Score-based reasons
  if (score >= 70) {
    reasons.push(`Highly relevant alternative`);
  } else if (score >= 50) {
    reasons.push(`Similar topic with different approach`);
  } else {
    reasons.push(`Related content you might find useful`);
  }
  
  return reasons[0] || 'Related content';
}

/**
 * Generate alternative recommendations component code
 */
export function generateAlternativeRecommendationsComponent(
  recommendations: AlternativeRecommendation[]
): string {
  if (recommendations.length === 0) return '';
  
  return `'use client';

export function AlternativeRecommendations() {
  const recommendations = ${JSON.stringify(recommendations, null, 2)};
  
  return (
    <div className="bg-blue-50 rounded-lg p-6 my-8 border-l-4 border-blue-600">
      <h3 className="text-xl font-bold mb-4 text-gray-900">Alternative Recommendations</h3>
      <p className="text-gray-600 mb-4">
        If this isn't quite what you're looking for, consider these alternatives:
      </p>
      <ul className="space-y-3">
        {recommendations.map((rec, index) => (
          <li key={index} className="flex items-start">
            <span className="text-blue-600 mr-2">→</span>
            <div>
              <a 
                href={rec.slug} 
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {rec.title}
              </a>
              <p className="text-sm text-gray-600">{rec.reason}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
`;
}
