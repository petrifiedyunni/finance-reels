export type SocialPlatform = "tiktok" | "instagram" | "youtube_shorts";

export interface VideoAnalytics {
  videoId: string;
  platform: SocialPlatform;
  publishedAt: string;
  views: number;
  avgWatchTime: number;
  completionRate: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  followersGained: number;
  rewatches?: number;
}
