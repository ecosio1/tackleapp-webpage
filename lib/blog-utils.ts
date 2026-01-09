/**
 * Blog utility functions
 */

/**
 * Split markdown body to insert CTA after first section
 * Returns: [contentBeforeFirstSection, contentAfterFirstSection]
 * The first section is everything up to and including the first H2 section
 */
export function splitMarkdownAfterFirstSection(body: string): [string, string] {
  // Find all H2 headings (##)
  const h2Pattern = /^##\s+(.+)$/gm;
  const matches: Array<{ index: number; length: number }> = [];
  let match;
  
  // Reset regex
  h2Pattern.lastIndex = 0;
  
  while ((match = h2Pattern.exec(body)) !== null) {
    matches.push({
      index: match.index,
      length: match[0].length,
    });
  }
  
  if (matches.length === 0) {
    // No H2 found, return entire body as first part
    return [body, ''];
  }
  
  if (matches.length === 1) {
    // Only one H2, return everything as first part
    return [body, ''];
  }
  
  // Split after the first section (before the second H2)
  const splitIndex = matches[1].index;
  const firstPart = body.substring(0, splitIndex).trim();
  const secondPart = body.substring(splitIndex).trim();
  
  return [firstPart, secondPart];
}
