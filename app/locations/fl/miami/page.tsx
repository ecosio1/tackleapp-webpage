/**
 * Miami, Florida - Location Fishing Guide
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
  title: 'Fishing in Miami, Florida: Complete Guide to Miami Fishing',
  description: 'Discover the best fishing spots, species, and techniques in Miami. Get expert tips for inshore, pier, and offshore fishing in Miami, Florida.',
  alternates: {
    canonical: generateCanonical('/locations/fl/miami'),
  },
  openGraph: {
    title: 'Fishing in Miami, Florida: Complete Guide',
    description: 'Discover the best fishing spots, species, and techniques in Miami.',
    url: generateCanonical('/locations/fl/miami'),
    type: 'article',
  },
};

const faqs = [
  {
    question: 'What fish can you catch in Miami, Florida?',
    answer: 'Miami offers excellent fishing for snook, tarpon, bonefish, permit, grouper, snapper, sailfish, and many other species. The area provides diverse opportunities from inshore flats to deep offshore waters.',
  },
  {
    question: 'What is the best time of year to fish in Miami?',
    answer: 'Fishing in Miami is productive year-round. Winter and spring (December through May) are often considered prime seasons. Summer offers excellent tarpon fishing, and fall brings increased activity for many species.',
  },
  {
    question: 'Where are the best fishing spots in Miami?',
    answer: 'Popular spots include Government Cut, various bridges, Biscayne Bay flats, Miami Beach jetties, and offshore reefs. The area offers diverse fishing locations accessible by boat, kayak, or shore.',
  },
  {
    question: 'Do you need a fishing license in Miami, Florida?',
    answer: 'Yes, a Florida fishing license is required for most fishing in Miami. Some exceptions apply for fishing from piers or for certain age groups. Always check current regulations before fishing.',
  },
  {
    question: 'What makes Miami fishing unique?',
    answer: 'Miami offers access to both inshore flats fishing (bonefish, permit, tarpon) and deep offshore fishing (sailfish, tuna, mahi-mahi). The proximity to the Gulf Stream provides unique opportunities not available in other Florida locations.',
  },
  {
    question: 'Can you fish from shore in Miami?',
    answer: 'Yes, Miami offers shore fishing opportunities at various beaches, jetties, and bridges. Government Cut and Miami Beach jetties are popular shore fishing locations. Inshore areas in Biscayne Bay also offer productive shore fishing.',
  },
  {
    question: 'What is the best time of day to fish in Miami?',
    answer: 'Early morning and late afternoon to evening are typically most productive. Many anglers prefer fishing during incoming tide, especially for inshore species. However, fishing can be productive throughout the day depending on conditions.',
  },
  {
    question: 'Are there fishing charters available in Miami?',
    answer: 'Yes, Miami has many experienced fishing charters offering inshore, nearshore, and offshore trips. Charters provide equipment, local knowledge, and access to productive fishing areas including flats, reefs, and deep water.',
  },
];

export default function MiamiLocationPage() {
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
          { name: 'Miami', item: 'https://tackleapp.ai/locations/fl/miami' },
        ]}
      />
      <FaqSchema faqs={faqs} />

      <article className="location-page">
        <header className="page-header">
          <h1>Fishing in Miami, Florida</h1>
          <p className="page-intro">
            Miami offers world-class fishing opportunities from legendary inshore flats to deep offshore waters. The area is famous for bonefish, permit, and tarpon on the flats, while offshore anglers target sailfish, tuna, and mahi-mahi. This guide covers the best species, seasons, techniques, and locations for fishing in Miami.
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
          title="Fish Miami Like a Local"
          copy="Get real-time fishing conditions, best spots, and expert advice for Miami, Florida. Download Tackle for iPhone."
          buttonText="default"
          position="above_fold"
          pageType="location"
          slug="fl/miami"
          location="Miami"
          className="my-8"
        />

        <section id="common-species">
          <h2>Common Species in Miami</h2>
          <p>
            Miami's diverse waters support numerous fish species, from world-famous flats species to offshore gamefish.
          </p>
          
          <h3>Inshore and Flats Species</h3>
          <p>
            Miami's flats are famous for:
          </p>
          <ul>
            <li><strong>Bonefish:</strong> World-famous flats species found on shallow flats throughout Biscayne Bay and surrounding areas. Bonefish are highly prized for their speed and fighting ability.</li>
            <li><strong>Permit:</strong> Another legendary flats species found on flats and around structure. Permit are challenging to catch and highly sought after.</li>
            <li><strong>Tarpon:</strong> Abundant during spring and summer months. Miami offers excellent tarpon fishing in channels, passes, and nearshore waters.</li>
            <li><strong>Snook:</strong> Found throughout inshore waters, especially near mangroves, bridges, and structure. Snook fishing is excellent year-round.</li>
            <li><strong>Redfish:</strong> Common in shallow flats and grass beds. Redfish fishing is productive throughout the year.</li>
          </ul>

          <h3>Offshore Species</h3>
          <p>
            Miami's proximity to the Gulf Stream provides:
          </p>
          <ul>
            <li><strong>Sailfish:</strong> Popular during winter months when sailfish migrate along the coast. Miami is famous for sailfish fishing.</li>
            <li><strong>Tuna:</strong> Blackfin and yellowfin tuna are found in offshore waters, especially near the Gulf Stream.</li>
            <li><strong>Mahi-Mahi:</strong> Common in offshore waters, especially around floating debris and structure.</li>
            <li><strong>Grouper:</strong> Red and gag grouper are found on reefs and structure in nearshore and offshore waters.</li>
            <li><strong>Snapper:</strong> Various snapper species including yellowtail, mutton, and red snapper are common on reefs.</li>
          </ul>
        </section>

        <section id="seasonal-patterns">
          <h2>Seasonal Patterns</h2>
          <p>
            Miami fishing varies by season, with each time of year offering different opportunities.
          </p>
          
          <h3>Winter (December - February)</h3>
          <p>
            Winter is prime season for many species:
          </p>
          <ul>
            <li>Sailfish fishing peaks during winter months</li>
            <li>Bonefish and permit fishing remains excellent</li>
            <li>Snook fishing is productive</li>
            <li>Comfortable weather conditions</li>
            <li>Offshore fishing for various species is excellent</li>
          </ul>

          <h3>Spring (March - May)</h3>
          <p>
            Spring brings increased activity:
          </p>
          <ul>
            <li>Tarpon begin arriving in late spring</li>
            <li>Bonefish and permit fishing remains excellent</li>
            <li>Snook spawning activity increases</li>
            <li>Overall fishing activity increases as water warms</li>
            <li>Offshore fishing remains productive</li>
          </ul>

          <h3>Summer (June - September)</h3>
          <p>
            Summer offers unique opportunities:
          </p>
          <ul>
            <li>Tarpon fishing peaks during summer months</li>
            <li>Bonefish and permit fishing remains productive</li>
            <li>Early morning and evening fishing is essential to avoid heat</li>
            <li>Offshore fishing for mahi-mahi and tuna is excellent</li>
            <li>Inshore fishing requires early starts or evening sessions</li>
          </ul>

          <h3>Fall (October - November)</h3>
          <p>
            Fall fishing is productive:
          </p>
          <ul>
            <li>Cooling water temperatures increase fish activity</li>
            <li>Bonefish and permit fishing remains excellent</li>
            <li>Snook fishing is productive</li>
            <li>Comfortable weather conditions</li>
            <li>Offshore fishing remains productive</li>
          </ul>
        </section>

        <section id="best-times">
          <h2>Best Times of Day</h2>
          <p>
            Timing your Miami fishing trip can significantly impact your success.
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
          <p>
            For flats fishing, early morning often provides the best visibility and fish activity.
          </p>

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
            <li>Early morning + incoming tide = excellent flats fishing</li>
            <li>Evening + outgoing tide = productive channel and structure fishing</li>
            <li>Moving tides during dawn or dusk are often most productive</li>
          </ul>
        </section>

        <section id="fishing-locations">
          <h2>Where to Fish in Miami</h2>
          <p>
            Miami offers diverse fishing locations from legendary flats to deep offshore waters.
          </p>
          
          <h3>Biscayne Bay Flats</h3>
          <p>
            Biscayne Bay offers world-famous flats fishing:
          </p>
          <ul>
            <li>Shallow flats for bonefish, permit, and tarpon</li>
            <li>Access by boat or kayak</li>
            <li>Best during incoming tide when water covers shallow areas</li>
            <li>Sight fishing opportunities in clear water</li>
            <li>Year-round productive fishing</li>
          </ul>

          <h3>Government Cut</h3>
          <p>
            Government Cut provides:
          </p>
          <ul>
            <li>Current flow that concentrates fish</li>
            <li>Productive for tarpon, snook, and other species</li>
            <li>Accessible from shore or boat</li>
            <li>Best during moving tides</li>
          </ul>

          <h3>Miami Beach Jetties</h3>
          <p>
            Miami Beach jetties offer:
          </p>
          <ul>
            <li>Shore fishing opportunities</li>
            <li>Structure holding various species</li>
            <li>Productive during incoming and outgoing tides</li>
            <li>Accessible to anglers without boats</li>
          </ul>

          <h3>Bridges and Channels</h3>
          <p>
            Miami's many bridges provide:
          </p>
          <ul>
            <li>Current flow that concentrates fish</li>
            <li>Structure holding snook, tarpon, and other species</li>
            <li>Productive during outgoing tide</li>
            <li>Accessible from shore or boat</li>
          </ul>

          <h3>Offshore Reefs and Gulf Stream</h3>
          <p>
            Offshore fishing provides:
          </p>
          <ul>
            <li>Reefs and structure holding grouper and snapper</li>
            <li>Gulf Stream access for sailfish, tuna, and mahi-mahi</li>
            <li>Access by boat (charter or private)</li>
            <li>Productive year-round with seasonal variations</li>
          </ul>
        </section>

        <section id="techniques">
          <h2>Fishing Techniques for Miami</h2>
          <p>
            Successful Miami fishing requires adapting techniques to location, species, and conditions.
          </p>
          
          <h3>Flats Fishing Techniques</h3>
          <p>
            For flats fishing:
          </p>
          <ul>
            <li><strong>Sight Fishing:</strong> Spotting and casting to visible fish on shallow flats</li>
            <li><strong>Fly Fishing:</strong> Popular for bonefish, permit, and tarpon</li>
            <li><strong>Light Tackle:</strong> Spinning or baitcasting gear with light lines</li>
            <li><strong>Live Bait:</strong> Shrimp, crabs, and small fish for various species</li>
            <li><strong>Artificial Lures:</strong> Effective for many flats species</li>
          </ul>

          <h3>Offshore Techniques</h3>
          <p>
            For offshore fishing:
          </p>
          <ul>
            <li>Trolling for sailfish, tuna, and mahi-mahi</li>
            <li>Bottom fishing on reefs for grouper and snapper</li>
            <li>Live bait fishing for various species</li>
            <li>Heavier tackle required for deep water</li>
          </ul>

          <h3>Shore and Structure Fishing</h3>
          <p>
            For shore and structure fishing:
          </p>
          <ul>
            <li>Live bait fishing near structure</li>
            <li>Jigging around bridges and jetties</li>
            <li>Bottom fishing in current</li>
            <li>Adjust techniques based on tide and time of day</li>
          </ul>
        </section>

        <section id="planning-your-trip">
          <h2>Planning Your Miami Fishing Trip</h2>
          <p>
            Planning ahead helps ensure a successful fishing trip in Miami.
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
            <li>Be aware of any special regulations for specific areas</li>
          </ul>

          <h3>Local Resources</h3>
          <p>
            Miami offers excellent resources:
          </p>
          <ul>
            <li>Local tackle shops for gear and advice</li>
            <li>Fishing charters for guided experiences</li>
            <li>Boat rentals for independent fishing</li>
            <li>Kayak rentals for flats exploration</li>
          </ul>
        </section>

        <ContentUpgradeCTA
          location="Miami"
          pageType="location"
          slug="fl/miami"
          className="my-12"
        />

        <PrimaryCTA
          title="Get Miami Fishing Forecasts"
          copy="Download Tackle and get daily fishing conditions, best times, and expert advice specifically for Miami, Florida."
          buttonText="download"
          position="end"
          pageType="location"
          slug="fl/miami"
          location="Miami"
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
          <h2>Popular Species in Miami</h2>
          <ul>
            <li><Link href="/species/snook">Snook Fishing Guide</Link></li>
            <li><Link href="/species/tarpon">Tarpon Fishing Guide</Link></li>
            <li><Link href="/species/redfish">Redfish Fishing Guide</Link></li>
            <li><Link href="/species/speckled-trout">Speckled Trout Fishing Guide</Link></li>
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
          slug="fl/miami"
          location="Miami"
          className="my-8"
        />

        <LastUpdated
          date="2024-01-15T00:00:00Z"
          author="Tackle Fishing Team"
        />

        <StickyBottomCTA
          pageType="location"
          slug="fl/miami"
          location="Miami"
        />
      </article>
    </>
  );
}

