/**
 * Publishing Metrics - Minimal Observability
 * Tracks publish success/fail counts, failure reasons, quarantined posts, and timing
 * 
 * ROLLING WINDOWS: Prevents unbounded growth by keeping only recent N items
 * - recentPublishes: Last 100 publishes (rolling window)
 * - recentFailures: Last 50 revalidation failures (rolling window)
 * - failuresByPath: Top 100 paths by failure count (keeps most problematic paths)
 * 
 * AGGREGATE COUNTERS: Unbounded numbers (fine - they're just integers)
 * - totalAttempts, totalSuccesses, totalFailures, etc.
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from './logger';

const METRICS_PATH = path.join(process.cwd(), 'content', '_system', 'publish-metrics.json');

export interface RevalidationMetrics {
  totalAttempts: number;
  totalSuccesses: number;
  totalFailures: number;
  failuresByPath: Record<string, number>; // Path -> failure count
  recentFailures: Array<{
    timestamp: string;
    paths: string[];
    error: string;
    retryAttempt: number;
  }>;
}

export interface PublishMetrics {
  version: string;
  lastUpdated: string;
  summary: {
    totalAttempts: number;
    totalSuccesses: number;
    totalFailures: number;
    totalQuarantined: number;
    averagePublishTimeMs: number;
  };
  failures: {
    validation: number;
    qualityGate: number;
    api: number;
    write: number;
    indexUpdate: number;
    other: number;
  };
  revalidation?: RevalidationMetrics; // Optional: revalidation metrics
  recentPublishes: Array<{
    timestamp: string;
    slug: string;
    pageType: string;
    status: 'success' | 'failure' | 'quarantined';
    durationMs: number;
    failureReason?: string;
    failureCode?: string;
  }>;
}

const DEFAULT_METRICS: PublishMetrics = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  summary: {
    totalAttempts: 0,
    totalSuccesses: 0,
    totalFailures: 0,
    totalQuarantined: 0,
    averagePublishTimeMs: 0,
  },
  failures: {
    validation: 0,
    qualityGate: 0,
    api: 0,
    write: 0,
    indexUpdate: 0,
    other: 0,
  },
  revalidation: {
    totalAttempts: 0,
    totalSuccesses: 0,
    totalFailures: 0,
    failuresByPath: {},
    recentFailures: [],
  },
  recentPublishes: [],
};

// Rolling window limits - prevent unbounded growth
const MAX_RECENT_PUBLISHES = 100; // Keep last 100 publishes
const MAX_RECENT_REVALIDATION_FAILURES = 50; // Keep last 50 revalidation failures
const MAX_FAILURES_BY_PATH = 100; // Keep top 100 paths by failure count

/**
 * Load metrics from file
 */
async function loadMetrics(): Promise<PublishMetrics> {
  try {
    const data = await fs.readFile(METRICS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or is invalid, return defaults
    return { ...DEFAULT_METRICS };
  }
}

/**
 * Save metrics to file
 * ATOMIC WRITE: temp file → verify → rename (prevents corruption if process killed mid-write)
 */
export async function saveMetrics(metrics: PublishMetrics): Promise<void> {
  const dir = path.dirname(METRICS_PATH);
  await fs.mkdir(dir, { recursive: true });
  
  // Atomic write: temp file → verify → rename
  const tempPath = `${METRICS_PATH}.tmp`;
  const jsonString = JSON.stringify(metrics, null, 2);
  
  // Validate JSON before writing
  JSON.parse(jsonString); // Verify it's valid JSON
  
  // Write to temp file first
  await fs.writeFile(tempPath, jsonString, 'utf-8');
  
  // Verify temp file was written correctly
  const written = await fs.readFile(tempPath, 'utf-8');
  if (written !== jsonString) {
    await fs.unlink(tempPath).catch(() => {}); // Clean up temp file
    throw new Error('Metrics write verification failed - written data does not match');
  }
  
  // Atomic rename (prevents corruption if process crashes)
  await fs.rename(tempPath, METRICS_PATH);
}

/**
 * Record a publish attempt
 */
export async function recordPublishAttempt(
  slug: string,
  pageType: string,
  status: 'success' | 'failure' | 'quarantined',
  durationMs: number,
  failureReason?: string,
  failureCode?: string
): Promise<void> {
  const metrics = await loadMetrics();
  
  // Update summary
  metrics.summary.totalAttempts++;
  if (status === 'success') {
    metrics.summary.totalSuccesses++;
  } else if (status === 'failure') {
    metrics.summary.totalFailures++;
    
    // Categorize failure
    const reason = failureReason?.toLowerCase() || '';
    const code = failureCode?.toLowerCase() || '';
    
    if (code.includes('validation') || reason.includes('validation') || reason.includes('required field')) {
      metrics.failures.validation++;
    } else if (code.includes('quality_gate') || reason.includes('quality gate')) {
      metrics.failures.qualityGate++;
    } else if (code.includes('api') || reason.includes('api') || reason.includes('fetch') || reason.includes('network')) {
      metrics.failures.api++;
    } else if (code.includes('write') || reason.includes('write') || reason.includes('file')) {
      metrics.failures.write++;
    } else if (code.includes('index') || reason.includes('index')) {
      metrics.failures.indexUpdate++;
    } else {
      metrics.failures.other++;
    }
  } else if (status === 'quarantined') {
    metrics.summary.totalQuarantined++;
  }
  
  // Update average publish time (only for successes)
  if (status === 'success') {
    const currentAvg = metrics.summary.averagePublishTimeMs;
    const successCount = metrics.summary.totalSuccesses;
    // Running average: newAvg = (oldAvg * (n-1) + newValue) / n
    metrics.summary.averagePublishTimeMs = 
      successCount === 1 
        ? durationMs 
        : (currentAvg * (successCount - 1) + durationMs) / successCount;
  }
  
  // Add to recent publishes (rolling window)
  metrics.recentPublishes.unshift({
    timestamp: new Date().toISOString(),
    slug,
    pageType,
    status,
    durationMs,
    failureReason,
    failureCode,
  });
  
  // Keep only recent publishes (rolling window - prevent unbounded growth)
  if (metrics.recentPublishes.length > MAX_RECENT_PUBLISHES) {
    metrics.recentPublishes = metrics.recentPublishes.slice(0, MAX_RECENT_PUBLISHES);
  }
  
  metrics.lastUpdated = new Date().toISOString();
  
  await saveMetrics(metrics);
}

/**
 * Get current metrics
 */
export async function getMetrics(): Promise<PublishMetrics> {
  return await loadMetrics();
}

/**
 * Reset metrics (for testing/maintenance)
 */
export async function resetMetrics(): Promise<void> {
  await saveMetrics({ ...DEFAULT_METRICS });
}

/**
 * Print metrics summary
 */
export function printMetricsSummary(metrics: PublishMetrics): void {
  console.log('\n📊 Publishing Metrics Summary\n');
  console.log('═'.repeat(60));
  
  // Summary
  console.log('\n📈 Overall Stats:');
  console.log(`   Total Attempts: ${metrics.summary.totalAttempts}`);
  console.log(`   ✅ Successes: ${metrics.summary.totalSuccesses}`);
  console.log(`   ❌ Failures: ${metrics.summary.totalFailures}`);
  console.log(`   🚫 Quarantined: ${metrics.summary.totalQuarantined}`);
  
  if (metrics.summary.totalSuccesses > 0) {
    const successRate = ((metrics.summary.totalSuccesses / metrics.summary.totalAttempts) * 100).toFixed(1);
    console.log(`   📊 Success Rate: ${successRate}%`);
  }
  
  if (metrics.summary.averagePublishTimeMs > 0) {
    console.log(`   ⏱️  Average Publish Time: ${Math.round(metrics.summary.averagePublishTimeMs)}ms (${(metrics.summary.averagePublishTimeMs / 1000).toFixed(2)}s)`);
  }
  
  // Failure breakdown
  if (metrics.summary.totalFailures > 0) {
    console.log('\n❌ Failure Breakdown:');
    console.log(`   Validation: ${metrics.failures.validation}`);
    console.log(`   Quality Gate: ${metrics.failures.qualityGate}`);
    console.log(`   API: ${metrics.failures.api}`);
    console.log(`   Write: ${metrics.failures.write}`);
    console.log(`   Index Update: ${metrics.failures.indexUpdate}`);
    console.log(`   Other: ${metrics.failures.other}`);
  }
  
  // Recent activity
  if (metrics.recentPublishes.length > 0) {
    console.log('\n📋 Recent Activity (last 10):');
    const recent = metrics.recentPublishes.slice(0, 10);
    recent.forEach((publish) => {
      const statusIcon = publish.status === 'success' ? '✅' : publish.status === 'quarantined' ? '🚫' : '❌';
      const time = (publish.durationMs / 1000).toFixed(2);
      console.log(`   ${statusIcon} ${publish.slug} (${publish.pageType}) - ${time}s`);
      if (publish.status === 'failure' && publish.failureReason) {
        console.log(`      Error: ${publish.failureReason.substring(0, 80)}${publish.failureReason.length > 80 ? '...' : ''}`);
      }
    });
  }
  
  // Revalidation metrics
  if (metrics.revalidation && metrics.revalidation.totalAttempts > 0) {
    console.log('\n🔄 Revalidation Stats:');
    console.log(`   Total Attempts: ${metrics.revalidation.totalAttempts}`);
    console.log(`   ✅ Successes: ${metrics.revalidation.totalSuccesses}`);
    console.log(`   ❌ Failures: ${metrics.revalidation.totalFailures}`);
    
    if (metrics.revalidation.totalAttempts > 0) {
      const successRate = ((metrics.revalidation.totalSuccesses / metrics.revalidation.totalAttempts) * 100).toFixed(1);
      console.log(`   📊 Success Rate: ${successRate}%`);
    }
    
    if (metrics.revalidation.recentFailures.length > 0) {
      console.log('\n   Recent Revalidation Failures (last 5):');
      const recentFailures = metrics.revalidation.recentFailures.slice(0, 5);
      recentFailures.forEach((failure) => {
        console.log(`   ❌ [${new Date(failure.timestamp).toLocaleString()}] ${failure.paths.join(', ')}`);
        console.log(`      Error: ${failure.error.substring(0, 80)}${failure.error.length > 80 ? '...' : ''}`);
        if (failure.retryAttempt > 0) {
          console.log(`      Retry Attempt: ${failure.retryAttempt}/2`);
        }
      });
    }
  }
  
  // Health check
  console.log('\n' + '═'.repeat(60));
  const isHealthy = 
    metrics.summary.totalAttempts === 0 || // No attempts yet
    (metrics.summary.totalSuccesses > 0 && metrics.summary.totalFailures < metrics.summary.totalSuccesses * 2); // More successes than failures
  
  if (metrics.summary.totalAttempts === 0) {
    console.log('\n⚠️  No publish attempts recorded yet.');
  } else if (isHealthy) {
    console.log('\n✅ System appears healthy - publishing is working.');
  } else {
    console.log('\n⚠️  System may have issues - high failure rate detected.');
  }
  
  console.log(`\nLast Updated: ${new Date(metrics.lastUpdated).toLocaleString()}\n`);
}
