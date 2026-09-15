import path from "node:path";
import type { Publisher } from "./index";

export type PublishStatus = "draft" | "inbox" | "posted" | "failed";

export const tiktokPublisherNote =
  "TikTok inbox upload is live. Connect a brand account with npm run tiktok -- login, then npm run tiktok -- publish generated/<id>.";

export class TikTokPublisher implements Publisher {
  readonly name = "tiktok";

  async publish(input: {
    videoPath: string;
    caption: string;
    hashtags: string[];
  }): Promise<{ platformId: string }> {
    const { publishReelToTikTok } = await import("../publish/tiktok/publishReel");
    const result = await publishReelToTikTok({
      outputDir: path.dirname(input.videoPath),
      mode: "inbox",
    });
    return { platformId: result.publishId };
  }
}
