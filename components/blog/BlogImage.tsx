'use client';

import Image from 'next/image';

interface BlogImageProps {
  src: string;
  alt: string;
  caption?: string;
  priority?: boolean;
  className?: string;
}

export function BlogImage({ src, alt, caption, priority = false, className = '' }: BlogImageProps) {
  return (
    <figure className={`my-8 ${className}`}>
      <div className="relative w-full overflow-hidden rounded-xl shadow-lg">
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={675}
          priority={priority}
          className="w-full h-auto object-cover"
          style={{ maxHeight: '600px' }}
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-sm text-center text-gray-600 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
