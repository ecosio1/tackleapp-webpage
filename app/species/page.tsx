/**
 * Species Index Page
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Fish Species Guides | Complete Fishing Species Information',
  description: 'Comprehensive guides for popular fish species. Learn about habitat, behavior, best times to catch, and techniques for each species.',
  alternates: {
    canonical: generateCanonical('/species'),
  },
};

const species = [
  {
    slug: 'snook',
    name: 'Snook',
    description: 'Learn about snook fishing, including habitat, behavior, and the best techniques for catching this popular inshore species.',
  },
  {
    slug: 'redfish',
    name: 'Redfish',
    description: 'Complete guide to redfish (red drum), including where to find them, when they bite best, and proven fishing techniques.',
  },
  {
    slug: 'speckled-trout',
    name: 'Speckled Trout',
    description: 'Everything you need to know about catching speckled sea trout, from tackle selection to seasonal patterns.',
  },
  {
    slug: 'largemouth-bass',
    name: 'Largemouth Bass',
    description: 'Master largemouth bass fishing with expert tips on habitat, behavior, lures, and seasonal strategies.',
  },
  {
    slug: 'tarpon',
    name: 'Tarpon',
    description: 'The ultimate guide to tarpon fishing, including migration patterns, tackle requirements, and fighting techniques.',
  },
];

export default function SpeciesIndexPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Fish Species Guides</h1>
        <p className="text-lg text-gray-600">
          Comprehensive guides for popular fish species. Learn about habitat, behavior, best times to catch, and proven techniques.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {species.map((fish) => (
          <article key={fish.slug} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-semibold mb-2">
              <Link href={`/species/${fish.slug}`} className="text-blue-600 hover:text-blue-800">
                {fish.name}
              </Link>
            </h2>
            <p className="text-gray-600 mb-4">{fish.description}</p>
            <Link
              href={`/species/${fish.slug}`}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View Guide →
            </Link>
          </article>
        ))}
      </div>

      <section className="mt-12 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Identify Fish Instantly with Tackle</h2>
        <p className="mb-4">
          Use Tackle's AI fish identification to instantly identify any fish you catch. Get species information, regulations, and tips right in the app.
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


