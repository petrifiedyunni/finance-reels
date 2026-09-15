import { describe, expect, it } from "vitest";
import { buildLocalStoryboard, inferSeries } from "../src/ai/localStoryboard";
import { parseStoryboard } from "../src/content/schema";
import { countWords } from "../src/utils/words";

describe("offline storyboards", () => {
  it("infers series from the idea", () => {
    expect(inferSeries("why is selling a put bullish")).toBe("options_101");
    expect(inferSeries("hawkish vs dovish")).toBe("wall_street_vocabulary");
    expect(inferSeries("why a 10% loss needs more than a 10% gain")).toBe("money_math");
    expect(inferSeries("what is inflation")).toBe("explain_like_im_five");
  });

  it("builds a valid selling-put storyboard without a cloud model", () => {
    const board = buildLocalStoryboard({ idea: "why is selling a put bullish" });
    expect(parseStoryboard(board).series).toBe("options_101");
    expect(countWords(board.voiceover)).toBeGreaterThanOrEqual(24);
    expect(board.voiceover).toMatch(/you're|here's|doesn't|that's|isn't/i);
    expect(board.scenes.some((s) => s.visual.type === "price_vs_strike")).toBe(true);
  });

  it("does not reuse the put recipe for an unrelated idea", () => {
    const board = buildLocalStoryboard({ idea: "what is a bond yield" });
    expect(board.voiceover.toLowerCase()).not.toContain("sell a put");
    expect(board.scenes.length).toBeGreaterThanOrEqual(2);
  });
});
