/**
 * Species Index Page
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import Link from 'next/link';
import Image from 'next/image';

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
    image: 'https://images.unsplash.com/photo-1560997494-75629423e3f6?w=600&h=400&fit=crop&auto=format&q=80',
  },
  {
    slug: 'redfish',
    name: 'Redfish',
    description: 'Complete guide to redfish (red drum), including where to find them, when they bite best, and proven fishing techniques.',
    image: 'https://images.unsplash.com/photo-1562819102-a085309d64ce?w=600&h=400&fit=crop&auto=format&q=80',
  },
  {
    slug: 'speckled-trout',
    name: 'Speckled Trout',
    description: 'Everything you need to know about catching speckled sea trout, from tackle selection to seasonal patterns.',
    image: 'https://images.unsplash.com/photo-1762625075186-b7f46767267a?w=600&h=400&fit=crop&auto=format&q=80',
  },
  {
    slug: 'largemouth-bass',
    name: 'Largemouth Bass',
    description: 'Master largemouth bass fishing with expert tips on habitat, behavior, lures, and seasonal strategies.',
    image: 'https://images.unsplash.com/photo-1762655210992-e2dd74cf3118?w=600&h=400&fit=crop&auto=format&q=80',
  },
  {
    slug: 'tarpon',
    name: 'Tarpon',
    description: 'The ultimate guide to tarpon fishing, including migration patterns, tackle requirements, and fighting techniques.',
    image: 'https://images.unsplash.com/photo-1766998112384-b8cecd7a45c7?w=600&h=400&fit=crop&auto=format&q=80',
  },
];

export default function SpeciesIndexPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Fish Species Guides</h1>
        <p className="text-lg text-gray-600">
          Comprehensive guides for popular fish species. Learn about habitat, behavior, best times to catch, and proven techniques.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {species.map((fish) => (
          <Link key={fish.slug} href={`/species/${fish.slug}`} className="group block overflow-hidden rounded-xl border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all">
            <div className="relative h-48 w-full overflow-hidden bg-gray-200">
              <Image
                src={fish.image}
                alt={`${fish.name} fishing guide`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-5">
              <h2 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                {fish.name}
              </h2>
              <p className="text-gray-600 text-sm mb-3">{fish.description}</p>
              <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                View Guide &rarr;
              </span>
            </div>
          </Link>
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


