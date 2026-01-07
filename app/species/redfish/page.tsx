/**
 * Redfish Species Page
 */

import { Metadata } from 'next';
import { generateCanonical } from '@/lib/seo/canonical';
import { PrimaryCTA } from '@/components/conversion/PrimaryCTA';
import { StickyBottomCTA } from '@/components/conversion/StickyBottomCTA';
import { AppStorePreviewModule } from '@/components/conversion/AppStorePreviewModule';
import { RegulationsOutboundLinkBlock } from '@/components/conversion/RegulationsOutboundLinkBlock';
import { AuthorSchema } from '@/components/seo/AuthorSchema';
import { BreadcrumbSchema } from '@/components/seo/BreadcrumbSchema';
import { FaqSchema } from '@/components/seo/FaqSchema';
import { LastUpdated } from '@/components/content/LastUpdated';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Redfish Fishing Guide: Habitat, Behavior, and Techniques',
  description: 'Learn everything about redfish fishing including habitat, behavior, best times to catch them, and proven techniques. Expert guide for targeting redfish in Florida waters.',
  alternates: {
    canonical: generateCanonical('/species/redfish'),
  },
  openGraph: {
    title: 'Redfish Fishing Guide: Habitat, Behavior, and Techniques',
    description: 'Learn everything about redfish fishing including habitat, behavior, and proven techniques.',
    url: generateCanonical('/species/redfish'),
    type: 'article',
  },
};

const faqs = [
  {
    question: 'What is the best time of year to catch redfish?',
    answer: 'Redfish fishing is productive year-round in Florida, but fall and winter are often considered prime seasons. Fall brings excellent feeding activity, and winter fishing can be excellent as redfish remain active in cooler water. Spring and summer also offer good opportunities.',
  },
  {
    question: 'Where do redfish live?',
    answer: 'Redfish are found in shallow inshore waters throughout Florida, including grass flats, mangrove shorelines, oyster bars, and backwater areas. They prefer shallow water (2-4 feet) and are often found in areas with grass beds and structure.',
  },
  {
    question: 'What is the best time of day to catch redfish?',
    answer: 'Early morning and late afternoon to evening are typically most productive for redfish. Many anglers find early morning especially productive as redfish feed actively on shallow flats. Low light conditions make redfish less cautious and more willing to move into very shallow water.',
  },
  {
    question: 'What bait works best for redfish?',
    answer: 'Live bait is often most effective for redfish, including shrimp, pinfish, and crabs. Artificial lures like soft plastics, spoons, and topwater lures also work well. The best choice depends on location, conditions, and time of year.',
  },
  {
    question: 'Do redfish bite during incoming or outgoing tide?',
    answer: 'Redfish can be caught during both tides, but many anglers find incoming tide most productive, especially when fishing shallow flats. Incoming tide brings redfish into very shallow water where they feed actively. Outgoing tide can also be productive in channels and deeper areas.',
  },
  {
    question: 'What tackle do I need for redfish fishing?',
    answer: 'Medium spinning or baitcasting gear works well for redfish. Use 10-20 lb braided line with a 15-30 lb fluorocarbon leader. Lighter tackle can be used for sight fishing on shallow flats, while heavier tackle may be needed for larger redfish or fishing around structure.',
  },
  {
    question: 'How do I identify a redfish?',
    answer: 'Redfish are easily identified by their copper-bronze color and distinctive black spot (or spots) near the tail. They have a sloping forehead and are typically found in shallow water. The black spot is the most distinguishing feature, though some redfish may have multiple spots or no visible spot.',
  },
  {
    question: 'Are redfish good to eat?',
    answer: 'Redfish are considered excellent table fare, but regulations vary by location. Always check current regulations for size limits, bag limits, and any seasonal closures. Some areas have slot limits that allow keeping fish within a specific size range.',
  },
];

export default function RedfishSpeciesPage() {
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
          { name: 'Species', item: 'https://tackleapp.ai/species' },
          { name: 'Redfish', item: 'https://tackleapp.ai/species/redfish' },
        ]}
      />
      <FaqSchema faqs={faqs} />

      <article className="species-page">
        <header className="page-header">
          <h1>Redfish Fishing Guide: Habitat, Behavior, and Techniques</h1>
          <p className="page-intro">
            Redfish, also known as red drum, are one of Florida's most popular inshore gamefish. Known for their distinctive black spot near the tail, powerful fights, and excellent table fare, redfish provide exciting fishing opportunities on shallow flats and inshore waters. This guide covers redfish habitat, behavior patterns, best times to catch them, and proven techniques for success.
          </p>
        </header>

        <nav className="table-of-contents">
          <h2>Table of Contents</h2>
          <ul>
            <li><a href="#about-redfish">About Redfish</a></li>
            <li><a href="#habitat-behavior">Habitat & Behavior</a></li>
            <li><a href="#when-they-bite">When They Bite Best</a></li>
            <li><a href="#common-techniques">Common Techniques</a></li>
            <li><a href="#tackle-gear">Tackle & Gear</a></li>
            <li><a href="#best-locations">Best Locations</a></li>
          </ul>
        </nav>

        <PrimaryCTA
          title="Catch More Redfish with Tackle"
          copy="Get real-time conditions, best spots, and expert advice for redfish fishing. Download Tackle for iPhone."
          buttonText="default"
          position="above_fold"
          pageType="species"
          slug="redfish"
          species="redfish"
          className="my-8"
        />

        <section id="about-redfish">
          <h2>About Redfish</h2>
          <p>
            Redfish (Sciaenops ocellatus) are a highly sought-after inshore gamefish found throughout Florida and the Gulf of Mexico. They're easily identified by their copper-bronze color and distinctive black spot (or spots) near the tail. Redfish are known for their powerful fights and are considered excellent table fare.
          </p>
          
          <h3>Physical Characteristics</h3>
          <p>
            Redfish are easily identified by their distinctive appearance:
          </p>
          <ul>
            <li><strong>Color:</strong> Copper-bronze body with a silvery underside</li>
            <li><strong>Black Spot:</strong> One or more black spots near the tail (most distinguishing feature)</li>
            <li><strong>Shape:</strong> Sloping forehead and streamlined body</li>
            <li><strong>Size:</strong> Most redfish caught range from 18 to 30 inches, with fish over 27 inches being quality catches</li>
          </ul>
          <p>
            Redfish can grow quite large, with the Florida state record exceeding 52 pounds. However, most inshore redfish are smaller, with the majority of fish caught being in the 18-30 inch range.
          </p>

          <h3>Why Anglers Love Redfish</h3>
          <p>
            Redfish are popular among anglers for several reasons:
          </p>
          <ul>
            <li><strong>Accessibility:</strong> Found in shallow water accessible to shore anglers, kayakers, and small boats</li>
            <li><strong>Sight Fishing:</strong> Often visible in clear, shallow water, making sight fishing possible</li>
            <li><strong>Powerful Fights:</strong> Strong fighters that make impressive runs when hooked</li>
            <li><strong>Year-Round Fishing:</strong> Can be caught throughout the year in Florida</li>
            <li><strong>Excellent Table Fare:</strong> Considered one of the best-tasting inshore fish</li>
          </ul>
        </section>

        <section id="habitat-behavior">
          <h2>Habitat & Behavior</h2>
          <p>
            Understanding redfish habitat and behavior is key to finding and catching them consistently. Redfish are shallow-water specialists that prefer specific types of habitat.
          </p>
          
          <h3>Preferred Habitat</h3>
          <p>
            Redfish are found in a variety of shallow inshore habitats:
          </p>
          <ul>
            <li><strong>Grass Flats:</strong> Shallow grass flats are prime redfish habitat. Redfish feed along grass edges and in potholes within grass beds</li>
            <li><strong>Mangrove Shorelines:</strong> Redfish frequently cruise along mangrove edges, especially during incoming tide when water covers the roots</li>
            <li><strong>Oyster Bars:</strong> Oyster bars provide structure and food sources, making them excellent redfish habitat</li>
            <li><strong>Backwater Areas:</strong> Shallow backwaters and creeks hold redfish, especially during favorable conditions</li>
            <li><strong>Channels and Cuts:</strong> Redfish move through channels and cuts, especially during tide changes</li>
            <li><strong>Beach Areas:</strong> Redfish can be found along beaches, especially near passes and inlets</li>
          </ul>
          <p>
            Redfish prefer shallow water, typically 2-4 feet deep, though they can be found in water as shallow as 6 inches during high tide. They're often found in areas with grass beds, as grass provides cover and attracts baitfish and crustaceans.
          </p>

          <h3>Behavior Patterns</h3>
          <p>
            Redfish behavior varies by season, tide, and time of day:
          </p>
          <ul>
            <li><strong>Feeding Behavior:</strong> Redfish are bottom feeders that root through grass and mud for crabs, shrimp, and small fish. They often leave visible "muds" or "tailing" when feeding in shallow water</li>
            <li><strong>Tailing Behavior:</strong> In very shallow water, redfish often "tail" with their tails visible above the surface as they feed. This is a prime opportunity for sight fishing</li>
            <li><strong>Tidal Movement:</strong> Redfish move with tides, following rising water into shallow areas during incoming tide and moving to deeper channels during outgoing tide</li>
            <li><strong>Schooling Behavior:</strong> Redfish often school, especially smaller fish. Finding one redfish often means more are nearby</li>
            <li><strong>Temperature Tolerance:</strong> Redfish are more tolerant of temperature changes than some species, allowing for productive fishing throughout the year</li>
          </ul>
        </section>

        <section id="when-they-bite">
          <h2>When They Bite Best</h2>
          <p>
            Timing is crucial for redfish fishing success. Understanding when redfish are most active helps you plan productive fishing trips.
          </p>
          
          <h3>Time of Day</h3>
          <p>
            Redfish feeding activity varies throughout the day:
          </p>
          <ul>
            <li><strong>Early Morning:</strong> Dawn to mid-morning is often most productive. Redfish feed actively on shallow flats during early morning hours, and low light conditions make them less cautious</li>
            <li><strong>Late Afternoon to Evening:</strong> Evening hours can be productive as redfish move into shallow water to feed. The last hour before dark is often excellent</li>
            <li><strong>Midday:</strong> Midday fishing can be productive, especially on overcast days or when fishing deeper areas. However, bright sun can make redfish more cautious in very shallow water</li>
            <li><strong>Night:</strong> Night fishing can be productive for redfish, especially around lighted docks and structure</li>
          </ul>

          <h3>Seasonal Patterns</h3>
          <p>
            Redfish fishing varies by season:
          </p>
          <ul>
            <li><strong>Fall (October - November):</strong> Fall is often considered prime redfish season. Cooling water temperatures increase activity, and redfish feed heavily before winter</li>
            <li><strong>Winter (December - February):</strong> Winter fishing can be excellent for redfish. They remain active in cooler water and often school in deeper holes during cold fronts</li>
            <li><strong>Spring (March - May):</strong> Spring brings increased activity as water warms. Redfish move into shallow areas and feed actively</li>
            <li><strong>Summer (June - September):</strong> Summer offers good redfish fishing, especially early morning and evening. Midday fishing may require focusing on deeper areas or shaded spots</li>
          </ul>

          <h3>Tide Conditions</h3>
          <p>
            Tides significantly affect redfish activity:
          </p>
          <ul>
            <li><strong>Incoming Tide:</strong> Many anglers find incoming tide most productive for redfish. Rising water brings redfish into very shallow areas where they feed actively. The last two hours of incoming tide are often best</li>
            <li><strong>Outgoing Tide:</strong> Outgoing tide can also be productive, especially in channels and deeper areas where redfish concentrate as water recedes</li>
            <li><strong>High Tide:</strong> High tide provides access to the shallowest areas, creating excellent sight fishing opportunities</li>
            <li><strong>Moving Tides:</strong> Generally, moving tides are more productive than slack tide</li>
          </ul>

          <h3>Weather Factors</h3>
          <p>
            Weather conditions affect redfish behavior:
          </p>
          <ul>
            <li><strong>Barometric Pressure:</strong> Falling pressure before storms often triggers active feeding</li>
            <li><strong>Cloud Cover:</strong> Overcast days can extend productive fishing times and make redfish less cautious</li>
            <li><strong>Wind:</strong> Light wind can improve fishing, but strong wind can make sight fishing difficult</li>
            <li><strong>Water Clarity:</strong> Clear water is ideal for sight fishing, though redfish can be caught in various conditions</li>
          </ul>
        </section>

        <section id="common-techniques">
          <h2>Common Techniques</h2>
          <p>
            Successful redfish fishing requires matching techniques to location, conditions, and time of year. Here are proven methods for catching redfish.
          </p>
          
          <h3>Sight Fishing</h3>
          <p>
            Sight fishing for redfish on shallow flats is one of the most exciting and effective methods:
          </p>
          <ul>
            <li>Look for redfish cruising along grass edges or in shallow water</li>
            <li>Watch for "tailing" redfish with tails visible above the surface</li>
            <li>Look for "muds" or cloudy water where redfish are feeding</li>
            <li>Use polarized sunglasses to spot fish</li>
            <li>Make accurate casts ahead of moving fish</li>
            <li>Use lighter tackle and smaller lures for better presentations</li>
          </ul>
          <p>
            Sight fishing requires clear water and calm conditions. Early morning often provides the best visibility and fish activity.
          </p>

          <h3>Live Bait Fishing</h3>
          <p>
            Live bait is highly effective for redfish:
          </p>
          <ul>
            <li><strong>Shrimp:</strong> Live shrimp are excellent redfish bait. Use them on shallow flats, around structure, and in current</li>
            <li><strong>Pinfish:</strong> Pinfish work well when fishing structure and deeper areas</li>
            <li><strong>Crabs:</strong> Small crabs are natural redfish food and work well, especially around oyster bars</li>
            <li><strong>Mullet:</strong> Small mullet can be effective, especially for larger redfish</li>
          </ul>
          <p>
            When using live bait, present it naturally near structure or in areas where redfish are feeding. Allow the bait to move naturally, as redfish often prefer moving targets.
          </p>

          <h3>Artificial Lures</h3>
          <p>
            Artificial lures can be highly effective for redfish:
          </p>
          <ul>
            <li><strong>Soft Plastics:</strong> Soft plastic jigs and swimbaits work well for redfish. Use them on shallow flats, around structure, and when sight fishing. Match colors to available baitfish and conditions</li>
            <li><strong>Spoons:</strong> Gold and silver spoons are classic redfish lures. They work well when retrieved along grass edges and over shallow flats</li>
            <li><strong>Topwater Lures:</strong> Topwater lures can produce exciting strikes, especially during early morning and evening. Walk-the-dog style lures are popular choices</li>
            <li><strong>Jigs:</strong> Jigs work well when fishing structure and deeper areas. They allow you to work different depths effectively</li>
          </ul>
          <p>
            When using artificial lures, vary your retrieve speed and presentation. Redfish often respond well to lures that mimic natural prey movement.
          </p>

          <h3>Bottom Fishing</h3>
          <p>
            Bottom fishing with cut bait or live bait can be effective:
          </p>
          <ul>
            <li>Use cut bait (mullet, pinfish) on bottom rigs</li>
            <li>Target channels, cuts, and deeper areas</li>
            <li>Allow bait to sit on bottom or move slowly with current</li>
            <li>Be patient—redfish may take time to find and take bait</li>
          </ul>
        </section>

        <section id="tackle-gear">
          <h2>Tackle & Gear</h2>
          <p>
            Proper tackle selection is important for redfish fishing success. Redfish are strong fighters that require appropriate gear.
          </p>
          
          <h3>Rods and Reels</h3>
          <p>
            Recommended tackle for redfish:
          </p>
          <ul>
            <li><strong>Spinning Gear:</strong> Medium to medium-heavy spinning rods (7-8 feet) paired with 3000-4000 size reels work well for most redfish fishing</li>
            <li><strong>Baitcasting Gear:</strong> Medium baitcasting rods with appropriate reels are excellent for structure fishing and heavier applications</li>
            <li><strong>Fly Fishing:</strong> 7-9 weight fly rods work well for redfish, especially when sight fishing on shallow flats</li>
          </ul>

          <h3>Line and Leader</h3>
          <p>
            Line selection is important:
          </p>
          <ul>
            <li><strong>Main Line:</strong> 10-20 lb braided line provides strength and sensitivity</li>
            <li><strong>Leader:</strong> 15-30 lb fluorocarbon leader is recommended for most situations</li>
            <li><strong>Leader Length:</strong> 2-4 feet of leader is typically sufficient</li>
          </ul>
          <p>
            Lighter tackle can be used for sight fishing on shallow flats, while heavier tackle may be needed for larger redfish or fishing around structure.
          </p>

          <h3>Terminal Tackle</h3>
          <p>
            Essential terminal tackle:
          </p>
          <ul>
            <li><strong>Hooks:</strong> Circle hooks for live bait (size 1/0 to 3/0), J-hooks for artificial lures</li>
            <li><strong>Weights:</strong> Split shot or small egg sinkers for live bait rigs</li>
            <li><strong>Swivels:</strong> Quality swivels to prevent line twist</li>
          </ul>
        </section>

        <section id="best-locations">
          <h2>Best Locations for Redfish</h2>
          <p>
            Redfish are found throughout Florida's inshore waters, but some areas are particularly productive.
          </p>
          
          <h3>Top Redfish Fishing Areas</h3>
          <p>
            Productive redfish locations include:
          </p>
          <ul>
            <li><strong>Shallow Flats:</strong> Throughout Florida, especially grass flats and mangrove areas</li>
            <li><strong>Mangrove Shorelines:</strong> All along Florida's coast, especially during incoming tide</li>
            <li><strong>Oyster Bars:</strong> Structure that provides food sources and ambush points</li>
            <li><strong>Backwater Areas:</strong> Shallow backwaters and creeks throughout Florida</li>
            <li><strong>Channels and Cuts:</strong> Areas with current flow that concentrate baitfish</li>
            <li><strong>Beach Areas:</strong> Near passes and inlets, especially during favorable conditions</li>
          </ul>

          <h3>Regional Considerations</h3>
          <p>
            Redfish fishing is productive throughout Florida:
          </p>
          <ul>
            <li><strong>South Florida:</strong> Excellent year-round redfish fishing in shallow flats and backwaters</li>
            <li><strong>Central Florida:</strong> Productive redfish fishing in Tampa Bay, Charlotte Harbor, and surrounding areas</li>
            <li><strong>North Florida:</strong> Good redfish fishing, with some seasonal variations</li>
          </ul>
          <p>
            Redfish are one of Florida's most accessible inshore species, found in shallow water throughout the state.
          </p>
        </section>

        <AppStorePreviewModule className="my-12" />

        <PrimaryCTA
          title="Track Your Redfish Catches"
          copy="Log every redfish you catch with GPS location, photos, and conditions. Download Tackle for iPhone."
          buttonText="download"
          position="end"
          pageType="species"
          slug="redfish"
          species="redfish"
          className="my-12"
        />

        <section className="related-content">
          <h2>Related How-To Guides</h2>
          <ul>
            <li><Link href="/how-to/best-fishing-times">Best Fishing Times</Link></li>
            <li><Link href="/how-to/how-tides-affect-fishing">How Tides Affect Fishing</Link></li>
            <li><Link href="/how-to/best-time-of-day-to-fish">Best Time of Day to Fish</Link></li>
          </ul>
        </section>

        <section className="related-locations">
          <h2>Top Redfish Fishing Locations</h2>
          <ul>
            <li><Link href="/locations/fl/naples">Fishing in Naples, Florida</Link></li>
            <li><Link href="/locations/fl/tampa">Fishing in Tampa, Florida</Link></li>
            <li><Link href="/locations/fl/fort-myers">Fishing in Fort Myers, Florida</Link></li>
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
          pageType="species"
          slug="redfish"
          className="my-8"
        />

        <LastUpdated
          date="2024-01-15T00:00:00Z"
          author="Tackle Fishing Team"
        />

        <StickyBottomCTA
          pageType="species"
          slug="redfish"
          species="redfish"
        />
      </article>
    </>
  );
}

