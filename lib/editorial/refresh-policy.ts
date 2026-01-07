/**
 * Content Refresh Policy - Scheduling and lifecycle management
 */

import { GeneratedDoc } from '@/scripts/pipeline/types';

export interface RefreshSchedule {
  pageType: 'blog' | 'species' | 'how-to' | 'location';
  frequencyMonths: number;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Refresh schedule by page type
 */
export const REFRESH_SCHEDULES: RefreshSchedule[] = [
  {
    pageType: 'species',
    frequencyMonths: 12,
    priority: 'medium',
  },
  {
    pageType: 'how-to',
    frequencyMonths: 12,
    priority: 'medium',
  },
  {
    pageType: 'location',
    frequencyMonths: 6,
    priority: 'high',
  },
  {
    pageType: 'blog',
    frequencyMonths: 0, // Manual refresh for top performers
    priority: 'low',
  },
];

/**
 * Check if content needs refresh
 */
export function needsRefresh(doc: GeneratedDoc): boolean {
  const updatedAt = new Date(doc.dates.updatedAt);
  const now = new Date();
  const monthsSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
  
  const schedule = REFRESH_SCHEDULES.find(s => s.pageType === doc.pageType);
  if (!schedule) return false;
  
  if (schedule.frequencyMonths === 0) {
    // Blog posts: manual refresh only
    return false;
  }
  
  return monthsSinceUpdate >= schedule.frequencyMonths;
}

/**
 * Get refresh priority
 */
export function getRefreshPriority(doc: GeneratedDoc): 'high' | 'medium' | 'low' {
  const schedule = REFRESH_SCHEDULES.find(s => s.pageType === doc.pageType);
  return schedule?.priority || 'low';
}

/**
 * Check if page should be pruned
 */
export interface PruningCandidate {
  slug: string;
  pageType: string;
  reason: 'no_impressions' | 'superseded' | 'outdated';
  action: 'merge' | 'noindex' | 'redirect' | 'delete';
  targetSlug?: string; // For merge/redirect
}

export function identifyPruningCandidates(
  docs: GeneratedDoc[],
  gscData?: { [slug: string]: { impressions: number; clicks: number } }
): PruningCandidate[] {
  const candidates: PruningCandidate[] = [];
  const now = new Date();
  const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);
  const nineMonthsAgo = new Date(now.getTime() - 9 * 30 * 24 * 60 * 60 * 1000);
  
  for (const doc of docs) {
    const publishedAt = new Date(doc.dates.publishedAt);
    const isOld = publishedAt < nineMonthsAgo;
    
    // Check for no impressions
    if (gscData && isOld) {
      const data = gscData[doc.slug];
      if (!data || data.impressions === 0) {
        candidates.push({
          slug: doc.slug,
          pageType: doc.pageType,
          reason: 'no_impressions',
          action: 'noindex', // Start with noindex, not delete
        });
      }
    }
    
    // Check if content is very outdated
    if (publishedAt < sixMonthsAgo && doc.dates.updatedAt === doc.dates.publishedAt) {
      // Never updated since publish
      candidates.push({
        slug: doc.slug,
        pageType: doc.pageType,
        reason: 'outdated',
        action: 'noindex',
      });
    }
  }
  
  return candidates;
}


