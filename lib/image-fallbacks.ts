/**
 * Category-specific fallback images from Unsplash
 * Each category gets a distinct, high-quality fishing image
 * instead of the same generic photo everywhere
 */

const categoryFallbacks: Record<string, string> = {
  'fishing-tips': 'https://images.unsplash.com/photo-1504309092620-4d0ec726efa4?w=1200&h=600&fit=crop&auto=format&q=80',
  'techniques': 'https://images.unsplash.com/photo-1500463959177-e0869687df26?w=1200&h=600&fit=crop&auto=format&q=80',
  'gear-reviews': 'https://images.unsplash.com/photo-1515023115689-589c33041d3c?w=1200&h=600&fit=crop&auto=format&q=80',
  'species': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&h=600&fit=crop&auto=format&q=80',
  'conditions': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop&auto=format&q=80',
};

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=1200&h=600&fit=crop&auto=format&q=80';

/**
 * Get a category-appropriate fallback image URL
 */
export function getCategoryFallbackImage(category?: string): string {
  if (!category) return DEFAULT_FALLBACK;
  return categoryFallbacks[category] || DEFAULT_FALLBACK;
}
