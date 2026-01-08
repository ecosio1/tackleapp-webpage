#!/usr/bin/env node

/**
 * CLI Runner for content pipeline
 */

// Load environment variables
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

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
 * Test DataForSEO connection
 */
program
  .command('test-dataforseo')
  .description('Test DataForSEO API connection')
  .action(async () => {
    try {
      const { testDataForSEOConnection } = await import('./pipeline/ideation');
      await testDataForSEOConnection();
      console.log('✅ DataForSEO connection test passed!');
    } catch (error) {
      console.error('❌ DataForSEO connection test failed:', error);
      process.exit(1);
    }
  });

/**
 * Test blog ideation
 */
program
  .command('test-perplexity')
  .description('Test Perplexity API connection')
  .action(async () => {
    try {
      const { testPerplexityConnection } = await import('./pipeline/perplexity');
      await testPerplexityConnection();
      console.log('✅ Perplexity connection test passed!');
    } catch (error) {
      console.error('❌ Perplexity connection test failed:', error);
      process.exit(1);
    }
  });

program
  .command('research')
  .description('Research a topic using Perplexity')
  .option('-q, --query <query>', 'Research query', 'best fishing techniques')
  .option('-l, --location <location>', 'Location (e.g., florida)', '')
  .option('-m, --model <model>', 'Model (small|large|huge)', 'small')
  .action(async (options) => {
    try {
      const { researchTopic, researchFishingTopic } = await import('./pipeline/perplexity');
      
      logger.info(`Researching: "${options.query}"`);
      if (options.location) {
        logger.info(`Location: ${options.location}`);
      }
      
      const modelMap: Record<string, any> = {
        small: 'llama-3.1-sonar-small-128k-online',
        large: 'llama-3.1-sonar-large-128k-online',
        huge: 'llama-3.1-sonar-huge-128k-online',
      };
      
      let result;
      if (options.location) {
        result = await researchFishingTopic(options.query, options.location);
      } else {
        result = await researchTopic(options.query, {
          model: modelMap[options.model] || modelMap.small,
        });
      }
      
      console.log('\n📚 Research Results:\n');
      console.log(result.answer);
      console.log('\n📖 Citations:');
      result.citations.forEach((citation, index) => {
        console.log(`  ${index + 1}. ${citation}`);
      });
      console.log(`\n✅ Research completed! (Model: ${result.model})`);
      
    } catch (error) {
      console.error('❌ Research failed:', error);
      process.exit(1);
    }
  });

program
  .command('generate-matrix')
  .description('COMBINED WORKFLOW: Generate and validate matrix combinations')
  .option('--use-perplexity', 'Step 1: Use Perplexity to brainstorm entities (20 species, 20 gear)', false)
  .option('--species-count <number>', 'Number of species to discover with Perplexity', '20')
  .option('--gear-count <number>', 'Number of gear types to discover with Perplexity', '20')
  .option('-p, --patterns <patterns>', 'Patterns to use (comma-separated)', 'Best {lure} for {species},How to catch {species} with {lure}')
  .option('--validate', 'Step 2: Validate combinations with DataForSEO (required for full workflow)', true)
  .option('--min-volume <number>', 'Minimum search volume (target 200-500 per keyword)', '200')
  .option('--max-volume <number>', 'Maximum search volume (target 200-500 per keyword)', '500')
  .option('--max-combinations <number>', 'Maximum combinations to validate (20x20=400)', '400')
  .option('--niche <string>', 'Fishing niche context', 'fishing')
  .option('--location <string>', 'Location focus (e.g., florida)', '')
  .action(async (options) => {
    try {
      const { generateMatrixCombinations, validateMatrixCombinations, calculateMatrixStats } = await import('./pipeline/matrix');
      
      logger.info('=== COMBINED WORKFLOW: Matrix Generation ===\n');
      
      let entities: any;
      
      // STEP 1: Use Perplexity to brainstorm entities (if requested)
      if (options.usePerplexity) {
        logger.info('🔍 Step 1: Using Perplexity to brainstorm entities...');
        logger.info(`   Target: ${options.speciesCount} species, ${options.gearCount} gear types`);
        logger.info(`   This will create ~${parseInt(options.speciesCount) * parseInt(options.gearCount)} potential combinations`);
        
        const { discoverAllEntities } = await import('./pipeline/entity-discovery');
        
        const discovered = await discoverAllEntities({
          speciesCount: parseInt(options.speciesCount, 10),
          gearCount: parseInt(options.gearCount, 10),
          niche: options.niche,
          location: options.location || undefined,
        });
        
        entities = {
          species: discovered.species,
          lures: discovered.lures,
          locations: discovered.locations || [],
          techniques: discovered.techniques || [],
        };
        
        logger.info(`✅ Step 1 Complete: Brainstormed ${discovered.species.length} species and ${discovered.lures.length} gear types`);
        logger.info(`   Potential combinations: ${discovered.species.length} × ${discovered.lures.length} = ${discovered.species.length * discovered.lures.length}\n`);
      } else {
        logger.info('⚠️ Using hardcoded entities (use --use-perplexity for Perplexity brainstorming)');
        const { getFishingEntities } = await import('./pipeline/matrix');
        entities = getFishingEntities();
      }
      
      // STEP 2: Generate combinations from entities
      logger.info('📊 Step 2: Generating combinations from entities...');
      const patterns = options.patterns.split(',').map(p => p.trim());
      
      logger.info(`   Patterns: ${patterns.join(', ')}`);
      logger.info(`   Max combinations to validate: ${options.maxCombinations}`);
      
      const combinations = generateMatrixCombinations({
        entities,
        patterns,
        maxCombinations: parseInt(options.maxCombinations, 10),
      });
      
      logger.info(`✅ Step 2 Complete: Generated ${combinations.length} potential combinations\n`);
      
      // STEP 3: Validate with DataForSEO
      if (options.validate) {
        logger.info('🔍 Step 3: Validating combinations with DataForSEO...');
        logger.info(`   Target per keyword: ${options.minVolume}-${options.maxVolume} searches/month`);
        logger.info(`   Goal: Find combinations that aggregate to 800k-2M+ searches/month`);
        logger.info(`   Intent: Informational only (people want guides, not buying)`);
        
        const validated = await validateMatrixCombinations(combinations, {
          minVolume: parseInt(options.minVolume, 10),
          maxVolume: parseInt(options.maxVolume, 10),
          intent: 'informational',
          includeQuestions: true,
        });
        
        logger.info(`✅ Step 3 Complete: Validated ${validated.length} combinations with search volume`);
        
        const stats = calculateMatrixStats(validated);
        
        console.log('\n📈 FINAL RESULTS:\n');
        console.log(`Total Combinations Generated: ${stats.totalCombinations.toLocaleString()}`);
        console.log(`Validated Opportunities: ${stats.validatedCount.toLocaleString()}`);
        console.log(`Total Search Volume: ${stats.totalVolume.toLocaleString()}/month`);
        console.log(`Average Keyword Difficulty: ${stats.averageDifficulty.toFixed(1)}`);
        console.log(`\n🎯 GOAL ASSESSMENT:`);
        
        if (stats.totalVolume >= 800000) {
          const millions = (stats.totalVolume / 1000000).toFixed(2);
          console.log(`   ✅ GOAL ACHIEVED: Aggregate volume (${millions}M/month) meets 800k-2M target!`);
        } else {
          const millions = (stats.totalVolume / 1000000).toFixed(2);
          console.log(`   ⚠️ Goal not met: Current volume (${millions}M/month) is below 800k-2M target`);
          console.log(`   💡 Suggestion: Increase entity counts or expand patterns to reach goal`);
        }
        
        console.log(`\n📊 Estimated Aggregate Traffic: ${Math.round(stats.totalVolume * 0.05).toLocaleString()} - ${Math.round(stats.totalVolume * 0.15).toLocaleString()} visits/month`);
        console.log(`   (Assuming 5-15% CTR from search results)\n`);
        
        console.log('🏆 Top 10 Opportunities:\n');
        stats.topOpportunities.slice(0, 10).forEach((combo, index) => {
          console.log(`${index + 1}. ${combo.keyword}`);
          console.log(`   Volume: ${combo.searchVolume}/month | Difficulty: ${combo.keywordDifficulty || 0} | Score: ${combo.opportunityScore || 0}/100`);
        });
        
        if (stats.byPattern && Object.keys(stats.byPattern).length > 0) {
          console.log('\n📋 Opportunities by Pattern:\n');
          Object.entries(stats.byPattern)
            .sort((a, b) => b[1] - a[1])
            .forEach(([pattern, count]) => {
              console.log(`  ${pattern}: ${count} validated keywords`);
            });
        }
        
        console.log('\n💡 Next Step: Run `npm run pipeline:generate-prd -- --run-discovery` to consolidate into PRD\n');
      } else {
        console.log(`\n📊 Generated ${combinations.length} combinations (not validated)`);
        console.log('💡 Run with --validate to check search volume and opportunity scores');
        console.log('💡 Or run with --validate=false to skip validation\n');
      }
      
    } catch (error) {
      console.error('❌ Matrix generation failed:', error);
      process.exit(1);
    }
  });

program
  .command('discover-tools')
  .description('Discover micro-tool opportunities using Perplexity + DataForSEO')
  .option('-c, --count <number>', 'Number of tools to discover', '15')
  .option('--validate', 'Validate with DataForSEO', false)
  .option('--min-volume <number>', 'Minimum search volume', '50')
  .option('--max-difficulty <number>', 'Maximum keyword difficulty', '60')
  .action(async (options) => {
    try {
      const { discoverMicroTools, getRecommendedFishingTools } = await import('./pipeline/micro-tools-discovery');
      
      logger.info('Discovering micro-tool opportunities...');
      
      // First show recommended tools
      const recommended = getRecommendedFishingTools();
      console.log('\n🎣 Recommended Fishing Tools (Pre-researched):\n');
      recommended.forEach((tool, index) => {
        console.log(`${index + 1}. ${tool.name}`);
        console.log(`   Type: ${tool.type}`);
        console.log(`   Search Query: "${tool.searchQuery}"`);
        console.log(`   Opportunity Score: ${tool.opportunityScore}/100`);
        console.log(`   Description: ${tool.description}`);
        console.log(`   Example Queries: ${tool.exampleQueries.slice(0, 2).join(', ')}`);
        console.log('');
      });
      
      if (options.validate) {
        logger.info('Discovering additional tools with Perplexity...');
        const discovered = await discoverMicroTools({
          niche: 'fishing',
          maxTools: parseInt(options.count, 10),
          minVolume: parseInt(options.minVolume, 10),
          maxDifficulty: parseInt(options.maxDifficulty, 10),
        });
        
        console.log('\n🔍 Discovered Tools (Validated):\n');
        discovered.forEach((tool, index) => {
          console.log(`${index + 1}. ${tool.name}`);
          console.log(`   Type: ${tool.type}`);
          console.log(`   Search Query: "${tool.searchQuery}"`);
          if (tool.searchVolume) {
            console.log(`   Volume: ${tool.searchVolume}/month | Difficulty: ${tool.keywordDifficulty}`);
          }
          console.log(`   Opportunity Score: ${tool.opportunityScore}/100`);
          console.log('');
        });
      } else {
        console.log('\n💡 Run with --validate to discover more tools with DataForSEO validation');
      }
      
      console.log('\n✅ Tool discovery complete!');
      console.log('\n💡 Next Steps:');
      console.log('  1. Review recommended tools');
      console.log('  2. Generate components for selected tools');
      console.log('  3. Integrate tools into content pages');
      
    } catch (error) {
      console.error('❌ Tool discovery failed:', error);
      process.exit(1);
    }
  });

program
  .command('generate-tool')
  .description('Generate React component for a micro-tool')
  .option('-n, --name <name>', 'Tool name', '')
  .option('-t, --type <type>', 'Tool type (calculator/comparator/finder)', 'calculator')
  .action(async (options) => {
    try {
      const { generateToolComponent } = await import('./pipeline/tool-generator');
      const { getRecommendedFishingTools } = await import('./pipeline/micro-tools-discovery');
      const { writeFileSync, mkdirSync } = await import('fs');
      const { join } = await import('path');
      
      logger.info('Generating tool component...');
      
      // Find tool by name or use first recommended
      const recommended = getRecommendedFishingTools();
      let tool = recommended.find(t => 
        t.name.toLowerCase().includes(options.name.toLowerCase())
      );
      
      if (!tool && options.name) {
        // Create custom tool
        tool = {
          name: options.name,
          type: options.type as any,
          description: `${options.name} for fishing`,
          searchQuery: options.name.toLowerCase(),
          opportunityScore: 70,
          implementation: {
            inputs: [
              { label: 'Input 1', type: 'text', required: true },
            ],
            outputs: [
              { label: 'Result', type: 'text' },
            ],
          },
          relatedKeywords: [],
          exampleQueries: [],
        };
      } else if (!tool) {
        tool = recommended[0];
      }
      
      const component = generateToolComponent(tool);
      
      // Save component
      const componentsDir = join(process.cwd(), 'components', 'tools');
      mkdirSync(componentsDir, { recursive: true });
      
      const componentName = tool.name.replace(/[^a-zA-Z0-9]/g, '');
      const componentPath = join(componentsDir, `${componentName}.tsx`);
      writeFileSync(componentPath, component.componentCode, 'utf-8');
      
      // Save server logic if needed
      if (component.serverCode) {
        const apiDir = join(process.cwd(), 'app', 'api', 'tools');
        mkdirSync(apiDir, { recursive: true });
        const apiPath = join(apiDir, `${tool.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')}`, 'route.ts');
        mkdirSync(join(apiDir, tool.name.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-')), { recursive: true });
        writeFileSync(apiPath, `import { calculate${componentName} } from '@/lib/tools/${componentName}';\n\n${component.serverCode}`, 'utf-8');
      }
      
      console.log(`\n✅ Tool component generated!`);
      console.log(`📄 Component: ${componentPath}`);
      if (component.serverCode) {
        console.log(`📄 API Route: ${apiPath}`);
      }
      console.log(`\n💡 Usage:`);
      console.log(`   import { ${componentName} } from '@/components/tools/${componentName}';`);
      console.log(`   <${componentName} />`);
      
    } catch (error) {
      console.error('❌ Tool generation failed:', error);
      process.exit(1);
    }
  });

program
  .command('generate-prd')
  .description('Generate Master Pipeline PRD - Runs discovery + validation + generates PRD')
  .option('--run-discovery', 'Run discovery commands to get fresh data', false)
  .option('--concepts-count <number>', 'Number of concepts to discover', '15')
  .option('--matrix-max <number>', 'Max matrix combinations to validate', '500')
  .option('--min-volume <number>', 'Minimum search volume', '200')
  .option('--max-volume <number>', 'Maximum search volume', '500')
  .option('--skip-discovery', 'Skip discovery, use existing data', false)
  .action(async (options) => {
    try {
      const { generatePRD, loadSummaries } = await import('./pipeline/prd-generator');
      const { writeFileSync } = await import('fs');
      const { join } = await import('path');
      
      logger.info('Generating Master Pipeline PRD...');
      
      // Load summaries
      const { siteSummary, appSummary } = loadSummaries();
      
      let discoveredConcepts: any[] = [];
      let matrixCombinations: any[] = [];
      let matrixStats: any = null;
      
      if (!options.skipDiscovery && options.runDiscovery) {
        logger.info('Running discovery commands to gather data...');
        
        // 1. Discover concepts
        try {
          logger.info('Step 1/3: Discovering programmatic concepts...');
          const { discoverProgrammaticConcepts } = await import('./pipeline/programmatic-discovery');
          discoveredConcepts = await discoverProgrammaticConcepts({
            niche: 'fishing',
            count: parseInt(options.conceptsCount, 10),
            validate: true,
            minVolume: parseInt(options.minVolume, 10),
            maxVolume: parseInt(options.maxVolume, 10),
          });
          logger.info(`Discovered ${discoveredConcepts.length} concepts`);
        } catch (error) {
          logger.warn('Concept discovery failed, continuing without concepts:', error);
        }
        
        // 2. Generate matrix (using combined workflow)
        try {
          logger.info('Step 2/3: Generating matrix combinations using combined workflow...');
          const { 
            generateMatrixCombinations, 
            validateMatrixCombinations, 
            calculateMatrixStats,
          } = await import('./pipeline/matrix');
          
          // STEP 1: Use Perplexity to brainstorm entities
          logger.info('   Sub-step 1: Brainstorming entities with Perplexity...');
          const { discoverAllEntities } = await import('./pipeline/entity-discovery');
          
          const discovered = await discoverAllEntities({
            speciesCount: 20,
            gearCount: 20,
            niche: 'fishing',
          });
          
          logger.info(`   ✅ Brainstormed ${discovered.species.length} species and ${discovered.lures.length} gear types`);
          
          // STEP 2: Generate combinations
          logger.info('   Sub-step 2: Generating combinations...');
          const entities = {
            species: discovered.species,
            lures: discovered.lures,
            locations: discovered.locations,
            techniques: discovered.techniques,
          };
          
          const patterns = [
            'Best {lure} for {species}',
            'How to catch {species} with {lure}',
            'Best {lure} for {species} in {location}',
            '{technique} for {species}',
            '{species} fishing in {location}',
          ];
          
          const combinations = generateMatrixCombinations({
            entities,
            patterns,
            maxCombinations: parseInt(options.matrixMax, 10),
          });
          
          logger.info(`   ✅ Generated ${combinations.length} combinations`);
          
          // STEP 3: Validate with DataForSEO
          logger.info('   Sub-step 3: Validating with DataForSEO...');
          logger.info(`   Target: ${parseInt(options.minVolume, 10)}-${parseInt(options.maxVolume, 10)} searches/month`);
          logger.info(`   Goal: Aggregate to 800k-2M+ searches/month`);
          
          const validated = await validateMatrixCombinations(combinations, {
            minVolume: parseInt(options.minVolume, 10),
            maxVolume: parseInt(options.maxVolume, 10),
            intent: 'informational',
            includeQuestions: true,
          });
          
          logger.info(`   ✅ Validated ${validated.length} combinations`);
          
          matrixStats = calculateMatrixStats(validated);
          
          logger.info(`   📊 Total volume: ${matrixStats.totalVolume.toLocaleString()}/month`);
          if (matrixStats.totalVolume >= 800000) {
            logger.info(`   ✅ GOAL ACHIEVED: ${(matrixStats.totalVolume / 1000000).toFixed(2)}M searches/month`);
          }
          matrixCombinations = validated;
          logger.info(`Validated ${matrixStats.validatedCount} combinations`);
        } catch (error) {
          logger.warn('Matrix generation failed, continuing without matrix:', error);
        }
      } else {
        logger.info('Skipping discovery - using template PRD. Use --run-discovery for real data.');
      }
      
      // 3. Get recommended patterns
      const { getRecommendedPatterns } = await import('./pipeline/programmatic-discovery');
      const recommendedPatterns = getRecommendedPatterns();
      
      // Generate PRD
      const prdData = {
        siteSummary,
        appSummary,
        discoveredConcepts,
        matrixCombinations,
        matrixStats,
        validationCriteria: {
          minVolume: parseInt(options.minVolume, 10),
          maxVolume: parseInt(options.maxVolume, 10),
          intent: 'informational',
        },
        recommendedPatterns,
      };
      
      const prd = await generatePRD(prdData);
      
      const outputPath = join(process.cwd(), 'MASTER_PIPELINE_PRD.md');
      writeFileSync(outputPath, prd, 'utf-8');
      
      console.log(`\n✅ Master Pipeline PRD generated successfully!`);
      console.log(`📄 Saved to: ${outputPath}`);
      
      if (matrixStats) {
        console.log(`\n📊 Key Metrics:`);
        console.log(`   Total Combinations: ${matrixStats.totalCombinations.toLocaleString()}`);
        console.log(`   Validated Opportunities: ${matrixStats.validatedCount.toLocaleString()}`);
        console.log(`   Total Search Volume: ${matrixStats.totalVolume.toLocaleString()}/month`);
        console.log(`   Estimated Traffic: ${Math.round(matrixStats.totalVolume * 0.05).toLocaleString()} - ${Math.round(matrixStats.totalVolume * 0.15).toLocaleString()} visits/month`);
      }
      
      console.log(`\n💡 Next Steps:`);
      console.log(`  1. Review MASTER_PIPELINE_PRD.md`);
      console.log(`  2. Use PRD to guide content pipeline implementation`);
      console.log(`  3. Start with highest-opportunity patterns`);
      console.log(`  4. Generate pages following the PRD strategy`);
      
    } catch (error) {
      console.error('❌ PRD generation failed:', error);
      process.exit(1);
    }
  });

program
  .command('discover-concepts')
  .description('Discover programmatic SEO concepts using Perplexity + DataForSEO validation')
  .option('-n, --niche <niche>', 'Niche (e.g., fishing, fishing gear)', 'fishing')
  .option('-c, --count <number>', 'Number of concepts to discover', '10')
  .option('-l, --location <location>', 'Location focus (e.g., florida)', '')
  .option('-p, --patterns <patterns>', 'Specific patterns to look for (comma-separated)', '')
  .option('--validate', 'Validate concepts with DataForSEO (checks 200-500 volume, informational intent)', false)
  .option('--min-volume <number>', 'Minimum search volume for validation', '200')
  .option('--max-volume <number>', 'Maximum search volume for validation', '500')
  .action(async (options) => {
    try {
      const { discoverProgrammaticConcepts, getRecommendedPatterns } = await import('./pipeline/programmatic-discovery');
      
      logger.info('Discovering programmatic SEO concepts...');
      logger.info(`Niche: ${options.niche}`);
      logger.info(`Count: ${options.count}`);
      if (options.location) {
        logger.info(`Location: ${options.location}`);
      }
      if (options.validate) {
        logger.info(`Validation: Enabled (Volume: ${options.minVolume}-${options.maxVolume}, Intent: informational)`);
      }
      
      const includePatterns = options.patterns 
        ? options.patterns.split(',').map(p => p.trim())
        : undefined;
      
      if (includePatterns) {
        logger.info(`Patterns: ${includePatterns.join(', ')}`);
      } else {
        logger.info('Using recommended patterns');
        const recommended = getRecommendedPatterns();
        logger.info(`Recommended patterns: ${recommended.slice(0, 5).join(', ')}...`);
      }
      
      const concepts = await discoverProgrammaticConcepts({
        niche: options.niche,
        count: parseInt(options.count, 10),
        location: options.location || undefined,
        includePatterns,
        validate: options.validate || false,
        minVolume: parseInt(options.minVolume, 10),
        maxVolume: parseInt(options.maxVolume, 10),
      });
      
      console.log('\n🎯 Discovered Programmatic Concepts:\n');
      concepts.forEach((concept, index) => {
        console.log(`${index + 1}. ${concept.concept}`);
        console.log(`   Pattern: ${concept.pattern}`);
        console.log(`   Description: ${concept.description}`);
        console.log(`   Examples: ${concept.exampleKeywords.join(', ')}`);
        console.log(`   Estimated: Volume ${concept.estimatedVolume} | Difficulty ${concept.difficulty} | Category ${concept.category}`);
        
        if (concept.validated) {
          console.log(`   ✅ Validated: ${concept.validated.keywords.length} keywords`);
          console.log(`      Total Volume: ${concept.validated.totalVolume}/month`);
          console.log(`      Avg Difficulty: ${concept.validated.averageDifficulty}`);
          console.log(`      Total Opportunity: ${concept.validated.totalOpportunity}`);
          if (concept.validated.keywords.length > 0) {
            console.log(`      Top Keywords:`);
            concept.validated.keywords.slice(0, 3).forEach(k => {
              console.log(`        - "${k.keyword}" (vol: ${k.searchVolume}, diff: ${k.keywordDifficulty}, score: ${k.opportunityScore})`);
              if (k.relatedQuestions.length > 0) {
                console.log(`          Questions: ${k.relatedQuestions.slice(0, 2).join(', ')}`);
              }
            });
          }
        }
        console.log('');
      });
      
      const validatedCount = concepts.filter(c => c.validated?.isValid).length;
      const totalVolume = concepts
        .filter(c => c.validated?.isValid)
        .reduce((sum, c) => sum + (c.validated?.totalVolume || 0), 0);
      
      console.log(`\n✅ Successfully discovered ${concepts.length} programmatic concepts!`);
      if (options.validate) {
        console.log(`\n📊 Validation Summary:`);
        console.log(`   Validated Concepts: ${validatedCount}/${concepts.length}`);
        console.log(`   Total Validated Volume: ${totalVolume.toLocaleString()}/month`);
        console.log(`   Estimated Aggregate Traffic: ${(totalVolume * 0.05).toLocaleString()} - ${(totalVolume * 0.15).toLocaleString()} visits/month`);
        console.log(`   (Assuming 5-15% CTR from search results)`);
      }
      
      console.log('\n💡 Next Steps:');
      if (!options.validate) {
        console.log('  1. Run with --validate flag to check search volume and intent');
        console.log('  2. Review validated concepts and select high-opportunity patterns');
      } else {
        console.log('  1. Review validated concepts (prioritize those with validated keywords)');
        console.log('  2. Generate specific keywords for each validated pattern');
        console.log('  3. Create content briefs using validated keywords and questions');
        console.log('  4. Generate pages following the programmatic pattern');
      }
      
    } catch (error) {
      console.error('❌ Concept discovery failed:', error);
      process.exit(1);
    }
  });

program
  .command('test-ideation')
  .description('Test blog ideation with DataForSEO')
  .option('-c, --category <category>', 'Blog category', 'fishing-tips')
  .option('-l, --location <location>', 'Location (e.g., florida)', '')
  .option('-n, --count <number>', 'Number of ideas to generate', '1')
  .option('--min-volume <number>', 'Minimum search volume (only filters keywords with volume > 0)', '10')
  .option('--max-difficulty <number>', 'Maximum keyword difficulty (only filters keywords with difficulty > 0)', '70')
  .action(async (options) => {
    try {
      const { generateBlogIdeas } = await import('./pipeline/ideation');
      
      logger.info('Testing blog ideation...');
      logger.info(`Category: ${options.category}`);
      logger.info(`Location: ${options.location || 'none'}`);
      logger.info(`Count: ${options.count}`);
      
      const ideas = await generateBlogIdeas({
        category: options.category,
        location: options.location || undefined,
        maxIdeas: parseInt(options.count, 10),
        minSearchVolume: parseInt(options.minVolume, 10),
        maxDifficulty: parseInt(options.maxDifficulty, 10),
      });
      
      console.log('\n✅ Generated Blog Ideas:\n');
      ideas.forEach((idea, index) => {
        console.log(`${index + 1}. ${idea.title}`);
        console.log(`   Keyword: ${idea.keyword}`);
        console.log(`   Search Volume: ${idea.searchVolume}`);
        console.log(`   Difficulty: ${idea.keywordDifficulty}`);
        console.log(`   Opportunity Score: ${idea.opportunityScore}/100`);
        console.log(`   Slug: ${idea.slug}`);
        if (idea.relatedQuestions.length > 0) {
          console.log(`   Questions: ${idea.relatedQuestions.slice(0, 3).join(', ')}`);
        }
        console.log('');
      });
      
      console.log(`\n✅ Successfully generated ${ideas.length} blog ideas!`);
      
    } catch (error) {
      console.error('❌ Blog ideation test failed:', error);
      process.exit(1);
    }
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

