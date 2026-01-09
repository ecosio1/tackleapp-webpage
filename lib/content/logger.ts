/**
 * Content loading logger
 * Provides structured logging for content loading failures
 */

interface ContentLoadError {
  slug?: string;
  filePath: string;
  reason: string;
  error?: Error | unknown;
}

/**
 * Log content loading error with structured format
 */
export function logContentLoadError(error: ContentLoadError): void {
  const timestamp = new Date().toISOString();
  const slugInfo = error.slug ? `slug="${error.slug}"` : '';
  const errorMessage = error.error instanceof Error 
    ? error.error.message 
    : String(error.error || 'Unknown error');
  
  console.error(
    `[CONTENT_LOAD_ERROR] ${timestamp} - Failed to load content\n` +
    `  ${slugInfo}\n` +
    `  filePath="${error.filePath}"\n` +
    `  reason="${error.reason}"\n` +
    `  error="${errorMessage}"`
  );
  
  // Also log stack trace if available
  if (error.error instanceof Error && error.error.stack) {
    console.error(`  stack: ${error.error.stack}`);
  }
}

/**
 * Log content validation error
 */
export function logContentValidationError(error: ContentLoadError & { validationErrors?: string[] }): void {
  const timestamp = new Date().toISOString();
  const slugInfo = error.slug ? `slug="${error.slug}"` : '';
  const validationInfo = error.validationErrors?.length 
    ? `\n  validationErrors=[${error.validationErrors.join(', ')}]`
    : '';
  
  console.error(
    `[CONTENT_VALIDATION_ERROR] ${timestamp} - Content validation failed\n` +
    `  ${slugInfo}\n` +
    `  filePath="${error.filePath}"\n` +
    `  reason="${error.reason}"${validationInfo}`
  );
}
