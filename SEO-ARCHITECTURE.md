# Tackle - AI Fishing Assistant: Complete SEO & Content Architecture

**Product:** Tackle - AI Fishing Assistant (iOS app)  
**Goal:** Rank on Google and convert organic traffic into app downloads  
**Strategy:** Scalable content architecture supporting hundreds/thousands of pages

---

## Table of Contents
1. [Navigation Structure](#navigation-structure)
2. [Site Map - Page Clusters](#site-map---page-clusters)
3. [Internal Linking System](#internal-linking-system)
4. [Page Template Checklist](#page-template-checklist)

---

## Navigation Structure

### Header Navigation (Top-Level)
```
Home | Species | How-To Guides | Locations | Blog | Download
```

**Header Links:**
- `/` - Home
- `/species` - Species index/landing (shows top 20 species)
- `/how-to` - How-to guides index/landing (shows top guides by category)
- `/locations` - Locations index/landing (shows top locations by state)
- `/blog` - Blog index (latest posts + categories)
- `/download` - Smart download page (iOS App Store + deep link)

**Mobile Menu:** Same links, hamburger menu format

### Footer Link Groups

**Footer Group 1: Product**
- `/` - Home
- `/features` - Features
- `/how-it-works` - How It Works
- `/pricing` - Pricing
- `/download` - Download App

**Footer Group 2: Content**
- `/species` - All Species
- `/how-to` - All Guides
- `/locations` - All Locations
- `/blog` - Blog

**Footer Group 3: Resources**
- `/regulations` - Regulations Hub (state index)
- `/blog/category/fishing-tips` - Fishing Tips
- `/blog/category/gear-reviews` - Gear Reviews
- `/blog/category/conditions` - Fishing Conditions

**Footer Group 4: Company**
- `/about` - About Us
- `/contact` - Contact
- `/privacy` - Privacy Policy
- `/terms` - Terms of Service

---

## Site Map - Page Clusters

### A) Core Marketing Pages

**URL Pattern:** Direct paths (no subdirectory)

| Page | URL | Purpose | Priority |
|------|-----|---------|----------|
| Home | `/` | Main landing page with app features | P0 |
| Download | `/download` | Smart link (iOS App Store + deep link) | P0 |
| Features | `/features` | Detailed feature breakdown | P1 |
| How It Works | `/how-it-works` | App functionality explanation | P1 |
| Pricing | `/pricing` | Pricing page ("Free + Premium coming") | P1 |
| About | `/about` | Company story, mission | P2 |
| Contact | `/contact` | Contact form + email | P2 |
| Privacy Policy | `/privacy` | Legal compliance | P0 |
| Terms of Service | `/terms` | Legal compliance | P0 |

---

### B) Species Cluster (Evergreen Content)

**URL Pattern:** `/species/{species-slug}`

**25 Starter Species Pages (Florida-heavy + general US):**

1. `/species/redfish` - Redfish (Red Drum)
2. `/species/snook` - Snook
3. `/species/tarpon` - Tarpon
4. `/species/speckled-trout` - Speckled Sea Trout
5. `/species/flounder` - Flounder
6. `/species/sheepshead` - Sheepshead
7. `/species/pompano` - Pompano
8. `/species/spanish-mackerel` - Spanish Mackerel
9. `/species/king-mackerel` - King Mackerel
10. `/species/cobia` - Cobia
11. `/species/grouper` - Grouper (various species)
12. `/species/snapper` - Snapper (various species)
13. `/species/bonefish` - Bonefish
14. `/species/permit` - Permit
15. `/species/largemouth-bass` - Largemouth Bass
16. `/species/peacock-bass` - Peacock Bass
17. `/species/crappie` - Crappie
18. `/species/bluegill` - Bluegill
19. `/species/catfish` - Catfish
20. `/species/striped-bass` - Striped Bass
21. `/species/walleye` - Walleye
22. `/species/trout` - Rainbow/Brook Trout
23. `/species/salmon` - Salmon (various species)
24. `/species/tuna` - Tuna (various species)
25. `/species/mahi-mahi` - Mahi-Mahi (Dolphinfish)

**Species Index Page:** `/species` (lists all species with filters by region/type)

**Each Species Page Links To:**
- 3-5 relevant "how to catch" guides (e.g., "How to Catch Redfish in Florida")
- 5 location pages where that species is common
- 3 gear/lure guides (future cluster - placeholder links)
- 1 regulations page (if applicable, e.g., `/regulations/florida/snook-regulations`)
- `/download` CTA

---

### C) How-To / Techniques Cluster (Evergreen Content)

**URL Pattern:** `/how-to/{topic-slug}`

**40 Starter How-To Guides:**

#### Beginner Basics (10 guides)
1. `/how-to/tie-fishing-knots` - How to Tie Essential Fishing Knots
2. `/how-to/choose-fishing-line` - How to Choose Fishing Line
3. `/how-to/read-tides` - How to Read Tides for Fishing
4. `/how-to/understand-moon-phases` - How Moon Phases Affect Fishing
5. `/how-to/read-weather-conditions` - How Weather Conditions Affect Fishing
6. `/how-to/rig-fishing-rod` - How to Rig a Fishing Rod
7. `/how-to/choose-bait` - How to Choose the Right Bait
8. `/how-to/handle-fish-safely` - How to Handle Fish Safely
9. `/how-to/measure-fish` - How to Measure Fish Correctly
10. `/how-to/fishing-etiquette` - Fishing Etiquette and Best Practices

#### Inshore Techniques (10 guides)
11. `/how-to/catch-redfish-inshore` - How to Catch Redfish Inshore
12. `/how-to/catch-snook-mangroves` - How to Catch Snook in Mangroves
13. `/how-to/catch-tarpon` - How to Catch Tarpon
14. `/how-to/fish-flats` - How to Fish the Flats
15. `/how-to/fish-tide-changes` - How to Fish Tide Changes
16. `/how-to/catch-sheepshead` - How to Catch Sheepshead
17. `/how-to/fish-bridges` - How to Fish Bridges and Piers
18. `/how-to/catch-flounder` - How to Catch Flounder
19. `/how-to/fish-jetties` - How to Fish Jetties
20. `/how-to/catch-speckled-trout` - How to Catch Speckled Trout

#### Pier & Bank Fishing (8 guides)
21. `/how-to/fish-pier` - How to Fish from a Pier
22. `/how-to/fish-bank` - How to Fish from the Bank
23. `/how-to/cast-long-distance` - How to Cast Long Distance
24. `/how-to/fish-surf` - How to Fish the Surf
25. `/how-to/fish-canal` - How to Fish Canals
26. `/how-to/fish-dock` - How to Fish from Docks
27. `/how-to/fish-bridge-pier` - How to Fish Bridges and Piers
28. `/how-to/fish-bank-safety` - Bank Fishing Safety Tips

#### Kayak Fishing (7 guides)
29. `/how-to/kayak-fishing-basics` - Kayak Fishing Basics
30. `/how-to/anchor-kayak` - How to Anchor a Kayak While Fishing
31. `/how-to/kayak-fishing-safety` - Kayak Fishing Safety
32. `/how-to/catch-fish-kayak` - How to Catch Fish from a Kayak
33. `/how-to/kayak-fishing-gear` - Essential Kayak Fishing Gear
34. `/how-to/kayak-fishing-tips` - Kayak Fishing Tips and Tricks
35. `/how-to/kayak-fishing-locations` - Best Kayak Fishing Locations

#### Advanced Techniques (5 guides)
36. `/how-to/fly-fishing-basics` - Fly Fishing Basics
37. `/how-to/fish-structure` - How to Fish Structure
38. `/how-to/read-water` - How to Read Water for Fish
39. `/how-to/catch-fish-season` - How to Catch Fish by Season
40. `/how-to/fishing-tactics` - Advanced Fishing Tactics

**How-To Index Page:** `/how-to` (lists all guides with category filters)

**Each How-To Page Links To:**
- 3 species pages (relevant to the technique)
- 3 location pages (where technique is commonly used)
- 1 `/download` CTA
- Related how-to guides (3-5 similar techniques)

---

### D) Locations Cluster (Local SEO)

**URL Pattern:** `/locations/{state}/{city}`

**20 Florida City Pages:**
1. `/locations/florida/miami` - Miami Fishing Guide
2. `/locations/florida/tampa` - Tampa Fishing Guide
3. `/locations/florida/orlando` - Orlando Fishing Guide
4. `/locations/florida/jacksonville` - Jacksonville Fishing Guide
5. `/locations/florida/key-west` - Key West Fishing Guide
6. `/locations/florida/key-largo` - Key Largo Fishing Guide
7. `/locations/florida/fort-lauderdale` - Fort Lauderdale Fishing Guide
8. `/locations/florida/west-palm-beach` - West Palm Beach Fishing Guide
9. `/locations/florida/sarasota` - Sarasota Fishing Guide
10. `/locations/florida/naples` - Naples Fishing Guide
11. `/locations/florida/fort-myers` - Fort Myers Fishing Guide
12. `/locations/florida/clearwater` - Clearwater Fishing Guide
13. `/locations/florida/st-petersburg` - St. Petersburg Fishing Guide
14. `/locations/florida/panama-city` - Panama City Fishing Guide
15. `/locations/florida/destin` - Destin Fishing Guide
16. `/locations/florida/cocoa-beach` - Cocoa Beach Fishing Guide
17. `/locations/florida/daytona-beach` - Daytona Beach Fishing Guide
18. `/locations/florida/venice` - Venice Fishing Guide
19. `/locations/florida/port-canaveral` - Port Canaveral Fishing Guide
20. `/locations/florida/cape-canaveral` - Cape Canaveral Fishing Guide

**10 Non-Florida Examples:**
1. `/locations/texas/galveston` - Galveston Fishing Guide
2. `/locations/texas/corpus-christi` - Corpus Christi Fishing Guide
3. `/locations/louisiana/new-orleans` - New Orleans Fishing Guide
4. `/locations/north-carolina/outer-banks` - Outer Banks Fishing Guide
5. `/locations/south-carolina/charleston` - Charleston Fishing Guide
6. `/locations/georgia/savannah` - Savannah Fishing Guide
7. `/locations/california/san-diego` - San Diego Fishing Guide
8. `/locations/california/monterey` - Monterey Fishing Guide
9. `/locations/hawaii/honolulu` - Honolulu Fishing Guide
10. `/locations/alaska/anchorage` - Anchorage Fishing Guide

**Location Index Pages:**
- `/locations` - All locations (state filter)
- `/locations/florida` - All Florida locations
- `/locations/texas` - All Texas locations
- (etc. for each state)

**Each Location Page Links To:**
- 5 relevant species pages (common in that location)
- 5 how-to guides (relevant techniques for that location)
- 1 "Today's Fishing Forecast" placeholder link (future automation: `/conditions/{state}/{city}`)
- `/download` CTA
- 1-2 regulations pages (if applicable)

---

### E) Blog Cluster (Editorial + Automated Later)

**URL Pattern:** `/blog/{post-slug}`  
**Category Pattern:** `/blog/category/{category-slug}`

**8 Blog Categories:**

1. **Fishing Tips** (`/blog/category/fishing-tips`)
   - 10 sample posts:
     1. `/blog/best-time-fish-florida` - Best Time to Fish in Florida: Complete Guide
     2. `/blog/top-10-fishing-mistakes` - Top 10 Fishing Mistakes Beginners Make
     3. `/blog/how-read-fish-finder` - How to Read a Fish Finder Like a Pro
     4. `/blog/fishing-knots-every-angler` - Fishing Knots Every Angler Should Know
     5. `/blog/weather-fishing-success` - How Weather Affects Your Fishing Success
     6. `/blog/tide-fishing-guide` - Complete Guide to Tide Fishing
     7. `/blog/moon-phase-fishing` - Moon Phase Fishing: When to Go
     8. `/blog/fishing-line-guide` - Complete Fishing Line Guide: Types and Uses
     9. `/blog/catch-release-best-practices` - Catch and Release: Best Practices
     10. `/blog/fishing-safety-tips` - Essential Fishing Safety Tips

2. **Gear Reviews** (`/blog/category/gear-reviews`)
   - 10 sample posts:
     1. `/blog/best-fishing-rods-2024` - Best Fishing Rods of 2024: Complete Review
     2. `/blog/best-fishing-reels-inshore` - Best Fishing Reels for Inshore Fishing
     3. `/blog/top-fishing-lures-florida` - Top Fishing Lures for Florida Waters
     4. `/blog/best-fishing-kayaks` - Best Fishing Kayaks: Buyer's Guide
     5. `/blog/fishing-apparel-guide` - Fishing Apparel Guide: What to Wear
     6. `/blog/best-fishing-tackle-boxes` - Best Fishing Tackle Boxes Reviewed
     7. `/blog/fishing-electronics-guide` - Fishing Electronics Guide: Fish Finders & More
     8. `/blog/best-fishing-nets` - Best Fishing Nets: Landing Net Guide
     9. `/blog/fishing-pliers-tools` - Essential Fishing Pliers and Tools
     10. `/blog/best-fishing-coolers` - Best Fishing Coolers for Your Catch

3. **Fishing Conditions** (`/blog/category/conditions`)
   - 10 sample posts:
     1. `/blog/florida-fishing-conditions-january` - Florida Fishing Conditions: January Guide
     2. `/blog/best-fishing-conditions-explained` - Best Fishing Conditions Explained
     3. `/blog/barometric-pressure-fishing` - How Barometric Pressure Affects Fishing
     4. `/blog/wind-fishing-impact` - How Wind Direction Impacts Fishing Success
     5. `/blog/water-temperature-fishing` - Water Temperature and Fishing: Complete Guide
     6. `/blog/seasonal-fishing-patterns` - Seasonal Fishing Patterns: What to Expect
     7. `/blog/fishing-forecast-how-to-read` - How to Read a Fishing Forecast
     8. `/blog/storm-fishing-tips` - Fishing Before and After Storms: Tips
     9. `/blog/clear-vs-murky-water` - Clear vs. Murky Water: Fishing Strategies
     10. `/blog/tide-chart-reading-guide` - How to Read Tide Charts for Fishing

4. **Species Spotlights** (`/blog/category/species-spotlights`)
   - 10 sample posts:
     1. `/blog/redfish-complete-guide` - Redfish Complete Guide: Everything You Need to Know
     2. `/blog/snook-fishing-secrets` - Snook Fishing Secrets: Tips from the Pros
     3. `/blog/tarpon-migration-guide` - Tarpon Migration Guide: When and Where
     4. `/blog/speckled-trout-habits` - Understanding Speckled Trout Habits
     5. `/blog/flounder-fishing-tips` - Flounder Fishing Tips: Bottom Fishing Mastery
     6. `/blog/sheepshead-fishing-guide` - Sheepshead Fishing: Complete Guide
     7. `/blog/bonefish-fishing-florida` - Bonefish Fishing in Florida: Ultimate Guide
     8. `/blog/permit-fishing-tips` - Permit Fishing Tips: The Grand Slam Fish
     9. `/blog/cobia-fishing-guide` - Cobia Fishing Guide: Everything You Need to Know
     10. `/blog/grouper-fishing-deep-water` - Grouper Fishing in Deep Water

5. **Location Guides** (`/blog/category/location-guides`)
   - 10 sample posts:
     1. `/blog/miami-fishing-spots` - Best Miami Fishing Spots: Local's Guide
     2. `/blog/florida-keys-fishing-guide` - Florida Keys Fishing: Complete Guide
     3. `/blog/tampa-bay-fishing-guide` - Tampa Bay Fishing Guide: Top Spots
     4. `/blog/inshore-fishing-florida` - Best Inshore Fishing Spots in Florida
     5. `/blog/offshore-fishing-florida` - Offshore Fishing in Florida: What to Know
     6. `/blog/pier-fishing-florida` - Best Pier Fishing Spots in Florida
     7. `/blog/kayak-fishing-florida` - Top Kayak Fishing Locations in Florida
     8. `/blog/bridge-fishing-florida` - Bridge Fishing in Florida: Hot Spots
     9. `/blog/flats-fishing-florida` - Flats Fishing in Florida: Ultimate Guide
     10. `/blog/backcountry-fishing-florida` - Backcountry Fishing in Florida

6. **Techniques & Tactics** (`/blog/category/techniques-tactics`)
   - 10 sample posts:
     1. `/blog/sight-fishing-techniques` - Sight Fishing Techniques: See and Catch
     2. `/blog/jigging-techniques` - Jigging Techniques: Master the Art
     3. `/blog/topwater-fishing-tips` - Topwater Fishing Tips: Surface Action
     4. `/blog/bottom-fishing-guide` - Bottom Fishing Guide: Techniques and Tips
     5. `/blog/trolling-techniques` - Trolling Techniques: Cover More Water
     6. `/blog/drift-fishing-guide` - Drift Fishing Guide: Let the Current Work
     7. `/blog/structure-fishing` - Structure Fishing: Find the Fish
     8. `/blog/live-bait-vs-artificial` - Live Bait vs. Artificial: When to Use What
     9. `/blog/fly-fishing-inshore` - Fly Fishing Inshore: Techniques and Tips
     10. `/blog/kayak-fishing-techniques` - Kayak Fishing Techniques: Stealth Approach

7. **Regulations & Conservation** (`/blog/category/regulations-conservation`)
   - 10 sample posts:
     1. `/blog/florida-fishing-regulations-2024` - Florida Fishing Regulations 2024: Complete Guide
     2. `/blog/snook-regulations-florida` - Snook Regulations in Florida: What You Need to Know
     3. `/blog/redfish-regulations-florida` - Redfish Regulations in Florida
     4. `/blog/fishing-license-guide` - Fishing License Guide: State by State
     5. `/blog/catch-release-best-practices` - Catch and Release: Best Practices
     6. `/blog/fishing-conservation-tips` - Fishing Conservation: How to Help
     7. `/blog/size-limit-guide` - Understanding Size Limits: Complete Guide
     8. `/blog/bag-limit-explained` - Bag Limits Explained: What You Need to Know
     9. `/blog/fishing-seasons-guide` - Fishing Seasons Guide: When You Can Fish
     10. `/blog/sustainable-fishing-practices` - Sustainable Fishing Practices

8. **App Features & Updates** (`/blog/category/app-features`)
   - 10 sample posts:
     1. `/blog/how-to-use-tackle-app` - How to Use Tackle App: Complete Guide
     2. `/blog/fish-identification-feature` - Fish Identification Feature: How It Works
     3. `/blog/fishing-forecast-feature` - Fishing Forecast Feature: Explained
     4. `/blog/ai-captain-guide` - AI Captain Guide: Get Expert Advice
     5. `/blog/catch-logging-feature` - Catch Logging Feature: Track Your Success
     6. `/blog/app-updates-2024` - Tackle App Updates 2024: What's New
     7. `/blog/offline-mode-guide` - Offline Mode Guide: Fish Without Internet
     8. `/blog/gps-features-guide` - GPS Features Guide: Mark Your Spots
     9. `/blog/app-tips-tricks` - Tackle App Tips and Tricks
     10. `/blog/user-success-stories` - User Success Stories: Real Anglers, Real Results

**Blog Index Page:** `/blog` (shows latest posts + category navigation)

**Each Blog Post Links To:**
- 1 species page (relevant to post topic)
- 1 how-to page (relevant technique)
- 1 location page (if applicable)
- `/download` CTA
- Related blog posts (3-5 similar posts)

---

### F) Regulations + Rules Cluster (High SEO Value)

**URL Pattern:** `/regulations/{state}/{topic-slug}`

**Legal Risk Mitigation:**
- Always cite official sources (FWC, state agencies)
- Add prominent disclaimer: "This information is for reference only. Always check official state regulations before fishing. Regulations may change."
- Never claim to be "official" or "authoritative"
- Include "Last updated" date
- Link to official state agency pages
- Use language like "According to [Agency Name]" or "Per [Agency Name] regulations"

**15 Starter Florida Regulation Pages:**

1. `/regulations/florida/snook-regulations` - Snook Regulations in Florida
2. `/regulations/florida/redfish-regulations` - Redfish Regulations in Florida
3. `/regulations/florida/tarpon-regulations` - Tarpon Regulations in Florida
4. `/regulations/florida/grouper-regulations` - Grouper Regulations in Florida
5. `/regulations/florida/snapper-regulations` - Snapper Regulations in Florida
6. `/regulations/florida/florida-fishing-seasons` - Florida Fishing Seasons Guide
7. `/regulations/florida/size-limits` - Florida Fish Size Limits
8. `/regulations/florida/bag-limits` - Florida Bag Limits Guide
9. `/regulations/florida/fishing-license` - Florida Fishing License Requirements
10. `/regulations/florida/saltwater-regulations` - Florida Saltwater Fishing Regulations
11. `/regulations/florida/freshwater-regulations` - Florida Freshwater Fishing Regulations
12. `/regulations/florida/special-zones` - Florida Special Fishing Zones
13. `/regulations/florida/closed-seasons` - Florida Closed Seasons Guide
14. `/regulations/florida/tournament-regulations` - Florida Tournament Fishing Regulations
15. `/regulations/florida/conservation-measures` - Florida Conservation Measures

**Regulations Index Pages:**
- `/regulations` - All regulations (state filter)
- `/regulations/florida` - All Florida regulations

**Each Regulations Page Links To:**
- 3-5 relevant species pages (affected by regulations)
- 3-5 location pages (where regulations apply)
- Official state agency link (external)
- `/download` CTA (with note about regulations feature in app)

---

## Internal Linking System

### Core Rules (MUST Follow)

#### 1. Blog Posts
**Every blog post MUST link to:**
- ✅ 1 species page (relevant to post topic)
- ✅ 1 how-to page (relevant technique)
- ✅ 1 location page (if applicable to post)
- ✅ `/download` CTA (always in conclusion section)
- ✅ 3-5 related blog posts (same category or related topics)

**Link Placement:**
- Species/how-to/location links: In body content (natural context)
- `/download` CTA: Always in conclusion section + sidebar (if applicable)
- Related posts: At bottom of article in "Related Articles" module

#### 2. Species Pages
**Every species page MUST link to:**
- ✅ 3-5 "how to catch" guides (specific to that species)
- ✅ 5 location pages (where species is commonly found)
- ✅ 3 gear/lure guides (future cluster - placeholder links for now)
- ✅ 1 regulations page (if applicable, e.g., snook → snook regulations)
- ✅ `/download` CTA (prominent placement)

**Link Placement:**
- How-to guides: In "How to Catch [Species]" section
- Location pages: In "Where to Find [Species]" section
- Regulations: In "Regulations" section (if applicable)
- `/download` CTA: After main content, before FAQ

#### 3. Location Pages
**Every location page MUST link to:**
- ✅ 5 species pages (common in that location)
- ✅ 5 how-to guides (relevant techniques for that location)
- ✅ 1 "Today's Fishing Forecast" placeholder link (future: `/conditions/{state}/{city}`)
- ✅ `/download` CTA (prominent placement)
- ✅ 1-2 regulations pages (if applicable)

**Link Placement:**
- Species: In "Popular Species" section
- How-to guides: In "Fishing Techniques" section
- Forecast link: Prominent callout box at top
- `/download` CTA: After main content, before FAQ

#### 4. How-To Pages
**Every how-to page MUST link to:**
- ✅ 3 species pages (relevant to the technique)
- ✅ 3 location pages (where technique is commonly used)
- ✅ `/download` CTA (always in conclusion)
- ✅ 3-5 related how-to guides (similar techniques)

**Link Placement:**
- Species/location links: In body content (natural context)
- `/download` CTA: In conclusion section
- Related guides: At bottom in "Related Guides" module

#### 5. Regulations Pages
**Every regulations page MUST link to:**
- ✅ 3-5 species pages (affected by regulations)
- ✅ 3-5 location pages (where regulations apply)
- ✅ Official state agency link (external, prominent)
- ✅ `/download` CTA (with note about regulations feature)

**Link Placement:**
- Species/location: In "Affected Species/Locations" section
- Official link: At top in disclaimer box
- `/download` CTA: After main content

### Breadcrumb Navigation

**Every page MUST include breadcrumb schema:**
- Home → Category → Page (e.g., Home → Species → Redfish)
- Use JSON-LD schema markup
- Visual breadcrumb trail above H1

**Breadcrumb Patterns:**
- Species: `Home > Species > [Species Name]`
- How-To: `Home > How-To Guides > [Guide Name]`
- Location: `Home > Locations > [State] > [City]`
- Blog: `Home > Blog > [Category] > [Post Title]`
- Regulations: `Home > Regulations > [State] > [Topic]`

### Related Content Modules

**Every page type MUST include a "Related Content" module at the bottom:**

1. **Species Pages:**
   - "Related Species" (3-5 similar species)
   - "How to Catch [Species]" (3-5 guides)
   - "Where to Find [Species]" (5 locations)

2. **How-To Pages:**
   - "Related Guides" (3-5 similar techniques)
   - "Species for This Technique" (3 species)
   - "Best Locations" (3 locations)

3. **Location Pages:**
   - "Popular Species Here" (5 species)
   - "Fishing Techniques" (5 how-to guides)
   - "Nearby Locations" (3-5 nearby cities)

4. **Blog Posts:**
   - "Related Articles" (3-5 same category)
   - "Related Species" (1-2 species)
   - "Related Guides" (1-2 how-to)

5. **Regulations Pages:**
   - "Affected Species" (3-5 species)
   - "Related Regulations" (3-5 other regulations)

### Link Distribution Rules

- **No orphan pages:** Every page must have at least 3 internal links pointing to it
- **Hub pages:** Index pages (e.g., `/species`, `/how-to`) link to all child pages
- **Silo structure:** Keep related content linked (species → how-to → locations)
- **Anchor text variety:** Use natural, varied anchor text (not always exact match)
- **Link depth:** No page should be more than 3 clicks from home

---

## Page Template Checklist

### Universal Requirements (All Pages)

- [ ] **H1 Tag:** One H1 per page, includes primary keyword
- [ ] **Meta Title:** 50-60 characters, includes primary keyword
- [ ] **Meta Description:** 150-160 characters, includes CTA
- [ ] **Open Graph Tags:** Title, description, image for social sharing
- [ ] **Breadcrumb Schema:** JSON-LD breadcrumb markup
- [ ] **FAQ Section:** 5-10 FAQs with schema markup (FAQPage schema)
- [ ] **Internal Links:** Follow internal linking rules for page type
- [ ] **Download CTA:** Prominent `/download` link/button
- [ ] **Mobile Responsive:** All content mobile-friendly
- [ ] **Page Speed:** Optimized images, lazy loading
- [ ] **Alt Text:** All images have descriptive alt text

### Species Page Template

**Required Components:**
- [ ] **H1:** "[Species Name] Fishing Guide" (e.g., "Redfish Fishing Guide")
- [ ] **Hero Image:** High-quality species photo
- [ ] **Quick Facts Box:** Size, habitat, best season, regulations summary
- [ ] **Introduction:** 2-3 paragraphs about the species
- [ ] **How to Catch Section:** Links to 3-5 how-to guides
- [ ] **Where to Find Section:** Links to 5 location pages
- [ ] **Gear & Tackle Section:** Links to 3 gear guides (placeholder)
- [ ] **Regulations Section:** Link to regulations page (if applicable)
- [ ] **FAQ Section:** 5-10 species-specific FAQs
- [ ] **Related Content Module:** Related species, guides, locations
- [ ] **Download CTA:** After main content, before FAQ
- [ ] **Schema Type:** `Article` or `WebPage` with `Thing > Animal` properties

**Content Length:** 1,500-2,500 words

### How-To Page Template

**Required Components:**
- [ ] **H1:** "How to [Action]" (e.g., "How to Catch Redfish Inshore")
- [ ] **Hero Image:** Technique demonstration photo
- [ ] **Introduction:** Why this technique matters
- [ ] **Step-by-Step Guide:** Numbered steps with images
- [ ] **Tips & Tricks Section:** Pro tips
- [ ] **Common Mistakes Section:** What to avoid
- [ ] **Best Conditions Section:** When to use this technique
- [ ] **Species Links:** 3 species pages (relevant to technique)
- [ ] **Location Links:** 3 location pages (where technique works)
- [ ] **FAQ Section:** 5-10 technique-specific FAQs
- [ ] **Related Guides Module:** 3-5 similar techniques
- [ ] **Download CTA:** In conclusion section
- [ ] **Schema Type:** `HowTo` schema (step-by-step instructions)

**Content Length:** 1,200-2,000 words

### Location Page Template

**Required Components:**
- [ ] **H1:** "[City], [State] Fishing Guide" (e.g., "Miami, Florida Fishing Guide")
- [ ] **Hero Image:** Location-specific fishing photo
- [ ] **Introduction:** Overview of fishing in this location
- [ ] **Best Fishing Spots Section:** 5-10 specific spots with descriptions
- [ ] **Popular Species Section:** Links to 5 species pages
- [ ] **Fishing Techniques Section:** Links to 5 how-to guides
- [ ] **Best Times to Fish Section:** Seasonal patterns
- [ ] **Fishing Forecast Link:** Placeholder for `/conditions/{state}/{city}`
- [ ] **Regulations Section:** Links to relevant regulations (if applicable)
- [ ] **Local Tips Section:** Insider knowledge
- [ ] **FAQ Section:** 5-10 location-specific FAQs
- [ ] **Related Locations Module:** 3-5 nearby cities
- [ ] **Download CTA:** After main content, before FAQ
- [ ] **Schema Type:** `LocalBusiness` or `Place` schema (if applicable)

**Content Length:** 2,000-3,000 words

### Blog Post Template

**Required Components:**
- [ ] **H1:** Engaging, keyword-rich title
- [ ] **Featured Image:** High-quality, relevant image
- [ ] **Introduction:** Hook readers, preview content
- [ ] **Body Content:** Well-structured with H2/H3 subheadings
- [ ] **Internal Links:** 1 species, 1 how-to, 1 location (if applicable)
- [ ] **Images:** 3-5 relevant images throughout
- [ ] **Conclusion:** Summary + `/download` CTA
- [ ] **FAQ Section:** 5-10 topic-specific FAQs
- [ ] **Related Articles Module:** 3-5 related blog posts
- [ ] **Author Bio:** (if applicable)
- [ ] **Publish Date:** Visible date
- [ ] **Schema Type:** `Article` or `BlogPosting` schema

**Content Length:** 1,500-3,000 words

### Regulations Page Template

**Required Components:**
- [ ] **H1:** "[Topic] Regulations in [State]" (e.g., "Snook Regulations in Florida")
- [ ] **Disclaimer Box:** Prominent legal disclaimer at top
- [ ] **Official Source Link:** Link to state agency (external, prominent)
- [ ] **Last Updated Date:** Visible date
- [ ] **Regulations Content:** Size limits, bag limits, seasons, etc.
- [ ] **Affected Species Section:** Links to 3-5 species pages
- [ ] **Affected Locations Section:** Links to 3-5 location pages
- [ ] **FAQ Section:** 5-10 regulation-specific FAQs
- [ ] **Download CTA:** With note about regulations feature in app
- [ ] **Schema Type:** `WebPage` with `GovernmentOrganization` references

**Content Length:** 1,000-2,000 words

### Core Marketing Pages Template

**Required Components:**
- [ ] **H1:** Clear, value proposition
- [ ] **Hero Section:** Compelling headline + CTA
- [ ] **Features Section:** Key app features
- [ ] **Benefits Section:** User benefits
- [ ] **Social Proof:** Testimonials, ratings (if available)
- [ ] **FAQ Section:** 5-10 common questions
- [ ] **Download CTA:** Multiple CTAs throughout page
- [ ] **Schema Type:** `SoftwareApplication` schema (for app pages)

**Content Length:** 800-1,500 words

---

## Scalability Notes

### Future Expansion

**Species Pages:**
- Can scale to 200+ species
- Use taxonomy: saltwater/freshwater, region, family
- Auto-generate from database

**How-To Guides:**
- Can scale to 500+ guides
- Use category system: beginner/intermediate/advanced
- Auto-generate from templates

**Location Pages:**
- Can scale to 1,000+ cities
- Use state/region hierarchy
- Auto-generate from location database

**Blog Posts:**
- Can scale to thousands of posts
- Use category/tag system
- Automated conditions posts (future)

**Regulations Pages:**
- Can scale to all 50 states
- Use state/topic hierarchy
- Auto-update from official sources (with disclaimers)

### Automation Opportunities

1. **Conditions Posts:** Auto-generate daily/weekly fishing conditions posts
2. **Location Pages:** Template-based generation from location database
3. **Species Pages:** Template-based generation from species database
4. **Internal Linking:** Auto-suggest related content based on tags/categories
5. **Schema Markup:** Auto-generate from page metadata

---

## Implementation Priority

### Phase 1: Foundation (Weeks 1-2)
- Core marketing pages (all P0/P1)
- Species index page + 10 starter species pages
- How-to index page + 15 starter how-to guides
- Locations index page + 10 starter location pages
- Blog index + 20 starter blog posts (2-3 per category)

### Phase 2: Content Expansion (Weeks 3-6)
- Complete all 25 species pages
- Complete all 40 how-to guides
- Complete all 30 location pages
- Complete all 80 blog posts (10 per category)
- Add 15 regulations pages

### Phase 3: Optimization (Weeks 7-8)
- Add all schema markup
- Optimize internal linking
- Add FAQ sections to all pages
- Performance optimization
- SEO audit and fixes

### Phase 4: Automation Prep (Weeks 9+)
- Set up content management system
- Create page templates
- Build automation for conditions posts
- Scale to hundreds/thousands of pages

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Next Review:** After Phase 1 completion



