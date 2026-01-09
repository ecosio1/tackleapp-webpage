/**
 * Index ↔ Files Drift Validation
 * Detects inconsistencies between index and actual files
 */

import fs from 'fs/promises';
import path from 'path';
import { ContentIndex, BlogPostIndexEntry } from './index';
import { loadContentIndex } from './index';
import { loadContentDoc } from './index';
import { validateDocumentSchema } from './schema-validator';

const CONTENT_DIR = path.join(process.cwd(), 'content');
const BLOG_DIR = path.join(CONTENT_DIR, 'blog');

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
  invalidSchema: Array<{
    slug: string;
    filePath: string;
    errors: string[];
    warnings?: string[];
  }>;
  summary: {
    totalIndexEntries: number;
    totalFiles: number;
    indexOnlyCount: number;
    fileOnlyCount: number;
    metadataMismatchCount: number;
    duplicateCount: number;
    invalidSchemaCount: number;
    validCount: number;
  };
}

/**
 * Validate index against files and detect drift
 */
export async function validateIndexDrift(): Promise<DriftReport> {
  const report: DriftReport = {
    indexOnly: [],
    fileOnly: [],
    metadataMismatches: [],
    duplicates: [],
    invalidSchema: [],
    summary: {
      totalIndexEntries: 0,
      totalFiles: 0,
      indexOnlyCount: 0,
      fileOnlyCount: 0,
      metadataMismatchCount: 0,
      duplicateCount: 0,
      invalidSchemaCount: 0,
      validCount: 0,
    },
  };

  // Load index
  const index = await loadContentIndex();
  const indexSlugs = new Set(index.blogPosts.map(p => p.slug));
  report.summary.totalIndexEntries = index.blogPosts.length;

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

  report.summary.duplicateCount = report.duplicates.length;

  // Get all blog files
  let fileSlugs: string[] = [];
  try {
    const files = await fs.readdir(BLOG_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));
    fileSlugs = jsonFiles.map(f => f.replace('.json', ''));
    report.summary.totalFiles = fileSlugs.length;
  } catch (error) {
    console.warn(`Failed to read blog directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Check for index-only entries (missing files)
  for (const entry of index.blogPosts) {
    const filePath = path.join(BLOG_DIR, `${entry.slug}.json`);
    
    try {
      await fs.access(filePath);
      // File exists - check metadata consistency and schema validity
      const doc = await loadContentDoc(filePath);
      
      if (!doc) {
        report.indexOnly.push({
          slug: entry.slug,
          reason: 'File exists but failed to load (invalid JSON or file error)',
        });
        continue;
      }

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

      if (doc.description !== entry.description) {
        mismatches.push({
          field: 'description',
          indexValue: entry.description,
          fileValue: doc.description,
        });
      }

      if ('categorySlug' in doc && doc.categorySlug !== entry.category) {
        mismatches.push({
          field: 'category',
          indexValue: entry.category,
          fileValue: doc.categorySlug,
        });
      }

      if (doc.dates?.publishedAt !== entry.publishedAt) {
        mismatches.push({
          field: 'publishedAt',
          indexValue: entry.publishedAt,
          fileValue: doc.dates?.publishedAt,
        });
      }

      if (mismatches.length > 0) {
        // Add each mismatch separately for clarity
        mismatches.forEach((mismatch) => {
          report.metadataMismatches.push({
            slug: entry.slug,
            field: mismatch.field,
            indexValue: mismatch.indexValue,
            fileValue: mismatch.fileValue,
          });
        });
        report.summary.metadataMismatchCount += mismatches.length;
      } else {
        report.summary.validCount++;
      }
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

  report.summary.indexOnlyCount = report.indexOnly.length;
  // metadataMismatchCount is already updated in the loop above

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

  report.summary.fileOnlyCount = report.fileOnly.length;
  report.summary.invalidSchemaCount = report.invalidSchema.length;

  return report;
}

/**
 * Print drift report in human-readable format
 */
export function printDriftReport(report: DriftReport): void {
  console.log('\n📊 Index ↔ Files Drift Validation Report\n');
  console.log('═'.repeat(60));
  
  // Summary
  console.log('\n📈 Summary:');
  console.log(`   Total index entries: ${report.summary.totalIndexEntries}`);
  console.log(`   Total files: ${report.summary.totalFiles}`);
  console.log(`   ✅ Valid matches: ${report.summary.validCount}`);
  console.log(`   ❌ Index-only (missing files): ${report.summary.indexOnlyCount}`);
  console.log(`   ⚠️  File-only (missing from index): ${report.summary.fileOnlyCount}`);
  console.log(`   🔄 Metadata mismatches: ${report.summary.metadataMismatchCount}`);
  console.log(`   🔁 Duplicates in index: ${report.summary.duplicateCount}`);
  console.log(`   🚫 Invalid schema docs: ${report.summary.invalidSchemaCount}`);

  // Index-only entries
  if (report.indexOnly.length > 0) {
    console.log('\n❌ Index Entries with Missing Files:');
    console.log('─'.repeat(60));
    report.indexOnly.forEach((item) => {
      console.log(`   • ${item.slug}`);
      console.log(`     Reason: ${item.reason}`);
    });
  }

  // File-only entries
  if (report.fileOnly.length > 0) {
    console.log('\n⚠️  Files Missing from Index:');
    console.log('─'.repeat(60));
    report.fileOnly.forEach((item) => {
      console.log(`   • ${item.slug}`);
      console.log(`     File: ${item.filePath}`);
      console.log(`     Reason: ${item.reason}`);
    });
  }

  // Metadata mismatches
  if (report.metadataMismatches.length > 0) {
    console.log('\n🔄 Metadata Mismatches:');
    console.log('─'.repeat(60));
    
    // Group by slug for better readability
    const mismatchesBySlug = new Map<string, typeof report.metadataMismatches>();
    report.metadataMismatches.forEach((item) => {
      if (!mismatchesBySlug.has(item.slug)) {
        mismatchesBySlug.set(item.slug, []);
      }
      mismatchesBySlug.get(item.slug)!.push(item);
    });
    
    mismatchesBySlug.forEach((mismatches, slug) => {
      console.log(`   • ${slug}:`);
      mismatches.forEach((item) => {
        console.log(`     - ${item.field}:`);
        console.log(`       Index: ${JSON.stringify(item.indexValue)}`);
        console.log(`       File:  ${JSON.stringify(item.fileValue)}`);
      });
    });
  }

  // Duplicates
  if (report.duplicates.length > 0) {
    console.log('\n🔁 Duplicate Entries in Index:');
    console.log('─'.repeat(60));
    report.duplicates.forEach((item) => {
      console.log(`   • ${item.slug} (appears ${item.count} times)`);
      console.log(`     Locations: ${item.locations.join(', ')}`);
    });
  }

  // Invalid schema documents
  if (report.invalidSchema.length > 0) {
    console.log('\n🚫 Invalid Schema Documents:');
    console.log('─'.repeat(60));
    report.invalidSchema.forEach((item) => {
      console.log(`   • ${item.slug}`);
      console.log(`     File: ${item.filePath}`);
      console.log(`     Schema Errors:`);
      item.errors.forEach((error) => {
        console.log(`       - ${error}`);
      });
      if (item.warnings && item.warnings.length > 0) {
        console.log(`     Schema Warnings:`);
        item.warnings.forEach((warning) => {
          console.log(`       ⚠️  ${warning}`);
        });
      }
    });
  }

  // Overall status
  console.log('\n' + '═'.repeat(60));
  const hasIssues = 
    report.indexOnly.length > 0 ||
    report.fileOnly.length > 0 ||
    report.metadataMismatches.length > 0 ||
    report.duplicates.length > 0 ||
    report.invalidSchema.length > 0;

  if (hasIssues) {
    console.log('\n⚠️  Issues detected!');
    console.log('   To fix:');
    if (report.indexOnly.length > 0 || report.fileOnly.length > 0 || report.metadataMismatches.length > 0 || report.duplicates.length > 0) {
      console.log('     • Run `npm run pipeline:rebuild-index` to rebuild index from files');
    }
    if (report.invalidSchema.length > 0) {
      console.log('     • Fix invalid schema documents (see errors above)');
      console.log('     • Or quarantine invalid files manually');
    }
  } else {
    console.log('\n✅ No drift detected - index and files are in sync!');
  }
  console.log('');
}

/**
 * Validate and print report (complete operation)
 */
export async function validateAndPrintDrift(): Promise<DriftReport> {
  const report = await validateIndexDrift();
  printDriftReport(report);
  return report;
}
