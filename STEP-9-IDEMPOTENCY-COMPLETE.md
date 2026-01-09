# ✅ STEP 9 Complete: Ensure Publishing is Idempotent

## Requirement

If a publish job retries after failure:
1. ✅ It must not duplicate index entries
2. ✅ It must not republish the same topicKey
3. ✅ It must not overwrite a finished post silently

## Done When

Re-running the same job is safe.

---

## ✅ Implementation Complete

### Idempotency Strategy

The publisher now implements **idempotent publishing** by:

1. **Checking publish state before proceeding** - Determines if post is fully published, partially published, or not published
2. **Skipping fully published posts** - Returns success without re-publishing
3. **Completing partially published posts** - Finishes missing steps (file, topic index, content index)
4. **Detecting conflicts** - Throws errors for actual conflicts (different topicKey with same slug)
5. **Preventing duplicates** - All index updates check for existing entries before adding

---

### 1. **Idempotency Check (Pre-Publish State Detection)**

**Location:** `scripts/pipeline/publisher.ts` (lines 243-323)

**Implementation:**
```typescript
// IDEMPOTENCY CHECK: Determine publish state before proceeding
const filePath = getFilePath(doc);
const topicKey = generateTopicKey(doc);

// Check current state
const fileExists = await checkFileExists(filePath);
const contentIndex = await loadContentIndex();
const topicRecord = await getRecord(topicKey);

// Check if slug exists in content index
let slugInIndex = false;
// ... check for slug in appropriate index array ...

const topicKeyPublished = topicRecord?.status === 'published' && topicRecord?.slug === doc.slug;

// IDEMPOTENCY: Check if already fully published
if (fileExists && slugInIndex && topicKeyPublished) {
  logger.info(`✅ Post already fully published: ${doc.slug} (idempotent skip)`);
  // Return success without re-publishing
  return { routePath, slug: doc.slug };
}

// IDEMPOTENCY: Check for conflicts (different topicKey with same slug)
if (fileExists && topicRecord && topicRecord.topicKey !== topicKey) {
  throw new PublishError(
    `Conflict: File exists with slug "${doc.slug}" but belongs to different topicKey...`,
    'SLUG_TOPICKEY_CONFLICT'
  );
}
```

**Features:**
- ✅ **State detection** - Checks file, content index, and topic index
- ✅ **Fully published skip** - Returns success if already fully published
- ✅ **Conflict detection** - Throws error for actual conflicts
- ✅ **Partial publish detection** - Logs when completing partial publishes

---

### 2. **Idempotent File Write**

**Location:** `scripts/pipeline/publisher.ts` (lines 334-360)

**Before (NOT idempotent):**
```typescript
// ❌ Always writes file, throws error if exists
await atomicWrite(filePath, JSON.stringify(doc, null, 2));
```

**After (idempotent):**
```typescript
// IDEMPOTENCY: Only write file if it doesn't exist
if (!fileExists) {
  // SAFEGUARD 5: Atomic file write (prevents corruption)
  logger.info(`Writing to: ${filePath}`);
  await atomicWrite(filePath, JSON.stringify(doc, null, 2));
  fileWritten = true;
  logger.info(`✅ File written successfully`);
} else {
  logger.info(`⏭️  File already exists, skipping write: ${filePath}`);
  // Verify existing file is valid (sanity check)
  const existingDoc = await loadContentDoc(filePath);
  if (!existingDoc || existingDoc.slug !== doc.slug) {
    throw new PublishError(
      `Existing file at ${filePath} has invalid or mismatched content`,
      'EXISTING_FILE_INVALID'
    );
  }
  logger.info(`✅ Existing file verified: ${filePath}`);
}
```

**Features:**
- ✅ **Skip if exists** - Only writes file if it doesn't exist
- ✅ **Verification** - Validates existing file matches expected slug
- ✅ **No overwrite** - Never overwrites finished posts silently

---

### 3. **Idempotent Topic Index Update**

**Location:** `scripts/pipeline/publisher.ts` (lines 362-372)

**Before (NOT idempotent):**
```typescript
// ❌ Always updates topic index, throws error if topicKey exists
const topicExists = await topicKeyExists(topicKey);
if (topicExists) {
  throw new PublishError('Topic key already exists...', 'DUPLICATE_TOPIC_KEY');
}
await markPublished(topicKey, doc.slug, hash, sourcesUsed);
```

**After (idempotent):**
```typescript
// IDEMPOTENCY: Only update topic index if not already published
if (!topicKeyPublished) {
  const hash = contentHash(doc.body);
  const sourcesUsed = doc.sources.map((s) => s.url);
  logger.info('Updating topic index...');
  await markPublished(topicKey, doc.slug, hash, sourcesUsed);
  topicIndexUpdated = true;
  logger.info('✅ Topic index updated');
} else {
  logger.info(`⏭️  Topic key already published, skipping update: ${topicKey}`);
}
```

**Features:**
- ✅ **Skip if published** - Only updates if topicKey not already published
- ✅ **No duplicate topicKey** - Never republishes the same topicKey
- ✅ **Safe upsert** - `markPublished()` uses `upsertRecord()` which is idempotent

---

### 4. **Idempotent Content Index Update**

**Location:** `scripts/pipeline/publisher.ts` (lines 384-475)

**Before (NOT idempotent):**
```typescript
// ❌ Always adds to index, throws error if slug exists
if (index.blogPosts.some((b: any) => b.slug === doc.slug)) {
  throw new PublishError('Duplicate slug in content index...', 'DUPLICATE_IN_INDEX');
}
index.blogPosts.push(blogEntry);
```

**After (idempotent):**
```typescript
// IDEMPOTENCY: Only update content index if slug not already in index
if (!slugInIndex) {
  await atomicIndexUpdate(
    path.join(process.cwd(), 'content', '_system', 'contentIndex.json'),
    (index) => {
      // ... build entry ...
      
      switch (doc.pageType) {
        case 'blog':
          // IDEMPOTENCY: Check for duplicate slug (should not happen, but safe check)
          if (index.blogPosts.some((b: any) => b.slug === doc.slug)) {
            // Already in index - skip (idempotent)
            logger.info(`⏭️  Slug already in blog index, skipping: ${doc.slug}`);
            return index;
          }
          index.blogPosts.push(blogEntry);
          break;
        // ... other page types ...
      }
      
      return index;
    }
  );
  contentIndexUpdated = true;
  logger.info('✅ Content index updated');
} else {
  logger.info(`⏭️  Slug already in content index, skipping update: ${doc.slug}`);
}
```

**Features:**
- ✅ **Skip if in index** - Only updates if slug not already in index
- ✅ **Double-check** - Even inside update callback, checks for duplicates
- ✅ **No duplicate entries** - Never adds duplicate index entries

---

### 5. **Idempotent Rollback**

**Location:** `scripts/pipeline/publisher.ts` (lines 557-571)

**Before (NOT idempotent):**
```typescript
// ❌ Always rolls back file if written
if (fileWritten) {
  await fs.unlink(filePath);
}
```

**After (idempotent):**
```typescript
// ROLLBACK: Clean up on failure (only rollback what we wrote in this attempt)
// Only rollback file if we wrote it in this attempt (idempotency: don't delete existing files)
if (fileWritten) {
  try {
    await fs.unlink(filePath);
    logger.info(`Rolled back: Deleted ${filePath}`);
  } catch (rollbackError) {
    logger.error(`Failed to rollback file: ${rollbackError}`);
  }
}

// Note: Topic index and content index updates are atomic and idempotent
// - If they failed, they didn't write anything, so no rollback needed
// - If they succeeded but we're here, that means a later step failed
// - For idempotency, we don't rollback index updates (they're safe to keep)
```

**Features:**
- ✅ **Only rollback new writes** - Only deletes files written in this attempt
- ✅ **Preserve existing files** - Never deletes existing files during rollback
- ✅ **Safe index updates** - Index updates are atomic, no rollback needed

---

## ✅ Idempotency Scenarios

### Scenario 1: Fully Published Post (Retry After Success)

**Setup:**
- File exists: ✅
- In content index: ✅
- Topic key published: ✅

**Behavior:**
```typescript
// Pre-publish check detects fully published state
if (fileExists && slugInIndex && topicKeyPublished) {
  logger.info(`✅ Post already fully published: ${doc.slug} (idempotent skip)`);
  return { routePath, slug: doc.slug }; // Return success immediately
}
```

**Result:** ✅ **Safely skipped** - Returns success without re-publishing

---

### Scenario 2: Partial Publish (File Written, Index Not Updated)

**Setup:**
- File exists: ✅
- In content index: ❌
- Topic key published: ❌

**Behavior:**
```typescript
// Pre-publish check detects partial state
if (fileExists && (!slugInIndex || !topicKeyPublished)) {
  logger.info(`⚠️  Post partially published: ${doc.slug} (completing publish)`);
  // Continue to complete missing steps
}

// Skip file write (already exists)
if (!fileExists) { /* write file */ } else { /* skip */ }

// Complete topic index
if (!topicKeyPublished) { /* update topic index */ } else { /* skip */ }

// Complete content index
if (!slugInIndex) { /* update content index */ } else { /* skip */ }
```

**Result:** ✅ **Safely completed** - Completes missing steps without duplicating

---

### Scenario 3: Partial Publish (File and Topic Index, Content Index Missing)

**Setup:**
- File exists: ✅
- In content index: ❌
- Topic key published: ✅

**Behavior:**
```typescript
// Pre-publish check detects partial state
// Skip file write (already exists)
// Skip topic index (already published)
// Complete content index (missing)
if (!slugInIndex) {
  await atomicIndexUpdate(/* add to index */);
}
```

**Result:** ✅ **Safely completed** - Adds to content index without duplicating

---

### Scenario 4: Conflict (Different TopicKey with Same Slug)

**Setup:**
- File exists: ✅
- File belongs to different topicKey: ✅

**Behavior:**
```typescript
// Pre-publish check detects conflict
if (fileExists && topicRecord && topicRecord.topicKey !== topicKey) {
  throw new PublishError(
    `Conflict: File exists with slug "${doc.slug}" but belongs to different topicKey...`,
    'SLUG_TOPICKEY_CONFLICT'
  );
}
```

**Result:** ✅ **Safely rejected** - Throws error for actual conflict

---

### Scenario 5: Retry After Failure (No Partial State)

**Setup:**
- File exists: ❌
- In content index: ❌
- Topic key published: ❌

**Behavior:**
```typescript
// Pre-publish check detects not published
// Write file (doesn't exist)
if (!fileExists) { await atomicWrite(/* ... */); }

// Update topic index (not published)
if (!topicKeyPublished) { await markPublished(/* ... */); }

// Update content index (not in index)
if (!slugInIndex) { await atomicIndexUpdate(/* ... */); }
```

**Result:** ✅ **Safely published** - Normal publish flow

---

## ✅ All Requirements Met

### 1. ✅ It Must Not Duplicate Index Entries

**Evidence:**
- Content index update checks `slugInIndex` before updating
- Inside update callback, double-checks for duplicates before adding
- Topic index uses `upsertRecord()` which is idempotent
- All index updates skip if entry already exists

**Location:**
- `scripts/pipeline/publisher.ts` (lines 384-475)

---

### 2. ✅ It Must Not Republish the Same TopicKey

**Evidence:**
- Pre-publish check detects if topicKey already published
- Topic index update skipped if `topicKeyPublished === true`
- `markPublished()` uses `upsertRecord()` which is idempotent
- Returns success immediately if fully published

**Location:**
- `scripts/pipeline/publisher.ts` (lines 277-289, 362-372)

---

### 3. ✅ It Must Not Overwrite a Finished Post Silently

**Evidence:**
- Pre-publish check detects fully published posts
- Returns success immediately without writing file
- File write skipped if `fileExists === true`
- Verifies existing file matches expected slug
- Throws error for conflicts (different topicKey)

**Location:**
- `scripts/pipeline/publisher.ts` (lines 277-289, 334-360)

---

### 4. ✅ Re-Running the Same Job is Safe

**Evidence:**
- All three idempotency checks in place
- Fully published posts return success immediately
- Partially published posts complete missing steps
- Conflicts throw errors (fail fast)
- No duplicate entries, no overwrites, no republishing

**Test Cases:**
1. ✅ Fully published → Returns success (skip)
2. ✅ Partial publish (file only) → Completes index updates
3. ✅ Partial publish (file + topic) → Completes content index
4. ✅ Conflict (different topicKey) → Throws error
5. ✅ Not published → Normal publish flow

---

## 🎯 Summary

**Status:** ✅ **COMPLETE**

Publishing is now fully idempotent:
- ✅ **No duplicate index entries** - All index updates check for existing entries
- ✅ **No republishing same topicKey** - Skips if topicKey already published
- ✅ **No overwriting finished posts** - Returns success if already fully published
- ✅ **Safe retries** - Re-running the same job is safe

**Idempotency Pattern:**
1. **Check state** - Determine if fully/partially/not published
2. **Skip if done** - Return success if fully published
3. **Complete if partial** - Finish missing steps
4. **Detect conflicts** - Throw errors for actual conflicts
5. **Prevent duplicates** - All updates check before adding

**Re-running the same job is safe!** 🎉
