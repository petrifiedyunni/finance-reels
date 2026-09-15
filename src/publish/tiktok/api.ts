import { readFile, stat } from "node:fs/promises";
import { chunkRanges, planChunks } from "./chunks";
import { tiktokIsAigc, tiktokPrivacyLevel } from "./env";

const API = "https://open.tiktokapis.com/v2";

export interface TikTokApiError {
  code: string;
  message: string;
  log_id?: string;
}

export interface CreatorInfo {
  creator_nickname?: string;
  creator_username?: string;
  privacy_level_options?: string[];
  comment_disabled?: boolean;
  duet_disabled?: boolean;
  stitch_disabled?: boolean;
  max_video_post_duration_sec?: number;
}

export interface InitUploadResult {
  publishId: string;
  uploadUrl: string;
}

export interface PublishStatus {
  status: string;
  fail_reason?: string;
  publicaly_available_post_id?: string[];
}

async function tiktokJson<T>(
  accessToken: string,
  path: string,
  body: Record<string, unknown>,
): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify(body),
  });
  const json = (await response.json()) as { data?: T; error?: TikTokApiError };
  if (!json.error || json.error.code !== "ok") {
    throw new Error(json.error?.message || json.error?.code || `TikTok API ${path} failed`);
  }
  if (!json.data) {
    throw new Error(`TikTok API ${path} returned no data`);
  }
  return json.data;
}

export async function queryCreatorInfo(accessToken: string): Promise<CreatorInfo> {
  return tiktokJson<CreatorInfo>(accessToken, "/post/publish/creator_info/query/", {});
}

export async function initInboxUpload(
  accessToken: string,
  videoSize: number,
): Promise<InitUploadResult> {
  const plan = planChunks(videoSize);
  const data = await tiktokJson<{ publish_id: string; upload_url: string }>(
    accessToken,
    "/post/publish/inbox/video/init/",
    {
      source_info: {
        source: "FILE_UPLOAD",
        video_size: videoSize,
        chunk_size: plan.chunkSize,
        total_chunk_count: plan.totalChunkCount,
      },
    },
  );
  return { publishId: data.publish_id, uploadUrl: data.upload_url };
}

export async function initDirectPost(
  accessToken: string,
  input: {
    videoSize: number;
    title: string;
    privacyLevel: string;
  },
): Promise<InitUploadResult> {
  const plan = planChunks(input.videoSize);
  const data = await tiktokJson<{ publish_id: string; upload_url: string }>(
    accessToken,
    "/post/publish/video/init/",
    {
      post_info: {
        title: input.title.slice(0, 2200),
        privacy_level: input.privacyLevel,
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 1000,
        brand_content_toggle: false,
        brand_organic_toggle: false,
        is_aigc: tiktokIsAigc(),
      },
      source_info: {
        source: "FILE_UPLOAD",
        video_size: input.videoSize,
        chunk_size: plan.chunkSize,
        total_chunk_count: plan.totalChunkCount,
      },
    },
  );
  return { publishId: data.publish_id, uploadUrl: data.upload_url };
}

export async function uploadVideoFile(uploadUrl: string, videoPath: string): Promise<void> {
  const info = await stat(videoPath);
  const plan = planChunks(info.size);
  const ranges = chunkRanges(info.size, plan);
  const file = await readFile(videoPath);

  for (const range of ranges) {
    const chunk = file.subarray(range.start, range.end);
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(chunk.byteLength),
        "Content-Range": `bytes ${range.start}-${range.end - 1}/${info.size}`,
      },
      body: chunk,
    });
    if (!response.ok && response.status !== 206 && response.status !== 201) {
      const text = await response.text();
      throw new Error(`TikTok upload failed (${response.status}): ${text.slice(0, 300)}`);
    }
  }
}

export async function fetchPublishStatus(
  accessToken: string,
  publishId: string,
): Promise<PublishStatus> {
  return tiktokJson<PublishStatus>(accessToken, "/post/publish/status/fetch/", {
    publish_id: publishId,
  });
}

export async function waitForPublishStatus(
  accessToken: string,
  publishId: string,
  mode: "inbox" | "direct",
): Promise<PublishStatus> {
  const done =
    mode === "inbox"
      ? new Set(["SEND_TO_USER_INBOX", "PUBLISH_COMPLETE"])
      : new Set(["PUBLISH_COMPLETE"]);
  const started = Date.now();
  while (Date.now() - started < 90_000) {
    const status = await fetchPublishStatus(accessToken, publishId);
    if (done.has(status.status)) return status;
    if (status.status === "FAILED") {
      throw new Error(status.fail_reason || "TikTok publish failed");
    }
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 2000);
    });
  }
  return fetchPublishStatus(accessToken, publishId);
}

export function pickPrivacyLevel(options: string[] | undefined): string {
  const preferred = tiktokPrivacyLevel();
  if (options?.includes(preferred)) return preferred;
  if (options?.includes("SELF_ONLY")) return "SELF_ONLY";
  return options?.[0] ?? preferred;
}
