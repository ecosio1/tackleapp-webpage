/**
 * Locations Index Page
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import Link from 'next/link';

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
  },
  {
    state: 'fl',
    city: 'tampa',
    name: 'Tampa, Florida',
    description: 'Complete guide to fishing in Tampa Bay, from redfish flats to offshore grouper grounds.',
  },
  {
    state: 'fl',
    city: 'miami',
    name: 'Miami, Florida',
    description: 'Discover Miami fishing opportunities, including Biscayne Bay, the Keys, and offshore fishing.',
  },
  {
    state: 'fl',
    city: 'fort-myers',
    name: 'Fort Myers, Florida',
    description: 'Learn about the best fishing in Fort Myers, from Caloosahatchee River to Sanibel Island.',
  },
  {
    state: 'fl',
    city: 'sarasota',
    name: 'Sarasota, Florida',
    description: 'Complete guide to fishing in Sarasota, including inshore snook, redfish, and trout fishing.',
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
    <div className="container mx-auto px-4 py-8">
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
              <article key={`${loc.state}-${loc.city}`} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-semibold mb-2">
                  <Link
                    href={`/locations/${loc.state}/${loc.city}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {loc.name}
                  </Link>
                </h3>
                <p className="text-gray-600 mb-4">{loc.description}</p>
                <Link
                  href={`/locations/${loc.state}/${loc.city}`}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View Location Guide →
                </Link>
              </article>
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


