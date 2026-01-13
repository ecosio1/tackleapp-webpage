/**
 * On-demand revalidation helper
 * Triggers Next.js ISR revalidation after content changes
 * NON-BLOCKING: Publish succeeds even if revalidation fails
 * OBSERVABLE: Logs warnings with paths, increments metrics, optional retry
 */

// Simple logger for revalidation (avoid circular dependency)
const log = {
  info: (message: string) => console.log(`[REVALIDATION] ${message}`),
  warn: (message: string) => console.warn(`[REVALIDATION] ${message}`),
  error: (message: string) => console.error(`[REVALIDATION] ${message}`),
};

const REVALIDATION_API_URL = process.env.NEXT_PUBLIC_URL 
  ? `${process.env.NEXT_PUBLIC_URL}/api/revalidate`
  : process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}/api/revalidate`
  : 'http://localhost:3000/api/revalidate';

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET || process.env.REVALIDATE_SECRET;

// Configuration for retry behavior
const REVALIDATION_RETRY_ENABLED = process.env.REVALIDATION_RETRY_ENABLED !== 'false'; // Default: enabled
const REVALIDATION_MAX_RETRIES = parseInt(process.env.REVALIDATION_MAX_RETRIES || '2', 10); // Default: 2 retries
const REVALIDATION_RETRY_DELAY_MS = parseInt(process.env.REVALIDATION_RETRY_DELAY_MS || '1000', 10); // Default: 1s

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Record revalidation failure metric (non-blocking)
 */
async function recordRevalidationFailure(paths: string[], error: Error | string, retryAttempt?: number): Promise<void> {
  try {
    // Import metrics module (dynamic import to avoid circular dependency)
    const metricsModule = await import('../../scripts/pipeline/metrics');
    const metrics = await metricsModule.getMetrics();
    
    // Initialize revalidation metrics if not present
    if (!metrics.revalidation) {
      metrics.revalidation = {
        totalAttempts: 0,
        totalSuccesses: 0,
        totalFailures: 0,
        failuresByPath: {},
        recentFailures: [],
      };
    }
    
    // Update metrics
    metrics.revalidation.totalAttempts++;
    metrics.revalidation.totalFailures++;
    
    // Track failures by path
    for (const path of paths) {
      if (!metrics.revalidation.failuresByPath[path]) {
        metrics.revalidation.failuresByPath[path] = 0;
      }
      metrics.revalidation.failuresByPath[path]++;
    }
    
    // Add to recent failures (rolling window)
    const errorMessage = error instanceof Error ? error.message : String(error);
    metrics.revalidation.recentFailures.unshift({
      timestamp: new Date().toISOString(),
      paths: [...paths],
      error: errorMessage,
      retryAttempt: retryAttempt || 0,
    });
    
    // Keep only recent failures (rolling window - prevent unbounded growth)
    const MAX_RECENT_REVALIDATION_FAILURES = 50;
    if (metrics.revalidation.recentFailures.length > MAX_RECENT_REVALIDATION_FAILURES) {
      metrics.revalidation.recentFailures = metrics.revalidation.recentFailures.slice(0, MAX_RECENT_REVALIDATION_FAILURES);
    }
    
    // Limit failuresByPath to top N paths by failure count (prevent unbounded growth)
    const MAX_FAILURES_BY_PATH = 100;
    const pathEntries = Object.entries(metrics.revalidation.failuresByPath);
    if (pathEntries.length > MAX_FAILURES_BY_PATH) {
      // Sort by failure count (descending) and keep top N
      pathEntries.sort((a, b) => b[1] - a[1]);
      const topPaths = pathEntries.slice(0, MAX_FAILURES_BY_PATH);
      metrics.revalidation.failuresByPath = Object.fromEntries(topPaths);
    }
    
    metrics.lastUpdated = new Date().toISOString();
    
    // Save metrics (atomic write)
    await metricsModule.saveMetrics(metrics);
  } catch (metricsError) {
    // Metrics recording failure shouldn't block - just log it
    log.error(`Failed to record revalidation failure metric: ${metricsError instanceof Error ? metricsError.message : 'Unknown error'}`);
  }
}

/**
 * Record revalidation success metric (non-blocking)
 */
async function recordRevalidationSuccess(paths: string[]): Promise<void> {
  try {
    const metricsModule = await import('../../scripts/pipeline/metrics');
    const metrics = await metricsModule.getMetrics();
    
    if (!metrics.revalidation) {
      metrics.revalidation = {
        totalAttempts: 0,
        totalSuccesses: 0,
        totalFailures: 0,
        failuresByPath: {},
        recentFailures: [],
      };
    }
    
    metrics.revalidation.totalAttempts++;
    metrics.revalidation.totalSuccesses++;
    metrics.lastUpdated = new Date().toISOString();
    
    await metricsModule.saveMetrics(metrics);
  } catch (metricsError) {
    // Metrics recording failure shouldn't block - just log it
    log.error(`Failed to record revalidation success metric: ${metricsError instanceof Error ? metricsError.message : 'Unknown error'}`);
  }
}

/**
 * Revalidate paths after content publish
 * NON-BLOCKING: Publish succeeds even if revalidation fails
 * OBSERVABLE: Logs warnings with paths, increments metrics, optional retry
 */
export async function revalidatePaths(paths: string[], retryAttempt = 0): Promise<void> {
  // Skip if no secret configured (development/local)
  if (!REVALIDATION_SECRET) {
    log.warn(
      'Revalidation secret not configured. Skipping on-demand revalidation. ' +
      'Set REVALIDATION_SECRET or REVALIDATE_SECRET environment variable.'
    );
    return;
  }

  // Skip if no API URL configured
  if (!REVALIDATION_API_URL || REVALIDATION_API_URL.includes('localhost')) {
    log.warn(
      'Revalidation API URL not configured or using localhost. ' +
      'Skipping on-demand revalidation. Set NEXT_PUBLIC_URL or VERCEL_URL.'
    );
    return;
  }

  try {
    if (retryAttempt > 0) {
      log.info(`Revalidating ${paths.length} path(s) (retry ${retryAttempt}/${REVALIDATION_MAX_RETRIES}): ${paths.join(', ')}`);
    } else {
      log.info(`Revalidating ${paths.length} path(s): ${paths.join(', ')}`);
    }

    // Create AbortController for timeout (fallback if AbortSignal.timeout is not available)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    try {
      const response = await fetch(REVALIDATION_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${REVALIDATION_SECRET}`,
        },
        body: JSON.stringify({ paths }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Revalidation API returned ${response.status}: ${JSON.stringify(error)}`);
      }

      const result = await response.json();
      log.info(`✅ Revalidation successful: ${JSON.stringify(result)}`);
      
      // Record success metric (non-blocking)
      await recordRevalidationSuccess(paths);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Check if it's a timeout error
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Revalidation request timed out after 5 seconds');
      }
      
      // Re-throw other errors
      throw fetchError;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log warning with paths (OBSERVABLE)
    log.warn(
      `⚠️  Revalidation failed (non-blocking) for paths [${paths.join(', ')}]: ${errorMessage}`
    );
    
    // Record failure metric (non-blocking)
    await recordRevalidationFailure(paths, error, retryAttempt);
    
    // Optional retry (OBSERVABLE - non-blocking)
    if (REVALIDATION_RETRY_ENABLED && retryAttempt < REVALIDATION_MAX_RETRIES) {
      const nextRetryAttempt = retryAttempt + 1;
      const delayMs = REVALIDATION_RETRY_DELAY_MS * nextRetryAttempt; // Exponential backoff
      
      log.info(`Retrying revalidation in ${delayMs}ms (attempt ${nextRetryAttempt}/${REVALIDATION_MAX_RETRIES})...`);
      
      // Schedule retry asynchronously (non-blocking)
      sleep(delayMs).then(() => {
        // Retry (fire and forget - don't block publish)
        revalidatePaths(paths, nextRetryAttempt).catch((retryError) => {
          // Final retry also failed - record failure again for retry attempt
          recordRevalidationFailure(paths, retryError, nextRetryAttempt).catch(() => {
            // Metrics recording failure shouldn't block - already logged
          });
          log.error(
            `⚠️  Revalidation retry ${nextRetryAttempt}/${REVALIDATION_MAX_RETRIES} failed for paths [${paths.join(', ')}]: ${retryError instanceof Error ? retryError.message : 'Unknown error'}`
          );
        });
      }).catch((sleepError) => {
        // Sleep error shouldn't happen, but if it does, log it
        log.error(`Failed to schedule revalidation retry: ${sleepError instanceof Error ? sleepError.message : 'Unknown error'}`);
      });
    }
    
    // Don't throw - revalidation failure must not block publishing
  }
}

/**
 * Revalidate blog-related paths after publishing a blog post
 */
export async function revalidateBlogPost(slug: string, categorySlug?: string): Promise<void> {
  const paths: string[] = [
    '/blog', // Blog index page
    `/blog/${slug}`, // The new post page
  ];

  // Revalidate category page if category is provided
  if (categorySlug) {
    paths.push(`/blog/category/${categorySlug}`);
  }

  // Also revalidate sitemap (handled by API route, but explicit for clarity)
  paths.push('/sitemap.xml');
  paths.push('/sitemap-blog.xml');

  await revalidatePaths(paths);
}

/**
 * Revalidate paths for other content types
 */
export async function revalidateContent(
  pageType: 'species' | 'how-to' | 'location' | 'blog',
  slug: string,
  additionalPaths?: string[]
): Promise<void> {
  const paths: string[] = [];

  switch (pageType) {
    case 'blog':
      // Extract category from slug if needed (blog posts handle this separately)
      await revalidateBlogPost(slug);
      return;
    case 'species':
      paths.push(`/species/${slug}`);
      paths.push('/species');
      break;
    case 'how-to':
      paths.push(`/how-to/${slug}`);
      paths.push('/how-to');
      break;
    case 'location':
      // Location slugs are like "fl/miami"
      const [state, city] = slug.split('/');
      paths.push(`/locations/${state}/${city}`);
      paths.push(`/locations/${state}`);
      paths.push('/locations');
      break;
  }

  // Add sitemap
  paths.push('/sitemap.xml');

  // Add any additional paths
  if (additionalPaths) {
    paths.push(...additionalPaths);
  }

  await revalidatePaths(paths);
}
