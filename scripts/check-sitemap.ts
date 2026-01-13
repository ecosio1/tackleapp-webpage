/**
 * Sitemap Verification Script
 * Checks sitemap accessibility and structure
 * Run: npx tsx scripts/check-sitemap.ts
 */

import * as https from 'https';
import * as http from 'http';

interface SitemapCheck {
  url: string;
  accessible: boolean;
  validXML: boolean;
  urlCount: number;
  errors: string[];
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

const SITEMAPS = [
  '/sitemap.xml',
  '/sitemap-static.xml',
  '/sitemap-blog.xml',
  '/sitemap-species.xml',
  '/sitemap-how-to.xml',
  '/sitemap-locations.xml',
];

function fetchUrl(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', reject);
  });
}

async function checkSitemap(sitemapPath: string): Promise<SitemapCheck> {
  const url = `${BASE_URL}${sitemapPath}`;
  const errors: string[] = [];
  let accessible = false;
  let validXML = false;
  let urlCount = 0;

  try {
    const content = await fetchUrl(url);
    accessible = true;

    // Check if it's valid XML
    if (content.trim().startsWith('<?xml') || content.trim().startsWith('<urlset') || content.trim().startsWith('<sitemapindex')) {
      validXML = true;
    } else {
      errors.push('Not valid XML');
    }

    // Count URLs
    const urlMatches = content.match(/<url>/g) || content.match(/<loc>/g);
    if (urlMatches) {
      urlCount = urlMatches.length;
    }

    // Check for common issues
    if (content.includes('noindex')) {
      errors.push('Sitemap contains "noindex" references');
    }

    if (content.includes('draft')) {
      // This is OK if it's in exclusion logic, but check context
      if (!content.includes('filter') && !content.includes('exclude')) {
        errors.push('Sitemap may include draft content');
      }
    }

  } catch (error) {
    errors.push(`Failed to fetch: ${(error as Error).message}`);
  }

  return {
    url,
    accessible,
    validXML,
    urlCount,
    errors,
  };
}

async function checkRobotsTxt() {
  console.log('\n📋 Checking robots.txt...\n');
  
  try {
    const robotsUrl = `${BASE_URL}/robots.txt`;
    const content = await fetchUrl(robotsUrl);
    
    console.log('✅ robots.txt is accessible');
    
    // Check for sitemap references
    if (content.includes('sitemap.xml')) {
      console.log('✅ robots.txt references sitemap.xml');
    } else {
      console.log('⚠️  robots.txt does not reference sitemap.xml');
    }
    
    // Check for disallowed paths
    if (content.includes('Disallow: /api/')) {
      console.log('✅ robots.txt disallows /api/');
    }
    
    // Check for allow all
    if (content.includes('Allow: /')) {
      console.log('✅ robots.txt allows crawling');
    }
    
    console.log('\nrobots.txt content:');
    console.log('─'.repeat(60));
    console.log(content);
    console.log('─'.repeat(60));
    
  } catch (error) {
    console.log(`❌ robots.txt not accessible: ${(error as Error).message}`);
  }
}

async function main() {
  console.log('🔍 Verifying Sitemaps\n');
  console.log(`Base URL: ${BASE_URL}`);
  console.log('='.repeat(60));

  const results: SitemapCheck[] = [];

  for (const sitemapPath of SITEMAPS) {
    console.log(`\n📄 Checking ${sitemapPath}...`);
    const result = await checkSitemap(sitemapPath);
    results.push(result);
    
    if (result.accessible) {
      console.log(`   ✅ Accessible`);
    } else {
      console.log(`   ❌ Not accessible`);
    }
    
    if (result.validXML) {
      console.log(`   ✅ Valid XML`);
    } else {
      console.log(`   ❌ Invalid XML`);
    }
    
    if (result.urlCount > 0) {
      console.log(`   ✅ Contains ${result.urlCount} URLs`);
    } else {
      console.log(`   ⚠️  No URLs found`);
    }
    
    if (result.errors.length > 0) {
      console.log(`   ⚠️  Issues:`);
      result.errors.forEach(error => console.log(`      - ${error}`));
    }
  }

  await checkRobotsTxt();

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:\n');
  
  const accessibleCount = results.filter(r => r.accessible).length;
  const validCount = results.filter(r => r.validXML).length;
  const totalUrls = results.reduce((sum, r) => sum + r.urlCount, 0);
  
  console.log(`✅ Accessible sitemaps: ${accessibleCount}/${SITEMAPS.length}`);
  console.log(`✅ Valid XML sitemaps: ${validCount}/${SITEMAPS.length}`);
  console.log(`📊 Total URLs in sitemaps: ${totalUrls}`);
  
  if (accessibleCount === SITEMAPS.length && validCount === SITEMAPS.length) {
    console.log('\n✅ All sitemaps are ready for Google Search Console!');
  } else {
    console.log('\n⚠️  Some sitemaps need attention.');
    process.exit(1);
  }
}

main().catch(console.error);



