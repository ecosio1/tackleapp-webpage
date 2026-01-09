# ✅ STEP 11 Complete: Add "Index ↔ Files Drift Check"

## Requirement

Validator reports:
1. ✅ Index references missing files
2. ✅ File exists but not in index
3. ✅ Duplicates
4. ✅ Invalid schema docs

## Done When

You can detect and fix drift quickly.

---

## ✅ Implementation Complete

### Drift Validator Implementation

**Location:** `lib/content/index-drift-validator.ts`

**Command:** `npm run pipeline:validate-index` (or `tsx scripts/run.ts validate-index`)

**Features:**
- ✅ **Detects index-only entries** - Index references missing files
- ✅ **Detects file-only entries** - Files exist but not in index
- ✅ **Detects duplicates** - Duplicate slugs in index
- ✅ **Detects invalid schema** - Documents with invalid schema
- ✅ **Detects metadata mismatches** - Index and file metadata don't match
- ✅ **Auto-fix option** - Can rebuild index from files with `--fix`

---

### 1. **Index References Missing Files**

**Location:** `lib/content/index-drift-validator.ts` (lines 119-221)

**Implementation:**
```typescript
// Check for index-only entries (missing files)
for (const entry of index.blogPosts) {
  const filePath = path.join(BLOG_DIR, `${entry.slug}.json`);
  
  try {
    await fs.access(filePath);
    // File exists - check metadata and schema...
  } catch (error) {
    // File doesn't exist
    const fileError = error as NodeJS.ErrnoException;
    if (fileError.code === 'ENOENT') {
      report.indexOnly.push({
        slug: entry.slug,
        reason: 'File not found',
      });
    } else {
      report.indexOnly.push({
        slug: entry.slug,
        reason: `Cannot access file: ${fileError.message}`,
      });
    }
  }
}
```

**Features:**
- ✅ **Checks file existence** - Uses `fs.access()` to verify file exists
- ✅ **Reports missing files** - Adds to `indexOnly` array with reason
- ✅ **Handles access errors** - Distinguishes between missing files and access errors

**Example Output:**
```
❌ Index Entries with Missing Files:
────────────────────────────────────────────────────────────
   • my-blog-post
     Reason: File not found
```

---

### 2. **File Exists But Not In Index**

**Location:** `lib/content/index-drift-validator.ts` (lines 226-272)

**Implementation:**
```typescript
// Check for file-only entries (missing from index)
for (const slug of fileSlugs) {
  if (!indexSlugs.has(slug)) {
    const filePath = path.join(BLOG_DIR, `${slug}.json`);
    
    // Try to load to see if it's valid
    const doc = await loadContentDoc(filePath);
    
    if (!doc) {
      report.fileOnly.push({
        slug,
        filePath,
        reason: 'File exists but failed to load (invalid JSON or file error)',
      });
    } else {
      // Check schema validity
      const schemaValidation = validateDocumentSchema(doc, 'blog');
      if (!schemaValidation.valid) {
        report.invalidSchema.push({
          slug,
          filePath,
          errors: schemaValidation.errors,
          warnings: schemaValidation.warnings.length > 0 ? schemaValidation.warnings : undefined,
        });
        // Don't add to fileOnly if schema is invalid (it's tracked separately)
      } else if (doc.pageType !== 'blog') {
        report.fileOnly.push({
          slug,
          filePath,
          reason: `File exists but wrong pageType: ${doc.pageType}`,
        });
      } else if (doc.flags?.draft || doc.flags?.noindex) {
        report.fileOnly.push({
          slug,
          filePath,
          reason: 'File exists but is draft/noindex (excluded from index)',
        });
      } else {
        report.fileOnly.push({
          slug,
          filePath,
          reason: 'File exists but missing from index',
        });
      }
    }
  }
}
```

**Features:**
- ✅ **Checks all files** - Scans blog directory for JSON files
- ✅ **Validates schema first** - Invalid schema files tracked separately
- ✅ **Handles edge cases** - Draft/noindex files, wrong pageType, invalid JSON
- ✅ **Clear reasons** - Explains why file is not in index

**Example Output:**
```
⚠️  Files Missing from Index:
────────────────────────────────────────────────────────────
   • my-new-post
     File: content/blog/my-new-post.json
     Reason: File exists but missing from index
```

---

### 3. **Duplicates**

**Location:** `lib/content/index-drift-validator.ts` (lines 82-106)

**Implementation:**
```typescript
// Check for duplicates in index
const slugCounts = new Map<string, number>();
const slugLocations = new Map<string, string[]>();

index.blogPosts.forEach((entry, indexPos) => {
  const count = slugCounts.get(entry.slug) || 0;
  slugCounts.set(entry.slug, count + 1);
  
  if (!slugLocations.has(entry.slug)) {
    slugLocations.set(entry.slug, []);
  }
  slugLocations.get(entry.slug)!.push(`index[${indexPos}]`);
});

slugCounts.forEach((count, slug) => {
  if (count > 1) {
    report.duplicates.push({
      slug,
      count,
      locations: slugLocations.get(slug) || [],
    });
  }
});
```

**Features:**
- ✅ **Detects duplicates** - Finds slugs that appear multiple times
- ✅ **Tracks locations** - Records index positions of duplicates
- ✅ **Counts occurrences** - Reports how many times each slug appears

**Example Output:**
```
🔁 Duplicate Entries in Index:
────────────────────────────────────────────────────────────
   • my-duplicate-post (appears 2 times)
     Locations: index[5], index[12]
```

---

### 4. **Invalid Schema Docs**

**Location:** `lib/content/index-drift-validator.ts` (lines 136-147, 241-250)

**Implementation:**
```typescript
// Check schema validity first
const schemaValidation = validateDocumentSchema(doc, 'blog');
if (!schemaValidation.valid) {
  report.invalidSchema.push({
    slug: entry.slug,
    filePath,
    errors: schemaValidation.errors,
    warnings: schemaValidation.warnings.length > 0 ? schemaValidation.warnings : undefined,
  });
  // Don't continue metadata check if schema is invalid
  continue;
}
```

**Features:**
- ✅ **Validates schema** - Uses `validateDocumentSchema()` from `schema-validator.ts`
- ✅ **Reports errors** - Lists all schema validation errors
- ✅ **Reports warnings** - Lists schema warnings (optional fields)
- ✅ **Tracks file path** - Includes file path for easy fixing
- ✅ **Separate tracking** - Invalid schema tracked separately from other issues

**Example Output:**
```
🚫 Invalid Schema Documents:
────────────────────────────────────────────────────────────
   • my-invalid-post
     File: content/blog/my-invalid-post.json
     Schema Errors:
       - Missing or invalid required field: id (must be string)
       - Missing or invalid required field: title (must be non-empty string)
     Schema Warnings:
       ⚠️  Optional field faqs is not an array (expected array or undefined)
```

---

### 5. **Metadata Mismatches**

**Location:** `lib/content/index-drift-validator.ts` (lines 149-205)

**Implementation:**
```typescript
// Check metadata matches (only if schema is valid)
const mismatches: Array<{ field: string; indexValue: any; fileValue: any }> = [];

if (doc.slug !== entry.slug) {
  mismatches.push({
    field: 'slug',
    indexValue: entry.slug,
    fileValue: doc.slug,
  });
}

if (doc.title !== entry.title) {
  mismatches.push({
    field: 'title',
    indexValue: entry.title,
    fileValue: doc.title,
  });
}

// ... more field checks ...

if (mismatches.length > 0) {
  mismatches.forEach((mismatch) => {
    report.metadataMismatches.push({
      slug: entry.slug,
      field: mismatch.field,
      indexValue: mismatch.indexValue,
      fileValue: mismatch.fileValue,
    });
  });
}
```

**Features:**
- ✅ **Validates metadata** - Checks slug, title, description, category, publishedAt
- ✅ **Shows differences** - Reports index value vs file value
- ✅ **Groups by slug** - Groups mismatches by slug for readability

**Example Output:**
```
🔄 Metadata Mismatches:
────────────────────────────────────────────────────────────
   • my-mismatched-post:
     - title:
       Index: "Old Title"
       File:  "New Title"
     - description:
       Index: "Old description"
       File:  "New description"
```

---

### 6. **Auto-Fix Option**

**Location:** `scripts/run.ts` (lines 261-294)

**Implementation:**
```typescript
program
  .command('validate-index')
  .description('Validate index ↔ files drift (check for inconsistencies)')
  .option('--fix', 'Automatically fix issues by rebuilding index', false)
  .action(async (options) => {
    const report = await validateAndPrintDrift();

    // Auto-fix if requested
    if (options.fix) {
      const hasIndexIssues = 
        report.indexOnly.length > 0 ||
        report.fileOnly.length > 0 ||
        report.metadataMismatches.length > 0 ||
        report.duplicates.length > 0;
      
      const hasSchemaIssues = report.invalidSchema.length > 0;

      if (hasIndexIssues) {
        console.log('\n🔧 Auto-fixing index issues by rebuilding index...\n');
        await rebuildAndSaveIndex();
        console.log('\n✅ Index rebuilt! Run validation again to verify.\n');
      }
      
      if (hasSchemaIssues) {
        console.log('\n⚠️  Schema issues cannot be auto-fixed.');
        console.log('   Please fix invalid schema documents manually (see errors above).\n');
      }
      
      if (!hasIndexIssues && !hasSchemaIssues) {
        console.log('\n✅ No issues to fix.\n');
      }
    }
  });
```

**Features:**
- ✅ **Auto-fix index issues** - Rebuilds index from files with `--fix`
- ✅ **Cannot fix schema issues** - Invalid schema must be fixed manually
- ✅ **Clear instructions** - Provides guidance on how to fix each issue type

**Usage:**
```bash
# Check for drift
npm run pipeline:validate-index

# Auto-fix index issues (rebuilds index from files)
npm run pipeline:validate-index -- --fix
```

---

## ✅ All Requirements Met

### 1. ✅ Index References Missing Files

**Evidence:**
- Validator checks each index entry for corresponding file
- Reports missing files in `indexOnly` array
- Includes reason (file not found, cannot access)

**Location:**
- `lib/content/index-drift-validator.ts` (lines 119-221)

---

### 2. ✅ File Exists But Not In Index

**Evidence:**
- Validator scans all files in blog directory
- Checks if file slug exists in index
- Reports files missing from index in `fileOnly` array
- Handles edge cases (draft/noindex, wrong pageType, invalid schema)

**Location:**
- `lib/content/index-drift-validator.ts` (lines 226-272)

---

### 3. ✅ Duplicates

**Evidence:**
- Validator counts slug occurrences in index
- Detects slugs that appear multiple times
- Reports duplicates with count and locations

**Location:**
- `lib/content/index-drift-validator.ts` (lines 82-106)

---

### 4. ✅ Invalid Schema Docs

**Evidence:**
- Validator uses `validateDocumentSchema()` to check schema
- Reports invalid schema documents separately
- Includes all validation errors and warnings
- Tracks file path for easy fixing

**Location:**
- `lib/content/index-drift-validator.ts` (lines 136-147, 241-250)

---

### 5. ✅ Detect and Fix Drift Quickly

**Evidence:**
- Comprehensive drift report with all issue types
- Clear summary with counts
- Detailed error messages with file paths
- Auto-fix option (`--fix`) to rebuild index
- Clear instructions for manual fixes

**Commands:**
- `npm run pipeline:validate-index` - Check for drift
- `npm run pipeline:validate-index -- --fix` - Auto-fix index issues

**Location:**
- `lib/content/index-drift-validator.ts` (entire file)
- `scripts/run.ts` (lines 261-294)

---

## 📊 Drift Report Structure

### Summary
- Total index entries
- Total files
- Valid matches count
- Index-only count (missing files)
- File-only count (missing from index)
- Metadata mismatch count
- Duplicate count
- Invalid schema count

### Detailed Sections
1. **Index-only entries** - Index references missing files
2. **File-only entries** - Files missing from index
3. **Metadata mismatches** - Index and file metadata don't match
4. **Duplicates** - Duplicate slugs in index
5. **Invalid schema** - Documents with invalid schema

### Fix Instructions
- Index issues: Run `npm run pipeline:rebuild-index`
- Schema issues: Fix invalid documents manually

---

## 🎯 Summary

**Status:** ✅ **COMPLETE**

Index ↔ Files drift validation is fully implemented:
- ✅ **Index references missing files** - Detected and reported
- ✅ **File exists but not in index** - Detected and reported
- ✅ **Duplicates** - Detected and reported
- ✅ **Invalid schema docs** - Detected and reported
- ✅ **Metadata mismatches** - Detected and reported
- ✅ **Quick detection** - Single command to check all drift
- ✅ **Quick fix** - Auto-fix option with `--fix` flag

**You can detect and fix drift quickly!** 🎉
