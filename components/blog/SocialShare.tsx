'use client';

import { Twitter, Facebook, Linkedin, Link as LinkIcon } from 'lucide-react';
import { useState } from 'react';

interface SocialShareProps {
  title: string;
  url: string;
}

export function SocialShare({ title, url }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="social-share">
      <span className="social-share-label">Share:</span>

      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className="social-share-button"
        aria-label="Share on Twitter"
      >
        <Twitter />
      </a>

      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className="social-share-button"
        aria-label="Share on Facebook"
      >
        <Facebook />
      </a>

      <a
        href={shareLinks.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        className="social-share-button"
        aria-label="Share on LinkedIn"
      >
        <Linkedin />
      </a>

      <button
        onClick={copyToClipboard}
        className="social-share-button"
        aria-label="Copy link"
        title={copied ? 'Copied!' : 'Copy link'}
      >
        <LinkIcon />
      </button>

      {copied && (
        <span style={{ fontSize: '0.875rem', color: 'var(--primary-blue)', fontWeight: '500' }}>
          Copied!
        </span>
      )}
    </div>
  );
}
