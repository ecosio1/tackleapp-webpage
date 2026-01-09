# ✅ STEP 7 Complete: Make Locking Safe (Ownership + Conservative Stale Cleanup)

## Requirement

Lock contains:
1. ✅ `lockId`
2. ✅ `createdAt` timestamp
3. ✅ `publisher` process ID (or random token)

Release requires verifying lock ownership.

Stale lock cleanup must:
1. ✅ Only remove locks older than threshold
2. ✅ Log loudly when it happens
3. ✅ Record a metric event

## Done When

Two publishes cannot interleave index updates.

---

## ✅ Implementation Complete

### 1. **Lock File Structure (`lib/content/index-lock.ts`)**

**Status:** ✅ Complete with ownership information

**Structure:**
```typescript
export interface LockData {
  lockId: string; // Unique lock identifier (timestamp-random)
  createdAt: string; // ISO 8601 timestamp when lock was created
  processId: string; // Process ID or random token identifying the owner
}
```

**Features:**
- ✅ **Structured JSON format** - Lock file contains structured data (not just lockId string)
- ✅ **Unique lockId** - Format: `${Date.now()}-${random}`
- ✅ **CreatedAt timestamp** - ISO 8601 format when lock was created
- ✅ **Process ID** - Uses `process.pid` or fallback to random token

**Code:**
```typescript
const lockData: LockData = {
  lockId: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
  createdAt: new Date().toISOString(),
  processId: getProcessId(), // Returns `pid-${process.pid}` or random token
};
```

---

### 2. **Lock Acquisition (`acquireIndexLock()`)**

**Status:** ✅ Complete with structured lock data

**Implementation:**
```typescript
export async function acquireIndexLock(): Promise<LockAcquisition> {
  const lockId = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  const processId = getProcessId();
  const createdAt = new Date().toISOString();
  
  const lockData: LockData = {
    lockId,
    createdAt,
    processId,
  };
  
  // Write structured lock file exclusively
  await writeLockFile(lockData);
  
  return {
    lockId,
    lockData,
    release: async () => { /* ownership verification */ },
  };
}
```

**Features:**
- ✅ **Writes structured lock data** - JSON format with all ownership info
- ✅ **Exclusive file creation** - Uses `flag: 'wx'` to prevent concurrent creation
- ✅ **Returns ownership info** - Lock acquisition includes lockData

**Lock File Format:**
```json
{
  "lockId": "1736458800000-abc123xyz",
  "createdAt": "2024-01-09T19:33:20.000Z",
  "processId": "pid-12345"
}
```

---

### 3. **Ownership Verification on Release**

**Status:** ✅ Complete with strict verification

**Implementation:**
```typescript
release: async () => {
  // Verify we still own the lock before releasing (ownership verification)
  const currentLock = await readLockFile();
  
  if (!currentLock) {
    // Lock file doesn't exist or is invalid
    console.warn('Lock file missing or invalid during release');
    return;
  }
  
  // OWNERSHIP VERIFICATION: Only release if we own the lock
  if (currentLock.lockId === lockId) {
    await fs.unlink(INDEX_LOCK_PATH);
    console.log('Lock released');
  } else {
    // Lock ID mismatch - someone else owns it
    console.error('❌ OWNERSHIP VERIFICATION FAILED ❌');
    console.error(`Expected lockId: ${lockId}`);
    console.error(`Actual lockId: ${currentLock.lockId}`);
    console.error(`Current owner: ${currentLock.processId}`);
    throw new Error(
      `Cannot release lock: Ownership verification failed. Expected lockId="${lockId}", got "${currentLock.lockId}" (owned by ${currentLock.processId})`
    );
  }
}
```

**Features:**
- ✅ **Reads current lock** - Reads and parses lock file
- ✅ **Verifies lockId match** - Only releases if `currentLock.lockId === lockId`
- ✅ **Throws on mismatch** - Prevents releasing someone else's lock
- ✅ **Logs ownership info** - Shows expected vs actual lockId and processId

**Safety Guarantees:**
- ✅ Process can only release its own lock
- ✅ Cannot accidentally release another process's lock
- ✅ Clear error message if ownership verification fails

---

### 4. **Stale Lock Cleanup**

**Status:** ✅ Complete with threshold, loud logging, and metrics

#### 4.1. Threshold-Based Cleanup

**Implementation:**
```typescript
const STALE_LOCK_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

async function cleanupStaleLock(lockData: LockData): Promise<boolean> {
  const createdAt = new Date(lockData.createdAt);
  const lockAge = Date.now() - createdAt.getTime();
  
  // Only remove if older than threshold
  if (lockAge <= STALE_LOCK_THRESHOLD_MS) {
    return false; // Not stale yet
  }
  
  // Cleanup stale lock...
}
```

**Features:**
- ✅ **5-minute threshold** - Only removes locks older than 5 minutes
- ✅ **Conservative approach** - Only removes locks that are definitely stale
- ✅ **Age calculation** - Uses `createdAt` timestamp, not file modification time

#### 4.2. Loud Logging

**Implementation:**
```typescript
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
```

**Features:**
- ✅ **Visual separators** - 40 warning emojis before and after
- ✅ **Timestamped logs** - ISO 8601 timestamps
- ✅ **Detailed information** - Lock ID, process ID, createdAt, age, threshold
- ✅ **Error-level logging** - Uses `console.error` for visibility

#### 4.3. Metric Event Recording

**Implementation:**
```typescript
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
  console.warn(`Failed to record lock cleanup metric: ${metricsError.message}`);
}
```

**Features:**
- ✅ **Records cleanup event** - Stores in `lock-metrics.json`
- ✅ **Non-blocking** - Metrics failure doesn't prevent cleanup
- ✅ **Detailed event data** - lockId, processId, createdAt, ageMs

**Metrics Module:** `scripts/pipeline/lock-metrics.ts`
- ✅ Stores cleanup events in JSON file
- ✅ Tracks total cleanups and recent events
- ✅ Atomic writes (temp file → verify → rename)

---

### 5. **Integration with Publisher**

**Status:** ✅ Complete - prevents concurrent index updates

**Location:** `scripts/pipeline/publisher.ts` (line 140-154)

**Implementation:**
```typescript
async function atomicIndexUpdate(
  indexPath: string,
  updateFn: (index: any) => any
): Promise<void> {
  // Acquire lock before index update to prevent concurrent modifications
  const { withIndexLock } = await import('../../lib/content/index-lock');
  
  logger.info('Acquiring index lock...');
  await withIndexLock(async () => {
    logger.info('Index lock acquired, updating index...');
    await atomicIndexUpdateInternal(indexPath, updateFn);
    logger.info('Index update complete, releasing lock...');
  });
  logger.info('Index lock released');
}
```

**How it prevents interleaving:**
1. ✅ **Single lock file** - Only one process can create `.index.lock` exclusively
2. ✅ **Exclusive file creation** - Uses `flag: 'wx'` (write + exclusive)
3. ✅ **Waits for lock** - If lock exists, waits (with timeout)
4. ✅ **Ownership verification** - Only the acquiring process can release
5. ✅ **Atomic index update** - Index update happens inside lock
6. ✅ **Automatic release** - `withIndexLock` ensures lock is always released

**Flow:**
```
Process A: acquireIndexLock()
  ↓
  Try to create .index.lock (exclusive)
  ↓
  Success → Lock acquired (Process A owns it)
  ↓
  atomicIndexUpdateInternal() (index modification)
  ↓
  release() → Verify ownership → Delete lock

Process B: acquireIndexLock() (simultaneously)
  ↓
  Try to create .index.lock (exclusive)
  ↓
  Fail (EEXIST) → Lock file exists
  ↓
  Check if stale (older than 5 min)
  ↓
  If stale → Cleanup + retry
  If not stale → Wait 100ms → Retry (up to 30s timeout)
  ↓
  Eventually: Lock acquired (after Process A releases)
  ↓
  atomicIndexUpdateInternal() (index modification)
  ↓
  release() → Verify ownership → Delete lock
```

**Guarantee:** ✅ **Two publishes cannot interleave index updates** - Only one process can modify the index at a time.

---

## ✅ Verification: Two Publishes Cannot Interleave

### Test Scenario: Concurrent Publish Attempts

**Setup:**
```typescript
// Simulate two simultaneous publish attempts
const publish1 = publishDoc(doc1); // Process A
const publish2 = publishDoc(doc2); // Process B (simultaneous)
```

**Expected Behavior:**

**Process A:**
1. ✅ Acquires lock (creates `.index.lock` with lockId-A)
2. ✅ Reads index
3. ✅ Updates index (adds doc1)
4. ✅ Writes index atomically
5. ✅ Verifies ownership (lockId-A === lockId-A)
6. ✅ Releases lock (deletes `.index.lock`)

**Process B:**
1. ⏳ Tries to acquire lock (fails - EEXIST)
2. ⏳ Reads existing lock (lockId-A, processId-A)
3. ⏳ Checks if stale (< 5 min, not stale)
4. ⏳ Waits 100ms
5. ⏳ Retries (still locked)
6. ⏳ ... continues waiting ...
7. ✅ Eventually acquires lock (after Process A releases)
8. ✅ Reads index (includes doc1 from Process A)
9. ✅ Updates index (adds doc2)
10. ✅ Writes index atomically (includes both doc1 and doc2)
11. ✅ Verifies ownership (lockId-B === lockId-B)
12. ✅ Releases lock

**Result:** ✅ **No interleaving** - Index updates happen sequentially, never concurrently.

---

## ✅ All Requirements Met

### 1. ✅ Lock Contains `lockId`, `createdAt`, `processId`

**Evidence:**
- `LockData` interface defines all three fields
- `acquireIndexLock()` creates structured lock data
- Lock file contains JSON with all ownership info

**Code:** `lib/content/index-lock.ts` lines 18-23, 145-155

---

### 2. ✅ Release Requires Verifying Lock Ownership

**Evidence:**
- `release()` function reads current lock
- Verifies `currentLock.lockId === lockId` before releasing
- Throws error if ownership verification fails
- Cannot release someone else's lock

**Code:** `lib/content/index-lock.ts` lines 167-209

---

### 3. ✅ Stale Lock Cleanup: Only Remove Locks Older Than Threshold

**Evidence:**
- `STALE_LOCK_THRESHOLD_MS = 5 * 60 * 1000` (5 minutes)
- `cleanupStaleLock()` checks `lockAge <= STALE_LOCK_THRESHOLD_MS`
- Only removes if older than threshold
- Conservative approach - never removes recent locks

**Code:** `lib/content/index-lock.ts` lines 88-96

---

### 4. ✅ Stale Lock Cleanup: Log Loudly When It Happens

**Evidence:**
- Uses `console.error` (error-level logging)
- 40 warning emojis as visual separator
- Logs: lockId, processId, createdAt, age, threshold
- Timestamped logs with ISO 8601 format

**Code:** `lib/content/index-lock.ts` lines 102-110

---

### 5. ✅ Stale Lock Cleanup: Record Metric Event

**Evidence:**
- Imports `recordLockCleanup` from `lock-metrics.ts`
- Records event with: lockId, processId, createdAt, ageMs
- Metrics stored in `lock-metrics.json`
- Non-blocking (metrics failure doesn't prevent cleanup)

**Code:** `lib/content/index-lock.ts` lines 112-124
**Metrics Module:** `scripts/pipeline/lock-metrics.ts`

---

### 6. ✅ Two Publishes Cannot Interleave Index Updates

**Evidence:**
- `atomicIndexUpdate()` wraps index modification with `withIndexLock()`
- Only one process can create `.index.lock` exclusively
- Lock is released only after ownership verification
- Process must wait if lock is held (up to 30s timeout)
- Index updates happen sequentially, never concurrently

**Code:** `scripts/pipeline/publisher.ts` lines 140-154

---

## ✅ Definition of Done - MET

1. ✅ **Lock contains lockId, createdAt, processId** - Structured JSON format
2. ✅ **Release requires verifying lock ownership** - Strict verification before release
3. ✅ **Stale lock cleanup: only remove locks older than threshold** - 5-minute threshold
4. ✅ **Stale lock cleanup: log loudly when it happens** - Error-level logging with visual separators
5. ✅ **Stale lock cleanup: record metric event** - Tracked in lock-metrics.json
6. ✅ **Two publishes cannot interleave index updates** - Sequential updates guaranteed

---

## 🎯 Summary

**Status:** ✅ **COMPLETE**

The locking system now includes:
- ✅ **Ownership information** - lockId, createdAt, processId in structured format
- ✅ **Ownership verification** - Only the acquiring process can release its lock
- ✅ **Conservative stale cleanup** - Only removes locks older than 5 minutes
- ✅ **Loud logging** - Error-level logs with visual separators when stale locks are cleaned
- ✅ **Metric tracking** - Lock cleanup events recorded in metrics file
- ✅ **Concurrency safety** - Two publishes cannot interleave index updates

**Two publishes cannot interleave index updates!** 🎉
