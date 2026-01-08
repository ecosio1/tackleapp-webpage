/**
 * How-To Guides Index Page
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import Link from 'next/link';

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
  },
  {
    slug: 'how-tides-affect-fishing',
    title: 'How Tides Affect Fishing',
    description: 'Understand how tidal movement influences fish behavior and learn to time your fishing trips for optimal results.',
  },
  {
    slug: 'what-is-a-good-tide-to-fish',
    title: 'What Is a Good Tide to Fish?',
    description: 'Discover which tide stages are most productive for different fishing scenarios and species.',
  },
  {
    slug: 'best-time-of-day-to-fish',
    title: 'Best Time of Day to Fish',
    description: 'Find out when fish are most active throughout the day and how to plan your fishing schedule.',
  },
  {
    slug: 'how-weather-affects-fishing',
    title: 'How Weather Affects Fishing',
    description: 'Learn how weather conditions, barometric pressure, and seasonal patterns impact fish activity.',
  },
];

export default function HowToIndexPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Fishing How-To Guides</h1>
        <p className="text-lg text-gray-600">
          Expert tips, techniques, and strategies to help you catch more fish. Learn from proven methods used by experienced anglers.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {howToGuides.map((guide) => (
          <article key={guide.slug} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">
              <Link href={`/how-to/${guide.slug}`} className="text-blue-600 hover:text-blue-800">
                {guide.title}
              </Link>
            </h2>
            <p className="text-gray-600 mb-4">{guide.description}</p>
            <Link
              href={`/how-to/${guide.slug}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Read Guide →
            </Link>
          </article>
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


