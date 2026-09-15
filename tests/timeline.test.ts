import { describe, expect, it } from "vitest";
import { buildSceneTimeline } from "../src/timing/buildSceneTimeline";
import type { Scene, WordTimestamp } from "../src/content/schema";

const scenes: Scene[] = [
  {
    id: "scene-1",
    type: "hook",
    headline: "HOOK",
    visual: { type: "question_bubble", state: "default" },
    narrationAnchorStart: "When you sell",
    narrationAnchorEnd: "sell a put",
  },
  {
    id: "scene-2",
    type: "concept",
    headline: "ABOVE",
    visual: { type: "price_vs_strike", state: "above" },
    narrationAnchorStart: "stock stays above",
    narrationAnchorEnd: "above your strike",
  },
  {
    id: "scene-3",
    type: "payoff",
    headline: "PREMIUM",
    visual: { type: "coins", state: "collect" },
    narrationAnchorStart: "keep the premium",
    narrationAnchorEnd: "keep the premium",
  },
];

const words: WordTimestamp[] = [
  { word: "When", start: 0.1, end: 0.3 },
  { word: "you", start: 0.3, end: 0.4 },
  { word: "sell", start: 0.4, end: 0.6 },
  { word: "a", start: 0.6, end: 0.7 },
  { word: "put,", start: 0.7, end: 1.0 },
  { word: "the", start: 1.2, end: 1.3 },
  { word: "stock", start: 1.3, end: 1.5 },
  { word: "stays", start: 1.5, end: 1.7 },
  { word: "above", start: 1.7, end: 2.0 },
  { word: "your", start: 2.0, end: 2.2 },
  { word: "strike.", start: 2.2, end: 2.6 },
  { word: "you", start: 3.0, end: 3.1 },
  { word: "keep", start: 3.1, end: 3.3 },
  { word: "the", start: 3.3, end: 3.4 },
  { word: "premium.", start: 3.4, end: 4.0 },
];

describe("scene timeline", () => {
  it("derives non-overlapping scenes covering full audio from anchors", () => {
    const timeline = buildSceneTimeline({
      scenes,
      words,
      totalSeconds: 12,
    });
    expect(timeline).toHaveLength(3);
    expect(timeline[0].startSeconds).toBe(0);
    expect(timeline[timeline.length - 1].endSeconds).toBe(12);
    for (let i = 1; i < timeline.length; i++) {
      expect(timeline[i].startSeconds).toBeGreaterThanOrEqual(timeline[i - 1].endSeconds - 0.001);
      expect(timeline[i].endSeconds).toBeGreaterThan(timeline[i].startSeconds);
    }
  });

  it("falls back to proportional timing without words", () => {
    const timeline = buildSceneTimeline({
      scenes,
      words: [],
      totalSeconds: 12,
    });
    expect(timeline.every((s) => s.source === "proportional")).toBe(true);
    expect(timeline[0].startSeconds).toBe(0);
    expect(timeline.at(-1)?.endSeconds).toBe(12);
  });

  it("rejects empty scenes or non-positive duration", () => {
    expect(() => buildSceneTimeline({ scenes: [], words, totalSeconds: 10 })).toThrow();
    expect(() => buildSceneTimeline({ scenes, words, totalSeconds: 0 })).toThrow();
  });
});
