# ✅ STEP 7 Complete: "Rebuild Index from Files" as First-Class Command

## Requirement

Create a maintenance operation that:
- ✅ Scans `content/blog/*.json`
- ✅ Validates each file
- ✅ Rebuilds a clean index from valid posts
- ✅ Logs invalid ones

## Done When

You can delete/repair index and recreate it automatically.

---

## ✅ Implementation Complete

### 1. **Index Rebuild Module (`lib/content/index-rebuild.ts`)**

**Status:** ✅ Created

**Features:**
- ✅ `rebuildIndexFromFiles()` - Scans and validates all blog files
- ✅ `saveRebuiltIndex()` - Saves rebuilt index to file
- ✅ `rebuildAndSaveIndex()` - Complete operation (rebuild + save)
- ✅ Comprehensive statistics tracking
- ✅ Detailed logging for each file

**Statistics Tracked:**
- ✅ Total files scanned
- ✅ Valid posts indexed
- ✅ Invalid posts (failed to load)
- ✅ Quarantined posts (schema validation failed)
- ✅ Draft/noindex posts (excluded)
- ✅ Error details for each invalid post

**Code:**
```typescript
export interface RebuildStats {
  totalFiles: number;
  validPosts: number;
  invalidPosts: number;
  quarantinedPosts: number;
  draftPosts: number;
  errors: Array<{
    slug: string;
    filePath: string;
    reason: string;
    errors?: string[];
  }>;
}
```

### 2. **CLI Command (`scripts/run.ts`)**

**Status:** ✅ Created

**Command:** `rebuild-index`

**Options:**
- ✅ `--backup` - Create backup of current index before rebuilding (default: true)
- ✅ `--dry-run` - Show what would be rebuilt without saving (default: false)

**Usage:**
```bash
# Rebuild index (with backup)
npm run pipeline:rebuild-index

# Dry run (see what would be rebuilt)
npm run pipeline:rebuild-index -- --dry-run

# Rebuild without backup
npm run pipeline:rebuild-index -- --no-backup
```

**Code:**
```typescript
program
  .command('rebuild-index')
  .description('Rebuild content index from files (maintenance operation)')
  .option('--backup', 'Create backup of current index before rebuilding', true)
  .option('--dry-run', 'Show what would be rebuilt without saving', false)
  .action(async (options) => {
    // Creates backup, rebuilds index, saves result
  });
```

### 3. **NPM Script (`package.json`)**

**Status:** ✅ Added

**Script:**
```json
"pipeline:rebuild-index": "tsx scripts/run.ts rebuild-index"
```

---

## ✅ Rebuild Process

### Step-by-Step Flow

```
1. User runs: npm run pipeline:rebuild-index
   ↓
2. Create backup (if --backup enabled)
   ↓
3. Scan content/blog/*.json files
   ↓
4. For each file:
   a. Load document
   b. Validate schema
   c. Check draft/noindex
   d. Build index entry (if valid)
   e. Log status (✅ valid, ❌ invalid, 🚫 quarantined, ⚠️ draft)
   ↓
5. Generate statistics
   ↓
6. Save rebuilt index (unless --dry-run)
   ↓
7. Display summary
```

### Validation Steps

For each blog post file:

1. **Load Document**
   - Uses `loadContentDoc()` (logs errors automatically)
   - If fails → Invalid post

2. **Schema Validation**
   - Uses `validateAndQuarantine()` (logs validation errors)
   - If fails → Quarantined post

3. **Draft/Noindex Check**
   - Excludes drafts and noindex posts
   - Logs as draft (not an error)

4. **Build Index Entry**
   - Creates `BlogPostIndexEntry` from valid document
   - Includes all required fields

---

## ✅ Output Examples

### Example 1: Successful Rebuild

```
🔧 Rebuilding content index from files...

Creating backup of current index...
✅ Backup created

📁 Found 5 blog post files to scan

  ✅ how-to-tie-a-fishing-hook: Valid post indexed
  ✅ best-fishing-times: Valid post indexed
  ✅ topwater-fishing-strategies: Valid post indexed
  ⚠️  draft-post: Draft/noindex (excluded from index)
  ✅ redfish-fishing-guide: Valid post indexed

📊 Rebuild Summary:
   Total files: 5
   ✅ Valid posts: 4
   ❌ Invalid posts: 0
   🚫 Quarantined posts: 0
   📝 Draft/noindex posts: 1
   📋 Total indexed: 4

✅ Index saved to: content/_system/contentIndex.json

✅ Index rebuild complete!
   Valid posts indexed: 4
```

### Example 2: With Invalid Posts

```
🔧 Rebuilding content index from files...

📁 Found 5 blog post files to scan

  ✅ how-to-tie-a-fishing-hook: Valid post indexed
  ❌ corrupted-post: Failed to load document (see logs for details)
  🚫 invalid-schema: Schema validation failed (quarantined)
  ✅ best-fishing-times: Valid post indexed
  ⚠️  draft-post: Draft/noindex (excluded from index)

⚠️  Invalid/Quarantined Posts:

   - corrupted-post: Failed to load document (see logs for details)
   - invalid-schema: Schema validation failed (quarantined)

📊 Rebuild Summary:
   Total files: 5
   ✅ Valid posts: 2
   ❌ Invalid posts: 1
   🚫 Quarantined posts: 1
   📝 Draft/noindex posts: 1
   📋 Total indexed: 2

✅ Index saved to: content/_system/contentIndex.json

✅ Index rebuild complete!
   Valid posts indexed: 2
   ⚠️  2 posts were invalid/quarantined (see logs above)
```

### Example 3: Dry Run

```
🔧 Rebuilding content index from files...

📁 Found 5 blog post files to scan

  ✅ how-to-tie-a-fishing-hook: Valid post indexed
  ✅ best-fishing-times: Valid post indexed
  ...

📊 Rebuild Summary:
   Total files: 5
   ✅ Valid posts: 4
   ❌ Invalid posts: 0
   🚫 Quarantined posts: 0
   📝 Draft/noindex posts: 1
   📋 Total indexed: 4

🔍 DRY RUN - Index would be rebuilt with:
   4 valid posts
   0 invalid posts
   0 quarantined posts
   1 draft/noindex posts

Run without --dry-run to save the rebuilt index.
```

---

## ✅ Use Cases

### Use Case 1: Index Corrupted

**Scenario:** Index file is corrupted or deleted

**Solution:**
```bash
npm run pipeline:rebuild-index
```

**Result:** 
- ✅ Scans all blog files
- ✅ Validates each one
- ✅ Rebuilds clean index
- ✅ Logs invalid files

### Use Case 2: Repair Index

**Scenario:** Index is missing entries or has stale data

**Solution:**
```bash
npm run pipeline:rebuild-index
```

**Result:**
- ✅ Rebuilds index from current files
- ✅ Only includes valid, published posts
- ✅ Excludes drafts and invalid posts

### Use Case 3: Preview Rebuild

**Scenario:** Want to see what would be rebuilt without saving

**Solution:**
```bash
npm run pipeline:rebuild-index -- --dry-run
```

**Result:**
- ✅ Shows statistics
- ✅ Lists what would be indexed
- ✅ Doesn't modify index file

### Use Case 4: Rebuild Without Backup

**Scenario:** Index is completely broken, don't need backup

**Solution:**
```bash
npm run pipeline:rebuild-index -- --no-backup
```

**Result:**
- ✅ Skips backup creation
- ✅ Rebuilds index directly

---

## ✅ Logging Details

### Valid Post
```
✅ how-to-tie-a-fishing-hook: Valid post indexed
```

### Invalid Post (Load Failed)
```
❌ corrupted-post: Failed to load document (see logs for details)
[CONTENT_LOAD_ERROR] ... (detailed error logged)
```

### Quarantined Post (Schema Failed)
```
🚫 invalid-schema: Schema validation failed (quarantined)
[CONTENT_VALIDATION_ERROR] ... (validation errors logged)
```

### Draft/Noindex Post
```
⚠️  draft-post: Draft/noindex (excluded from index)
```

---

## ✅ Definition of Done - MET

1. ✅ **Scans content/blog/*.json** - Reads all JSON files in blog directory
2. ✅ **Validates each file** - Uses schema validation and quarantine
3. ✅ **Rebuilds clean index** - Creates new index from valid posts only
4. ✅ **Logs invalid ones** - Detailed logging for each invalid file
5. ✅ **First-class command** - Accessible via `npm run pipeline:rebuild-index`
6. ✅ **Can delete/repair index** - Can recreate index automatically

---

## 📊 Statistics Output

The rebuild command provides comprehensive statistics:

```
📊 Rebuild Summary:
   Total files: 10
   ✅ Valid posts: 7
   ❌ Invalid posts: 1
   🚫 Quarantined posts: 1
   📝 Draft/noindex posts: 1
   📋 Total indexed: 7
```

**Breakdown:**
- **Total files**: All `.json` files found
- **Valid posts**: Successfully indexed
- **Invalid posts**: Failed to load (file errors)
- **Quarantined posts**: Schema validation failed
- **Draft/noindex posts**: Excluded (not errors)
- **Total indexed**: Final count in rebuilt index

---

## 🎯 Summary

"Rebuild index from files" is now a **first-class maintenance operation**:

- ✅ Standalone CLI command
- ✅ Scans and validates all blog files
- ✅ Rebuilds clean index from valid posts
- ✅ Comprehensive logging for invalid files
- ✅ Statistics and summary output
- ✅ Dry-run mode for preview
- ✅ Automatic backup before rebuild
- ✅ Can repair or recreate index automatically

**You can now delete/repair the index and recreate it automatically!**
