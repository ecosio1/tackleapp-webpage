'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, User } from 'lucide-react';

interface ModernBlogCardProps {
  slug: string;
  title: string;
  description: string;
  category?: string;
  date: string;
  readTime?: number;
  author?: string;
  image?: string;
  featured?: boolean;
}

const categoryStyles: Record<string, { bg: string; text: string; border: string }> = {
  'fishing-tips': { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' },
  'techniques': { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  'gear-reviews': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  'conditions': { bg: 'bg-violet-50', text: 'text-violet-800', border: 'border-violet-200' },
  'species': { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
};

export function ModernBlogCard({
  slug,
  title,
  description,
  category = 'fishing-tips',
  date,
  readTime = 5,
  author = 'Tackle Fishing Team',
  image,
  featured = false,
}: ModernBlogCardProps) {
  const imageUrl = image || 'https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=1200&h=600&fit=crop&auto=format&q=80';
  const cat = categoryStyles[category] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };

  if (featured) {
    return (
      <article className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 transition-all duration-300 hover:border-transparent"
        style={{ boxShadow: '0 4px 24px rgba(29,111,184,0.08)' }}
      >
        <Link href={`/blog/${slug}`} className="block md:grid md:grid-cols-2">
          <div className="relative h-72 md:h-full min-h-[320px] w-full overflow-hidden bg-gray-100">
            <Image
              src={imageUrl}
              alt={title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/10" />
          </div>
          <div className="p-8 flex flex-col justify-center">
            <div className="mb-4">
              <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold border ${cat.bg} ${cat.text} ${cat.border}`}>
                {category.replaceAll('-', ' ')}
              </span>
            </div>
            <h2 className="mb-3 text-2xl md:text-3xl font-bold text-gray-900 line-clamp-3 leading-tight transition-colors group-hover:text-[var(--primary-blue)]"
                style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              {title}
            </h2>
            <p className="mb-5 text-gray-500 line-clamp-3 leading-relaxed">{description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <time dateTime={date}>
                  {new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{readTime} min read</span>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <User className="h-4 w-4" />
                <span>{author}</span>
              </div>
              <span className="text-sm font-semibold text-[var(--accent-warm)] group-hover:translate-x-1 transition-transform">
                Read Article &rarr;
              </span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article
      className="group flex flex-col overflow-hidden rounded-xl bg-white border border-gray-100 transition-all duration-300 hover:-translate-y-1.5 hover:border-transparent"
      style={{ boxShadow: '0 2px 12px rgba(29,111,184,0.06)' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 32px rgba(29,111,184,0.12)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(29,111,184,0.06)'; }}
    >
      <Link href={`/blog/${slug}`} className="block">
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <div className="flex flex-col flex-grow p-5">
          <div className="mb-3 flex items-center gap-3">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold border ${cat.bg} ${cat.text} ${cat.border}`}>
              {category.replaceAll('-', ' ')}
            </span>
            <time className="text-xs text-gray-400" dateTime={date}>
              {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </time>
          </div>
          <h3 className="mb-2 text-base font-bold text-gray-900 line-clamp-2 leading-snug transition-colors group-hover:text-[var(--primary-blue)]">
            {title}
          </h3>
          <p className="mb-4 text-sm text-gray-500 line-clamp-2 leading-relaxed">{description}</p>
          <div className="mt-auto flex items-center justify-between text-xs text-gray-400">
            <span>{readTime} min read</span>
            <span className="font-semibold text-[var(--accent-warm)] group-hover:translate-x-0.5 transition-transform">
              Read &rarr;
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
