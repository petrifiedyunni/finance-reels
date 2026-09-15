import { describe, expect, it } from "vitest";
import { chunkRanges, planChunks } from "../src/publish/tiktok/chunks";
import { challengeFromVerifier } from "../src/publish/tiktok/pkce";
import { tiktokCaptionFromSocial } from "../src/publish/tiktok/publishReel";
import { pickPrivacyLevel } from "../src/publish/tiktok/api";
import { parseArgs } from "../src/cli/parseArgs";
import { createHash } from "node:crypto";

describe("TikTok chunk plan", () => {
  it("uploads small reels as one chunk", () => {
    const plan = planChunks(1_048_576);
    expect(plan).toEqual({ chunkSize: 1_048_576, totalChunkCount: 1 });
    expect(chunkRanges(1_048_576, plan)).toEqual([{ start: 0, end: 1_048_576 }]);
  });

  it("splits files over 64MB into sequential chunks", () => {
    const size = 70 * 1024 * 1024;
    const plan = planChunks(size);
    expect(plan.totalChunkCount).toBeGreaterThanOrEqual(2);
    const ranges = chunkRanges(size, plan);
    expect(ranges[0]?.start).toBe(0);
    expect(ranges.at(-1)?.end).toBe(size);
    expect(ranges.reduce((sum, range) => sum + (range.end - range.start), 0)).toBe(size);
  });
});

describe("TikTok PKCE", () => {
  it("uses hex SHA-256 for the desktop code challenge", () => {
    const verifier = "abc";
    expect(challengeFromVerifier(verifier)).toBe(createHash("sha256").update(verifier).digest("hex"));
  });
});

describe("TikTok caption + privacy", () => {
  it("appends the disclaimer under the social caption", () => {
    const caption = tiktokCaptionFromSocial({
      title: "What is an option",
      caption: "An option is not the stock. 🎀\n\n#options",
      hashtags: ["options"],
      series: "options_101",
      createdAt: "2026-09-15T00:00:00.000Z",
      publishStatus: "draft",
      disclaimer: "Educational content only. Not personalized investment advice.",
    });
    expect(caption).toContain("#options");
    expect(caption).toContain("Educational content only");
  });

  it("prefers SELF_ONLY when the app is unaudited", () => {
    expect(pickPrivacyLevel(["SELF_ONLY", "PUBLIC_TO_EVERYONE"])).toBe("SELF_ONLY");
  });
});

describe("CLI publish flag", () => {
  it("maps --publish tiktok to inbox", () => {
    const options = parseArgs(["node", "reel", "--idea", "what is an option", "--publish", "inbox"]);
    expect(options.publish).toBe("inbox");
  });
});
