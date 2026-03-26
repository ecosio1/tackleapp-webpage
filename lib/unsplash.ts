/**
 * Unsplash API service with in-memory caching
 * Demo key: 50 requests/hour
 */

const UNSPLASH_API = 'https://api.unsplash.com';

export interface UnsplashPhoto {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  links: {
    download_location: string;
  };
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

// In-memory cache with 1-hour TTL
const cache = new Map<string, CacheEntry<unknown>>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

function getAccessKey(): string | null {
  return process.env.UNSPLASH_ACCESS_KEY || null;
}

/**
 * Search Unsplash for photos
 */
export async function searchImages(
  query: string,
  options: { page?: number; perPage?: number; orientation?: 'landscape' | 'portrait' | 'squarish' } = {}
): Promise<UnsplashPhoto[]> {
  const accessKey = getAccessKey();
  if (!accessKey || accessKey === 'your_unsplash_access_key_here') {
    return [];
  }

  const { page = 1, perPage = 10, orientation = 'landscape' } = options;
  const cacheKey = `search:${query}:${page}:${perPage}:${orientation}`;

  const cached = getCached<UnsplashPhoto[]>(cacheKey);
  if (cached) return cached;

  try {
    const params = new URLSearchParams({
      query,
      page: String(page),
      per_page: String(perPage),
      orientation,
    });

    const res = await fetch(`${UNSPLASH_API}/search/photos?${params}`, {
      headers: { Authorization: `Client-ID ${accessKey}` },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn(`[Unsplash] Search failed: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    const photos: UnsplashPhoto[] = data.results || [];
    setCache(cacheKey, photos);
    return photos;
  } catch (error) {
    console.warn('[Unsplash] Search error:', error);
    return [];
  }
}

/**
 * Get a specific photo by ID
 */
export async function getPhoto(id: string): Promise<UnsplashPhoto | null> {
  const accessKey = getAccessKey();
  if (!accessKey || accessKey === 'your_unsplash_access_key_here') {
    return null;
  }

  const cacheKey = `photo:${id}`;
  const cached = getCached<UnsplashPhoto>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(`${UNSPLASH_API}/photos/${id}`, {
      headers: { Authorization: `Client-ID ${accessKey}` },
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const photo: UnsplashPhoto = await res.json();
    setCache(cacheKey, photo);
    return photo;
  } catch {
    return null;
  }
}

/**
 * Construct an optimized Unsplash image URL
 * Works with Next.js Image component since images.unsplash.com is in remotePatterns
 */
export function getUnsplashImageUrl(
  photoIdOrUrl: string,
  width: number = 1200,
  height: number = 600
): string {
  // If it's already a full URL, modify the query params
  if (photoIdOrUrl.startsWith('https://images.unsplash.com/')) {
    const url = new URL(photoIdOrUrl);
    url.searchParams.set('w', String(width));
    url.searchParams.set('h', String(height));
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('auto', 'format');
    url.searchParams.set('q', '80');
    return url.toString();
  }

  // Build URL from photo ID
  return `https://images.unsplash.com/photo-${photoIdOrUrl}?w=${width}&h=${height}&fit=crop&auto=format&q=80`;
}

/**
 * Extract photographer name from Unsplash URL query params (if available)
 * For static URLs that don't go through the API
 */
export function isUnsplashUrl(url: string): boolean {
  return url.includes('unsplash.com');
}
