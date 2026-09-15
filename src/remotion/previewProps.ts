import type { CompositionProps } from "../content/schema";
import sellingPut from "../../examples/selling-put.json";
import fixtureCaptions from "../../public/fixtures/selling-put.captions.json";
import { buildSceneTimeline } from "../timing/buildSceneTimeline";
import { groupCaptions } from "../timing/groupCaptions";
import { DURATION, VIDEO } from "../config";
import { parseStoryboard, type WordTimestamp } from "../content/schema";
import { staticFile } from "remotion";

const storyboard = parseStoryboard(sellingPut);
const words = fixtureCaptions as WordTimestamp[];
const lastWordEnd = words.length ? words[words.length - 1].end : 11.2;
const durationSeconds =
  lastWordEnd + DURATION.startPaddingSeconds + DURATION.endPaddingSeconds;
const timeline = buildSceneTimeline({
  scenes: storyboard.scenes,
  words,
  totalSeconds: durationSeconds,
});
const captions = groupCaptions(words);

export const previewProps: CompositionProps = {
  storyboard,
  timeline,
  captions,
  audioSrc: staticFile("fixtures/selling-put.mp3"),
  durationInFrames: Math.max(1, Math.round(durationSeconds * VIDEO.fps)),
};
