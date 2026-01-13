/**
 * Internal Link Verification Script
 * Checks that all pages have required internal links
 * Run: npx tsx scripts/verify-internal-links.ts
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface LinkCheck {
  page: string;
  hasDownloadLink: boolean;
  howToLinks: number;
  speciesLinks: number;
  locationLinks: number;
  issues: string[];
}

const HOW_TO_PAGES = [
  'app/how-to/best-fishing-times/page.tsx',
  'app/how-to/how-tides-affect-fishing/page.tsx',
  'app/how-to/what-is-a-good-tide-to-fish/page.tsx',
  'app/how-to/best-time-of-day-to-fish/page.tsx',
  'app/how-to/how-weather-affects-fishing/page.tsx',
];

const LOCATION_PAGES = [
  'app/locations/fl/naples/page.tsx',
  'app/locations/fl/tampa/page.tsx',
  'app/locations/fl/miami/page.tsx',
  'app/locations/fl/fort-myers/page.tsx',
  'app/locations/fl/sarasota/page.tsx',
];

const SPECIES_PAGES = [
  'app/species/snook/page.tsx',
  'app/species/redfish/page.tsx',
  'app/species/speckled-trout/page.tsx',
  'app/species/largemouth-bass/page.tsx',
  'app/species/tarpon/page.tsx',
];

async function checkPage(filePath: string, pageType: 'how-to' | 'location' | 'species'): Promise<LinkCheck> {
  const issues: string[] = [];
  let hasDownloadLink = false;
  let howToLinks = 0;
  let speciesLinks = 0;
  let locationLinks = 0;

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Check for /download link
    if (content.includes('/download') || content.includes('href="/download"')) {
      hasDownloadLink = true;
    } else {
      issues.push('Missing /download link');
    }
    
    // Count how-to links
    const howToMatches = content.match(/href="\/how-to\/[^"]+"/g) || [];
    howToLinks = howToMatches.length;
    
    // Count species links
    const speciesMatches = content.match(/href="\/species\/[^"]+"/g) || [];
    speciesLinks = speciesMatches.length;
    
    // Count location links
    const locationMatches = content.match(/href="\/locations\/[^"]+"/g) || [];
    locationLinks = locationMatches.length;
    
    // Check requirements based on page type
    if (pageType === 'how-to') {
      if (speciesLinks < 1) {
        issues.push(`Only ${speciesLinks} species links found (minimum: 1)`);
      }
      if (locationLinks < 1) {
        issues.push(`Only ${locationLinks} location links found (minimum: 1)`);
      }
    } else if (pageType === 'location') {
      if (howToLinks < 5) {
        issues.push(`Only ${howToLinks} how-to links found (minimum: 5)`);
      }
      if (speciesLinks < 5) {
        issues.push(`Only ${speciesLinks} species links found (minimum: 5)`);
      }
    } else if (pageType === 'species') {
      // Species pages should have how-to and location links (already checked in Step 4)
      if (howToLinks < 3) {
        issues.push(`Only ${howToLinks} how-to links found (minimum: 3)`);
      }
      if (locationLinks < 3) {
        issues.push(`Only ${locationLinks} location links found (minimum: 3)`);
      }
    }
    
  } catch (error) {
    issues.push(`Error reading file: ${(error as Error).message}`);
  }

  return {
    page: filePath,
    hasDownloadLink,
    howToLinks,
    speciesLinks,
    locationLinks,
    issues,
  };
}

async function main() {
  console.log('🔗 Verifying Internal Links\n');
  console.log('='.repeat(60));

  const allResults: LinkCheck[] = [];

  // Check how-to pages
  console.log('\n📋 How-To Pages:\n');
  for (const page of HOW_TO_PAGES) {
    const result = await checkPage(page, 'how-to');
    allResults.push(result);
    
    const icon = result.issues.length === 0 ? '✅' : '⚠️';
    console.log(`${icon} ${path.basename(path.dirname(page))}`);
    console.log(`   Download: ${result.hasDownloadLink ? '✅' : '❌'}`);
    console.log(`   How-To: ${result.howToLinks}`);
    console.log(`   Species: ${result.speciesLinks} ${result.speciesLinks >= 1 ? '✅' : '❌'}`);
    console.log(`   Locations: ${result.locationLinks} ${result.locationLinks >= 1 ? '✅' : '❌'}`);
    if (result.issues.length > 0) {
      result.issues.forEach(issue => console.log(`   ⚠️  ${issue}`));
    }
  }

  // Check location pages
  console.log('\n📋 Location Pages:\n');
  for (const page of LOCATION_PAGES) {
    const result = await checkPage(page, 'location');
    allResults.push(result);
    
    const icon = result.issues.length === 0 ? '✅' : '⚠️';
    const locationName = path.basename(path.dirname(page));
    console.log(`${icon} ${locationName}`);
    console.log(`   Download: ${result.hasDownloadLink ? '✅' : '❌'}`);
    console.log(`   How-To: ${result.howToLinks} ${result.howToLinks >= 5 ? '✅' : '❌'}`);
    console.log(`   Species: ${result.speciesLinks} ${result.speciesLinks >= 5 ? '✅' : '❌'}`);
    console.log(`   Locations: ${result.locationLinks}`);
    if (result.issues.length > 0) {
      result.issues.forEach(issue => console.log(`   ⚠️  ${issue}`));
    }
  }

  // Check species pages
  console.log('\n📋 Species Pages:\n');
  for (const page of SPECIES_PAGES) {
    const result = await checkPage(page, 'species');
    allResults.push(result);
    
    const icon = result.issues.length === 0 ? '✅' : '⚠️';
    console.log(`${icon} ${path.basename(path.dirname(page))}`);
    console.log(`   Download: ${result.hasDownloadLink ? '✅' : '❌'}`);
    console.log(`   How-To: ${result.howToLinks} ${result.howToLinks >= 3 ? '✅' : '❌'}`);
    console.log(`   Species: ${result.speciesLinks}`);
    console.log(`   Locations: ${result.locationLinks} ${result.locationLinks >= 3 ? '✅' : '❌'}`);
    if (result.issues.length > 0) {
      result.issues.forEach(issue => console.log(`   ⚠️  ${issue}`));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:\n');
  
  const pagesWithIssues = allResults.filter(r => r.issues.length > 0);
  const pagesWithoutDownload = allResults.filter(r => !r.hasDownloadLink);
  
  console.log(`Total pages checked: ${allResults.length}`);
  console.log(`Pages with issues: ${pagesWithIssues.length}`);
  console.log(`Pages missing /download: ${pagesWithoutDownload.length}`);
  
  if (pagesWithIssues.length === 0 && pagesWithoutDownload.length === 0) {
    console.log('\n✅ All pages meet internal linking requirements!');
  } else {
    console.log('\n⚠️  Some pages need attention.');
    if (pagesWithoutDownload.length > 0) {
      console.log('\nPages missing /download link:');
      pagesWithoutDownload.forEach(r => console.log(`  - ${r.page}`));
    }
    process.exit(1);
  }
}

main().catch(console.error);



