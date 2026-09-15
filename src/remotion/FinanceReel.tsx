import React from "react";
import {
  AbsoluteFill,
  Audio,
  Sequence,
  useVideoConfig,
} from "remotion";
import type { CompositionProps, Scene } from "../content/schema";
import type { TemplateId } from "../content/series";
import { backgroundByKey, colors } from "../brand/theme";
import { SERIES } from "../content/series";
import { DURATION } from "../config";
import { DecorativeElements, SeriesPill } from "./components/DecorativeElements";
import { KineticCaptions } from "./components/KineticCaptions";
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
  const series = SERIES[storyboard.series];
  const backgroundKey = storyboard.background ?? series.background;
  const background = backgroundByKey[backgroundKey];
  const Template = TEMPLATES[storyboard.template] ?? CenteredExplainer;
  const scenesById = new Map(storyboard.scenes.map((s) => [s.id, s]));

  return (
    <AbsoluteFill style={{ background, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(1200px 700px at 50% 18%, ${colors.white}55, transparent 70%)`,
        }}
      />
      <SeriesPill series={storyboard.series} />
      <DecorativeElements variant={storyboard.scenes.some((s) => s.type === "payoff") ? "payoff" : "sparse"} />
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
      <KineticCaptions phrases={captions} startPadding={DURATION.startPaddingSeconds} />
      {audioSrc ? <Audio src={audioSrc} /> : null}
    </AbsoluteFill>
  );
};
