'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  minHeadings?: number; // Only show TOC if there are at least this many headings
}

export function TableOfContents({ content, minHeadings = 3 }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Extract headings from markdown content
    const headingRegex = /^(#{2,3})\s+(.+)$/gm;
    const matches = Array.from(content.matchAll(headingRegex));

    const extractedHeadings = matches.map((match) => {
      const level = match[1].length; // Number of # symbols
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');

      return { id, text, level };
    });

    // Only set headings if we have enough
    if (extractedHeadings.length >= minHeadings) {
      setHeadings(extractedHeadings);
    }
  }, [content, minHeadings]);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-80px 0px -80% 0px',
      }
    );

    // Observe all heading elements
    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  // Don't render if not enough headings
  if (headings.length < minHeadings) {
    return null;
  }

  return (
    <nav className="toc-container">
      <div className="toc-header">
        <h4>Table of Contents</h4>
      </div>
      <ul className="toc-list">
        {headings.map(({ id, text, level }) => (
          <li
            key={id}
            className={`toc-item toc-level-${level} ${activeId === id ? 'toc-active' : ''}`}
          >
            <a href={`#${id}`} className="toc-link">
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
