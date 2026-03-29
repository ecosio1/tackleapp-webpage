export type FeedSource = 'youtube' | 'instagram' | 'tiktok' | 'rss';

export type FeedItemType = 'video' | 'short' | 'reel' | 'article' | 'post';

export interface FeedItemIndexEntry {
  slug: string;
  title: string;
  description: string;
  source: FeedSource;
  type: FeedItemType;
  originalUrl: string;
  thumbnailUrl?: string;
  publishedAt: string;
  duration?: string;
  author?: string;
  tags?: string[];
}

export function getSourceDisplayName(source: FeedSource): string {
  const names: Record<FeedSource, string> = {
    youtube: 'YouTube',
    instagram: 'Instagram',
    tiktok: 'TikTok',
    rss: 'RSS',
  };
  return names[source] || source;
}

export function isVideoType(type: FeedItemType): boolean {
  return ['video', 'short', 'reel'].includes(type);
}
