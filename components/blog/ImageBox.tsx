'use client';

import Image from 'next/image';
import { ReactNode } from 'react';

interface ImageBoxProps {
  src: string;
  alt: string;
  caption?: string;
  position?: 'left' | 'right' | 'center' | 'full';
  rounded?: boolean;
  shadow?: boolean;
  children?: ReactNode;
}

export function ImageBox({
  src,
  alt,
  caption,
  position = 'center',
  rounded = true,
  shadow = true,
  children,
}: ImageBoxProps) {
  const positionClasses = {
    left: 'float-left mr-6 mb-4 max-w-md',
    right: 'float-right ml-6 mb-4 max-w-md',
    center: 'mx-auto my-8 max-w-2xl',
    full: 'w-full my-8',
  };

  const roundedClass = rounded ? 'rounded-xl' : '';
  const shadowClass = shadow ? 'shadow-lg' : '';

  return (
    <figure className={`${positionClasses[position]} ${roundedClass} ${shadowClass} overflow-hidden`}>
      <div className="relative aspect-video w-full">
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes={position === 'full' ? '100vw' : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-center text-sm italic text-gray-600">
          {caption}
        </figcaption>
      )}
      {children && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          {children}
        </div>
      )}
    </figure>
  );
}

interface ImageGridProps {
  images: Array<{ src: string; alt: string; caption?: string }>;
  columns?: 2 | 3 | 4;
}

export function ImageGrid({ images, columns = 3 }: ImageGridProps) {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-4 my-8`}>
      {images.map((image, index) => (
        <figure key={index} className="overflow-hidden rounded-lg shadow-md">
          <div className="relative aspect-square w-full">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          {image.caption && (
            <figcaption className="p-2 text-center text-xs text-gray-600">
              {image.caption}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  );
}

interface QuoteBoxProps {
  quote: string;
  author?: string;
  image?: string;
}

export function QuoteBox({ quote, author, image }: QuoteBoxProps) {
  return (
    <blockquote className="my-8 rounded-xl bg-gradient-to-r from-blue-50 to-teal-50 p-6 border-l-4 border-blue-500">
      <div className="flex gap-4">
        {image && (
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full">
            <Image src={image} alt={author || 'Quote'} fill className="object-cover" />
          </div>
        )}
        <div className="flex-1">
          <p className="mb-2 text-lg italic text-gray-800">"{quote}"</p>
          {author && (
            <cite className="text-sm font-semibold text-gray-600 not-italic">— {author}</cite>
          )}
        </div>
      </div>
    </blockquote>
  );
}
