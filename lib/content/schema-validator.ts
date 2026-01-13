/**
 * Runtime schema validation for content documents
 * Protects the renderer from invalid JSON structures
 */

import { GeneratedDoc, BlogPostDoc } from '@/scripts/pipeline/types';
import { logContentValidationError } from './logger';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate a document has the minimum required structure
 * This is a runtime check to prevent rendering errors
 */
export function validateDocumentSchema(doc: any, expectedPageType?: string): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Type check
  if (!doc || typeof doc !== 'object') {
    errors.push('Document is not an object');
    return { valid: false, errors, warnings };
  }

  // Required base fields
  if (!doc.id || typeof doc.id !== 'string') {
    errors.push('Missing or invalid required field: id (must be string)');
  }

  if (!doc.slug || typeof doc.slug !== 'string') {
    errors.push('Missing or invalid required field: slug (must be string)');
  }

  if (!doc.pageType || typeof doc.pageType !== 'string') {
    errors.push('Missing or invalid required field: pageType (must be string)');
  } else if (expectedPageType && doc.pageType !== expectedPageType) {
    errors.push(`Expected pageType="${expectedPageType}", got "${doc.pageType}"`);
  }

  if (!doc.title || typeof doc.title !== 'string' || doc.title.trim().length === 0) {
    errors.push('Missing or invalid required field: title (must be non-empty string)');
  }

  if (!doc.description || typeof doc.description !== 'string' || doc.description.trim().length === 0) {
    errors.push('Missing or invalid required field: description (must be non-empty string)');
  }

  if (!doc.body || typeof doc.body !== 'string' || doc.body.trim().length === 0) {
    errors.push('Missing or invalid required field: body (must be non-empty string)');
  }

  if (!doc.primaryKeyword || typeof doc.primaryKeyword !== 'string') {
    errors.push('Missing or invalid required field: primaryKeyword (must be string)');
  }

  if (!Array.isArray(doc.secondaryKeywords)) {
    errors.push('Missing or invalid required field: secondaryKeywords (must be array)');
  }

  if (!doc.dates || typeof doc.dates !== 'object') {
    errors.push('Missing or invalid required field: dates (must be object)');
  } else {
    if (!doc.dates.publishedAt || typeof doc.dates.publishedAt !== 'string') {
      errors.push('Missing or invalid required field: dates.publishedAt (must be ISO 8601 string)');
    }
    if (!doc.dates.updatedAt || typeof doc.dates.updatedAt !== 'string') {
      errors.push('Missing or invalid required field: dates.updatedAt (must be ISO 8601 string)');
    }
  }

  if (!doc.flags || typeof doc.flags !== 'object') {
    errors.push('Missing or invalid required field: flags (must be object)');
  } else {
    if (typeof doc.flags.draft !== 'boolean') {
      errors.push('Missing or invalid required field: flags.draft (must be boolean)');
    }
    if (typeof doc.flags.noindex !== 'boolean') {
      errors.push('Missing or invalid required field: flags.noindex (must be boolean)');
    }
  }

  if (!doc.author || typeof doc.author !== 'object') {
    errors.push('Missing or invalid required field: author (must be object)');
  } else {
    if (!doc.author.name || typeof doc.author.name !== 'string') {
      errors.push('Missing or invalid required field: author.name (must be string)');
    }
  }

  // Optional fields - warnings only
  if (!Array.isArray(doc.faqs)) {
    warnings.push('Optional field faqs is not an array (expected array or undefined)');
  }

  if (!Array.isArray(doc.headings)) {
    warnings.push('Optional field headings is not an array (expected array or undefined)');
  }

  if (doc.related && typeof doc.related !== 'object') {
    warnings.push('Optional field related is not an object (expected object or undefined)');
  }

  if (doc.sources && !Array.isArray(doc.sources)) {
    warnings.push('Optional field sources is not an array (expected array or undefined)');
  }

  // Blog-specific validation
  if (doc.pageType === 'blog') {
    if (!doc.categorySlug || typeof doc.categorySlug !== 'string') {
      errors.push('Missing or invalid required field for blog: categorySlug (must be string)');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate and quarantine invalid documents
 * Returns null if invalid (after logging)
 */
export function validateAndQuarantine(
  doc: any,
  slug: string,
  filePath: string,
  expectedPageType?: string
): GeneratedDoc | null {
  const validation = validateDocumentSchema(doc, expectedPageType);

  if (!validation.valid) {
    // Log validation errors
    logContentValidationError({
      slug,
      filePath,
      reason: 'Schema validation failed - document does not meet required structure',
      validationErrors: validation.errors,
    });

    // Log warnings if any
    if (validation.warnings.length > 0) {
      console.warn(
        `[CONTENT_VALIDATION_WARNING] ${new Date().toISOString()} - Schema warnings for slug="${slug}"\n` +
        `  warnings=[${validation.warnings.join(', ')}]`
      );
    }

    // Quarantine: return null to exclude from rendering
    return null;
  }

  // Log warnings but don't block
  if (validation.warnings.length > 0) {
    console.warn(
      `[CONTENT_VALIDATION_WARNING] ${new Date().toISOString()} - Schema warnings for slug="${slug}"\n` +
      `  warnings=[${validation.warnings.join(', ')}]`
    );
  }

  return doc as GeneratedDoc;
}

/**
 * Check if a document is quarantined (invalid)
 * This can be used to mark documents in the index
 */
export function isQuarantined(doc: any): boolean {
  const validation = validateDocumentSchema(doc);
  return !validation.valid;
}
