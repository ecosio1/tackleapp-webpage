/**
 * Category-specific fallback images from Unsplash
 * Each category gets a distinct, high-quality fishing image
 * instead of the same generic photo everywhere
 */

const categoryFallbacks: Record<string, string> = {
  'fishing-tips': 'https://images.unsplash.com/photo-1680529642520-5897a7e9707b?w=1200&h=600&fit=crop&auto=format&q=80',
  'techniques': 'https://images.unsplash.com/photo-1598901690327-3ec1e95fd35d?w=1200&h=600&fit=crop&auto=format&q=80',
  'gear-reviews': 'https://images.unsplash.com/photo-1761171865044-f6f959fd07ea?w=1200&h=600&fit=crop&auto=format&q=80',
  'species': 'https://images.unsplash.com/photo-1533060498584-2f538c6f84fc?w=1200&h=600&fit=crop&auto=format&q=80',
  'conditions': 'https://images.unsplash.com/photo-1762895628023-531bfe46bb0b?w=1200&h=600&fit=crop&auto=format&q=80',
};

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1559332425-ccdf0eae9480?w=1200&h=600&fit=crop&auto=format&q=80';

/**
 * Get a category-appropriate fallback image URL
 */
export function getCategoryFallbackImage(category?: string): string {
  if (!category) return DEFAULT_FALLBACK;
  return categoryFallbacks[category] || DEFAULT_FALLBACK;
}
