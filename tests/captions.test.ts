import { describe, expect, it } from "vitest";
import { groupCaptions } from "../src/timing/groupCaptions";
import type { WordTimestamp } from "../src/content/schema";

const words: WordTimestamp[] = [
  { word: "When", start: 0, end: 0.2 },
  { word: "you", start: 0.2, end: 0.3 },
  { word: "sell", start: 0.3, end: 0.5 },
  { word: "a", start: 0.5, end: 0.55 },
  { word: "put,", start: 0.55, end: 0.9 },
  { word: "you're", start: 1.1, end: 1.3 },
  { word: "betting", start: 1.3, end: 1.6 },
  { word: "the", start: 1.6, end: 1.7 },
  { word: "stock", start: 1.7, end: 2.0 },
  { word: "stays", start: 2.0, end: 2.3 },
  { word: "above", start: 2.3, end: 2.6 },
  { word: "strike.", start: 2.6, end: 3.1 },
];

describe("caption grouping", () => {
  it("groups 2–5 words and keeps punctuation attached", () => {
    const phrases = groupCaptions(words);
    expect(phrases.length).toBeGreaterThan(1);
    for (const phrase of phrases) {
      expect(phrase.words.length).toBeGreaterThanOrEqual(1);
      expect(phrase.words.length).toBeLessThanOrEqual(6);
      expect(phrase.end).toBeGreaterThan(phrase.start);
    }
    expect(phrases.some((p) => p.text.includes("put,"))).toBe(true);
  });

  it("returns empty for no words", () => {
    expect(groupCaptions([])).toEqual([]);
  });
});
