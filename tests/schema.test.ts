import { describe, expect, it } from "vitest";
import { parseStoryboard, StoryboardSchema, VisualTypeSchema } from "../src/content/schema";
import sellingPut from "../examples/selling-put.json";
import iv from "../examples/implied-volatility.json";
import hawkish from "../examples/hawkish-dovish.json";
import percentLoss from "../examples/percent-loss.json";

describe("VideoSpec schema", () => {
  it("accepts all example storyboards", () => {
    for (const example of [sellingPut, iv, hawkish, percentLoss]) {
      const parsed = parseStoryboard(example);
      expect(parsed.scenes.length).toBeGreaterThanOrEqual(2);
      expect(parsed.voiceover.split(/\s+/).length).toBeGreaterThan(20);
    }
  });

  it("rejects unsupported visuals", () => {
    const result = VisualTypeSchema.safeParse("dancing_hamster");
    expect(result.success).toBe(false);
  });

  it("rejects a storyboard with an unknown visual type", () => {
    const bad = {
      ...sellingPut,
      scenes: [
        {
          ...sellingPut.scenes[0],
          visual: { type: "not_a_visual", state: "default" },
        },
      ],
    };
    expect(StoryboardSchema.safeParse(bad).success).toBe(false);
  });
});
