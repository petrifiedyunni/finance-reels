import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { CompositionProps, Scene } from "../content/schema";
import type { TemplateId } from "../content/series";
import { backgroundByKey, colors } from "../brand/theme";
import { SERIES } from "../content/series";
import { DURATION } from "../config";
import { introDurationSeconds, resolveIntro } from "../content/intro";
import { DecorativeElements, SeriesPill } from "./components/DecorativeElements";
import { KineticCaptions } from "./components/KineticCaptions";
import { BrandBumper } from "./branding/BrandBumper";
import { CenteredExplainer } from "./templates/CenteredExplainer";
import { BeforeAfter } from "./templates/BeforeAfter";
import { CauseEffect } from "./templates/CauseEffect";
import { PriceLineTemplate } from "./templates/PriceLine";

const TEMPLATES: Record<TemplateId, React.FC<{ scene: Scene }>> = {
  "centered-explainer": CenteredExplainer,
  "before-after": BeforeAfter,
  "cause-effect": CauseEffect,
  "price-line": PriceLineTemplate,
};

export const FinanceReel: React.FC<CompositionProps> = ({
  storyboard,
  timeline,
  captions,
  audioSrc,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const series = SERIES[storyboard.series];
  const backgroundKey = storyboard.background ?? series.background;
  const background = backgroundByKey[backgroundKey];
  const Template = TEMPLATES[storyboard.template] ?? CenteredExplainer;
  const scenesById = new Map(storyboard.scenes.map((s) => [s.id, s]));
  const intro = resolveIntro(storyboard.intro);
  const introSeconds = introDurationSeconds(intro);
  const introFrames = Math.max(0, Math.round(introSeconds * fps));
  const showChrome = introFrames === 0 || frame >= introFrames - 6;

  return (
    <AbsoluteFill style={{ background, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(1200px 700px at 50% 18%, ${colors.white}55, transparent 70%)`,
        }}
      />
      {showChrome ? <SeriesPill series={storyboard.series} /> : null}
      {showChrome ? (
        <DecorativeElements variant={storyboard.scenes.some((s) => s.type === "payoff") ? "payoff" : "sparse"} />
      ) : null}
      {timeline.map((timing) => {
        const scene = scenesById.get(timing.sceneId);
        if (!scene) return null;
        const from = Math.round(timing.startSeconds * fps);
        const durationInFrames = Math.max(
          1,
          Math.round((timing.endSeconds - timing.startSeconds) * fps),
        );
        return (
          <Sequence key={`${timing.sceneId}-${from}`} from={from} durationInFrames={durationInFrames}>
            <Template scene={scene} />
          </Sequence>
        );
      })}
      {intro.mode !== "none" && introFrames > 0 ? (
        <Sequence durationInFrames={introFrames} name="brand-bumper">
          <BrandBumper
            mode={intro.mode}
            phrase={intro.phrase}
            durationInFrames={introFrames}
          />
        </Sequence>
      ) : null}
      <KineticCaptions
        phrases={captions}
        startPadding={introSeconds > 0 ? 0 : DURATION.startPaddingSeconds}
      />
      {audioSrc ? <Audio src={audioSrc} /> : null}
    </AbsoluteFill>
  );
};
