'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Link, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import type { ParsedImage } from './MarkdownParser';

interface ImageEditModalProps {
  image: ParsedImage;
  onSave: (imageId: string, updates: { url: string; alt: string; caption: string | null }) => void;
  onDelete: (imageId: string) => void;
  onClose: () => void;
}

/**
 * ImageEditModal Component
 *
 * Modal for editing image properties: URL, alt text, and caption.
 * Supports both URL input and file upload with drag-and-drop.
 */
export function ImageEditModal({
  image,
  onSave,
  onDelete,
  onClose,
}: ImageEditModalProps) {
  const [url, setUrl] = useState(image.url);
  const [alt, setAlt] = useState(image.alt);
  const [caption, setCaption] = useState(image.caption || '');
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleFileUpload = async (file: File) => {
    setUploadError('');
    setUploading(true);

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

      setUrl(data.url);
      // Auto-fill alt text from filename if empty
      if (!alt) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setAlt(nameWithoutExt);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    } else {
      setUploadError('Please drop an image file');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSave = () => {
    onSave(image.id, {
      url,
      alt,
      caption: caption.trim() || null,
    });
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete(image.id);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal admin-modal-image-edit" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>Edit Image</h3>
          <button className="admin-modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="admin-modal-body">
          {/* Current Image Preview */}
          <div className="image-edit-preview">
            {url ? (
              <img
                src={url}
                alt={alt || 'Preview'}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="image-edit-preview-placeholder">
                No image URL
              </div>
            )}
          </div>

          {/* Mode Toggle */}
          <div className="admin-image-mode-toggle">
            <button
              className={`admin-mode-btn ${mode === 'url' ? 'active' : ''}`}
              onClick={() => setMode('url')}
            >
              <Link size={16} />
              URL
            </button>
            <button
              className={`admin-mode-btn ${mode === 'upload' ? 'active' : ''}`}
              onClick={() => setMode('upload')}
            >
              <Upload size={16} />
              Upload
            </button>
          </div>

          {mode === 'upload' ? (
            <>
              <div
                className={`admin-upload-zone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
                {uploading ? (
                  <div className="admin-upload-loading">
                    <Loader2 size={32} className="admin-spin" />
                    <span>Uploading...</span>
                  </div>
                ) : (
                  <div className="admin-upload-placeholder">
                    <Upload size={32} />
                    <span>Drop an image here or click to browse</span>
                    <span className="admin-upload-hint">JPG, PNG, WebP, GIF (max 5MB)</span>
                  </div>
                )}
              </div>
              {uploadError && (
                <div className="admin-upload-error">
                  <AlertCircle size={14} />
                  {uploadError}
                </div>
              )}
            </>
          ) : (
            <div className="admin-field">
              <label>Image URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://images.unsplash.com/photo-xxx?w=800"
              />
            </div>
          )}

          <div className="admin-field">
            <label>Alt Text (for accessibility)</label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Describe the image"
            />
            <span className="admin-field-hint">
              Describes the image for screen readers and SEO
            </span>
          </div>

          <div className="admin-field">
            <label>Caption (optional)</label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Caption text below the image"
            />
          </div>
        </div>

        <div className="admin-modal-footer">
          <button
            className={`admin-btn admin-btn-danger ${showDeleteConfirm ? 'confirm' : ''}`}
            onClick={handleDelete}
          >
            <Trash2 size={16} />
            {showDeleteConfirm ? 'Confirm Delete' : 'Delete'}
          </button>
          <div className="admin-modal-footer-right">
            <button className="admin-btn admin-btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button
              className="admin-btn admin-btn-primary"
              onClick={handleSave}
              disabled={!url || uploading}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
