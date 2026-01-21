'use client';

import React, { useState, useCallback } from 'react';
import { Edit2, Trash2 } from 'lucide-react';

interface EditableImageProps {
  id: string;
  src: string;
  alt: string;
  caption?: string | null;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onReplace: (id: string, file: File) => void;
}

/**
 * EditableImage Component
 *
 * Wraps images in a clickable/droppable container for visual editing.
 * Shows hover overlay with Edit and Delete buttons.
 * Handles drag-and-drop file replacement.
 */
export function EditableImage({
  id,
  src,
  alt,
  caption,
  onEdit,
  onDelete,
  onReplace,
}: EditableImageProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        onReplace(id, file);
      }
    },
    [id, onReplace]
  );

  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onEdit(id);
    },
    [id, onEdit]
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(id);
    },
    [id, onDelete]
  );

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <div
      className={`editable-image-container ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <figure className="editable-image-figure">
        {imageError ? (
          <div className="editable-image-error">
            <span>Image failed to load</span>
            <span className="editable-image-error-url">{src}</span>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            onError={handleImageError}
            className="editable-image"
          />
        )}

        {/* Hover Overlay */}
        <div className="editable-image-overlay">
          <div className="editable-image-actions">
            <button
              className="editable-image-btn editable-image-btn-edit"
              onClick={handleEditClick}
              title="Edit image"
            >
              <Edit2 size={16} />
              <span>Edit</span>
            </button>
            <button
              className="editable-image-btn editable-image-btn-delete"
              onClick={handleDeleteClick}
              title="Delete image"
            >
              <Trash2 size={16} />
              <span>Delete</span>
            </button>
          </div>
          <div className="editable-image-hint">
            Drop image here to replace
          </div>
        </div>

        {/* Drag overlay indicator */}
        {isDragOver && (
          <div className="editable-image-drop-zone">
            <div className="editable-image-drop-indicator">
              <span>Drop to replace</span>
            </div>
          </div>
        )}

        {/* Caption */}
        {caption && (
          <figcaption className="editable-image-caption">{caption}</figcaption>
        )}
      </figure>
    </div>
  );
}
