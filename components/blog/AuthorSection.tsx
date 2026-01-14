/**
 * Author Section Component
 * Clean, consistent author bio section for blog posts
 */

import Link from 'next/link';
import Image from 'next/image';

interface AuthorSectionProps {
  author: {
    name: string;
    url?: string;
    image?: string;
    bio?: string;
  };
}

// Default author data for Tackle Team
const defaultAuthorData = {
  image: '/logo.png',
  bio: 'The Tackle Fishing Team is a collective of anglers, data scientists, and fishing enthusiasts dedicated to making fishing more accessible and successful for everyone.',
};

export function AuthorSection({ author }: AuthorSectionProps) {
  const authorUrl = author.url || '/authors/tackle-fishing-team';
  const authorImage = author.image || defaultAuthorData.image;
  const authorBio = author.bio || defaultAuthorData.bio;

  return (
    <section className="author-section my-12 p-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200/60">
      <div className="flex items-start gap-5">
        {/* Author Avatar */}
        <Link
          href={authorUrl}
          className="flex-shrink-0 transition-transform hover:scale-105"
        >
          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white shadow-sm ring-2 ring-white">
            <Image
              src={authorImage}
              alt={author.name}
              fill
              className="object-cover"
            />
          </div>
        </Link>

        {/* Author Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-blue-600 uppercase tracking-wider">
              Written by
            </span>
          </div>

          <Link
            href={authorUrl}
            className="group inline-block"
          >
            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
              {author.name}
            </h3>
          </Link>

          <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-2">
            {authorBio}
          </p>

          <Link
            href={authorUrl}
            className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            View profile
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
