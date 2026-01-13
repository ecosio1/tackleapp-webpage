/**
 * NoIndex tag component for draft content
 */

interface NoIndexTagProps {
  isDraft?: boolean;
  noindex?: boolean;
}

export function NoIndexTag({ isDraft, noindex }: NoIndexTagProps) {
  if (isDraft || noindex) {
    return <meta name="robots" content="noindex,nofollow" />;
  }
  return null;
}



