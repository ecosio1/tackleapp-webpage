/**
 * How-To Guides Index Page
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Fishing How-To Guides | Expert Tips & Techniques',
  description: 'Learn fishing techniques, tips, and strategies from expert guides. Everything you need to know about tides, weather, timing, and more.',
  alternates: {
    canonical: generateCanonical('/how-to'),
  },
};

const howToGuides = [
  {
    slug: 'best-fishing-times',
    title: 'Best Fishing Times',
    description: 'Learn when to fish for maximum success based on weather, tides, moon phases, and time of day.',
    image: 'https://images.unsplash.com/photo-1755870344289-00ac1db1b144?w=600&h=400&fit=crop&auto=format&q=80',
  },
  {
    slug: 'how-tides-affect-fishing',
    title: 'How Tides Affect Fishing',
    description: 'Understand how tidal movement influences fish behavior and learn to time your fishing trips for optimal results.',
    image: 'https://images.unsplash.com/photo-1596433141587-65a1e50fec82?w=600&h=400&fit=crop&auto=format&q=80',
  },
  {
    slug: 'what-is-a-good-tide-to-fish',
    title: 'What Is a Good Tide to Fish?',
    description: 'Discover which tide stages are most productive for different fishing scenarios and species.',
    image: 'https://images.unsplash.com/photo-1620055750222-5cc0be3534b6?w=600&h=400&fit=crop&auto=format&q=80',
  },
  {
    slug: 'best-time-of-day-to-fish',
    title: 'Best Time of Day to Fish',
    description: 'Find out when fish are most active throughout the day and how to plan your fishing schedule.',
    image: 'https://images.unsplash.com/photo-1749468385812-34c53d2d7b74?w=600&h=400&fit=crop&auto=format&q=80',
  },
  {
    slug: 'how-weather-affects-fishing',
    title: 'How Weather Affects Fishing',
    description: 'Learn how weather conditions, barometric pressure, and seasonal patterns impact fish activity.',
    image: 'https://images.unsplash.com/photo-1662568580477-2ed6de5a86d5?w=600&h=400&fit=crop&auto=format&q=80',
  },
];

export default function HowToIndexPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Fishing How-To Guides</h1>
        <p className="text-lg text-gray-600">
          Expert tips, techniques, and strategies to help you catch more fish. Learn from proven methods used by experienced anglers.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {howToGuides.map((guide) => (
          <Link key={guide.slug} href={`/how-to/${guide.slug}`} className="group block overflow-hidden rounded-xl border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all">
            <div className="relative h-48 w-full overflow-hidden bg-gray-200">
              <Image
                src={guide.image}
                alt={guide.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-5">
              <h2 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                {guide.title}
              </h2>
              <p className="text-gray-600 text-sm mb-3">{guide.description}</p>
              <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                Read Guide &rarr;
              </span>
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-12 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Want Personalized Fishing Advice?</h2>
        <p className="mb-4">
          Get real-time fishing conditions, AI-powered fish identification, and expert advice tailored to your location with Tackle.
        </p>
        <Link
          href="/download"
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
        >
          Download Tackle for iPhone
        </Link>
      </section>
    </div>
  );
}


