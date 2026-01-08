/**
 * Canonical URL utilities
 */

import { absoluteUrl } from './utils';

/**
 * Generate canonical URL for a page
 */
export function generateCanonical(path: string): string {
  return absoluteUrl(path);
}

/**
 * Get canonical URL from metadata
 */
export function getCanonicalFromMetadata(metadata: {
  alternates?: { canonical?: string };
}): string | undefined {
  return metadata.alternates?.canonical;
}



