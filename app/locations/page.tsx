/**
 * Locations Index Page
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Fishing Locations | Best Fishing Spots by City & State',
  description: 'Discover the best fishing locations across the United States. Get location-specific guides, species information, and local fishing tips.',
  alternates: {
    canonical: generateCanonical('/locations'),
  },
};

const locations = [
  {
    state: 'fl',
    city: 'naples',
    name: 'Naples, Florida',
    description: 'Explore the best fishing spots in Naples, including inshore, offshore, and pier fishing opportunities.',
    image: 'https://images.unsplash.com/photo-1664733062150-002f3858f3c8?w=600&h=400&fit=crop&auto=format&q=80',
  },
  {
    state: 'fl',
    city: 'tampa',
    name: 'Tampa, Florida',
    description: 'Complete guide to fishing in Tampa Bay, from redfish flats to offshore grouper grounds.',
    image: 'https://images.unsplash.com/photo-1566067794186-928053eabf51?w=600&h=400&fit=crop&auto=format&q=80',
  },
  {
    state: 'fl',
    city: 'miami',
    name: 'Miami, Florida',
    description: 'Discover Miami fishing opportunities, including Biscayne Bay, the Keys, and offshore fishing.',
    image: 'https://images.unsplash.com/photo-1663086246578-b6878c41b618?w=600&h=400&fit=crop&auto=format&q=80',
  },
  {
    state: 'fl',
    city: 'fort-myers',
    name: 'Fort Myers, Florida',
    description: 'Learn about the best fishing in Fort Myers, from Caloosahatchee River to Sanibel Island.',
    image: 'https://images.unsplash.com/photo-1625504541884-dc03490c56ce?w=600&h=400&fit=crop&auto=format&q=80',
  },
  {
    state: 'fl',
    city: 'sarasota',
    name: 'Sarasota, Florida',
    description: 'Complete guide to fishing in Sarasota, including inshore snook, redfish, and trout fishing.',
    image: 'https://images.unsplash.com/photo-1609697101432-cd892bdac51e?w=600&h=400&fit=crop&auto=format&q=80',
  },
];

export default function LocationsIndexPage() {
  const locationsByState = locations.reduce((acc, loc) => {
    if (!acc[loc.state]) {
      acc[loc.state] = [];
    }
    acc[loc.state].push(loc);
    return acc;
  }, {} as Record<string, typeof locations>);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Fishing Locations</h1>
        <p className="text-lg text-gray-600">
          Discover the best fishing spots across the United States. Get location-specific guides, species information, and local fishing tips.
        </p>
      </header>

      {Object.entries(locationsByState).map(([state, stateLocations]) => (
        <section key={state} className="mb-12">
          <h2 className="text-3xl font-semibold mb-6 capitalize">{state.toUpperCase()}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stateLocations.map((loc) => (
              <Link key={`${loc.state}-${loc.city}`} href={`/locations/${loc.state}/${loc.city}`} className="group block overflow-hidden rounded-xl border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all">
                <div className="relative h-48 w-full overflow-hidden bg-gray-200">
                  <Image
                    src={loc.image}
                    alt={`Fishing in ${loc.name}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                    {loc.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{loc.description}</p>
                  <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                    View Location Guide &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-12 p-6 bg-blue-50 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Get Location-Specific Fishing Forecasts</h2>
        <p className="mb-4">
          Tackle provides real-time fishing conditions, daily fishing scores, and personalized advice for your exact location.
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


