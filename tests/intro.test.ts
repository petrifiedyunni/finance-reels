import { describe, expect, it } from "vitest";
import { INTRO } from "../src/config";
import {
  introDurationSeconds,
  introSpokenText,
  resolveIntro,
  shouldPlayIntroSting,
  shouldPlayIntroVoice,
} from "../src/content/intro";
import { parseStoryboard } from "../src/content/schema";
import { parseArgs } from "../src/cli/parseArgs";
import sellingPut from "../examples/selling-put.json";
import hawkish from "../examples/hawkish-dovish.json";

describe("intro config", () => {
  it("defaults to a micro bumper", () => {
    const intro = resolveIntro(undefined);
    expect(intro.mode).toBe("micro");
    expect(intro.phrase).toBe(INTRO.phrase);
    expect(introDurationSeconds(intro)).toBe(INTRO.microSeconds);
  });

  it("uses the full phrase for full intros and a punchier line for micro", () => {
    expect(introSpokenText(resolveIntro({ mode: "full" }))).toMatch(/timeee/i);
    expect(introSpokenText(resolveIntro({ mode: "micro" }))).toBe("Diva finance.");
    expect(shouldPlayIntroVoice(resolveIntro({ mode: "none" }))).toBe(false);
    expect(shouldPlayIntroSting(resolveIntro({ mode: "micro" }))).toBe(true);
  });

  it("parses example specs with micro and full intros", () => {
    expect(parseStoryboard(sellingPut).intro.mode).toBe("micro");
    expect(parseStoryboard(hawkish).intro.mode).toBe("full");
    expect(introDurationSeconds(parseStoryboard(hawkish).intro)).toBe(INTRO.fullSeconds);
  });
});

describe("intro CLI", () => {
  it("parses --intro full", () => {
    const options = parseArgs(["node", "reel", "--idea", "what is theta", "--intro", "full"]);
    expect(options.intro).toBe("full");
  });
});
