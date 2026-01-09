/**
 * Index corruption recovery and backup utilities
 * Protects against index corruption wiping all content
 */

import fs from 'fs/promises';
import path from 'path';
import { ContentIndex, BlogPostIndexEntry } from './index';
import { loadContentDoc } from './index';
import { validateAndQuarantine } from './schema-validator';

const CONTENT_INDEX_PATH = path.join(process.cwd(), 'content', '_system', 'contentIndex.json');
const CONTENT_INDEX_BACKUP_PATH = path.join(process.cwd(), 'content', '_system', 'contentIndex.json.backup');
const CONTENT_DIR = path.join(process.cwd(), 'content');

/**
 * Create a backup of the current index before updating
 */
export async function backupContentIndex(): Promise<void> {
  try {
    // Check if index exists
    try {
      await fs.access(CONTENT_INDEX_PATH);
    } catch {
      // Index doesn't exist yet, nothing to backup
      return;
    }

    // Read current index
    const data = await fs.readFile(CONTENT_INDEX_PATH, 'utf-8');
    
    // Validate it's valid JSON before backing up
    try {
      JSON.parse(data);
    } catch {
      // Current index is corrupted, don't backup corrupted data
      console.warn(
        `[INDEX_BACKUP] ${new Date().toISOString()} - Skipping backup: current index is corrupted`
      );
      return;
    }

    // Atomic write: temp file → verify → rename (prevents corruption if process killed mid-write)
    const tempPath = `${CONTENT_INDEX_BACKUP_PATH}.tmp`;
    
    // Write to temp file first
    await fs.writeFile(tempPath, data, 'utf-8');
    
    // Verify temp file was written correctly
    const written = await fs.readFile(tempPath, 'utf-8');
    if (written !== data) {
      await fs.unlink(tempPath).catch(() => {}); // Clean up temp file
      throw new Error('Backup write verification failed - written data does not match');
    }
    
    // Atomic rename (prevents corruption if process crashes)
    await fs.rename(tempPath, CONTENT_INDEX_BACKUP_PATH);
    
    console.log(
      `[INDEX_BACKUP] ${new Date().toISOString()} - Backup created: ${CONTENT_INDEX_BACKUP_PATH}`
    );
  } catch (error) {
    // Log but don't fail - backup is best effort
    console.warn(
      `[INDEX_BACKUP] ${new Date().toISOString()} - Failed to create backup: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Load backup index if available
 */
export async function loadBackupIndex(): Promise<ContentIndex | null> {
  try {
    await fs.access(CONTENT_INDEX_BACKUP_PATH);
    const data = await fs.readFile(CONTENT_INDEX_BACKUP_PATH, 'utf-8');
    const index = JSON.parse(data);
    
    // Validate backup structure
    if (!index || typeof index !== 'object') {
      console.warn('[INDEX_RECOVERY] Backup index has invalid structure');
      return null;
    }
    
    // Ensure required arrays exist
    if (!Array.isArray(index.species)) index.species = [];
    if (!Array.isArray(index.howTo)) index.howTo = [];
    if (!Array.isArray(index.locations)) index.locations = [];
    if (!Array.isArray(index.blogPosts)) index.blogPosts = [];
    
    console.log(
      `[INDEX_RECOVERY] ${new Date().toISOString()} - Successfully loaded backup index`
    );
    return index as ContentIndex;
  } catch (error) {
    console.warn(
      `[INDEX_RECOVERY] ${new Date().toISOString()} - Backup index not available: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    return null;
  }
}

/**
 * Attempt to recover index from backup or rebuild
 * Recovery flow:
 * 1. Try to load backup index
 * 2. If backup succeeds → restore to primary location
 * 3. If backup fails → rebuild from files
 * 4. Save recovered index to primary location (CRITICAL - ensures no data loss)
 */
export async function recoverIndex(): Promise<ContentIndex> {
  console.log(
    `[INDEX_RECOVERY] ${new Date().toISOString()} - Attempting index recovery...`
  );

  // Step 1: Try to load backup
  const backupIndex = await loadBackupIndex();
  if (backupIndex) {
    console.log(
      `[INDEX_RECOVERY] Successfully recovered from backup (${backupIndex.blogPosts.length} blog posts)`
    );
    
    // CRITICAL: Restore backup as main index (with lock and atomic write)
    try {
      const { withIndexLock } = await import('./index-lock');
      await withIndexLock(async () => {
        // Ensure directory exists
        const dir = path.dirname(CONTENT_INDEX_PATH);
        await fs.mkdir(dir, { recursive: true });
        
        // Atomic write: temp file → verify → rename
        const tempPath = `${CONTENT_INDEX_PATH}.tmp`;
        const jsonString = JSON.stringify(backupIndex, null, 2);
        
        await fs.writeFile(tempPath, jsonString, 'utf-8');
        
        // Verify temp file was written correctly
        const written = await fs.readFile(tempPath, 'utf-8');
        if (written !== jsonString) {
          await fs.unlink(tempPath).catch(() => {});
          throw new Error('Index write verification failed - written data does not match');
        }
        
        // Atomic rename (prevents corruption if process crashes)
        await fs.rename(tempPath, CONTENT_INDEX_PATH);
        
        console.log(
          `[INDEX_RECOVERY] ✅ Successfully restored backup as main index (${CONTENT_INDEX_PATH})`
        );
      });
    } catch (error) {
      // Log error but don't fail - we still have the backup index in memory
      console.error(
        `[INDEX_RECOVERY] ❌ Failed to restore backup as main index: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      // Re-throw so caller knows recovery partially failed
      throw new Error(`Recovery from backup succeeded but failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    // Backup is already the latest (we restored it), but update timestamp
    backupIndex.lastUpdated = new Date().toISOString();
    
    return backupIndex;
  }

  // Step 2: Rebuild from files (backup failed or doesn't exist)
  console.log(
    `[INDEX_RECOVERY] Backup not available or invalid, rebuilding from blog files...`
  );
  
  // Use the rebuild function from index-rebuild.ts (returns { index, stats })
  const { rebuildIndexFromFiles: rebuildFromFiles } = await import('./index-rebuild');
  const { index: rebuiltIndex, stats } = await rebuildFromFiles();
  
  console.log(
    `[INDEX_RECOVERY] Rebuilt index from files: ${stats.validPosts} valid posts, ${stats.invalidPosts} invalid, ${stats.quarantinedPosts} quarantined`
  );
  
  // CRITICAL: Save rebuilt index to primary location (with lock and atomic write)
  try {
    const { withIndexLock } = await import('./index-lock');
    await withIndexLock(async () => {
      // Ensure directory exists
      const dir = path.dirname(CONTENT_INDEX_PATH);
      await fs.mkdir(dir, { recursive: true });
      
      // Atomic write: temp file → verify → rename
      const tempPath = `${CONTENT_INDEX_PATH}.tmp`;
      const jsonString = JSON.stringify(rebuiltIndex, null, 2);
      
      await fs.writeFile(tempPath, jsonString, 'utf-8');
      
      // Verify temp file was written correctly
      const written = await fs.readFile(tempPath, 'utf-8');
      if (written !== jsonString) {
        await fs.unlink(tempPath).catch(() => {});
        throw new Error('Index write verification failed - written data does not match');
      }
      
      // Atomic rename (prevents corruption if process crashes)
      await fs.rename(tempPath, CONTENT_INDEX_PATH);
      
      console.log(
        `[INDEX_RECOVERY] ✅ Successfully saved rebuilt index to primary location (${CONTENT_INDEX_PATH})`
      );
    });
    
    // Also update backup with the rebuilt index (for future recovery)
    try {
      await backupContentIndex();
      console.log(
        `[INDEX_RECOVERY] ✅ Updated backup with rebuilt index`
      );
    } catch (backupError) {
      // Backup update is best-effort, don't fail recovery if it fails
      console.warn(
        `[INDEX_RECOVERY] ⚠️  Rebuilt index saved but backup update failed: ${backupError instanceof Error ? backupError.message : 'Unknown error'}`
      );
    }
  } catch (error) {
    // CRITICAL: If we can't save the rebuilt index, we lose all data recovery
    console.error(
      `[INDEX_RECOVERY] ❌ CRITICAL: Failed to save rebuilt index: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    // Re-throw so caller knows recovery failed
    throw new Error(`Recovery from files succeeded but failed to save: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
  
  return rebuiltIndex;
}
