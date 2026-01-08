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
          {image && (
            <div className="relative h-64 w-full overflow-hidden">
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${categoryColor}`}>
                  {category.replace('-', ' ')}
                </span>
              </div>
            </div>
          )}
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
            <h2 className="mb-3 text-2xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
              {title}
            </h2>
            <p className="mb-4 text-gray-600 line-clamp-2">{description}</p>
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
    <article className="group overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-lg">
      <Link href={`/blog/${slug}`} className="block">
        {image && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
        <div className="p-5">
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
          <h3 className="mb-2 text-xl font-bold text-gray-900 transition-colors group-hover:text-blue-600">
            {title}
          </h3>
          <p className="mb-3 text-sm text-gray-600 line-clamp-2">{description}</p>
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
