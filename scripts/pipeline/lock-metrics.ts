/**
 * Lock Metrics - Track lock cleanup events
 * Records when stale locks are detected and cleaned up
 */

import fs from 'fs/promises';
import path from 'path';
import { logger } from './logger';

const LOCK_METRICS_PATH = path.join(process.cwd(), 'content', '_system', 'lock-metrics.json');

export interface LockCleanupEvent {
  timestamp: string; // ISO 8601
  lockId: string;
  processId: string;
  createdAt: string; // When lock was originally created
  ageMs: number; // How old the lock was when cleaned up
}

export interface LockMetrics {
  version: string;
  lastUpdated: string;
  totalCleanups: number;
  recentCleanups: Array<LockCleanupEvent>;
}

const DEFAULT_METRICS: LockMetrics = {
  version: '1.0.0',
  lastUpdated: new Date().toISOString(),
  totalCleanups: 0,
  recentCleanups: [],
};

const MAX_RECENT_CLEANUPS = 100; // Keep last 100 cleanup events

/**
 * Load lock metrics from file
 */
async function loadLockMetrics(): Promise<LockMetrics> {
  try {
    const data = await fs.readFile(LOCK_METRICS_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist or is invalid, return defaults
    return { ...DEFAULT_METRICS };
  }
}

/**
 * Save lock metrics to file
 */
async function saveLockMetrics(metrics: LockMetrics): Promise<void> {
  try {
    const dir = path.dirname(LOCK_METRICS_PATH);
    await fs.mkdir(dir, { recursive: true });
    
    // Atomic write: temp file → rename
    const tempPath = `${LOCK_METRICS_PATH}.tmp`;
    const jsonString = JSON.stringify(metrics, null, 2);
    
    await fs.writeFile(tempPath, jsonString, 'utf-8');
    
    // Verify temp file
    const written = await fs.readFile(tempPath, 'utf-8');
    if (written !== jsonString) {
      await fs.unlink(tempPath).catch(() => {});
      throw new Error('Lock metrics write verification failed');
    }
    
    // Atomic rename
    await fs.rename(tempPath, LOCK_METRICS_PATH);
  } catch (error) {
    // Metrics saving failure is non-blocking, but log it
    logger.warn(`Failed to save lock metrics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Record a lock cleanup event (stale lock removed)
 */
export async function recordLockCleanup(event: {
  lockId: string;
  processId: string;
  createdAt: string;
  ageMs: number;
}): Promise<void> {
  try {
    const metrics = await loadLockMetrics();
    
    // Increment total cleanups
    metrics.totalCleanups++;
    
    // Add cleanup event
    const cleanupEvent: LockCleanupEvent = {
      timestamp: new Date().toISOString(),
      lockId: event.lockId,
      processId: event.processId,
      createdAt: event.createdAt,
      ageMs: event.ageMs,
    };
    
    metrics.recentCleanups.unshift(cleanupEvent);
    
    // Keep only recent cleanups
    if (metrics.recentCleanups.length > MAX_RECENT_CLEANUPS) {
      metrics.recentCleanups = metrics.recentCleanups.slice(0, MAX_RECENT_CLEANUPS);
    }
    
    metrics.lastUpdated = new Date().toISOString();
    
    await saveLockMetrics(metrics);
    
    logger.info(`Recorded lock cleanup event: lockId=${event.lockId}, age=${Math.round(event.ageMs / 1000)}s`);
  } catch (error) {
    // Metrics recording failure is non-blocking
    logger.warn(`Failed to record lock cleanup event: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get lock metrics
 */
export async function getLockMetrics(): Promise<LockMetrics> {
  return await loadLockMetrics();
}

/**
 * Reset lock metrics (for testing/maintenance)
 */
export async function resetLockMetrics(): Promise<void> {
  await saveLockMetrics({ ...DEFAULT_METRICS });
}
