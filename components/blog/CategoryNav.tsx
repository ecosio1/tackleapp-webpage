'use client';

import Link from 'next/link';
import { Lightbulb, Target, Wrench, Fish, CloudSun, MapPin } from 'lucide-react';

interface CategoryItem {
  slug: string;
  name: string;
  count: number;
}

interface CategoryNavProps {
  categories: CategoryItem[];
  activeCategory?: string;
}

const categoryIcons: Record<string, React.ElementType> = {
  'fishing-tips': Lightbulb,
  'techniques': Target,
  'gear-reviews': Wrench,
  'species': Fish,
  'conditions': CloudSun,
  'locations': MapPin,
};

export function CategoryNav({ categories, activeCategory }: CategoryNavProps) {
  return (
    <nav className="mb-10 overflow-x-auto scrollbar-hide" aria-label="Blog categories">
      <div className="flex gap-2.5 min-w-max pb-2">
        <Link
          href="/blog"
          className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
            !activeCategory
              ? 'bg-[var(--primary-blue)] text-white shadow-lg'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-[var(--primary-blue)] hover:text-[var(--primary-blue)] hover:shadow-md'
          }`}
          style={!activeCategory ? { boxShadow: '0 4px 14px var(--shadow-blue)' } : {}}
        >
          All Posts
        </Link>

        {categories.map((cat) => {
          const Icon = categoryIcons[cat.slug];
          const isActive = activeCategory === cat.slug;

          return (
            <Link
              key={cat.slug}
              href={`/blog/category/${cat.slug}`}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[var(--primary-blue)] text-white shadow-lg'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[var(--primary-blue)] hover:text-[var(--primary-blue)] hover:shadow-md'
              }`}
              style={isActive ? { boxShadow: '0 4px 14px var(--shadow-blue)' } : {}}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {cat.name}
              <span className={`text-xs ${isActive ? 'text-blue-200' : 'text-gray-400'}`}>
                {cat.count}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
