'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, User } from 'lucide-react';

interface ModernBlogCardProps {
  slug: string;
  title: string;
  description: string;
  category: string;
  date: string;
  readTime?: number;
  author?: string;
  image?: string;
  featured?: boolean;
}

export function ModernBlogCard({
  slug,
  title,
  description,
  category,
  date,
  readTime = 5,
  author = 'Tackle Fishing Team',
  image,
  featured = false,
}: ModernBlogCardProps) {
  // Default fallback image
  const imageUrl = image || 'https://images.unsplash.com/photo-1544552866-d3ed42536cfd?w=1200&h=600&fit=crop';

  const categoryColors: Record<string, string> = {
    'fishing-tips': 'bg-blue-100 text-blue-800',
    'techniques': 'bg-green-100 text-green-800',
    'gear-reviews': 'bg-orange-100 text-orange-800',
    'conditions': 'bg-purple-100 text-purple-800',
    'species': 'bg-teal-100 text-teal-800',
  };

  const categoryColor = categoryColors[category] || 'bg-gray-100 text-gray-800';

  if (featured) {
    return (
      <article className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-xl">
        <Link href={`/blog/${slug}`} className="block">
          <div className="relative h-80 w-full overflow-hidden bg-gray-200">
            <Image
              src={imageUrl}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryColor}`}>
                {category.replace('-', ' ')}
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-3 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <time dateTime={date}>
                  {new Date(date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{readTime} min read</span>
              </div>
            </div>
            <h2 className="mb-3 text-2xl font-bold text-gray-900 line-clamp-2 leading-tight transition-colors group-hover:text-blue-600">
              {title}
            </h2>
            <p className="mb-4 text-gray-600 line-clamp-3 leading-relaxed">{description}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <User className="h-4 w-4" />
                <span>{author}</span>
              </div>
              <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                Read More →
              </span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <Link href={`/blog/${slug}`} className="block">
        <div className="relative h-40 w-full overflow-hidden bg-gray-200">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        </div>
        <div className="flex flex-col flex-grow p-5">
          <div className="mb-2 flex items-center gap-3">
            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${categoryColor}`}>
              {category.replace('-', ' ')}
            </span>
            <time className="text-xs text-gray-500" dateTime={date}>
              {new Date(date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </time>
          </div>
          <h3 className="mb-2 text-lg font-bold text-gray-900 line-clamp-2 leading-tight transition-colors group-hover:text-blue-600">
            {title}
          </h3>
          <p className="mb-4 text-sm text-gray-600 line-clamp-3 leading-relaxed">{description}</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{readTime} min read</span>
            <span className="font-semibold text-blue-600 group-hover:text-blue-700">
              Read →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
