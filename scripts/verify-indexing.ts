/**
 * Verification Script - Check pages are indexable
 * Run: npx tsx scripts/verify-indexing.ts
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface PageCheck {
  path: string;
  hasNoIndex: boolean;
  hasCanonical: boolean;
  hasTitle: boolean;
  hasDescription: boolean;
  status: 'ok' | 'warning' | 'error';
  issues: string[];
}

const PAGES_TO_CHECK = [
  '/',
  '/how-to/best-fishing-times',
  '/how-to/how-tides-affect-fishing',
  '/locations/fl/naples',
  '/locations/fl/tampa',
  '/download',
  '/about',
];

async function checkPage(pagePath: string): Promise<PageCheck> {
  const issues: string[] = [];
  let hasNoIndex = false;
  let hasCanonical = false;
  let hasTitle = false;
  let hasDescription = false;

  // For Next.js pages, we check the page file
  const filePath = path.join(process.cwd(), 'app', pagePath === '/' ? 'page.tsx' : `${pagePath}/page.tsx`);
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Check for noindex
    if (content.includes('noindex') || content.includes('noIndex')) {
      hasNoIndex = true;
      issues.push('Page contains noindex - will not be indexed');
    }
    
    // Check for canonical
    if (content.includes('canonical') || content.includes('generateCanonical')) {
      hasCanonical = true;
    } else {
      issues.push('Missing canonical URL');
    }
    
    // Check for title
    if (content.includes('title:') || content.includes('metadata')) {
      hasTitle = true;
    } else {
      issues.push('Missing title metadata');
    }
    
    // Check for description
    if (content.includes('description:') || content.includes('metadata')) {
      hasDescription = true;
    } else {
      issues.push('Missing description metadata');
    }
  } catch (error) {
    issues.push(`File not found: ${filePath}`);
  }

  const status = hasNoIndex ? 'error' : issues.length > 0 ? 'warning' : 'ok';

  return {
    path: pagePath,
    hasNoIndex,
    hasCanonical,
    hasTitle,
    hasDescription,
    status,
    issues,
  };
}

async function checkSitemap() {
  console.log('\n📋 Checking Sitemap Files...\n');
  
  const sitemapFiles = [
    'app/sitemap.xml/route.ts',
    'app/sitemap-static.xml/route.ts',
    'app/sitemap-blog.xml/route.ts',
    'app/sitemap-species.xml/route.ts',
    'app/sitemap-how-to.xml/route.ts',
    'app/sitemap-locations.xml/route.ts',
  ];

  for (const file of sitemapFiles) {
    const filePath = path.join(process.cwd(), file);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      if (content.includes('draft') && content.includes('noindex')) {
        console.log(`✅ ${file} - Excludes drafts and noindex`);
      } else {
        console.log(`⚠️  ${file} - May not exclude drafts/noindex`);
      }
    } catch (error) {
      console.log(`❌ ${file} - Not found`);
    }
  }
}

async function main() {
  console.log('🔍 Verifying Pages for Google Indexing\n');
  console.log('=' .repeat(60));

  const results: PageCheck[] = [];

  for (const pagePath of PAGES_TO_CHECK) {
    const result = await checkPage(pagePath);
    results.push(result);
    
    const icon = result.status === 'ok' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
    console.log(`\n${icon} ${pagePath}`);
    
    if (result.hasNoIndex) {
      console.log('   ❌ HAS NOINDEX - WILL NOT BE INDEXED');
    } else {
      console.log('   ✅ No noindex found');
    }
    
    if (result.hasCanonical) {
      console.log('   ✅ Has canonical URL');
    } else {
      console.log('   ⚠️  Missing canonical URL');
    }
    
    if (result.hasTitle) {
      console.log('   ✅ Has title metadata');
    } else {
      console.log('   ⚠️  Missing title metadata');
    }
    
    if (result.hasDescription) {
      console.log('   ✅ Has description metadata');
    } else {
      console.log('   ⚠️  Missing description metadata');
    }
    
    if (result.issues.length > 0) {
      console.log('   Issues:');
      result.issues.forEach(issue => console.log(`     - ${issue}`));
    }
  }

  await checkSitemap();

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:\n');
  
  const okCount = results.filter(r => r.status === 'ok').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  
  console.log(`✅ Indexable: ${okCount}`);
  console.log(`⚠️  Warnings: ${warningCount}`);
  console.log(`❌ Errors (noindex): ${errorCount}`);
  
  if (errorCount > 0) {
    console.log('\n⚠️  WARNING: Some pages have noindex and will NOT be indexed by Google!');
    process.exit(1);
  }
  
  if (warningCount > 0) {
    console.log('\n⚠️  Some pages have missing metadata but are still indexable.');
  }
  
  if (okCount === results.length) {
    console.log('\n✅ All pages are ready for indexing!');
  }
}

main().catch(console.error);


