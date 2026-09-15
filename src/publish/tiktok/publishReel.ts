import path from "node:path";
import { stat } from "node:fs/promises";
import type { SocialMetadata } from "../../content/schema";
import { fileExists, readJson, writeJson, writeText } from "../../utils/fs";
import {
  initDirectPost,
  initInboxUpload,
  pickPrivacyLevel,
  queryCreatorInfo,
  uploadVideoFile,
  waitForPublishStatus,
} from "./api";
import { getValidTokens } from "./session";

export type TikTokPublishMode = "inbox" | "direct";

export interface PublishReelResult {
  mode: TikTokPublishMode;
  publishId: string;
  status: string;
  videoPath: string;
  caption: string;
}

export function tiktokCaptionFromSocial(social: SocialMetadata): string {
  const extra = social.disclaimer ? `\n\n${social.disclaimer}` : "";
  return `${social.caption}${extra}`.trim();
}

export async function resolveReelDir(input: string): Promise<{
  dir: string;
  videoPath: string;
  socialPath: string;
}> {
  const dir = path.resolve(input);
  const videoPath = path.join(dir, "render.mp4");
  const socialPath = path.join(dir, "social.json");
  if (!(await fileExists(videoPath))) {
    throw new Error(`No render.mp4 in ${dir}. Produce the reel first.`);
  }
  if (!(await fileExists(socialPath))) {
    throw new Error(`No social.json in ${dir}. Produce the reel first.`);
  }
  return { dir, videoPath, socialPath };
}

export async function publishReelToTikTok(input: {
  outputDir: string;
  mode?: TikTokPublishMode;
}): Promise<PublishReelResult> {
  const mode = input.mode ?? "inbox";
  const { dir, videoPath, socialPath } = await resolveReelDir(input.outputDir);
  const social = await readJson<SocialMetadata>(socialPath);
  const caption = tiktokCaptionFromSocial(social);
  await writeText(path.join(dir, "tiktok-caption.txt"), `${caption}\n`);

  const tokens = await getValidTokens();
  const videoSize = (await stat(videoPath)).size;
  const init =
    mode === "direct"
      ? await initDirectWithFallback(tokens.accessToken, videoSize, caption)
      : await initInboxUpload(tokens.accessToken, videoSize);

  await uploadVideoFile(init.uploadUrl, videoPath);
  const status = await waitForPublishStatus(tokens.accessToken, init.publishId, mode);

  const next: SocialMetadata = {
    ...social,
    publishStatus: mode === "direct" && status.status === "PUBLISH_COMPLETE" ? "posted" : "inbox",
    tiktok: {
      mode,
      publishId: init.publishId,
      status: status.status,
      uploadedAt: new Date().toISOString(),
      openId: tokens.openId,
    },
  };
  await writeJson(socialPath, next);

  return {
    mode,
    publishId: init.publishId,
    status: status.status,
    videoPath,
    caption,
  };
}

async function initDirectWithFallback(accessToken: string, videoSize: number, title: string) {
  const creator = await queryCreatorInfo(accessToken);
  const privacy = pickPrivacyLevel(creator.privacy_level_options);
  try {
    return await initDirectPost(accessToken, {
      videoSize,
      title,
      privacyLevel: privacy,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (privacy !== "SELF_ONLY" && /unaudited|privacy_level|SELF_ONLY/i.test(message)) {
      return initDirectPost(accessToken, {
        videoSize,
        title,
        privacyLevel: "SELF_ONLY",
      });
    }
    throw new Error(message);
  }
}
