# ✅ STEP 9 Complete: Publishing Concurrency Control

## Requirement

Decide and enforce one of these:
- ✅ Option A: Publishing is single-threaded (one publish job at a time)
- ✅ Option B: Allow concurrency but enforce locking around index updates

Either way, index updates must be atomic and safe.

## Done When

Two simultaneous publish attempts cannot corrupt the index.

---

## ✅ Implementation Complete

**Decision:** Option B - Allow concurrency with locking around index updates

**Rationale:**
- ✅ Better throughput (can publish multiple posts concurrently)
- ✅ File operations can happen in parallel
- ✅ Only index updates are serialized (critical section)
- ✅ Atomic writes remain atomic

---

### 1. **Index Lock Module (`lib/content/index-lock.ts`)**

**Status:** ✅ Created

**Features:**
- ✅ File-based locking mechanism
- ✅ Lock timeout (30 seconds max wait)
- ✅ Stale lock detection (5 minutes)
- ✅ Automatic lock release
- ✅ `withIndexLock()` helper for automatic cleanup

**Lock Strategy:**
- ✅ Uses exclusive file creation (`wx` flag)
- ✅ Lock file: `content/_system/.index.lock`
- ✅ Contains unique lock ID for verification
- ✅ Automatically releases on completion or error

**Code:**
```typescript
export async function acquireIndexLock(): Promise<LockAcquisition> {
  const lockId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const startTime = Date.now();

  // Try to acquire lock with timeout
  while (true) {
    try {
      // Try to create lock file exclusively
      await fs.writeFile(INDEX_LOCK_PATH, lockId, { flag: 'wx' });
      
      // Lock acquired!
      return {
        lockId,
        release: async () => {
          // Verify we still own the lock before releasing
          const currentLock = await fs.readFile(INDEX_LOCK_PATH, 'utf-8').catch(() => null);
          if (currentLock === lockId) {
            await fs.unlink(INDEX_LOCK_PATH);
          }
        },
      };
    } catch (error) {
      // Lock exists - wait and retry (with timeout and stale lock detection)
      // ...
    }
  }
}

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
```

### 2. **Enhanced Publisher (`scripts/pipeline/publisher.ts`)**

**Status:** ✅ Updated with locking

**Changes:**
- ✅ `atomicIndexUpdate()` now uses `withIndexLock()`
- ✅ Lock acquired before index update
- ✅ Lock released after update (automatic)
- ✅ Internal function `atomicIndexUpdateInternal()` performs actual update

**Code:**
```typescript
async function atomicIndexUpdate(
  indexPath: string,
  updateFn: (index: any) => any
): Promise<void> {
  // Acquire lock before index update
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

### 3. **Enhanced Index Rebuild (`lib/content/index-rebuild.ts`)**

**Status:** ✅ Updated with locking

**Changes:**
- ✅ `saveRebuiltIndex()` uses `withIndexLock()`
- ✅ Atomic write pattern (temp file → rename)
- ✅ Prevents concurrent rebuilds from corrupting index

### 4. **Enhanced Index Recovery (`lib/content/index-recovery.ts`)**

**Status:** ✅ Updated with locking

**Changes:**
- ✅ Recovery operations use `withIndexLock()`
- ✅ Prevents recovery from interfering with active publishes

### 5. **CLI Command Enhancement (`scripts/run.ts`)**

**Status:** ✅ Added force-lock option

**New Option:**
- ✅ `--force-lock` - Force release any existing lock before rebuilding

**Usage:**
```bash
npm run pipeline:rebuild-index -- --force-lock
```

---

## ✅ Concurrency Strategy

### Option B: Locking Around Index Updates

**How It Works:**
1. Multiple `publishDoc()` calls can run concurrently
2. File writes happen in parallel (no conflict)
3. When index update is needed:
   - Acquire lock (wait if another process has it)
   - Load index
   - Apply update
   - Write to temp file
   - Atomic rename
   - Release lock
4. Next waiting process acquires lock and proceeds

**Benefits:**
- ✅ High throughput (file operations parallel)
- ✅ Safe index updates (serialized)
- ✅ No corruption possible
- ✅ Automatic lock cleanup

---

## ✅ Lock Behavior

### Normal Operation

```
Process 1: publishDoc() → Acquire lock → Update index → Release lock
Process 2: publishDoc() → Wait for lock → Acquire lock → Update index → Release lock
```

### Lock Timeout

```
Process 1: publishDoc() → Acquire lock → (hangs/crashes)
Process 2: publishDoc() → Wait for lock → Timeout after 30s → Error
```

### Stale Lock Detection

```
Process 1: publishDoc() → Acquire lock → (crashes, lock remains)
Process 2: publishDoc() → Detect stale lock (>5min old) → Remove → Acquire lock → Update index
```

---

## ✅ Safety Guarantees

### Guarantee 1: No Concurrent Index Updates

**Enforced By:**
- ✅ Exclusive file creation (`wx` flag)
- ✅ Lock file prevents concurrent access
- ✅ All index updates go through `atomicIndexUpdate()`

**Result:** Only one process can update index at a time

### Guarantee 2: Atomic Writes Remain Atomic

**Enforced By:**
- ✅ Lock acquired before write
- ✅ Temp file → verify → atomic rename
- ✅ Lock released after rename

**Result:** Index updates are atomic and safe

### Guarantee 3: Lock Cleanup

**Enforced By:**
- ✅ `withIndexLock()` uses try/finally
- ✅ Lock always released (even on error)
- ✅ Stale lock detection (5 minutes)

**Result:** Locks don't persist indefinitely

---

## ✅ Edge Cases Handled

### Edge Case 1: Process Crash During Update

**Scenario:** Process crashes while holding lock

**Solution:**
- ✅ Stale lock detection (5 minutes)
- ✅ Next process removes stale lock
- ✅ Continues normally

### Edge Case 2: Multiple Processes Publishing

**Scenario:** Two `publishDoc()` calls happen simultaneously

**Solution:**
- ✅ First process acquires lock
- ✅ Second process waits (up to 30s)
- ✅ First process completes, releases lock
- ✅ Second process acquires lock, proceeds

### Edge Case 3: Lock Timeout

**Scenario:** Lock held for >30 seconds

**Solution:**
- ✅ Waiting process throws error
- ✅ Prevents indefinite waiting
- ✅ Error logged clearly

### Edge Case 4: Rebuild During Publish

**Scenario:** Rebuild index while publish is running

**Solution:**
- ✅ Rebuild acquires lock
- ✅ Publish waits for rebuild to complete
- ✅ Both operations safe

---

## ✅ Performance Impact

### Without Locking (Unsafe)
```
2 concurrent publishes:
- Process 1: Load index → Update → Write (corrupted!)
- Process 2: Load index → Update → Write (corrupted!)
Result: Index corruption ❌
```

### With Locking (Safe)
```
2 concurrent publishes:
- Process 1: Acquire lock → Load index → Update → Write → Release lock (2s)
- Process 2: Wait for lock → Acquire lock → Load index → Update → Write → Release lock (2s)
Total: ~4s (safe, no corruption) ✅
```

**Trade-off:** Slight delay for index updates, but guaranteed safety

---

## ✅ Definition of Done - MET

1. ✅ **Concurrency strategy decided** - Option B (locking around index updates)
2. ✅ **Locking implemented** - File-based lock with timeout
3. ✅ **Index updates protected** - All updates go through locked function
4. ✅ **Atomic writes maintained** - Temp file → verify → rename pattern
5. ✅ **No corruption possible** - Two simultaneous publishes cannot corrupt index
6. ✅ **Lock cleanup** - Automatic release, stale lock detection

---

## 📊 Lock Flow Diagram

```
Process 1: publishDoc()
  ↓
  File write (parallel, no lock needed)
  ↓
  Acquire index lock
  ↓
  Load index
  ↓
  Update index
  ↓
  Write temp file
  ↓
  Atomic rename
  ↓
  Release lock
  ✅ Complete

Process 2: publishDoc() (concurrent)
  ↓
  File write (parallel, no lock needed)
  ↓
  Try acquire lock → Locked by Process 1
  ↓
  Wait (up to 30s)
  ↓
  Lock acquired (Process 1 released)
  ↓
  Load index (sees Process 1's update)
  ↓
  Update index
  ↓
  Write temp file
  ↓
  Atomic rename
  ↓
  Release lock
  ✅ Complete
```

---

## 🎯 Summary

Publishing concurrency control is now **fully implemented**:

- ✅ Option B chosen: Concurrency with locking
- ✅ File-based locking around index updates
- ✅ Lock timeout (30 seconds)
- ✅ Stale lock detection (5 minutes)
- ✅ Automatic lock cleanup
- ✅ All index updates protected
- ✅ Atomic writes remain atomic
- ✅ Two simultaneous publishes cannot corrupt index

**The index is now safe from concurrent update corruption!**
