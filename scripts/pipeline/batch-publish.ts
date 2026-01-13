/**
 * Batch Publish - Publish multiple posts with cadence controls
 * Respects all quality gates and publishing limits
 */

import { generateBlogIdeas } from './ideation';
import { blogIdeaToBrief } from './blog-brief-builder';
import { generateBlogPost } from './generators/blog';
import { validateDoc } from './validator';
import { publishDoc, PublishError } from './publisher';
import { topicKeyExists } from './dedupe';
import { filterIdeasByCadence, checkDailyLimit, CadenceControls, DEFAULT_CADENCE_CONTROLS } from './cadence-controls';
import { logger } from './logger';

/**
 * Batch publish result
 */
export interface BatchPublishResult {
  totalGenerated: number;
  passedFilters: number;
  published: number;
  failed: number;
  publishedPosts: Array<{ slug: string; title: string; route: string }>;
  rejected: Array<{ title: string; reason: string }>;
  errors: Array<{ title: string; error: string }>;
}

/**
 * Batch publish blog posts with cadence controls
 */
export async function batchPublishBlogs(
  options: {
    category?: string;
    location?: string;
    maxIdeas?: number;
    cadenceControls?: Partial<CadenceControls>;
  } = {}
): Promise<BatchPublishResult> {
  logger.info('=== Batch Blog Publishing with Cadence Controls ===\n');

  // Merge cadence controls
  const controls: CadenceControls = {
    ...DEFAULT_CADENCE_CONTROLS,
    ...options.cadenceControls,
  };

  // Check daily limit
  const dailyLimit = await checkDailyLimit(controls);
  if (!dailyLimit.withinLimit) {
    logger.warn(
      `Daily limit reached: ${dailyLimit.countToday}/${dailyLimit.limit} posts published today. Skipping batch publish.`
    );
    return {
      totalGenerated: 0,
      passedFilters: 0,
      published: 0,
      failed: 0,
      publishedPosts: [],
      rejected: [],
      errors: [],
    };
  }

  logger.info(`Daily limit: ${dailyLimit.countToday}/${dailyLimit.limit} posts published today\n`);

  // Step 1: Generate ideas
  logger.info('Step 1: Generating blog ideas...');
  logger.info(`  Category: ${options.category || 'all'}`);
  logger.info(`  Location: ${options.location || 'all'}`);
  logger.info(`  Max ideas to generate: ${options.maxIdeas || 50}`);

  const allIdeas = await generateBlogIdeas({
    category: options.category || 'fishing-tips',
    location: options.location,
    maxIdeas: options.maxIdeas || 50,
    minSearchVolume: controls.minSearchVolume || 10,
    maxDifficulty: controls.maxKeywordDifficulty || 70,
  });

  logger.info(`Generated ${allIdeas.length} blog ideas\n`);

  // Step 2: Apply cadence controls
  logger.info('Step 2: Applying cadence controls...');
  logger.info(`  Min opportunity score: ${controls.minOpportunityScore}`);
  logger.info(`  Allowed intents: ${controls.allowedIntents.join(', ')}`);
  logger.info(`  Max posts per run: ${controls.maxPostsPerRun}`);
  if (controls.allowedCategories) {
    logger.info(`  Allowed categories: ${controls.allowedCategories.join(', ')}`);
  }

  const { passed: filteredIdeas, rejected } = filterIdeasByCadence(allIdeas, controls);

  logger.info(`\n✅ ${filteredIdeas.length} ideas passed cadence controls`);
  logger.info(`❌ ${rejected.length} ideas rejected\n`);

  if (filteredIdeas.length === 0) {
    logger.warn('No ideas passed cadence controls. Batch publish cancelled.');
    return {
      totalGenerated: allIdeas.length,
      passedFilters: 0,
      published: 0,
      failed: 0,
      publishedPosts: [],
      rejected: rejected.map((r) => ({ title: r.idea.title, reason: r.reason })),
      errors: [],
    };
  }

  // Step 3: Publish each idea
  logger.info('Step 3: Publishing posts...\n');
  const publishedPosts: Array<{ slug: string; title: string; route: string }> = [];
  const errors: Array<{ title: string; error: string }> = [];

  for (let i = 0; i < filteredIdeas.length; i++) {
    const idea = filteredIdeas[i];
    logger.info(`[${i + 1}/${filteredIdeas.length}] Publishing: ${idea.title}`);

    try {
      // Check if already exists
      const topicKey = `blog::${idea.slug}`;
      if (await topicKeyExists(topicKey)) {
        logger.warn(`  ⚠️  Already exists, skipping`);
        errors.push({
          title: idea.title,
          error: 'Post already exists',
        });
        continue;
      }

      // Convert to brief
      const brief = await blogIdeaToBrief(idea);

      // Generate post
      const doc = await generateBlogPost(brief);

      // Validate
      const validation = validateDoc(doc);
      if (!validation.passed) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Quality Gate (runs automatically in publisher, but check here for early feedback)
      const { runQualityGate } = await import('./quality-gate');
      const qualityGate = runQualityGate(doc);
      if (qualityGate.blocked) {
        throw new Error(`Quality gate BLOCKED: ${qualityGate.errors.join('; ')}`);
      }
      if (qualityGate.warnings.length > 0) {
        logger.warn(`Quality gate warnings for "${doc.title}":`, qualityGate.warnings);
      }

      // Publish
      const { routePath, slug } = await publishDoc(doc);
      publishedPosts.push({
        slug,
        title: doc.title,
        route: routePath,
      });

      logger.info(`  ✅ Published: ${routePath}\n`);

      // Check daily limit again (in case we hit it mid-batch)
      const currentLimit = await checkDailyLimit(controls);
      if (!currentLimit.withinLimit) {
        logger.warn(`Daily limit reached. Stopping batch publish.`);
        break;
      }
    } catch (error) {
      const errorMessage = error instanceof PublishError ? error.message : error instanceof Error ? error.message : 'Unknown error';
      logger.error(`  ❌ Failed: ${errorMessage}`);
      errors.push({
        title: idea.title,
        error: errorMessage,
      });
    }
  }

  // Summary
  logger.info('\n=== Batch Publish Summary ===');
  logger.info(`Total ideas generated: ${allIdeas.length}`);
  logger.info(`Passed cadence controls: ${filteredIdeas.length}`);
  logger.info(`Successfully published: ${publishedPosts.length}`);
  logger.info(`Failed: ${errors.length}`);
  logger.info(`Rejected by filters: ${rejected.length}`);

  return {
    totalGenerated: allIdeas.length,
    passedFilters: filteredIdeas.length,
    published: publishedPosts.length,
    failed: errors.length,
    publishedPosts,
    rejected: rejected.map((r) => ({ title: r.idea.title, reason: r.reason })),
    errors,
  };
}
