'use client';

import React, { useMemo, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { EditableImage } from './EditableImage';
import { ImageEditModal } from './ImageEditModal';
import {
  parseImagesFromMarkdown,
  updateImageInMarkdown,
  deleteImageFromMarkdown,
  replaceImageUrl,
  type ParsedImage,
} from './MarkdownParser';

interface ImagePreviewProps {
  markdown: string;
  onMarkdownChange: (newMarkdown: string) => void;
}

/**
 * ImagePreview Component
 *
 * Renders a live preview of the blog post with editable images.
 * Uses ReactMarkdown with custom components to match actual blog styling.
 * All images are wrapped in EditableImage for click-to-edit and drag-to-replace.
 */
export function ImagePreview({ markdown, onMarkdownChange }: ImagePreviewProps) {
  const [editingImage, setEditingImage] = useState<ParsedImage | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);

  // Parse images from markdown
  const images = useMemo(() => parseImagesFromMarkdown(markdown), [markdown]);

  // Create a map of image URLs to their parsed data for quick lookup
  const imageMap = useMemo(() => {
    const map = new Map<string, ParsedImage>();
    images.forEach(img => map.set(img.url, img));
    return map;
  }, [images]);

  // Handle edit button click
  const handleEdit = useCallback((imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (image) {
      setEditingImage(image);
    }
  }, [images]);

  // Handle delete button click
  const handleDelete = useCallback((imageId: string) => {
    const newMarkdown = deleteImageFromMarkdown(markdown, imageId, images);
    onMarkdownChange(newMarkdown);
    setEditingImage(null);
  }, [markdown, images, onMarkdownChange]);

  // Handle drag-and-drop replacement
  const handleReplace = useCallback(async (imageId: string, file: File) => {
    setUploading(imageId);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      // Update the markdown with the new URL
      const newMarkdown = replaceImageUrl(markdown, imageId, images, data.url);
      onMarkdownChange(newMarkdown);
    } catch (error) {
      console.error('Failed to upload replacement image:', error);
    } finally {
      setUploading(null);
    }
  }, [markdown, images, onMarkdownChange]);

  // Handle save from edit modal
  const handleSaveImage = useCallback((
    imageId: string,
    updates: { url: string; alt: string; caption: string | null }
  ) => {
    const newMarkdown = updateImageInMarkdown(markdown, imageId, images, updates);
    onMarkdownChange(newMarkdown);
    setEditingImage(null);
  }, [markdown, images, onMarkdownChange]);

  // Helper function to generate heading IDs from text (matching blog page)
  const generateHeadingId = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
  };

  // Track current image index for ID assignment during rendering
  let imageIndexCounter = 0;

  // Custom markdown components matching the actual blog page styling
  const markdownComponents = useMemo(() => ({
    h2: ({ children, ...props }: any) => {
      const text = children?.toString() || '';
      const id = generateHeadingId(text);
      return (
        <h2
          id={id}
          className="text-3xl font-bold mt-12 mb-6 text-gray-900 border-b border-gray-200 pb-3"
          {...props}
        >
          {children}
        </h2>
      );
    },
    h3: ({ children, ...props }: any) => {
      const text = children?.toString() || '';
      const id = generateHeadingId(text);
      return (
        <h3
          id={id}
          className="text-2xl font-semibold mt-8 mb-4 text-gray-900"
          {...props}
        >
          {children}
        </h3>
      );
    },
    p: ({ children, node, ...props }: any) => {
      // Check if this paragraph contains only an image - React Markdown wraps images in p tags
      const hasOnlyImage = node?.children?.length === 1 && node?.children[0]?.tagName === 'img';
      if (hasOnlyImage) {
        return <>{children}</>;
      }
      return (
        <p className="text-lg leading-relaxed text-gray-700 mb-6" {...props}>
          {children}
        </p>
      );
    },
    ul: ({ children, ...props }: any) => {
      return (
        <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700" {...props}>
          {children}
        </ul>
      );
    },
    ol: ({ children, ...props }: any) => {
      return (
        <ol className="list-decimal list-inside space-y-2 mb-6 text-gray-700" {...props}>
          {children}
        </ol>
      );
    },
    blockquote: ({ children, ...props }: any) => {
      return (
        <blockquote
          className="border-l-4 border-blue-500 pl-6 py-2 my-6 italic text-gray-600 bg-blue-50 rounded-r-lg"
          {...props}
        >
          {children}
        </blockquote>
      );
    },
    strong: ({ children, ...props }: any) => {
      return (
        <strong className="font-bold text-gray-900" {...props}>
          {children}
        </strong>
      );
    },
    a: ({ children, href, ...props }: any) => {
      return (
        <a
          href={href}
          className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors"
          {...props}
        >
          {children}
        </a>
      );
    },
    em: ({ children, ...props }: any) => {
      // Check if this is a caption (directly after an image)
      // Captions in our markdown are italicized text on their own line
      return (
        <em className="text-sm text-gray-500 block text-center mt-2 mb-6" {...props}>
          {children}
        </em>
      );
    },
    img: ({ src, alt, ...props }: any) => {
      // Find the corresponding parsed image
      const parsedImage = imageMap.get(src);

      if (parsedImage) {
        const isUploading = uploading === parsedImage.id;
        return (
          <div className={`editable-image-wrapper ${isUploading ? 'uploading' : ''}`}>
            <EditableImage
              id={parsedImage.id}
              src={src}
              alt={alt || ''}
              caption={parsedImage.caption}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onReplace={handleReplace}
            />
            {isUploading && (
              <div className="editable-image-uploading-overlay">
                <div className="editable-image-uploading-spinner" />
                <span>Uploading...</span>
              </div>
            )}
          </div>
        );
      }

      // Fallback for images not in our parsed list (shouldn't happen normally)
      return (
        <img
          src={src}
          alt={alt || ''}
          className="max-w-full rounded-lg my-6"
          {...props}
        />
      );
    },
  }), [imageMap, uploading, handleEdit, handleDelete, handleReplace]);

  return (
    <div className="image-preview-container">
      {/* Info bar */}
      <div className="image-preview-info">
        <span className="image-preview-count">
          {images.length} image{images.length !== 1 ? 's' : ''} in content
        </span>
        <span className="image-preview-hint">
          Click images to edit, or drag new images onto existing ones to replace
        </span>
      </div>

      {/* Preview content with blog-like styling */}
      <div className="image-preview-content blog-content">
        <ReactMarkdown components={markdownComponents}>
          {markdown}
        </ReactMarkdown>
      </div>

      {/* Edit Modal */}
      {editingImage && (
        <ImageEditModal
          image={editingImage}
          onSave={handleSaveImage}
          onDelete={handleDelete}
          onClose={() => setEditingImage(null)}
        />
      )}
    </div>
  );
}
