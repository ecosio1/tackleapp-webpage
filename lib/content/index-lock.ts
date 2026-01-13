/**
 * Index update locking mechanism
 * Prevents concurrent index updates from corrupting the index
 * WITH OWNERSHIP: Lock contains lockId, createdAt, and processId for safe release
 */

import fs from 'fs/promises';
import path from 'path';

const INDEX_LOCK_PATH = path.join(process.cwd(), 'content', '_system', '.index.lock');
const LOCK_TIMEOUT_MS = 30000; // 30 seconds max wait
const LOCK_CHECK_INTERVAL_MS = 100; // Check every 100ms
const STALE_LOCK_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes - locks older than this are considered stale

/**
 * Lock file structure with ownership information
 */
export interface LockData {
  lockId: string; // Unique lock identifier (timestamp-random)
  createdAt: string; // ISO 8601 timestamp when lock was created
  processId: string; // Process ID or random token identifying the owner
}

export interface LockAcquisition {
  release: () => Promise<void>;
  lockId: string;
  lockData: LockData;
}

/**
 * Get process identifier (PID or random token)
 */
function getProcessId(): string {
  try {
    return `pid-${process.pid}`;
  } catch {
    // Fallback to random token if PID unavailable
    return `token-${Math.random().toString(36).substring(2, 15)}`;
  }
}

/**
 * Read and parse lock file
 */
async function readLockFile(): Promise<LockData | null> {
  try {
    const data = await fs.readFile(INDEX_LOCK_PATH, 'utf-8');
    try {
      const parsed = JSON.parse(data);
      // Validate structure
      if (parsed && typeof parsed === 'object' && parsed.lockId && parsed.createdAt && parsed.processId) {
        return parsed as LockData;
      }
    } catch {
      // Invalid JSON or structure - treat as legacy format or corrupted
      // Legacy format: lock file might contain just lockId string
      if (typeof data === 'string' && data.trim().length > 0) {
        // Try to parse as legacy format (just the lockId)
        return {
          lockId: data.trim(),
          createdAt: new Date().toISOString(), // Unknown creation time for legacy
          processId: 'unknown', // Unknown process ID for legacy
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Write lock file with structured data
 */
async function writeLockFile(lockData: LockData): Promise<void> {
  const dir = path.dirname(INDEX_LOCK_PATH);
  await fs.mkdir(dir, { recursive: true });
  
  const jsonString = JSON.stringify(lockData, null, 2);
  await fs.writeFile(INDEX_LOCK_PATH, jsonString, { flag: 'wx' });
}

/**
 * Clean up stale lock (only if older than threshold)
 * Logs loudly and records metric event
 */
async function cleanupStaleLock(lockData: LockData): Promise<boolean> {
  try {
    const createdAt = new Date(lockData.createdAt);
    const lockAge = Date.now() - createdAt.getTime();
    
    // Only remove if older than threshold
    if (lockAge <= STALE_LOCK_THRESHOLD_MS) {
      return false; // Not stale yet
    }
    
    // LOUD LOGGING when stale lock is detected and cleaned up
    const ageSeconds = Math.round(lockAge / 1000);
    const ageMinutes = Math.round(ageSeconds / 60);
    
    console.error('\n' + '⚠️'.repeat(40));
    console.error(`[INDEX_LOCK] ${new Date().toISOString()} - ⚠️  STALE LOCK DETECTED ⚠️`);
    console.error(`[INDEX_LOCK] Lock ID: ${lockData.lockId}`);
    console.error(`[INDEX_LOCK] Process ID: ${lockData.processId}`);
    console.error(`[INDEX_LOCK] Created At: ${lockData.createdAt}`);
    console.error(`[INDEX_LOCK] Age: ${ageMinutes} minutes (${ageSeconds} seconds)`);
    console.error(`[INDEX_LOCK] Threshold: ${Math.round(STALE_LOCK_THRESHOLD_MS / 1000 / 60)} minutes`);
    console.error(`[INDEX_LOCK] ⚠️  REMOVING STALE LOCK ⚠️`);
    console.error('⚠️'.repeat(40) + '\n');
    
    // Record metric event
    try {
      const { recordLockCleanup } = await import('../../scripts/pipeline/lock-metrics');
      await recordLockCleanup({
        lockId: lockData.lockId,
        processId: lockData.processId,
        createdAt: lockData.createdAt,
        ageMs: lockAge,
      });
    } catch (metricsError) {
      // Metrics recording failure is non-blocking
      console.warn(`[INDEX_LOCK] Failed to record lock cleanup metric: ${metricsError instanceof Error ? metricsError.message : 'Unknown error'}`);
    }
    
    // Remove stale lock
    await fs.unlink(INDEX_LOCK_PATH);
    
    return true; // Stale lock cleaned up
  } catch (error) {
    // Failed to cleanup - log but don't throw (another process may have removed it)
    console.warn(
      `[INDEX_LOCK] Failed to cleanup stale lock: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return false;
  }
}

/**
 * Acquire lock for index updates
 * Returns a lock object with release() method
 * Throws if lock cannot be acquired within timeout
 * WITH OWNERSHIP: Lock contains lockId, createdAt, and processId
 */
export async function acquireIndexLock(): Promise<LockAcquisition> {
  const lockId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  const processId = getProcessId();
  const createdAt = new Date().toISOString();
  const startTime = Date.now();
  
  const lockData: LockData = {
    lockId,
    createdAt,
    processId,
  };

  // Try to acquire lock
  while (true) {
    try {
      // Try to create lock file exclusively with structured data
      await writeLockFile(lockData);
      
      // Lock acquired!
      return {
        lockId,
        lockData,
        release: async () => {
          try {
            // Verify we still own the lock before releasing (ownership verification)
            const currentLock = await readLockFile();
            
            if (!currentLock) {
              // Lock file doesn't exist or is invalid
              console.warn(
                `[INDEX_LOCK] ${new Date().toISOString()} - Lock file missing or invalid during release (may have been released by another process)`
              );
              return;
            }
            
            // OWNERSHIP VERIFICATION: Only release if we own the lock
            if (currentLock.lockId === lockId) {
              await fs.unlink(INDEX_LOCK_PATH);
              console.log(
                `[INDEX_LOCK] ${new Date().toISOString()} - Lock released (${lockId})`
              );
            } else {
              // Lock ID mismatch - someone else owns it or it was replaced
              console.error(
                `[INDEX_LOCK] ${new Date().toISOString()} - ❌ OWNERSHIP VERIFICATION FAILED ❌`
              );
              console.error(`[INDEX_LOCK] Expected lockId: ${lockId}`);
              console.error(`[INDEX_LOCK] Actual lockId: ${currentLock.lockId}`);
              console.error(`[INDEX_LOCK] Current owner: ${currentLock.processId}`);
              console.error(`[INDEX_LOCK] Lock may have been taken by another process`);
              throw new Error(
                `Cannot release lock: Ownership verification failed. Expected lockId="${lockId}", got "${currentLock.lockId}" (owned by ${currentLock.processId})`
              );
            }
          } catch (error) {
            if (error instanceof Error && error.message.includes('Ownership verification failed')) {
              // Re-throw ownership verification failures
              throw error;
            }
            // Other errors are non-fatal (lock may already be released)
            console.warn(
              `[INDEX_LOCK] ${new Date().toISOString()} - Failed to release lock: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
          }
        },
      };
    } catch (error) {
      const fileError = error as NodeJS.ErrnoException;
      
      // If file exists, another process has the lock
      if (fileError.code === 'EEXIST') {
        // Check timeout
        const elapsed = Date.now() - startTime;
        if (elapsed >= LOCK_TIMEOUT_MS) {
          throw new Error(
            `Failed to acquire index lock within ${LOCK_TIMEOUT_MS}ms. Another process may be updating the index.`
          );
        }

        // Check if lock is stale (CONSERVATIVE: only remove if older than threshold)
        const existingLock = await readLockFile();
        
        if (existingLock) {
          // Try to cleanup stale lock (only if older than threshold)
          const cleaned = await cleanupStaleLock(existingLock);
          
          if (cleaned) {
            // Stale lock was cleaned up, retry acquiring lock
            continue;
          }
          
          // Lock is not stale or cleanup failed, wait before retrying
          await new Promise((resolve) => setTimeout(resolve, LOCK_CHECK_INTERVAL_MS));
          continue;
        } else {
          // Lock file exists but couldn't be parsed - may be corrupted or legacy format
          // Try to remove it after a short delay (conservative)
          try {
            const stats = await fs.stat(INDEX_LOCK_PATH);
            const lockAge = Date.now() - stats.mtimeMs;
            
            if (lockAge > STALE_LOCK_THRESHOLD_MS) {
              console.warn(
                `[INDEX_LOCK] ${new Date().toISOString()} - Detected unparseable lock file (${Math.round(lockAge / 1000)}s old), attempting to remove...`
              );
              await fs.unlink(INDEX_LOCK_PATH);
              continue; // Retry acquiring lock
            }
          } catch {
            // Can't stat lock file, continue waiting
          }
        }

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, LOCK_CHECK_INTERVAL_MS));
        continue;
      }

      // Other error
      throw new Error(
        `Failed to acquire index lock: ${fileError.message || 'Unknown error'}`
      );
    }
  }
}

/**
 * Execute function with index lock
 * Automatically acquires and releases lock
 */
export async function withIndexLock<T>(
  fn: () => Promise<T>
): Promise<T> {
  const lock = await acquireIndexLock();
  
  try {
    return await fn();
  } finally {
    await lock.release();
  }
}

/**
 * Check if index is currently locked
 */
export async function isIndexLocked(): Promise<boolean> {
  try {
    await fs.access(INDEX_LOCK_PATH);
    return true;
  } catch {
    return false;
  }
}

/**
 * Force release lock (use with caution - only if you're sure no process is using it)
 * Logs the lock information before releasing
 */
export async function forceReleaseLock(): Promise<void> {
  try {
    // Read lock data before releasing (for logging)
    const lockData = await readLockFile();
    
    if (lockData) {
      console.warn(`[INDEX_LOCK] ${new Date().toISOString()} - ⚠️  FORCE RELEASING LOCK ⚠️`);
      console.warn(`[INDEX_LOCK] Lock ID: ${lockData.lockId}`);
      console.warn(`[INDEX_LOCK] Process ID: ${lockData.processId}`);
      console.warn(`[INDEX_LOCK] Created At: ${lockData.createdAt}`);
      console.warn(`[INDEX_LOCK] Age: ${Math.round((Date.now() - new Date(lockData.createdAt).getTime()) / 1000)}s`);
    }
    
    await fs.unlink(INDEX_LOCK_PATH);
    console.log(`[INDEX_LOCK] ${new Date().toISOString()} - ✅ Force released lock`);
  } catch (error) {
    const fileError = error as NodeJS.ErrnoException;
    if (fileError.code !== 'ENOENT') {
      throw new Error(`Failed to force release lock: ${fileError.message}`);
    }
    // Lock doesn't exist, that's fine
    console.log(`[INDEX_LOCK] ${new Date().toISOString()} - No lock to force release`);
  }
}
