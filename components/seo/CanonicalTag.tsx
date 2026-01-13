/**
 * Canonical tag component
 */

import { generateCanonical } from '@/lib/seo/canonical';

interface CanonicalTagProps {
  path: string;
}

export function CanonicalTag({ path }: CanonicalTagProps) {
  const canonical = generateCanonical(path);
  return <link rel="canonical" href={canonical} />;
}



