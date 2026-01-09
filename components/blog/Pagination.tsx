/**
 * Pagination Component for Blog Index
 */

'use client';

import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

export function Pagination({ currentPage, totalPages, basePath = '/blog' }: PaginationProps) {
  // Build URL for pagination
  // Page 1 = no page param (canonical to /blog)
  // Page 2+ = /blog?page=2
  const buildPageUrl = (page: number) => {
    if (page === 1) {
      return basePath; // Page 1 = canonical URL (no query param)
    }
    return `${basePath}?page=${page}`;
  };

  if (totalPages <= 1) {
    return null; // Don't show pagination if only one page
  }

  // Calculate page range to show
  const maxVisiblePages = 7;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage < maxVisiblePages - 1) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages: (number | 'ellipsis')[] = [];
  
  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) {
      pages.push('ellipsis');
    }
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push('ellipsis');
    }
    pages.push(totalPages);
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Blog pagination">
      {/* Previous Button */}
      {currentPage > 1 ? (
        <Link
          href={buildPageUrl(currentPage - 1)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Previous page"
        >
          ← Previous
        </Link>
      ) : (
        <span className="px-4 py-2 border border-gray-300 rounded-lg text-gray-400 cursor-not-allowed">
          ← Previous
        </span>
      )}

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {pages.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                ...
              </span>
            );
          }

          const isCurrentPage = page === currentPage;
          
          return (
            <Link
              key={page}
              href={buildPageUrl(page)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isCurrentPage
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
              aria-label={`Page ${page}`}
              aria-current={isCurrentPage ? 'page' : undefined}
            >
              {page}
            </Link>
          );
        })}
      </div>

      {/* Next Button */}
      {currentPage < totalPages ? (
        <Link
          href={buildPageUrl(currentPage + 1)}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Next page"
        >
          Next →
        </Link>
      ) : (
        <span className="px-4 py-2 border border-gray-300 rounded-lg text-gray-400 cursor-not-allowed">
          Next →
        </span>
      )}
    </nav>
  );
}
