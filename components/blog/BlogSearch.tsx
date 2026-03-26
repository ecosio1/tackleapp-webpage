'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { ModernBlogCard } from './ModernBlogCard';

interface SearchablePost {
  slug: string;
  title: string;
  description: string;
  category: string;
  publishedAt: string;
  readTime?: number;
  author?: string;
  heroImage?: string;
}

interface BlogSearchProps {
  posts: SearchablePost[];
}

export function BlogSearch({ posts }: BlogSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const filteredPosts = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [query, posts]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-500 bg-white border border-gray-200 rounded-full hover:border-[var(--primary-blue)] hover:text-[var(--primary-blue)] hover:shadow-md transition-all"
        aria-label="Search posts"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search</span>
      </button>
    );
  }

  return (
    <div className="mb-8">
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles by title, topic, or category..."
          className="w-full pl-11 pr-11 py-3.5 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 text-sm transition-all"
          style={{
            boxShadow: '0 2px 12px rgba(29,111,184,0.06)',
            outline: 'none',
          }}
          onFocus={(e) => { e.currentTarget.style.boxShadow = '0 0 0 3px rgba(29,111,184,0.12), 0 4px 16px rgba(29,111,184,0.08)'; e.currentTarget.style.borderColor = 'var(--primary-blue)'; }}
          onBlur={(e) => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(29,111,184,0.06)'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
          autoFocus
        />
        <button
          onClick={() => { setQuery(''); setIsOpen(false); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close search"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {filteredPosts && (
        <div className="mt-6">
          <p className="text-sm text-gray-400 mb-4">
            {filteredPosts.length} {filteredPosts.length === 1 ? 'result' : 'results'} for &ldquo;{query}&rdquo;
          </p>
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPosts.map((post) => (
                <ModernBlogCard
                  key={post.slug}
                  slug={post.slug}
                  title={post.title}
                  description={post.description}
                  category={post.category}
                  date={post.publishedAt}
                  readTime={post.readTime}
                  author={post.author}
                  image={post.heroImage}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              No articles found. Try a different search term.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
