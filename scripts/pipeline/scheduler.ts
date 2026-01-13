/**
 * Scheduler - Manages job queue and publishing schedule
 */

import { Job, PageType, TopicKey } from './types';
import { logger } from './logger';
import { DAILY_PUBLISH_CAP, FAILURE_STOP_THRESHOLD } from './config';
import fs from 'fs/promises';
import path from 'path';

const JOB_QUEUE_PATH = path.join(process.cwd(), 'content', '_system', 'jobQueue.json');

/**
 * Save job queue (internal)
 */
async function saveJobQueue(jobs: Job[]): Promise<void> {
  const dir = path.dirname(JOB_QUEUE_PATH);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(JOB_QUEUE_PATH, JSON.stringify(jobs, null, 2), 'utf-8');
}

/**
 * Export loadJobQueue for external use
 */
export { loadJobQueue };

/**
 * Add job to queue
 */
export async function addJob(job: Omit<Job, 'jobId' | 'status' | 'attempts'>): Promise<Job> {
  const jobs = await loadJobQueue();
  const newJob: Job = {
    ...job,
    jobId: crypto.randomUUID(),
    status: 'pending',
    attempts: 0,
  };
  jobs.push(newJob);
  await saveJobQueue(jobs);
  logger.info(`Added job: ${newJob.jobId} (${newJob.type}:${newJob.topicKey})`);
  return newJob;
}

/**
 * Get next job (prioritized)
 */
export async function getNextJob(): Promise<Job | null> {
  const jobs = await loadJobQueue();
  const pending = jobs.filter((j) => j.status === 'pending');
  
  if (pending.length === 0) {
    return null;
  }
  
  // Sort by priority (descending), then scheduledAt
  pending.sort((a, b) => {
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
  });
  
  return pending[0];
}

/**
 * Update job status
 */
export async function updateJobStatus(
  jobId: string,
  status: Job['status'],
  error?: string,
  outputs?: Job['outputs']
): Promise<void> {
  const jobs = await loadJobQueue();
  const job = jobs.find((j) => j.jobId === jobId);
  
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }
  
  job.status = status;
  job.attempts = (job.attempts || 0) + 1;
  
  if (error) {
    job.lastError = error;
  }
  
  if (outputs) {
    job.outputs = outputs;
  }
  
  if (status === 'running') {
    job.runAt = new Date().toISOString();
  } else if (status === 'completed' || status === 'failed') {
    job.completedAt = new Date().toISOString();
  }
  
  await saveJobQueue(jobs);
}

/**
 * Check if we can publish more today
 */
export async function canPublishToday(): Promise<boolean> {
  const jobs = await loadJobQueue();
  const today = new Date().toISOString().split('T')[0];
  const publishedToday = jobs.filter(
    (j) => j.status === 'completed' && j.completedAt?.startsWith(today)
  ).length;
  
  return publishedToday < DAILY_PUBLISH_CAP;
}

/**
 * Check consecutive failures
 */
export async function checkConsecutiveFailures(): Promise<number> {
  const jobs = await loadJobQueue();
  const recent = jobs
    .filter((j) => j.status === 'failed' || j.status === 'completed')
    .sort((a, b) => {
      const timeA = a.completedAt || a.runAt || a.scheduledAt;
      const timeB = b.completedAt || b.runAt || b.scheduledAt;
      return new Date(timeB).getTime() - new Date(timeA).getTime();
    })
    .slice(0, FAILURE_STOP_THRESHOLD);
  
  let consecutiveFailures = 0;
  for (const job of recent) {
    if (job.status === 'failed') {
      consecutiveFailures++;
    } else {
      break; // Stop counting on first success
    }
  }
  
  return consecutiveFailures;
}

/**
 * Calculate priority for job type
 */
export function calculatePriority(type: PageType, topicKey: TopicKey): number {
  // High intent how-to: 10
  if (type === 'how-to' && topicKey.includes('beginner')) {
    return 10;
  }
  // Florida locations: 9
  if (type === 'location' && topicKey.includes('fl')) {
    return 9;
  }
  // Species: 8
  if (type === 'species') {
    return 8;
  }
  // Blog: 7
  if (type === 'blog') {
    return 7;
  }
  // Default: 5
  return 5;
}

import crypto from 'crypto';

/**
 * Load job queue (internal)
 */
async function loadJobQueue(): Promise<Job[]> {
  try {
    const data = await fs.readFile(JOB_QUEUE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

