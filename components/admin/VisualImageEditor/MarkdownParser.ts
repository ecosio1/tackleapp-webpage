/**
 * Markdown Image Parser Utilities
 *
 * Parses, updates, and manipulates images within markdown content.
 * Handles markdown image syntax: ![alt](url) with optional *caption* on the next line.
 */

export interface ParsedImage {
  id: string;
  fullMatch: string;
  url: string;
  alt: string;
  caption: string | null;
  startIndex: number;
  endIndex: number;
}

/**
 * Generates a unique ID for each image based on its position
 */
function generateImageId(index: number): string {
  return `img-${index}-${Date.now().toString(36)}`;
}

/**
 * Parse all images from markdown content
 *
 * Matches: ![alt text](url)
 * Optionally followed by: *caption text* on the next line
 */
export function parseImagesFromMarkdown(markdown: string): ParsedImage[] {
  const images: ParsedImage[] = [];

  // Match image with optional caption on next line
  // Pattern: ![alt](url) optionally followed by newline and *caption*
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)(?:\n\*([^*]+)\*)?/g;

  let match;
  let index = 0;

  while ((match = imageRegex.exec(markdown)) !== null) {
    images.push({
      id: generateImageId(index),
      fullMatch: match[0],
      alt: match[1] || '',
      url: match[2],
      caption: match[3] || null,
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
    index++;
  }

  return images;
}

/**
 * Update a specific image in markdown content
 *
 * @param markdown - The full markdown content
 * @param imageId - The ID of the image to update
 * @param images - The current list of parsed images
 * @param updates - The updates to apply (url, alt, caption)
 * @returns Updated markdown string
 */
export function updateImageInMarkdown(
  markdown: string,
  imageId: string,
  images: ParsedImage[],
  updates: { url?: string; alt?: string; caption?: string | null }
): string {
  const image = images.find(img => img.id === imageId);
  if (!image) return markdown;

  // Build the new image markdown
  const newUrl = updates.url ?? image.url;
  const newAlt = updates.alt ?? image.alt;
  const newCaption = updates.caption !== undefined ? updates.caption : image.caption;

  let newImageMarkdown = `![${newAlt}](${newUrl})`;
  if (newCaption) {
    newImageMarkdown += `\n*${newCaption}*`;
  }

  // Replace the old image markdown with the new one
  const before = markdown.substring(0, image.startIndex);
  const after = markdown.substring(image.endIndex);

  return before + newImageMarkdown + after;
}

/**
 * Delete an image from markdown content
 *
 * @param markdown - The full markdown content
 * @param imageId - The ID of the image to delete
 * @param images - The current list of parsed images
 * @returns Updated markdown string with image removed
 */
export function deleteImageFromMarkdown(
  markdown: string,
  imageId: string,
  images: ParsedImage[]
): string {
  const image = images.find(img => img.id === imageId);
  if (!image) return markdown;

  // Remove the image and any surrounding blank lines to avoid double spacing
  const before = markdown.substring(0, image.startIndex);
  const after = markdown.substring(image.endIndex);

  // Clean up extra newlines
  const trimmedBefore = before.replace(/\n\n$/, '\n');
  const trimmedAfter = after.replace(/^\n\n/, '\n');

  return trimmedBefore + trimmedAfter;
}

/**
 * Replace an image URL in markdown (quick replace without changing alt/caption)
 * Useful for drag-and-drop image replacement
 */
export function replaceImageUrl(
  markdown: string,
  imageId: string,
  images: ParsedImage[],
  newUrl: string
): string {
  return updateImageInMarkdown(markdown, imageId, images, { url: newUrl });
}

/**
 * Insert a new image at a specific position in the markdown
 */
export function insertImageAtPosition(
  markdown: string,
  position: number,
  imageData: { url: string; alt: string; caption?: string }
): string {
  let newImageMarkdown = `\n\n![${imageData.alt}](${imageData.url})`;
  if (imageData.caption) {
    newImageMarkdown += `\n*${imageData.caption}*`;
  }
  newImageMarkdown += '\n';

  const before = markdown.substring(0, position);
  const after = markdown.substring(position);

  return before + newImageMarkdown + after;
}

/**
 * Get image data by ID
 */
export function getImageById(images: ParsedImage[], imageId: string): ParsedImage | undefined {
  return images.find(img => img.id === imageId);
}
