#!/usr/bin/env node

/**
 * CLI Runner for content pipeline
 */

import { Command } from 'commander';
import { logger } from './pipeline/logger';
import {
  getNextJob,
  updateJobStatus,
  addJob,
  calculatePriority,
  canPublishToday,
  checkConsecutiveFailures,
} from './pipeline/scheduler';
import { generateTopicKey, buildBrief } from './pipeline/briefBuilder';
import { generateBlogPost } from './pipeline/generators/blog';
import { generateSpecies } from './pipeline/generators/species';
import { generateHowTo } from './pipeline/generators/howto';
import { generateLocation } from './pipeline/generators/location';
import { validateDoc } from './pipeline/validator';
import { publishDoc } from './pipeline/publisher';
import { topicKeyExists, resolveSlugCollision } from './pipeline/dedupe';
import { PageType } from './pipeline/types';
import { DEFAULT_REVALIDATE_ENDPOINT, DEFAULT_REVALIDATE_SECRET_NAME } from './pipeline/config';

const program = new Command();

program
  .name('content-pipeline')
  .description('Automated content publishing pipeline for Tackle')
  .version('1.0.0');

/**
 * Seed command - Create initial jobs
 */
program
  .command('seed')
  .description('Seed job queue with initial content')
  .option('-t, --type <type>', 'Content type (blog|species|how-to|location)', 'blog')
  .option('-c, --count <number>', 'Number of jobs to create', '20')
  .action(async (options) => {
    const type = options.type as PageType;
    const count = parseInt(options.count, 10);
    
    logger.info(`Seeding ${count} ${type} jobs...`);
    
    // Example seed data (replace with actual topic generation logic)
    for (let i = 0; i < count; i++) {
      const topicKey = generateTopicKey(type, {
        blog: `topic-${i}`,
        species: `species-${i}`,
        howTo: `howto-${i}`,
        state: 'florida',
        city: `city-${i}`,
      });
      
      const priority = calculatePriority(type, topicKey);
      
      await addJob({
        type,
        topicKey,
        priority,
        maxAttempts: 3,
        scheduledAt: new Date().toISOString(),
      });
    }
    
    logger.info(`Seeded ${count} jobs`);
  });

/**
 * Run command - Process jobs
 */
program
  .command('run')
  .description('Run pending jobs from queue')
  .option('-l, --limit <number>', 'Maximum jobs to process', '5')
  .action(async (options) => {
    const limit = parseInt(options.limit, 10);
    
    // Check consecutive failures
    const failures = await checkConsecutiveFailures();
    if (failures >= 3) {
      logger.error('Too many consecutive failures - stopping pipeline');
      process.exit(1);
    }
    
    logger.info(`Processing up to ${limit} jobs...`);
    
    let processed = 0;
    while (processed < limit) {
      // Check daily cap
      if (!(await canPublishToday())) {
        logger.warn('Daily publish cap reached');
        break;
      }
      
      const job = await getNextJob();
      if (!job) {
        logger.info('No pending jobs');
        break;
      }
      
      await updateJobStatus(job.jobId, 'running');
      logger.info(`Processing job: ${job.jobId} (${job.type}:${job.topicKey})`);
      
      try {
        // Process job (simplified - implement full pipeline)
        await processJob(job);
        
        await updateJobStatus(job.jobId, 'completed', undefined, {
          slug: job.topicKey.split('::')[1] || '',
        });
        
        processed++;
      } catch (error) {
        logger.error(`Job failed: ${job.jobId}`, error);
        await updateJobStatus(job.jobId, 'failed', (error as Error).message);
      }
    }
    
    logger.info(`Processed ${processed} jobs`);
  });

/**
 * Publish command - Force publish a specific topic
 */
program
  .command('publish')
  .description('Force publish a specific topic')
  .requiredOption('-k, --topicKey <key>', 'Topic key to publish')
  .action(async (options) => {
    const topicKey = options.topicKey;
    logger.info(`Force publishing: ${topicKey}`);
    
    // Check if topic exists
    if (await topicKeyExists(topicKey)) {
      logger.warn(`Topic already exists: ${topicKey}`);
      return;
    }
    
    // Create and process job
    const [type, ...identifiers] = topicKey.split('::');
    const job = await addJob({
      type: type as PageType,
      topicKey,
      priority: 10,
      maxAttempts: 1,
      scheduledAt: new Date().toISOString(),
    });
    
    await updateJobStatus(job.jobId, 'running');
    
    try {
      await processJob(job);
      await updateJobStatus(job.jobId, 'completed');
      logger.info(`Published: ${topicKey}`);
    } catch (error) {
      logger.error(`Publish failed: ${topicKey}`, error);
      await updateJobStatus(job.jobId, 'failed', (error as Error).message);
    }
  });

/**
 * Status command - Show queue status
 */
program
  .command('status')
  .description('Show job queue status')
  .action(async () => {
    const scheduler = await import('./pipeline/scheduler');
    const jobs = await scheduler.loadJobQueue();
    
    const stats = {
      total: jobs.length,
      pending: jobs.filter((j) => j.status === 'pending').length,
      running: jobs.filter((j) => j.status === 'running').length,
      completed: jobs.filter((j) => j.status === 'completed').length,
      failed: jobs.filter((j) => j.status === 'failed').length,
    };
    
    console.log('Job Queue Status:');
    console.log(JSON.stringify(stats, null, 2));
  });

/**
 * Rebuild index command
 */
program
  .command('rebuild-index')
  .description('Rebuild content index from published files')
  .action(async () => {
    logger.info('Rebuilding content index...');
    // Implementation: scan content/ directory and rebuild index
    logger.info('Content index rebuilt');
  });

/**
 * Process a single job - Full pipeline
 */
async function processJob(job: any): Promise<void> {
  logger.info(`Processing job: ${job.jobId} (${job.type}:${job.topicKey})`);
  
  try {
    // 1. Parse topic key to get identifiers
    const [pageType, ...identifiers] = job.topicKey.split('::');
    
    // 2. Check if topic already exists
    if (await topicKeyExists(job.topicKey)) {
      logger.warn(`Topic already exists: ${job.topicKey}`);
      return;
    }
    
    // 3. Resolve slug collision
    const baseSlug = identifiers.join('-');
    const slug = await resolveSlugCollision(baseSlug, job.type);
    
    // 4. Fetch sources (placeholder - implement based on your sources)
    // For now, create mock facts
    const mockFacts = [
      {
        claim: 'Sample fact extracted from source',
        confidence: 0.8,
        supportingSources: ['https://example.com'],
        observedAt: new Date().toISOString(),
        scope: 'global' as const,
        category: 'habitat' as const,
      },
    ];
    
    const mockSources = [
      {
        label: 'Example Source',
        url: 'https://example.com',
        retrievedAt: new Date().toISOString(),
      },
    ];
    
    // 5. Build brief
    const brief = await buildBrief({
      pageType: job.type as PageType,
      topicKey: job.topicKey,
      slug,
      title: `Guide to ${slug.replace(/-/g, ' ')}`,
      primaryKeyword: slug.replace(/-/g, ' '),
      secondaryKeywords: [slug, job.type],
      facts: mockFacts,
      sources: mockSources,
    });
    
    // 6. Generate content based on type
    let doc;
    switch (job.type) {
      case 'blog':
        doc = await generateBlogPost(brief);
        break;
      case 'species':
        doc = await generateSpecies(brief);
        break;
      case 'how-to':
        doc = await generateHowTo(brief);
        break;
      case 'location':
        doc = await generateLocation(brief);
        break;
      default:
        throw new Error(`Unknown page type: ${job.type}`);
    }
    
    // 7. Validate
    const validation = validateDoc(doc);
    if (!validation.passed) {
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    
    // 8. Publish
    const { routePath } = await publishDoc(doc);
    
    // 9. Trigger revalidation
    await triggerRevalidation([routePath, `/${job.type}`]);
    
    logger.info(`Successfully published: ${routePath}`);
  } catch (error) {
    logger.error(`Job processing failed: ${job.jobId}`, error);
    throw error;
  }
}

// Trigger revalidation
async function triggerRevalidation(paths: string[]): Promise<void> {
  const secret = process.env[DEFAULT_REVALIDATE_SECRET_NAME] || process.env.REVALIDATION_SECRET;
  const endpoint = process.env.NEXT_PUBLIC_URL
    ? `${process.env.NEXT_PUBLIC_URL}${DEFAULT_REVALIDATE_ENDPOINT}`
    : `http://localhost:3000${DEFAULT_REVALIDATE_ENDPOINT}`;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${secret}`,
      },
      body: JSON.stringify({ paths }),
    });
    
    if (!response.ok) {
      throw new Error(`Revalidation failed: ${response.status}`);
    }
    
    logger.info(`Revalidated paths: ${paths.join(', ')}`);
  } catch (error) {
    logger.error('Revalidation error:', error);
  }
}

program.parse();

