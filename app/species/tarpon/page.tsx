/**
 * Tarpon Species Page
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
  title: 'Tarpon Fishing Guide: Habitat, Behavior, and Techniques',
  description: 'Learn everything about tarpon fishing including habitat, behavior, best times to catch them, and proven techniques. Expert guide for targeting tarpon in Florida waters.',
  alternates: {
    canonical: generateCanonical('/species/tarpon'),
  },
  openGraph: {
    title: 'Tarpon Fishing Guide: Habitat, Behavior, and Techniques',
    description: 'Learn everything about tarpon fishing including habitat, behavior, and proven techniques.',
    url: generateCanonical('/species/tarpon'),
    type: 'article',
  },
};

const faqs = [
  {
    question: 'What is the best time of year to catch tarpon?',
    answer: 'Tarpon fishing is most productive during spring and summer months (April through August) in Florida. This is when tarpon migrate along the coast and are most accessible to anglers. However, tarpon can be caught year-round in some areas, especially in South Florida.',
  },
  {
    question: 'Where do tarpon live?',
    answer: 'Tarpon are found in inshore and nearshore waters throughout Florida, including passes, channels, bridges, beaches, and nearshore waters. They prefer areas with current flow and are often found near structure including bridges, jetties, and passes.',
  },
  {
    question: 'What is the best time of day to catch tarpon?',
    answer: 'Early morning and late afternoon to evening are typically most productive for tarpon. Many anglers also find success at night, especially around lighted docks and bridges. Tarpon are often more active during low light conditions.',
  },
  {
    question: 'What bait works best for tarpon?',
    answer: 'Live bait is often most effective for tarpon, including crabs, mullet, pinfish, and threadfin herring. Artificial lures like soft plastics and jigs also work well. The best choice depends on location, conditions, and time of year.',
  },
  {
    question: 'Do tarpon bite during incoming or outgoing tide?',
    answer: 'Tarpon can be caught during both tides, but many anglers find moving tides most productive. Incoming and outgoing tides create current flow that tarpon use for feeding. The best fishing often occurs when tide movement is strongest.',
  },
  {
    question: 'What tackle do I need for tarpon fishing?',
    answer: 'Heavy tackle is recommended for tarpon due to their size and power. Use 30-50 lb braided line with a 60-100 lb fluorocarbon or monofilament leader. Heavy spinning or conventional reels with strong drag systems are essential.',
  },
  {
    question: 'How do I identify a tarpon?',
    answer: 'Tarpon are easily identified by their large size, silvery body, large scales, and distinctive appearance. They have a large mouth and are known for their acrobatic jumps when hooked. Tarpon can grow to over 200 pounds.',
  },
  {
    question: 'Are tarpon good to eat?',
    answer: 'Tarpon are typically catch and release only in Florida. They are not considered good table fare and are protected in many areas. Always check current regulations, as tarpon fishing is heavily regulated with specific seasons and restrictions.',
  },
];

export default function TarponSpeciesPage() {
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
          { name: 'Tarpon', item: 'https://tackleapp.ai/species/tarpon' },
        ]}
      />
      <FaqSchema faqs={faqs} />

      <article className="species-page">
        <header className="page-header">
          <h1>Tarpon Fishing Guide: Habitat, Behavior, and Techniques</h1>
          <p className="page-intro">
            Tarpon are one of Florida's most iconic and challenging gamefish. Known for their massive size, acrobatic jumps, and powerful fights, tarpon provide some of the most exciting fishing opportunities in Florida. This guide covers tarpon habitat, behavior patterns, best times to catch them, and proven techniques for success.
          </p>
        </header>

        <nav className="table-of-contents">
          <h2>Table of Contents</h2>
          <ul>
            <li><a href="#about-tarpon">About Tarpon</a></li>
            <li><a href="#habitat-behavior">Habitat & Behavior</a></li>
            <li><a href="#when-they-bite">When They Bite Best</a></li>
            <li><a href="#common-techniques">Common Techniques</a></li>
            <li><a href="#tackle-gear">Tackle & Gear</a></li>
            <li><a href="#best-locations">Best Locations</a></li>
          </ul>
        </nav>

        <PrimaryCTA
          title="Catch More Tarpon with Tackle"
          copy="Get real-time conditions, best spots, and expert advice for tarpon fishing. Download Tackle for iPhone."
          buttonText="default"
          position="above_fold"
          pageType="species"
          slug="tarpon"
          species="tarpon"
          className="my-8"
        />

        <section id="about-tarpon">
          <h2>About Tarpon</h2>
          <p>
            Tarpon (Megalops atlanticus) are one of Florida's most iconic gamefish. Known as the "Silver King," tarpon are famous for their massive size, acrobatic jumps, and powerful fights. They can grow to over 200 pounds and provide some of the most challenging and exciting fishing opportunities in Florida.
          </p>
          
          <h3>Physical Characteristics</h3>
          <p>
            Tarpon are easily identified by their distinctive appearance:
          </p>
          <ul>
            <li><strong>Size:</strong> Can grow to over 200 pounds, though most tarpon caught range from 40 to 100 pounds</li>
            <li><strong>Color:</strong> Silvery body with large, distinctive scales</li>
            <li><strong>Shape:</strong> Streamlined body built for speed and power</li>
            <li><strong>Mouth:</strong> Large mouth with a protruding lower jaw</li>
            <li><strong>Jumps:</strong> Known for spectacular acrobatic jumps when hooked</li>
          </ul>
          <p>
            Tarpon are one of the largest inshore gamefish, with the Florida state record exceeding 240 pounds. However, most tarpon caught by anglers range from 40 to 100 pounds, with fish over 100 pounds being considered trophy catches.
          </p>

          <h3>Why Anglers Love Tarpon</h3>
          <p>
            Tarpon are popular among anglers for several reasons:
          </p>
          <ul>
            <li><strong>Size and Power:</strong> Massive fish that provide incredible fights</li>
            <li><strong>Acrobatic Jumps:</strong> Spectacular jumps and aerial displays when hooked</li>
            <li><strong>Challenge:</strong> Difficult to catch, requiring skill and patience</li>
            <li><strong>Seasonal Migrations:</strong> Predictable migrations create excellent fishing opportunities</li>
            <li><strong>Accessibility:</strong> Found in inshore and nearshore waters accessible to anglers</li>
          </ul>
        </section>

        <section id="habitat-behavior">
          <h2>Habitat & Behavior</h2>
          <p>
            Understanding tarpon habitat and behavior is key to finding and catching them. Tarpon are migratory fish that follow predictable patterns throughout the year.
          </p>
          
          <h3>Preferred Habitat</h3>
          <p>
            Tarpon are found in a variety of inshore and nearshore habitats:
          </p>
          <ul>
            <li><strong>Passes and Inlets:</strong> Tarpon frequently move through passes and inlets, especially during migrations. These areas provide current flow that tarpon use for feeding</li>
            <li><strong>Bridges:</strong> Bridges provide structure and current flow that attract tarpon. Many anglers target tarpon around bridges, especially at night</li>
            <li><strong>Channels:</strong> Deep channels hold tarpon, especially during migrations. Current flow in channels concentrates baitfish</li>
            <li><strong>Beaches:</strong> Tarpon can be found along beaches, especially near passes and inlets</li>
            <li><strong>Nearshore Waters:</strong> Tarpon are found in nearshore waters, especially during migrations along the coast</li>
            <li><strong>Backwater Areas:</strong> Tarpon move into backwaters and creeks, especially during favorable conditions</li>
          </ul>
          <p>
            Tarpon prefer areas with current flow, as moving water brings baitfish and creates feeding opportunities. They're often found near structure that creates current breaks or holds baitfish.
          </p>

          <h3>Behavior Patterns</h3>
          <p>
            Tarpon behavior varies by season, migration patterns, and time of day:
          </p>
          <ul>
            <li><strong>Migratory Behavior:</strong> Tarpon follow predictable migration patterns along Florida's coast. Spring and summer migrations bring large numbers of tarpon to specific areas</li>
            <li><strong>Feeding Behavior:</strong> Tarpon are opportunistic feeders that often feed on schools of baitfish. They may roll on the surface or feed actively in current</li>
            <li><strong>Rolling Behavior:</strong> Tarpon often "roll" on the surface, making them visible to anglers. This behavior helps locate tarpon</li>
            <li><strong>Nocturnal Activity:</strong> Tarpon are often more active at night, especially around lighted docks and bridges</li>
            <li><strong>Temperature Sensitivity:</strong> Tarpon prefer warmer water and are most active when water temperatures are favorable (typically 70-85°F)</li>
          </ul>
        </section>

        <section id="when-they-bite">
          <h2>When They Bite Best</h2>
          <p>
            Timing is crucial for tarpon fishing success. Understanding when tarpon are most active and accessible helps you plan productive fishing trips.
          </p>
          
          <h3>Time of Day</h3>
          <p>
            Tarpon feeding activity varies throughout the day:
          </p>
          <ul>
            <li><strong>Early Morning:</strong> Dawn to mid-morning can be productive as tarpon feed actively. Low light conditions may make them less cautious</li>
            <li><strong>Late Afternoon to Evening:</strong> Evening hours can be productive as tarpon move into feeding areas. The last hour before dark is often excellent</li>
            <li><strong>Night:</strong> Night fishing can be excellent for tarpon, especially around lighted docks and bridges. Many anglers find their best tarpon fishing occurs at night</li>
            <li><strong>Midday:</strong> Midday fishing can be productive, especially when tarpon are rolling or feeding actively</li>
          </ul>

          <h3>Seasonal Patterns</h3>
          <p>
            Tarpon fishing is highly seasonal:
          </p>
          <ul>
            <li><strong>Spring (March - May):</strong> Spring brings tarpon migrations along Florida's coast. This is often the start of prime tarpon season as fish move north</li>
            <li><strong>Summer (June - August):</strong> Summer is peak tarpon season in many areas. Large numbers of tarpon are accessible, and fishing can be excellent</li>
            <li><strong>Fall (September - November):</strong> Fall can still offer good tarpon fishing, especially in South Florida. Some tarpon remain in areas year-round</li>
            <li><strong>Winter (December - February):</strong> Winter tarpon fishing is more limited, though some areas in South Florida offer year-round opportunities</li>
          </ul>
          <p>
            Tarpon migrations follow predictable patterns, with fish moving along the coast during spring and summer. Understanding these patterns helps you plan trips when tarpon are most accessible.
          </p>

          <h3>Tide Conditions</h3>
          <p>
            Tides significantly affect tarpon activity:
          </p>
          <ul>
            <li><strong>Moving Tides:</strong> Generally, moving tides (incoming or outgoing) are more productive than slack tide. Tarpon feed actively when water is moving</li>
            <li><strong>Incoming Tide:</strong> Incoming tide can bring tarpon into passes and channels where they feed actively</li>
            <li><strong>Outgoing Tide:</strong> Outgoing tide can concentrate tarpon in passes and channels as current flow increases</li>
            <li><strong>Spring Tides:</strong> Stronger tides during new and full moon periods often produce better tarpon fishing</li>
          </ul>

          <h3>Weather Factors</h3>
          <p>
            Weather conditions affect tarpon behavior:
          </p>
          <ul>
            <li><strong>Barometric Pressure:</strong> Falling pressure before storms may affect tarpon behavior, though they can be caught in various conditions</li>
            <li><strong>Wind:</strong> Light to moderate wind can improve fishing, but strong wind can make conditions difficult</li>
            <li><strong>Temperature:</strong> Tarpon prefer warmer water and are most active when water temperatures are favorable</li>
            <li><strong>Water Clarity:</strong> Tarpon can be caught in various water clarity conditions</li>
          </ul>
        </section>

        <section id="common-techniques">
          <h2>Common Techniques</h2>
          <p>
            Successful tarpon fishing requires matching techniques to location, conditions, and time of year. Here are proven methods for catching tarpon.
          </p>
          
          <h3>Live Bait Fishing</h3>
          <p>
            Live bait is often the most effective method for tarpon:
          </p>
          <ul>
            <li><strong>Crabs:</strong> Blue crabs and pass crabs are excellent tarpon bait. Use them around bridges, passes, and channels where tarpon feed</li>
            <li><strong>Mullet:</strong> Large mullet work well for targeting bigger tarpon. Use them in passes, channels, and areas with current</li>
            <li><strong>Pinfish:</strong> Pinfish work well when fishing structure and areas where tarpon are feeding</li>
            <li><strong>Threadfin Herring:</strong> Threadfin herring are natural tarpon food and work well, especially during migrations</li>
          </ul>
          <p>
            When using live bait, present it naturally in current or near structure where tarpon are feeding. Allow the bait to move naturally, as tarpon often prefer moving targets.
          </p>

          <h3>Artificial Lures</h3>
          <p>
            Artificial lures can be effective for tarpon:
          </p>
          <ul>
            <li><strong>Soft Plastics:</strong> Large soft plastic jigs and swimbaits work well for tarpon. Use them in passes, channels, and when tarpon are feeding actively</li>
            <li><strong>Jigs:</strong> Heavy jigs work well when fishing structure and deeper areas. They allow you to work different depths effectively</li>
            <li><strong>Topwater Lures:</strong> Large topwater lures can produce exciting strikes, especially during early morning and evening</li>
          </ul>
          <p>
            When using artificial lures, match the size to available baitfish and present lures naturally in current or near feeding tarpon.
          </p>

          <h3>Fly Fishing</h3>
          <p>
            Fly fishing for tarpon is highly challenging and rewarding:
          </p>
          <ul>
            <li>Use heavy fly rods (11-13 weight) with strong reels</li>
            <li>Large flies that mimic baitfish or crabs</li>
            <li>Present flies to rolling or feeding tarpon</li>
            <li>Requires skill and patience</li>
            <li>Considered one of the ultimate fly fishing challenges</li>
          </ul>

          <h3>Structure Fishing</h3>
          <p>
            Fishing structure is a reliable method for tarpon:
          </p>
          <ul>
            <li>Target bridges, jetties, and passes</li>
            <li>Cast near structure and work lures in current</li>
            <li>Use current to your advantage</li>
            <li>Focus on areas where tarpon are rolling or feeding</li>
            <li>Be patient—tarpon may take time to commit to a strike</li>
          </ul>
        </section>

        <section id="tackle-gear">
          <h2>Tackle & Gear</h2>
          <p>
            Proper tackle selection is essential for tarpon fishing success. Tarpon are massive, powerful fish that require heavy, quality tackle.
          </p>
          
          <h3>Rods and Reels</h3>
          <p>
            Recommended tackle for tarpon:
          </p>
          <ul>
            <li><strong>Spinning Gear:</strong> Heavy spinning rods (7-8 feet) paired with large spinning reels (6000-8000 size) with strong drag systems</li>
            <li><strong>Conventional Gear:</strong> Heavy conventional rods with large reels and strong drag systems are excellent for tarpon</li>
            <li><strong>Fly Fishing:</strong> 11-13 weight fly rods with large arbor reels and strong drag systems</li>
          </ul>
          <p>
            Quality tackle is essential for tarpon, as they are powerful fish that can easily break inferior equipment.
          </p>

          <h3>Line and Leader</h3>
          <p>
            Line selection is crucial:
          </p>
          <ul>
            <li><strong>Main Line:</strong> 30-50 lb braided line provides strength and capacity</li>
            <li><strong>Leader:</strong> 60-100 lb fluorocarbon or monofilament leader is recommended. Tarpon have rough mouths that can abrade lighter leaders</li>
            <li><strong>Leader Length:</strong> 3-6 feet of leader is typically used</li>
          </ul>
          <p>
            Strong leaders are essential, as tarpon have rough mouths and powerful runs that can break lighter leaders.
          </p>

          <h3>Terminal Tackle</h3>
          <p>
            Essential terminal tackle:
          </p>
          <ul>
            <li><strong>Hooks:</strong> Large, strong hooks (size 5/0 to 8/0) for live bait. Circle hooks are often preferred for tarpon</li>
            <li><strong>Swivels:</strong> Heavy-duty swivels to prevent line twist</li>
            <li><strong>Wire Leader:</strong> Optional but can help prevent cut-offs from sharp objects</li>
          </ul>
        </section>

        <section id="best-locations">
          <h2>Best Locations for Tarpon</h2>
          <p>
            Tarpon are found throughout Florida's inshore and nearshore waters, but some areas are particularly productive.
          </p>
          
          <h3>Top Tarpon Fishing Areas</h3>
          <p>
            Productive tarpon locations include:
          </p>
          <ul>
            <li><strong>Passes and Inlets:</strong> Throughout Florida, especially during spring and summer migrations</li>
            <li><strong>Bridges:</strong> All major bridges provide tarpon habitat, especially those with current flow and lighting</li>
            <li><strong>Channels:</strong> Deep channels and passes where tarpon migrate and feed</li>
            <li><strong>Beaches:</strong> Near passes and inlets, especially during migrations</li>
            <li><strong>Nearshore Waters:</strong> Along the coast during migrations</li>
          </ul>

          <h3>Regional Considerations</h3>
          <p>
            Tarpon fishing varies by region:
          </p>
          <ul>
            <li><strong>South Florida:</strong> Year-round tarpon fishing opportunities, especially in Miami, the Keys, and surrounding areas</li>
            <li><strong>Central Florida:</strong> Excellent tarpon fishing during spring and summer migrations in Tampa Bay and surrounding areas</li>
            <li><strong>North Florida:</strong> Tarpon fishing is more seasonal, with best opportunities during warmer months</li>
          </ul>
          <p>
            Understanding regional patterns and migration timing helps you plan trips when tarpon are most accessible in your area.
          </p>
        </section>

        <AppStorePreviewModule className="my-12" />

        <PrimaryCTA
          title="Track Your Tarpon Catches"
          copy="Log every tarpon you catch with GPS location, photos, and conditions. Download Tackle for iPhone."
          buttonText="download"
          position="end"
          pageType="species"
          slug="tarpon"
          species="tarpon"
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
          <h2>Top Tarpon Fishing Locations</h2>
          <ul>
            <li><Link href="/locations/fl/miami">Fishing in Miami, Florida</Link></li>
            <li><Link href="/locations/fl/tampa">Fishing in Tampa, Florida</Link></li>
            <li><Link href="/locations/fl/naples">Fishing in Naples, Florida</Link></li>
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
          slug="tarpon"
          className="my-8"
        />

        <LastUpdated
          date="2024-01-15T00:00:00Z"
          author="Tackle Fishing Team"
        />

        <StickyBottomCTA
          pageType="species"
          slug="tarpon"
          species="tarpon"
        />
      </article>
    </>
  );
}

