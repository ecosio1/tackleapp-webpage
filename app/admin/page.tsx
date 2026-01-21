'use client';

import { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Video,
  Image as ImageIcon,
  Save,
  ArrowLeft,
  ExternalLink,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Heading2,
  Heading3,
  Quote,
  X,
  Plus,
  Upload,
  Loader2,
  ImagePlus
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ImagePreview } from '@/components/admin/VisualImageEditor';

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  heroImage?: string;
  videoUrl?: string;
  body?: string;
}

interface FullPost extends BlogPost {
  body: string;
}

interface ContentIndex {
  blog: BlogPost[];
}

export default function AdminPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [fullPost, setFullPost] = useState<FullPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingPost, setLoadingPost] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editedPost, setEditedPost] = useState<FullPost | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [visualPreviewMode, setVisualPreviewMode] = useState(true); // Visual editor vs raw markdown preview
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageCaption, setImageCaption] = useState('');
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('upload');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [cursorPosition, setCursorPosition] = useState(0);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      const res = await fetch('/api/admin/content');
      const data: ContentIndex = await res.json();
      setPosts(data.blog || []);
    } catch (error) {
      console.error('Failed to load posts:', error);
      setMessage({ type: 'error', text: 'Failed to load content' });
    } finally {
      setLoading(false);
    }
  }

  async function loadFullPost(slug: string) {
    setLoadingPost(true);
    try {
      const res = await fetch(`/api/admin/post/${slug}`);
      const data: FullPost = await res.json();
      setFullPost(data);
      setEditedPost({ ...data });
    } catch (error) {
      console.error('Failed to load post:', error);
      setMessage({ type: 'error', text: 'Failed to load post content' });
    } finally {
      setLoadingPost(false);
    }
  }

  async function savePost() {
    if (!editedPost) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post: editedPost }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Saved successfully!' });
        setFullPost(editedPost);
        await loadPosts();
        setTimeout(() => setMessage(null), 3000);
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save changes' });
    } finally {
      setSaving(false);
    }
  }

  function selectPost(post: BlogPost) {
    setSelectedPost(post);
    setShowPreview(false);
    loadFullPost(post.slug);
  }

  function updateField(field: keyof FullPost, value: string) {
    if (!editedPost) return;
    setEditedPost({ ...editedPost, [field]: value });
  }

  function insertAtCursor(text: string) {
    if (!editedPost || !textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const body = editedPost.body || '';

    const newBody = body.substring(0, start) + text + body.substring(end);
    setEditedPost({ ...editedPost, body: newBody });

    // Restore cursor position after the inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
    }, 0);
  }

  function insertMarkdown(type: string) {
    const textarea = textareaRef.current;
    if (!textarea || !editedPost) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editedPost.body?.substring(start, end) || '';

    let insert = '';
    let cursorOffset = 0;

    switch (type) {
      case 'bold':
        insert = `**${selectedText || 'bold text'}**`;
        cursorOffset = selectedText ? insert.length : 2;
        break;
      case 'italic':
        insert = `*${selectedText || 'italic text'}*`;
        cursorOffset = selectedText ? insert.length : 1;
        break;
      case 'h2':
        insert = `\n## ${selectedText || 'Heading'}\n`;
        cursorOffset = selectedText ? insert.length : 4;
        break;
      case 'h3':
        insert = `\n### ${selectedText || 'Subheading'}\n`;
        cursorOffset = selectedText ? insert.length : 5;
        break;
      case 'ul':
        insert = `\n- ${selectedText || 'List item'}\n`;
        cursorOffset = selectedText ? insert.length : 3;
        break;
      case 'ol':
        insert = `\n1. ${selectedText || 'List item'}\n`;
        cursorOffset = selectedText ? insert.length : 4;
        break;
      case 'quote':
        insert = `\n> ${selectedText || 'Quote'}\n`;
        cursorOffset = selectedText ? insert.length : 3;
        break;
      case 'link':
        insert = `[${selectedText || 'link text'}](url)`;
        cursorOffset = selectedText ? insert.length - 4 : 1;
        break;
    }

    insertAtCursor(insert);
  }

  function handleInsertImage() {
    if (!imageUrl) return;

    let markdown = `\n![${imageAlt || 'Image'}](${imageUrl})\n`;
    if (imageCaption) {
      markdown += `*${imageCaption}*\n`;
    }

    insertAtCursor(markdown);
    closeImageModal();
  }

  function closeImageModal() {
    setShowImageModal(false);
    setImageUrl('');
    setImageAlt('');
    setImageCaption('');
    setUploadError('');
    setDragOver(false);
  }

  async function handleFileUpload(file: File) {
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

      setImageUrl(data.url);
      // Auto-fill alt text from filename if empty
      if (!imageAlt) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setImageAlt(nameWithoutExt);
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    } else {
      setUploadError('Please drop an image file');
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  }

  function getVideoEmbedUrl(url: string): string | null {
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return null;
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <p>Loading content...</p>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h1>Content Admin</h1>
          <span className="admin-badge">{posts.length} posts</span>
        </div>

        <div className="admin-post-list">
          {posts.map((post) => (
            <button
              key={post.slug}
              className={`admin-post-item ${selectedPost?.slug === post.slug ? 'active' : ''}`}
              onClick={() => selectPost(post)}
            >
              <FileText size={16} />
              <div className="admin-post-item-content">
                <span className="admin-post-item-title">{post.title}</span>
                <span className="admin-post-item-meta">
                  {post.category} • {new Date(post.publishedAt).toLocaleDateString()}
                </span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {selectedPost && editedPost ? (
          <>
            {/* Header */}
            <div className="admin-header">
              <button className="admin-back" onClick={() => { setSelectedPost(null); setFullPost(null); setEditedPost(null); }}>
                <ArrowLeft size={18} />
                Back
              </button>
              <div className="admin-actions">
                <button
                  className={`admin-btn admin-btn-ghost ${showPreview ? 'active' : ''}`}
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showPreview ? 'Edit' : 'Preview'}
                </button>
                {showPreview && (
                  <button
                    className={`admin-btn admin-btn-ghost ${visualPreviewMode ? 'active' : ''}`}
                    onClick={() => setVisualPreviewMode(!visualPreviewMode)}
                    title={visualPreviewMode ? 'Switch to raw markdown preview' : 'Switch to visual image editor'}
                  >
                    <ImagePlus size={16} />
                    {visualPreviewMode ? 'Visual' : 'Raw'}
                  </button>
                )}
                <a
                  href={`/blog/${selectedPost.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-btn admin-btn-secondary"
                >
                  <ExternalLink size={16} />
                  View Live
                </a>
                <button
                  className="admin-btn admin-btn-primary"
                  onClick={savePost}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : <><Save size={16} /> Save</>}
                </button>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className={`admin-message admin-message-${message.type}`}>
                {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                {message.text}
              </div>
            )}

            {loadingPost ? (
              <div className="admin-loading-inline">
                <div className="admin-spinner" />
                <p>Loading post content...</p>
              </div>
            ) : (
              <div className="admin-editor">
                {/* Basic Info */}
                <section className="admin-section">
                  <h2>Basic Information</h2>
                  <div className="admin-field">
                    <label>Title</label>
                    <input
                      type="text"
                      value={editedPost.title}
                      onChange={(e) => updateField('title', e.target.value)}
                    />
                  </div>
                  <div className="admin-field">
                    <label>Description</label>
                    <textarea
                      value={editedPost.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="admin-row">
                    <div className="admin-field">
                      <label>Category</label>
                      <select
                        value={editedPost.category}
                        onChange={(e) => updateField('category', e.target.value)}
                      >
                        <option value="fishing-tips">Fishing Tips</option>
                        <option value="techniques">Techniques</option>
                        <option value="gear-reviews">Gear Reviews</option>
                        <option value="species">Species</option>
                        <option value="conditions">Conditions</option>
                        <option value="locations">Locations</option>
                      </select>
                    </div>
                    <div className="admin-field">
                      <label>Published Date</label>
                      <input
                        type="date"
                        value={editedPost.publishedAt?.split('T')[0]}
                        onChange={(e) => updateField('publishedAt', e.target.value)}
                      />
                    </div>
                  </div>
                </section>

                {/* Media Section */}
                <section className="admin-section">
                  <h2>Media</h2>
                  <div className="admin-row">
                    <div className="admin-field">
                      <label><ImageIcon size={14} /> Hero Image URL</label>
                      <input
                        type="url"
                        value={editedPost.heroImage || ''}
                        onChange={(e) => updateField('heroImage', e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                      />
                      {editedPost.heroImage && (
                        <div className="admin-image-preview-small">
                          <img src={editedPost.heroImage} alt="Hero" />
                        </div>
                      )}
                    </div>
                    <div className="admin-field">
                      <label><Video size={14} /> Video URL</label>
                      <input
                        type="url"
                        value={editedPost.videoUrl || ''}
                        onChange={(e) => updateField('videoUrl', e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                  </div>
                </section>

                {/* Body Editor */}
                <section className="admin-section admin-section-body">
                  <div className="admin-section-header">
                    <h2>Content Body</h2>
                    <button
                      className="admin-btn admin-btn-small"
                      onClick={() => setShowImageModal(true)}
                    >
                      <ImageIcon size={14} />
                      Insert Image
                    </button>
                  </div>

                  {/* Toolbar */}
                  <div className="admin-toolbar">
                    <button onClick={() => insertMarkdown('bold')} title="Bold">
                      <Bold size={16} />
                    </button>
                    <button onClick={() => insertMarkdown('italic')} title="Italic">
                      <Italic size={16} />
                    </button>
                    <div className="admin-toolbar-divider" />
                    <button onClick={() => insertMarkdown('h2')} title="Heading 2">
                      <Heading2 size={16} />
                    </button>
                    <button onClick={() => insertMarkdown('h3')} title="Heading 3">
                      <Heading3 size={16} />
                    </button>
                    <div className="admin-toolbar-divider" />
                    <button onClick={() => insertMarkdown('ul')} title="Bullet List">
                      <List size={16} />
                    </button>
                    <button onClick={() => insertMarkdown('ol')} title="Numbered List">
                      <ListOrdered size={16} />
                    </button>
                    <div className="admin-toolbar-divider" />
                    <button onClick={() => insertMarkdown('link')} title="Link">
                      <Link size={16} />
                    </button>
                    <button onClick={() => insertMarkdown('quote')} title="Quote">
                      <Quote size={16} />
                    </button>
                    <button onClick={() => setShowImageModal(true)} title="Insert Image">
                      <ImageIcon size={16} />
                    </button>
                  </div>

                  {/* Editor / Preview */}
                  {showPreview ? (
                    visualPreviewMode ? (
                      <div className="admin-visual-preview">
                        <ImagePreview
                          markdown={editedPost.body || ''}
                          onMarkdownChange={(newMarkdown) => updateField('body', newMarkdown)}
                        />
                      </div>
                    ) : (
                      <div className="admin-preview">
                        <ReactMarkdown>{editedPost.body || ''}</ReactMarkdown>
                      </div>
                    )
                  ) : (
                    <textarea
                      ref={textareaRef}
                      className="admin-body-editor"
                      value={editedPost.body || ''}
                      onChange={(e) => updateField('body', e.target.value)}
                      onSelect={(e) => setCursorPosition((e.target as HTMLTextAreaElement).selectionStart)}
                      placeholder="Write your post content in Markdown..."
                      rows={25}
                    />
                  )}
                </section>
              </div>
            )}
          </>
        ) : (
          <div className="admin-empty">
            <FileText size={48} />
            <h2>Select a post to edit</h2>
            <p>Choose a blog post from the sidebar to edit content and add images.</p>
          </div>
        )}
      </main>

      {/* Image Insert Modal */}
      {showImageModal && (
        <div className="admin-modal-overlay" onClick={closeImageModal}>
          <div className="admin-modal admin-modal-image" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Insert Image</h3>
              <button className="admin-modal-close" onClick={closeImageModal}>
                <X size={20} />
              </button>
            </div>
            <div className="admin-modal-body">
              {/* Mode Toggle */}
              <div className="admin-image-mode-toggle">
                <button
                  className={`admin-mode-btn ${imageMode === 'upload' ? 'active' : ''}`}
                  onClick={() => setImageMode('upload')}
                >
                  <Upload size={16} />
                  Upload
                </button>
                <button
                  className={`admin-mode-btn ${imageMode === 'url' ? 'active' : ''}`}
                  onClick={() => setImageMode('url')}
                >
                  <Link size={16} />
                  URL
                </button>
              </div>

              {imageMode === 'upload' ? (
                <>
                  {/* Upload Zone */}
                  <div
                    className={`admin-upload-zone ${dragOver ? 'drag-over' : ''} ${imageUrl ? 'has-image' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
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
                    ) : imageUrl ? (
                      <div className="admin-upload-preview">
                        <img src={imageUrl} alt="Preview" />
                        <div className="admin-upload-overlay">
                          <span>Click to change</span>
                        </div>
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
                  <label>Image URL *</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-xxx?w=800"
                    autoFocus
                  />
                  {imageUrl && (
                    <div className="admin-image-preview-modal">
                      <img src={imageUrl} alt="Preview" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
                    </div>
                  )}
                </div>
              )}

              <div className="admin-field">
                <label>Alt Text (for accessibility)</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Describe the image"
                />
              </div>
              <div className="admin-field">
                <label>Caption (optional)</label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="Caption text below the image"
                />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={closeImageModal}>
                Cancel
              </button>
              <button
                className="admin-btn admin-btn-primary"
                onClick={handleInsertImage}
                disabled={!imageUrl || uploading}
              >
                <Plus size={16} />
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background: #0a0a0f;
          color: #ffffff;
        }

        .admin-sidebar {
          width: 300px;
          background: #141419;
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        .admin-sidebar-header {
          padding: 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .admin-sidebar-header h1 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        .admin-badge {
          font-size: 0.6875rem;
          padding: 0.2rem 0.5rem;
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          border-radius: 4px;
        }

        .admin-post-list {
          flex: 1;
          overflow-y: auto;
          padding: 0.5rem;
        }

        .admin-post-item {
          width: 100%;
          display: flex;
          align-items: flex-start;
          gap: 0.625rem;
          padding: 0.75rem;
          background: transparent;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          text-align: left;
          color: rgba(255, 255, 255, 0.7);
          transition: background 0.15s ease;
          margin-bottom: 2px;
        }

        .admin-post-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .admin-post-item.active {
          background: rgba(59, 130, 246, 0.15);
          color: #ffffff;
        }

        .admin-post-item-content {
          flex: 1;
          min-width: 0;
        }

        .admin-post-item-title {
          display: block;
          font-size: 0.8125rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .admin-post-item-meta {
          display: block;
          font-size: 0.6875rem;
          opacity: 0.6;
          margin-top: 0.125rem;
        }

        .admin-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .admin-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.875rem 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          background: #141419;
          flex-shrink: 0;
        }

        .admin-back {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          cursor: pointer;
          font-size: 0.8125rem;
          padding: 0.375rem 0.5rem;
          border-radius: 4px;
        }

        .admin-back:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.05);
        }

        .admin-actions {
          display: flex;
          gap: 0.5rem;
        }

        .admin-btn {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.4rem 0.75rem;
          border-radius: 5px;
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .admin-btn-primary {
          background: #3b82f6;
          border: none;
          color: white;
        }

        .admin-btn-primary:hover {
          background: #2563eb;
        }

        .admin-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .admin-btn-secondary {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: white;
          text-decoration: none;
        }

        .admin-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.25);
        }

        .admin-btn-ghost {
          background: transparent;
          border: 1px solid transparent;
          color: rgba(255, 255, 255, 0.7);
        }

        .admin-btn-ghost:hover,
        .admin-btn-ghost.active {
          background: rgba(255, 255, 255, 0.05);
          color: white;
        }

        .admin-btn-small {
          padding: 0.3rem 0.625rem;
          font-size: 0.75rem;
          background: rgba(59, 130, 246, 0.15);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #60a5fa;
        }

        .admin-btn-small:hover {
          background: rgba(59, 130, 246, 0.25);
        }

        .admin-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          font-size: 0.8125rem;
        }

        .admin-message-success {
          background: rgba(34, 197, 94, 0.1);
          color: #4ade80;
        }

        .admin-message-error {
          background: rgba(239, 68, 68, 0.1);
          color: #f87171;
        }

        .admin-editor {
          flex: 1;
          overflow-y: auto;
          padding: 1.25rem;
        }

        .admin-section {
          margin-bottom: 1.5rem;
        }

        .admin-section h2 {
          font-size: 0.8125rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
          color: rgba(255, 255, 255, 0.9);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .admin-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
        }

        .admin-section-header h2 {
          margin-bottom: 0;
        }

        .admin-section-body {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .admin-field {
          margin-bottom: 0.875rem;
        }

        .admin-field label {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 0.375rem;
        }

        .admin-field input,
        .admin-field textarea,
        .admin-field select {
          width: 100%;
          padding: 0.5rem 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 5px;
          color: #ffffff;
          font-size: 0.8125rem;
          font-family: inherit;
        }

        .admin-field input:focus,
        .admin-field textarea:focus,
        .admin-field select:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .admin-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .admin-toolbar {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-bottom: none;
          border-radius: 6px 6px 0 0;
        }

        .admin-toolbar button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          background: transparent;
          border: none;
          border-radius: 4px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .admin-toolbar button:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #ffffff;
        }

        .admin-toolbar-divider {
          width: 1px;
          height: 20px;
          background: rgba(255, 255, 255, 0.1);
          margin: 0 0.25rem;
        }

        .admin-body-editor {
          width: 100%;
          min-height: 400px;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0 0 6px 6px;
          color: #ffffff;
          font-size: 0.875rem;
          font-family: 'SF Mono', 'Fira Code', monospace;
          line-height: 1.6;
          resize: vertical;
        }

        .admin-body-editor:focus {
          outline: none;
          border-color: #3b82f6;
        }

        .admin-preview {
          padding: 1.5rem;
          background: #ffffff;
          border-radius: 0 0 6px 6px;
          color: #1a1d24;
          min-height: 400px;
          font-size: 1rem;
          line-height: 1.7;
        }

        .admin-preview h2 {
          font-size: 1.5rem;
          color: #1a1d24;
          margin: 1.5rem 0 0.75rem;
          text-transform: none;
          letter-spacing: normal;
        }

        .admin-preview h3 {
          font-size: 1.25rem;
          margin: 1.25rem 0 0.5rem;
        }

        .admin-preview p {
          margin-bottom: 1rem;
          color: #4a5568;
        }

        .admin-preview img {
          max-width: 100%;
          border-radius: 8px;
          margin: 1rem 0;
        }

        .admin-preview ul, .admin-preview ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }

        .admin-preview li {
          margin-bottom: 0.5rem;
        }

        .admin-image-preview-small {
          margin-top: 0.5rem;
          height: 80px;
          border-radius: 4px;
          overflow: hidden;
        }

        .admin-image-preview-small img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .admin-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: rgba(255, 255, 255, 0.5);
          padding: 2rem;
        }

        .admin-empty h2 {
          margin: 1rem 0 0.5rem;
          font-size: 1.125rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .admin-empty p {
          font-size: 0.875rem;
          max-width: 300px;
        }

        .admin-loading,
        .admin-loading-inline {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.7);
          padding: 3rem;
        }

        .admin-loading {
          min-height: 100vh;
          background: #0a0a0f;
        }

        .admin-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 0.75rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Modal */
        .admin-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .admin-modal {
          background: #1a1d24;
          border-radius: 12px;
          width: 100%;
          max-width: 480px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        }

        .admin-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .admin-modal-header h3 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        .admin-modal-close {
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 4px;
        }

        .admin-modal-close:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.1);
        }

        .admin-modal-body {
          padding: 1.25rem;
        }

        .admin-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .admin-image-preview-modal {
          margin-top: 0.75rem;
          border-radius: 8px;
          overflow: hidden;
          max-height: 200px;
        }

        .admin-image-preview-modal img {
          width: 100%;
          height: auto;
          object-fit: contain;
        }

        /* Image Mode Toggle */
        .admin-image-mode-toggle {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .admin-mode-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.625rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 6px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          font-size: 0.8125rem;
          font-weight: 500;
          transition: all 0.15s ease;
        }

        .admin-mode-btn:hover {
          background: rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.8);
        }

        .admin-mode-btn.active {
          background: rgba(59, 130, 246, 0.15);
          border-color: rgba(59, 130, 246, 0.4);
          color: #60a5fa;
        }

        /* Upload Zone */
        .admin-upload-zone {
          border: 2px dashed rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s ease;
          margin-bottom: 1rem;
          min-height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-upload-zone:hover {
          border-color: rgba(59, 130, 246, 0.4);
          background: rgba(59, 130, 246, 0.05);
        }

        .admin-upload-zone.drag-over {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.1);
        }

        .admin-upload-zone.has-image {
          padding: 0;
          border-style: solid;
          border-color: rgba(255, 255, 255, 0.1);
        }

        .admin-upload-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          color: rgba(255, 255, 255, 0.5);
        }

        .admin-upload-placeholder span {
          font-size: 0.875rem;
        }

        .admin-upload-hint {
          font-size: 0.75rem !important;
          opacity: 0.6;
        }

        .admin-upload-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          color: #60a5fa;
        }

        .admin-spin {
          animation: spin 1s linear infinite;
        }

        .admin-upload-preview {
          position: relative;
          width: 100%;
          height: 200px;
          overflow: hidden;
          border-radius: 6px;
        }

        .admin-upload-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .admin-upload-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.15s ease;
        }

        .admin-upload-overlay span {
          color: white;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .admin-upload-zone:hover .admin-upload-overlay {
          opacity: 1;
        }

        .admin-upload-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 0.875rem;
          background: rgba(239, 68, 68, 0.1);
          border-radius: 6px;
          color: #f87171;
          font-size: 0.8125rem;
          margin-bottom: 1rem;
        }

        .admin-modal-image {
          max-width: 520px;
        }
      `}</style>
    </div>
  );
}
