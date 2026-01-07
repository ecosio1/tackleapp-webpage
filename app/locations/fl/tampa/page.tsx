/**
 * Tampa, Florida - Location Fishing Guide
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import { PrimaryCTA } from '@/components/conversion/PrimaryCTA';
import { StickyBottomCTA } from '@/components/conversion/StickyBottomCTA';
import { ContentUpgradeCTA } from '@/components/conversion/ContentUpgradeCTA';
import { RegulationsOutboundLinkBlock } from '@/components/conversion/RegulationsOutboundLinkBlock';
import { AuthorSchema } from '@/components/seo/AuthorSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { FaqSchema } from '@/components/seo/FaqSchema';
import { LastUpdated } from '@/components/content/LastUpdated';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Fishing in Tampa, Florida: Complete Guide to Tampa Bay Fishing',
  description: 'Discover the best fishing spots, species, and techniques in Tampa Bay. Get expert tips for inshore, pier, and offshore fishing in Tampa, Florida.',
  alternates: {
    canonical: generateCanonical('/locations/fl/tampa'),
  },
  openGraph: {
    title: 'Fishing in Tampa, Florida: Complete Guide',
    description: 'Discover the best fishing spots, species, and techniques in Tampa Bay.',
    url: generateCanonical('/locations/fl/tampa'),
    type: 'article',
  },
};

const faqs = [
  {
    question: 'What fish can you catch in Tampa Bay?',
    answer: 'Tampa Bay offers excellent fishing for redfish, snook, speckled trout, tarpon, grouper, snapper, sheepshead, and many other species. The bay system provides diverse habitat supporting both inshore and nearshore species.',
  },
  {
    question: 'What is the best time of year to fish in Tampa?',
    answer: 'Fishing in Tampa is productive year-round. Fall and winter (October through March) are often considered prime seasons for inshore species. Spring brings snook spawning activity, and summer offers excellent tarpon fishing.',
  },
  {
    question: 'Where are the best fishing spots in Tampa Bay?',
    answer: 'Popular spots include Skyway Fishing Pier, various bridges, inshore flats throughout the bay, mangrove shorelines, and nearshore reefs. The bay system offers countless productive locations accessible by boat or shore.',
  },
  {
    question: 'Do you need a fishing license in Tampa, Florida?',
    answer: 'Yes, a Florida fishing license is required for most fishing in Tampa Bay. Some exceptions apply for fishing from piers or for certain age groups. Always check current regulations before fishing.',
  },
  {
    question: 'What is the best time of day to fish in Tampa Bay?',
    answer: 'Early morning and late afternoon to evening are typically most productive. Many anglers prefer fishing during incoming tide, especially for inshore species. However, fishing can be productive throughout the day depending on conditions.',
  },
  {
    question: 'Can you fish from shore in Tampa?',
    answer: 'Yes, Tampa offers excellent shore fishing opportunities. Skyway Fishing Pier is world-famous, and many bridges, parks, and shorelines provide access to good fishing. Inshore areas throughout the bay offer productive shore fishing.',
  },
  {
    question: 'What makes Tampa Bay fishing unique?',
    answer: 'Tampa Bay is one of Florida\'s largest estuaries, providing diverse habitat from shallow flats to deep channels. The bay system supports both inshore and nearshore species, offering year-round fishing opportunities in a protected environment.',
  },
  {
    question: 'Are there fishing charters available in Tampa?',
    answer: 'Yes, Tampa has many experienced fishing charters offering inshore, nearshore, and offshore trips. Charters provide equipment, local knowledge, and access to productive fishing areas throughout Tampa Bay.',
  },
];

export default function TampaLocationPage() {
  return (
    <>
      <AuthorSchema
        author={{
          name: 'Tackle Fishing Team',
          url: '/authors/tackle-fishing-team',
        }}
      />
      <BreadcrumbSchema
        items={[
          { name: 'Home', item: 'https://tackleapp.ai' },
          { name: 'Locations', item: 'https://tackleapp.ai/locations' },
          { name: 'Florida', item: 'https://tackleapp.ai/locations/fl' },
          { name: 'Tampa', item: 'https://tackleapp.ai/locations/fl/tampa' },
        ]}
      />
      <FaqSchema faqs={faqs} />

      <article className="location-page">
        <header className="page-header">
          <h1>Fishing in Tampa, Florida</h1>
          <p className="page-intro">
            Tampa Bay is one of Florida's premier fishing destinations, offering diverse opportunities from world-famous piers to extensive inshore flats. The bay system supports a wide variety of species including redfish, snook, trout, tarpon, and many others. This guide covers the best species, seasons, techniques, and locations for fishing in Tampa Bay.
          </p>
        </header>

        <nav className="table-of-contents">
          <h2>Table of Contents</h2>
          <ul>
            <li><a href="#common-species">Common Species</a></li>
            <li><a href="#seasonal-patterns">Seasonal Patterns</a></li>
            <li><a href="#best-times">Best Times of Day</a></li>
            <li><a href="#fishing-locations">Where to Fish</a></li>
            <li><a href="#techniques">Fishing Techniques</a></li>
            <li><a href="#planning-your-trip">Planning Your Trip</a></li>
          </ul>
        </nav>

        <PrimaryCTA
          title="Fish Tampa Bay Like a Local"
          copy="Get real-time fishing conditions, best spots, and expert advice for Tampa Bay. Download Tackle for iPhone."
          buttonText="default"
          position="above_fold"
          pageType="location"
          slug="fl/tampa"
          location="Tampa"
          className="my-8"
        />

        <section id="common-species">
          <h2>Common Species in Tampa Bay</h2>
          <p>
            Tampa Bay's diverse ecosystem supports numerous fish species, from inshore favorites to nearshore gamefish.
          </p>
          
          <h3>Inshore Species</h3>
          <p>
            Tampa Bay's inshore waters are famous for:
          </p>
          <ul>
            <li><strong>Redfish:</strong> Abundant throughout the bay system. Tampa Bay offers excellent redfish fishing year-round, with fall and winter often being most productive. Redfish are found on shallow flats, grass beds, and around structure.</li>
            <li><strong>Snook:</strong> Popular gamefish found throughout the bay. Snook fishing is excellent, especially during spring spawning migrations. They're commonly found near bridges, mangroves, and structure.</li>
            <li><strong>Speckled Trout:</strong> Common in grass beds and shallow flats throughout the bay. Trout fishing is productive year-round, with peak seasons in fall and spring.</li>
            <li><strong>Tarpon:</strong> Summer months bring tarpon to Tampa Bay. These powerful fish are popular targets, especially in the bay's deeper channels and passes.</li>
            <li><strong>Sheepshead:</strong> Found around bridges, docks, and structure throughout the bay. Sheepshead fishing is productive year-round, especially during cooler months.</li>
          </ul>

          <h3>Nearshore and Offshore Species</h3>
          <p>
            Nearshore and offshore fishing offers:
          </p>
          <ul>
            <li><strong>Grouper:</strong> Red and gag grouper are found on nearshore reefs and structure. Grouper fishing is productive with seasonal regulations.</li>
            <li><strong>Snapper:</strong> Various snapper species including mangrove, yellowtail, and lane snapper are common on reefs and structure.</li>
            <li><strong>Kingfish:</strong> Popular during spring and fall migrations in nearshore waters.</li>
            <li><strong>Spanish Mackerel:</strong> Common in nearshore waters, especially during cooler months.</li>
          </ul>
        </section>

        <section id="seasonal-patterns">
          <h2>Seasonal Patterns</h2>
          <p>
            Tampa Bay fishing varies by season, with each time of year offering different opportunities.
          </p>
          
          <h3>Fall (October - November)</h3>
          <p>
            Fall is often considered prime fishing season:
          </p>
          <ul>
            <li>Cooling water temperatures increase fish activity</li>
            <li>Redfish and snook fishing is excellent</li>
            <li>Comfortable weather conditions</li>
            <li>Many species feed heavily before winter</li>
            <li>Trout fishing peaks during fall months</li>
          </ul>

          <h3>Winter (December - February)</h3>
          <p>
            Winter fishing in Tampa Bay remains productive:
          </p>
          <ul>
            <li>Redfish and snook continue to be active</li>
            <li>Speckled trout fishing can be excellent</li>
            <li>Sheepshead fishing peaks during cooler months</li>
            <li>Nearshore fishing for grouper and snapper remains productive</li>
            <li>Weather is generally comfortable, though occasional cold fronts occur</li>
          </ul>

          <h3>Spring (March - May)</h3>
          <p>
            Spring brings increased activity:
          </p>
          <ul>
            <li>Snook begin spring migrations and spawning activity</li>
            <li>Redfish fishing remains excellent</li>
            <li>Tarpon begin arriving in late spring</li>
            <li>Kingfish appear in nearshore waters</li>
            <li>Overall fishing activity increases as water warms</li>
          </ul>

          <h3>Summer (June - September)</h3>
          <p>
            Summer offers unique opportunities:
          </p>
          <ul>
            <li>Tarpon fishing peaks during summer months</li>
            <li>Early morning and evening fishing is essential to avoid heat</li>
            <li>Night fishing becomes more attractive</li>
            <li>Nearshore fishing for grouper and snapper remains productive</li>
            <li>Inshore fishing requires early starts or evening sessions</li>
          </ul>
        </section>

        <section id="best-times">
          <h2>Best Times of Day</h2>
          <p>
            Timing your Tampa Bay fishing trip can significantly impact your success.
          </p>
          
          <h3>Early Morning</h3>
          <p>
            Early morning (dawn to 10 AM) is often most productive:
          </p>
          <ul>
            <li>Cooler water temperatures make fish more active</li>
            <li>Low light conditions make fish less cautious</li>
            <li>Many species feed actively after night</li>
            <li>Calm conditions are common</li>
            <li>Especially important during summer months</li>
          </ul>

          <h3>Late Afternoon to Evening</h3>
          <p>
            Evening fishing (4 PM to dusk) offers another prime window:
          </p>
          <ul>
            <li>Cooling temperatures increase fish activity</li>
            <li>Decreasing light makes fish less cautious</li>
            <li>Many species move into shallow water to feed</li>
            <li>Comfortable conditions for anglers</li>
            <li>Particularly productive during summer</li>
          </ul>

          <h3>Combining with Tides</h3>
          <p>
            The best fishing often occurs when optimal time of day combines with favorable tides:
          </p>
          <ul>
            <li>Early morning + incoming tide = excellent shallow water fishing</li>
            <li>Evening + outgoing tide = productive channel and structure fishing</li>
            <li>Moving tides during dawn or dusk are often most productive</li>
          </ul>
        </section>

        <section id="fishing-locations">
          <h2>Where to Fish in Tampa Bay</h2>
          <p>
            Tampa Bay offers diverse fishing locations from world-famous piers to extensive inshore areas.
          </p>
          
          <h3>Skyway Fishing Pier</h3>
          <p>
            The Skyway Fishing Pier is world-famous:
          </p>
          <ul>
            <li>One of the longest fishing piers in the world</li>
            <li>No fishing license required when fishing from the pier</li>
            <li>Productive for snook, tarpon, grouper, snapper, and many other species</li>
            <li>Accessible to anglers of all skill levels</li>
            <li>Best fishing during incoming and outgoing tides</li>
          </ul>

          <h3>Inshore Flats and Grass Beds</h3>
          <p>
            Tampa Bay's extensive flats offer:
          </p>
          <ul>
            <li>Shallow flats for sight fishing redfish and snook</li>
            <li>Grass beds holding trout and redfish</li>
            <li>Access by kayak, small boat, or wading</li>
            <li>Best during incoming tide when water covers shallow areas</li>
            <li>Countless productive locations throughout the bay</li>
          </ul>

          <h3>Bridges and Structure</h3>
          <p>
            Tampa Bay's many bridges provide:
          </p>
          <ul>
            <li>Current flow that concentrates fish</li>
            <li>Structure holding snook, sheepshead, and other species</li>
            <li>Productive during outgoing tide</li>
            <li>Accessible from shore or boat</li>
          </ul>

          <h3>Mangrove Shorelines</h3>
          <p>
            Mangrove areas throughout the bay offer:
          </p>
          <ul>
            <li>Excellent snook and redfish habitat</li>
            <li>Productive fishing during incoming tide</li>
            <li>Access by boat or kayak</li>
            <li>Year-round productive fishing</li>
          </ul>

          <h3>Nearshore Reefs</h3>
          <p>
            Nearshore fishing in the Gulf of Mexico provides:
          </p>
          <ul>
            <li>Reefs and structure holding grouper and snapper</li>
            <li>Access by boat (charter or private)</li>
            <li>Productive year-round with seasonal variations</li>
          </ul>
        </section>

        <section id="techniques">
          <h2>Fishing Techniques for Tampa Bay</h2>
          <p>
            Successful Tampa Bay fishing requires adapting techniques to location, species, and conditions.
          </p>
          
          <h3>Inshore Techniques</h3>
          <p>
            For inshore fishing:
          </p>
          <ul>
            <li><strong>Sight Fishing:</strong> Spotting and casting to visible fish on shallow flats</li>
            <li><strong>Live Bait:</strong> Shrimp, pilchards, and pinfish are popular choices</li>
            <li><strong>Soft Plastics:</strong> Effective for redfish, snook, and trout</li>
            <li><strong>Topwater Lures:</strong> Productive during early morning and evening</li>
            <li><strong>Fly Fishing:</strong> Excellent opportunities on shallow flats</li>
          </ul>

          <h3>Pier Fishing</h3>
          <p>
            Skyway Pier techniques:
          </p>
          <ul>
            <li>Bottom fishing with live or cut bait</li>
            <li>Jigging for pelagic species</li>
            <li>Float rigs for various species</li>
            <li>Adjust techniques based on tide and time of day</li>
          </ul>

          <h3>Bridge and Structure Fishing</h3>
          <p>
            For bridges and structure:
          </p>
          <ul>
            <li>Live bait fishing near pilings</li>
            <li>Jigging around structure</li>
            <li>Bottom fishing in current</li>
            <li>Targeting specific species based on structure type</li>
          </ul>
        </section>

        <section id="planning-your-trip">
          <h2>Planning Your Tampa Bay Fishing Trip</h2>
          <p>
            Planning ahead helps ensure a successful fishing trip in Tampa Bay.
          </p>
          
          <h3>Check Conditions</h3>
          <p>
            Before heading out:
          </p>
          <ul>
            <li>Review tide charts for your fishing location</li>
            <li>Check weather forecasts (wind, temperature, storms)</li>
            <li>Consider time of day and seasonal patterns</li>
            <li>Check current fishing reports if available</li>
          </ul>

          <h3>Licenses and Regulations</h3>
          <p>
            Ensure compliance:
          </p>
          <ul>
            <li>Obtain required Florida fishing license</li>
            <li>Check current size limits and bag limits</li>
            <li>Review seasonal closures and special regulations</li>
            <li>Note: No license needed when fishing from Skyway Pier</li>
          </ul>

          <h3>Local Resources</h3>
          <p>
            Tampa offers excellent resources:
          </p>
          <ul>
            <li>Local tackle shops for gear and advice</li>
            <li>Fishing charters for guided experiences</li>
            <li>Boat rentals for independent fishing</li>
            <li>Kayak rentals for backwater exploration</li>
          </ul>
        </section>

        <ContentUpgradeCTA
          location="Tampa"
          pageType="location"
          slug="fl/tampa"
          className="my-12"
        />

        <PrimaryCTA
          title="Get Tampa Bay Fishing Forecasts"
          copy="Download Tackle and get daily fishing conditions, best times, and expert advice specifically for Tampa Bay."
          buttonText="download"
          position="end"
          pageType="location"
          slug="fl/tampa"
          location="Tampa"
          className="my-12"
        />

        <section className="related-content">
          <h2>Related How-To Guides</h2>
          <ul>
            <li><Link href="/how-to/best-fishing-times">Best Fishing Times</Link></li>
            <li><Link href="/how-to/how-tides-affect-fishing">How Tides Affect Fishing</Link></li>
            <li><Link href="/how-to/best-time-of-day-to-fish">Best Time of Day to Fish</Link></li>
            <li><Link href="/how-to/how-weather-affects-fishing">How Weather Affects Fishing</Link></li>
            <li><Link href="/how-to/what-is-a-good-tide-to-fish">What Is a Good Tide to Fish</Link></li>
          </ul>
        </section>

        <section className="related-species">
          <h2>Popular Species in Tampa Bay</h2>
          <ul>
            <li><Link href="/species/redfish">Redfish Fishing Guide</Link></li>
            <li><Link href="/species/snook">Snook Fishing Guide</Link></li>
            <li><Link href="/species/speckled-trout">Speckled Trout Fishing Guide</Link></li>
            <li><Link href="/species/tarpon">Tarpon Fishing Guide</Link></li>
            <li><Link href="/species/largemouth-bass">Largemouth Bass Fishing Guide</Link></li>
          </ul>
        </section>

        <section className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div key={index} className="faq-item">
                <h3 className="faq-question">{faq.question}</h3>
                <p className="faq-answer">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <RegulationsOutboundLinkBlock
          stateCode="FL"
          pageType="location"
          slug="fl/tampa"
          location="Tampa"
          className="my-8"
        />

        <LastUpdated
          date="2024-01-15T00:00:00Z"
          author="Tackle Fishing Team"
        />

        <StickyBottomCTA
          pageType="location"
          slug="fl/tampa"
          location="Tampa"
        />
      </article>
    </>
  );
}

