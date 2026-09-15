import { describe, expect, it } from "vitest";
import { datedId, slugify } from "../src/utils/slug";
import { DURATION, VIDEO, DEFAULTS } from "../src/config";
import { videoDurationFromAudio } from "../src/audio/getAudioDuration";
import { recoverFromLoss, putSellerWinsAtExpiry } from "../src/content/financeMath";
import { LlmFinanceReviewSchema, parseStoryboard } from "../src/content/schema";
import { heuristicFlags } from "../src/ai/reviewFinance";
import sellingPut from "../examples/selling-put.json";
import { inputHash, storyboardCacheKey, ttsCacheKey } from "../src/pipeline/cache";
import { parseArgs } from "../src/cli/parseArgs";

describe("slug generation", () => {
  it("creates a stable dated id", () => {
    expect(slugify("Why is selling a put bullish?")).toBe("why-selling-put-bullish");
    expect(datedId("why is selling a put bullish", new Date("2026-09-15T12:00:00Z"))).toBe(
      "2026-09-15-why-selling-put-bullish",
    );
  });
});

describe("duration boundaries", () => {
  it("adds padding without exceeding typical reel length", () => {
    const duration = videoDurationFromAudio(11.8, {
      start: DURATION.startPaddingSeconds,
      end: DURATION.endPaddingSeconds,
    });
    expect(duration).toBeGreaterThan(11.8);
    expect(duration).toBeLessThan(DURATION.maxSeconds);
    expect(duration).toBeGreaterThanOrEqual(DURATION.minSeconds);
    expect(Math.round(duration * VIDEO.fps)).toBeGreaterThan(0);
  });
});

describe("percentage-loss math", () => {
  it("shows that +10% does not recover a -10% loss", () => {
    const result = recoverFromLoss(100, 10);
    expect(result.afterLoss).toBe(90);
    expect(result.afterSameGain).toBeCloseTo(99);
    expect(result.gainNeededPercent).toBeCloseTo(11.111, 2);
  });

  it("keeps put-seller payoff direction correct", () => {
    expect(putSellerWinsAtExpiry(105, 100)).toBe(true);
    expect(putSellerWinsAtExpiry(95, 100)).toBe(false);
  });
});

describe("finance review parsing", () => {
  it("parses a passing review payload", () => {
    const parsed = LlmFinanceReviewSchema.parse({
      passed: true,
      warnings: [],
      issues: [],
      containsPersonalizedAdvice: false,
      containsFabricatedData: false,
      containsGuarantee: false,
      correctedVoiceover: null,
      correctedHook: null,
    });
    expect(parsed.passed).toBe(true);
  });

  it("flags advice-like copy", () => {
    const board = parseStoryboard({
      ...sellingPut,
      voiceover: "You should buy this stock tomorrow for a guaranteed return.",
    });
    expect(heuristicFlags(board).length).toBeGreaterThan(0);
  });
});

describe("cache keys", () => {
  it("uses Grok as the default text model", () => {
    expect(DEFAULTS.textModel).toBe("grok-4.6");
  });

  it("changes when voiceover text changes", () => {
    const a = ttsCacheKey({ text: "hello", voice: "coral", model: "gpt-4o-mini-tts" });
    const b = ttsCacheKey({ text: "hello there", voice: "coral", model: "gpt-4o-mini-tts" });
    expect(a).not.toBe(b);
    expect(inputHash("a")).toBe(inputHash("a"));
    expect(
      storyboardCacheKey({ idea: "iv", series: "options_101", model: "grok-4.6" }),
    ).not.toBe(storyboardCacheKey({ idea: "theta", series: "options_101", model: "grok-4.6" }));
  });
});

describe("CLI args", () => {
  it("parses idea, series, and flags", () => {
    const options = parseArgs([
      "node",
      "reel",
      "--idea",
      "what is theta",
      "--series",
      "options_101",
      "--dry-run",
      "--verbose",
      "--preset",
      "smart_friend",
      "--intro",
      "micro",
    ]);
    expect(options.idea).toBe("what is theta");
    expect(options.series).toBe("options_101");
    expect(options.dryRun).toBe(true);
    expect(options.verbose).toBe(true);
    expect(options.preset).toBe("smart_friend");
    expect(options.intro).toBe("micro");
  });
});
