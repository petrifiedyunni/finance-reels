import type { CompositionProps } from "../content/schema";
import sellingPut from "../../examples/selling-put.json";
import fixtureCaptions from "../../public/fixtures/selling-put.captions.json";
import { buildSceneTimeline } from "../timing/buildSceneTimeline";
import { groupCaptions } from "../timing/groupCaptions";
import { DURATION, INTRO, VIDEO } from "../config";
import { parseStoryboard, type WordTimestamp } from "../content/schema";
import { introDurationSeconds, resolveIntro } from "../content/intro";
import { staticFile } from "remotion";

const storyboard = parseStoryboard(sellingPut);
const intro = resolveIntro(storyboard.intro);
const introSeconds = introDurationSeconds(intro);
const overlap = introSeconds > 0 ? INTRO.overlapSeconds : 0;
const words = fixtureCaptions as WordTimestamp[];
const lastWordEnd = words.length ? words[words.length - 1].end : 11.2;
const contentDuration =
  lastWordEnd + (introSeconds > 0 ? 0 : DURATION.startPaddingSeconds) + DURATION.endPaddingSeconds;
const timeline = buildSceneTimeline({
  scenes: storyboard.scenes,
  words,
  totalSeconds: contentDuration,
}).map((timing) => ({
  ...timing,
  startSeconds: timing.startSeconds + Math.max(0, introSeconds - overlap),
  endSeconds: timing.endSeconds + Math.max(0, introSeconds - overlap),
}));
const captions = groupCaptions(words).map((phrase) => ({
  ...phrase,
  start: phrase.start + introSeconds,
  end: phrase.end + introSeconds,
  words: phrase.words.map((word) => ({
    ...word,
    start: word.start + introSeconds,
    end: word.end + introSeconds,
  })),
}));
const durationSeconds = introSeconds + contentDuration - overlap;

export const previewProps: CompositionProps = {
  storyboard,
  timeline,
  captions,
  audioSrc: staticFile("fixtures/selling-put.mp3"),
  durationInFrames: Math.max(1, Math.round(durationSeconds * VIDEO.fps)),
};
