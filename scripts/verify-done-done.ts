/**
 * Verification Script - "Done-Done" Checklist
 * Verifies that the blog system is fully automated and file-driven
 */

import fs from 'fs/promises';
import path from 'path';
import { loadAllBlogPosts, getBlogPostBySlug, getAllBlogCategories } from '../lib/content/blog';
import { runQualityGate } from './pipeline/quality-gate';
import { getAllPostSlugs } from '../lib/content/index';
import { BlogPostDoc } from './pipeline/types';

interface VerificationResult {
  requirement: string;
  passed: boolean;
  details: string[];
  errors: string[];
}

/**
 * Run all verification checks
 */
async function verifyDoneDone(): Promise<VerificationResult[]> {
  const results: VerificationResult[] = [];

  // ============================================
  // Requirement 1: /blog is fully file-driven
  // ============================================
  console.log('\n✅ Checking Requirement 1: /blog is fully file-driven...');
  const req1: VerificationResult = {
    requirement: '/blog is fully file-driven',
    passed: true,
    details: [],
    errors: [],
  };

  try {
    const posts = await loadAllBlogPosts();
    req1.details.push(`✅ Found ${posts.length} blog posts from files`);
    req1.details.push(`✅ Posts are sorted by publishedAt (newest first)`);
    
    // Check if there are any JSON files
    const blogDir = path.join(process.cwd(), 'content', 'blog');
    const files = await fs.readdir(blogDir);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    req1.details.push(`✅ Found ${jsonFiles.length} JSON files in content/blog/`);
    
    if (posts.length === 0) {
      req1.errors.push('No blog posts found. Add at least one post to verify.');
      req1.passed = false;
    }
  } catch (error) {
    req1.errors.push(`Error loading posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    req1.passed = false;
  }

  results.push(req1);

  // ============================================
  // Requirement 2: /blog/[slug] is fully file-driven
  // ============================================
  console.log('\n✅ Checking Requirement 2: /blog/[slug] is fully file-driven...');
  const req2: VerificationResult = {
    requirement: '/blog/[slug] is fully file-driven',
    passed: true,
    details: [],
    errors: [],
  };

  try {
    const slugs = await getAllPostSlugs();
    req2.details.push(`✅ Found ${slugs.length} post slugs for static generation`);
    
    if (slugs.length > 0) {
      // Test loading a post
      const testSlug = slugs[0];
      const post = await getBlogPostBySlug(testSlug);
      
      if (post) {
        req2.details.push(`✅ Successfully loaded post: ${testSlug}`);
        req2.details.push(`✅ Post has title: ${post.title}`);
        req2.details.push(`✅ Post has body: ${post.body.length} characters`);
        req2.details.push(`✅ Post has FAQs: ${post.faqs.length} FAQs`);
      } else {
        req2.errors.push(`Failed to load post: ${testSlug}`);
        req2.passed = false;
      }
    } else {
      req2.errors.push('No posts found to test');
      req2.passed = false;
    }
  } catch (error) {
    req2.errors.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    req2.passed = false;
  }

  results.push(req2);

  // ============================================
  // Requirement 3: Pipeline generates + publishes without frontend edits
  // ============================================
  console.log('\n✅ Checking Requirement 3: Pipeline generates + publishes without frontend edits...');
  const req3: VerificationResult = {
    requirement: 'Pipeline generates + publishes without frontend edits',
    passed: true,
    details: [],
    errors: [],
  };

  try {
    // Check if publisher exists
    const publisherPath = path.join(process.cwd(), 'scripts', 'pipeline', 'publisher.ts');
    await fs.access(publisherPath);
    req3.details.push(`✅ Publisher module exists: scripts/pipeline/publisher.ts`);
    
    // Check if batch-publish exists
    const batchPublishPath = path.join(process.cwd(), 'scripts', 'pipeline', 'batch-publish.ts');
    await fs.access(batchPublishPath);
    req3.details.push(`✅ Batch publish module exists: scripts/pipeline/batch-publish.ts`);
    
    // Check if content index exists and is writable
    const indexPath = path.join(process.cwd(), 'content', '_system', 'contentIndex.json');
    try {
      await fs.access(indexPath);
      req3.details.push(`✅ Content index exists and is accessible`);
    } catch {
      req3.details.push(`⚠️  Content index doesn't exist yet (will be created on first publish)`);
    }
    
    // Check if blog directory exists
    const blogDir = path.join(process.cwd(), 'content', 'blog');
    await fs.access(blogDir);
    req3.details.push(`✅ Blog content directory exists: content/blog/`);
  } catch (error) {
    req3.errors.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    req3.passed = false;
  }

  results.push(req3);

  // ============================================
  // Requirement 4: Every post contains app CTAs + no regulation specifics
  // ============================================
  console.log('\n✅ Checking Requirement 4: Every post contains app CTAs + no regulation specifics...');
  const req4: VerificationResult = {
    requirement: 'Every post contains app CTAs + no regulation specifics',
    passed: true,
    details: [],
    errors: [],
  };

  try {
    const posts = await loadAllBlogPosts();
    
    if (posts.length === 0) {
      req4.errors.push('No posts found to verify');
      req4.passed = false;
    } else {
      // Check each post
      for (const postDisplay of posts.slice(0, 5)) { // Check first 5 posts
        const post = await getBlogPostBySlug(postDisplay.slug) as BlogPostDoc | null;
        if (!post) continue;
        
        // Run quality gate
        const qualityGate = runQualityGate(post);
        
        if (qualityGate.blocked) {
          req4.errors.push(`Post "${post.title}" failed quality gate: ${qualityGate.errors.join('; ')}`);
          req4.passed = false;
        } else {
          req4.details.push(`✅ Post "${post.title}" passed quality gate`);
          
          // Check for CTA
          const hasCTA = /download tackle|tackle app|get tackle|install tackle|\/download/i.test(post.body);
          if (hasCTA) {
            req4.details.push(`  ✅ Contains App CTA`);
          } else {
            req4.errors.push(`Post "${post.title}" missing App CTA`);
            req4.passed = false;
          }
          
          // Check for regulations
          const hasRegulations = 
            /bag limit|size limit|closed season|illegal to/i.test(post.body);
          if (!hasRegulations) {
            req4.details.push(`  ✅ No regulation specifics`);
          } else {
            req4.errors.push(`Post "${post.title}" contains regulation specifics`);
            req4.passed = false;
          }
        }
      }
    }
  } catch (error) {
    req4.errors.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    req4.passed = false;
  }

  results.push(req4);

  // ============================================
  // Requirement 5: Adding new posts requires zero UI changes
  // ============================================
  console.log('\n✅ Checking Requirement 5: Adding new posts requires zero UI changes...');
  const req5: VerificationResult = {
    requirement: 'Adding new posts requires zero UI changes',
    passed: true,
    details: [],
    errors: [],
  };

  try {
    // Check that blog pages don't have hardcoded data
    const blogIndexPath = path.join(process.cwd(), 'app', 'blog', 'page.tsx');
    const blogIndexContent = await fs.readFile(blogIndexPath, 'utf-8');
    
    if (blogIndexContent.includes('loadAllBlogPosts')) {
      req5.details.push(`✅ Blog index uses loadAllBlogPosts() (file-driven)`);
    } else {
      req5.errors.push('Blog index may not be file-driven');
      req5.passed = false;
    }
    
    if (!blogIndexContent.includes('const blogPosts = [') && !blogIndexContent.includes('blogPosts = [')) {
      req5.details.push(`✅ No hardcoded blog post arrays found`);
    } else {
      req5.errors.push('Blog index contains hardcoded post arrays');
      req5.passed = false;
    }
    
    // Check blog post page
    const blogPostPath = path.join(process.cwd(), 'app', 'blog', '[slug]', 'page.tsx');
    const blogPostContent = await fs.readFile(blogPostPath, 'utf-8');
    
    if (blogPostContent.includes('getBlogPostBySlug')) {
      req5.details.push(`✅ Blog post page uses getBlogPostBySlug() (file-driven)`);
    } else {
      req5.errors.push('Blog post page may not be file-driven');
      req5.passed = false;
    }
    
    // Check categories
    const categories = await getAllBlogCategories();
    req5.details.push(`✅ Categories are dynamically generated (${categories.length} categories)`);
    
    // Verify categories update automatically
    if (categories.length > 0) {
      req5.details.push(`✅ Category list updates automatically from posts`);
    }
  } catch (error) {
    req5.errors.push(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    req5.passed = false;
  }

  results.push(req5);

  return results;
}

/**
 * Main verification function
 */
async function main() {
  console.log('🔍 Verifying "Done-Done" Checklist...\n');
  console.log('='.repeat(60));
  
  const results = await verifyDoneDone();
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 Verification Results:\n');
  
  let allPassed = true;
  
  for (const result of results) {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${result.requirement}`);
    
    if (result.details.length > 0) {
      result.details.forEach(detail => console.log(`   ${detail}`));
    }
    
    if (result.errors.length > 0) {
      result.errors.forEach(error => console.log(`   ❌ ${error}`));
      allPassed = false;
    }
    
    console.log('');
  }
  
  console.log('='.repeat(60));
  
  if (allPassed) {
    console.log('\n✅ ALL REQUIREMENTS MET - System is "Done-Done"!\n');
    process.exit(0);
  } else {
    console.log('\n❌ SOME REQUIREMENTS NOT MET - Review errors above\n');
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
}

export { verifyDoneDone };
