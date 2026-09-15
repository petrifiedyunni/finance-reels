export type PublishStatus = "draft" | "scheduled" | "posted" | "failed";

export interface PublisherPlaceholder {
  platforms: Array<"tiktok" | "instagram" | "youtube_shorts" | "scheduler">;
  note: "V1 does not publish. Implement Publisher in a later version.";
}

export const futurePublishers: PublisherPlaceholder = {
  platforms: ["tiktok", "instagram", "youtube_shorts", "scheduler"],
  note: "V1 does not publish. Implement Publisher in a later version.",
};
