# ✅ STEP 8 Complete: Index ↔ Files Drift Validation

## Requirement

Add a validator that reports:
- ✅ Slugs listed in index with missing files
- ✅ Files present with missing index entries
- ✅ Duplicates or mismatched metadata

## Done When

You can run a check and get a clear report of inconsistencies.

---

## ✅ Implementation Complete

### 1. **Index Validator Module (`lib/content/index-validator.ts`)**

**Status:** ✅ Created

**Features:**
- ✅ `validateIndexDrift()` - Compares index vs files
- ✅ `printDriftReport()` - Human-readable report
- ✅ `validateAndPrintDrift()` - Complete operation
- ✅ Comprehensive drift detection

**Detects:**
- ✅ Index-only entries (missing files)
- ✅ File-only entries (missing from index)
- ✅ Metadata mismatches (title, description, category, dates)
- ✅ Duplicate entries in index

**Code:**
```typescript
export interface DriftReport {
  indexOnly: Array<{
    slug: string;
    reason: string;
  }>;
  fileOnly: Array<{
    slug: string;
    filePath: string;
    reason: string;
  }>;
  metadataMismatches: Array<{
    slug: string;
    field: string;
    indexValue: any;
    fileValue: any;
  }>;
  duplicates: Array<{
    slug: string;
    count: number;
    locations: string[];
  }>;
  summary: {
    totalIndexEntries: number;
    totalFiles: number;
    indexOnlyCount: number;
    fileOnlyCount: number;
    metadataMismatchCount: number;
    duplicateCount: number;
    validCount: number;
  };
}
```

### 2. **CLI Command (`scripts/run.ts`)**

**Status:** ✅ Created

**Command:** `validate-index`

**Options:**
- ✅ `--fix` - Automatically fix issues by rebuilding index

**Usage:**
```bash
# Check for drift
npm run pipeline:validate-index

# Check and auto-fix
npm run pipeline:validate-index -- --fix
```

### 3. **NPM Script (`package.json`)**

**Status:** ✅ Added

**Script:**
```json
"pipeline:validate-index": "tsx scripts/run.ts validate-index"
```

---

## ✅ Validation Checks

### Check 1: Index-Only Entries (Missing Files)

**Detects:** Slugs in index that don't have corresponding files

**Reasons:**
- File not found (ENOENT)
- Cannot access file (permission error)
- File exists but failed to load

**Example:**
```
❌ Index Entries with Missing Files:
────────────────────────────────────────────────────────────
   • deleted-post
     Reason: File not found
```

### Check 2: File-Only Entries (Missing from Index)

**Detects:** Files that don't have index entries

**Reasons:**
- File exists but missing from index
- File exists but is draft/noindex (excluded)
- File exists but wrong pageType
- File exists but failed to load (invalid JSON)

**Example:**
```
⚠️  Files Missing from Index:
────────────────────────────────────────────────────────────
   • new-post
     File: content/blog/new-post.json
     Reason: File exists but missing from index
```

### Check 3: Metadata Mismatches

**Detects:** Index and file have different values for:
- `slug`
- `title`
- `description`
- `category` (vs `categorySlug` in file)
- `publishedAt`

**Example:**
```
🔄 Metadata Mismatches:
────────────────────────────────────────────────────────────
   • updated-post:
     - title:
       Index: "Old Title"
       File:  "New Title"
     - description:
       Index: "Old description"
       File:  "New description"
```

### Check 4: Duplicates in Index

**Detects:** Same slug appearing multiple times in index

**Example:**
```
🔁 Duplicate Entries in Index:
────────────────────────────────────────────────────────────
   • duplicate-slug (appears 2 times)
     Locations: index[5], index[12]
```

---

## ✅ Report Output

### Example 1: No Drift

```
📊 Index ↔ Files Drift Validation Report

════════════════════════════════════════════════════════════

📈 Summary:
   Total index entries: 5
   Total files: 5
   ✅ Valid matches: 5
   ❌ Index-only (missing files): 0
   ⚠️  File-only (missing from index): 0
   🔄 Metadata mismatches: 0
   🔁 Duplicates in index: 0

════════════════════════════════════════════════════════════

✅ No drift detected - index and files are in sync!
```

### Example 2: With Drift

```
📊 Index ↔ Files Drift Validation Report

════════════════════════════════════════════════════════════

📈 Summary:
   Total index entries: 6
   Total files: 5
   ✅ Valid matches: 4
   ❌ Index-only (missing files): 1
   ⚠️  File-only (missing from index): 1
   🔄 Metadata mismatches: 1
   🔁 Duplicates in index: 0

❌ Index Entries with Missing Files:
────────────────────────────────────────────────────────────
   • deleted-post
     Reason: File not found

⚠️  Files Missing from Index:
────────────────────────────────────────────────────────────
   • new-post
     File: content/blog/new-post.json
     Reason: File exists but missing from index

🔄 Metadata Mismatches:
────────────────────────────────────────────────────────────
   • updated-post:
     - title:
       Index: "Old Title"
       File:  "New Title"

════════════════════════════════════════════════════════════

⚠️  Issues detected! Run `npm run pipeline:rebuild-index` to fix.
```

### Example 3: With Duplicates

```
📊 Index ↔ Files Drift Validation Report

════════════════════════════════════════════════════════════

📈 Summary:
   Total index entries: 7
   Total files: 5
   ✅ Valid matches: 4
   ❌ Index-only (missing files): 0
   ⚠️  File-only (missing from index): 1
   🔄 Metadata mismatches: 0
   🔁 Duplicates in index: 1

⚠️  Files Missing from Index:
────────────────────────────────────────────────────────────
   • new-post
     File: content/blog/new-post.json
     Reason: File exists but missing from index

🔁 Duplicate Entries in Index:
────────────────────────────────────────────────────────────
   • duplicate-slug (appears 2 times)
     Locations: index[2], index[5]

════════════════════════════════════════════════════════════

⚠️  Issues detected! Run `npm run pipeline:rebuild-index` to fix.
```

---

## ✅ Auto-Fix Option

### With `--fix` Flag

**Command:**
```bash
npm run pipeline:validate-index -- --fix
```

**Behavior:**
1. Runs validation
2. Prints report
3. If issues detected, automatically rebuilds index
4. Rebuilds from files (fixes all drift issues)

**Output:**
```
📊 Index ↔ Files Drift Validation Report
...
⚠️  Issues detected! Run `npm run pipeline:rebuild-index` to fix.

🔧 Auto-fixing issues by rebuilding index...

📁 Found 5 blog post files to scan
...
✅ Index rebuilt! Run validation again to verify.
```

---

## ✅ Use Cases

### Use Case 1: Regular Health Check

**Scenario:** Check for drift periodically

**Solution:**
```bash
npm run pipeline:validate-index
```

**Result:** 
- ✅ Shows summary of inconsistencies
- ✅ Lists all issues
- ✅ Suggests fix command

### Use Case 2: After Manual File Deletion

**Scenario:** Deleted a file manually, want to check if index is stale

**Solution:**
```bash
npm run pipeline:validate-index
```

**Result:**
- ✅ Detects missing file
- ✅ Reports index-only entry
- ✅ Suggests rebuild

### Use Case 3: After Manual File Addition

**Scenario:** Added a file manually, want to check if it's in index

**Solution:**
```bash
npm run pipeline:validate-index
```

**Result:**
- ✅ Detects file-only entry
- ✅ Reports missing from index
- ✅ Suggests rebuild

### Use Case 4: Auto-Fix All Issues

**Scenario:** Want to fix all drift issues automatically

**Solution:**
```bash
npm run pipeline:validate-index -- --fix
```

**Result:**
- ✅ Validates drift
- ✅ Automatically rebuilds index
- ✅ Fixes all inconsistencies

---

## ✅ Validation Logic

### Index-Only Detection

```typescript
for (const entry of index.blogPosts) {
  const filePath = path.join(BLOG_DIR, `${entry.slug}.json`);
  
  try {
    await fs.access(filePath);
    // File exists - check metadata
  } catch (error) {
    // File doesn't exist - index-only entry
    report.indexOnly.push({
      slug: entry.slug,
      reason: 'File not found',
    });
  }
}
```

### File-Only Detection

```typescript
for (const slug of fileSlugs) {
  if (!indexSlugs.has(slug)) {
    // File exists but not in index
    report.fileOnly.push({
      slug,
      filePath,
      reason: 'File exists but missing from index',
    });
  }
}
```

### Metadata Mismatch Detection

```typescript
if (doc.title !== entry.title) {
  mismatches.push({
    field: 'title',
    indexValue: entry.title,
    fileValue: doc.title,
  });
}
// ... check other fields
```

### Duplicate Detection

```typescript
const slugCounts = new Map<string, number>();
index.blogPosts.forEach((entry) => {
  const count = slugCounts.get(entry.slug) || 0;
  slugCounts.set(entry.slug, count + 1);
});

slugCounts.forEach((count, slug) => {
  if (count > 1) {
    report.duplicates.push({
      slug,
      count,
      locations: [...],
    });
  }
});
```

---

## ✅ Definition of Done - MET

1. ✅ **Reports index-only entries** - Slugs in index with missing files
2. ✅ **Reports file-only entries** - Files missing from index
3. ✅ **Reports metadata mismatches** - Differences in title, description, category, dates
4. ✅ **Reports duplicates** - Same slug appearing multiple times in index
5. ✅ **Clear report format** - Human-readable output with summary
6. ✅ **First-class command** - Accessible via `npm run pipeline:validate-index`
7. ✅ **Auto-fix option** - `--fix` flag to automatically rebuild index

---

## 📊 Report Structure

### Summary Section
- Total index entries
- Total files
- Valid matches count
- Issue counts by type

### Detailed Sections
- **Index-only entries**: List of slugs with missing files
- **File-only entries**: List of files missing from index
- **Metadata mismatches**: Field-by-field differences
- **Duplicates**: Slugs appearing multiple times

### Status Message
- ✅ No issues detected
- ⚠️ Issues detected (with fix suggestion)

---

## 🎯 Summary

Index ↔ Files drift validation is now **fully implemented**:

- ✅ Detects index-only entries (missing files)
- ✅ Detects file-only entries (missing from index)
- ✅ Detects metadata mismatches
- ✅ Detects duplicates in index
- ✅ Clear, human-readable reports
- ✅ Auto-fix option with `--fix` flag
- ✅ First-class CLI command

**You can now run a check and get a clear report of all inconsistencies!**
