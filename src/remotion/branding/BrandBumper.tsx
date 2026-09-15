import React from "react";
import { AbsoluteFill, Audio, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../brand/theme";
import { VIDEO, type IntroMode } from "../../config";
import { enterSpring } from "../animations";
import { CreatorDoll } from "./CreatorDoll";
import { IntroSparkles } from "./IntroSparkles";
import { IntroText } from "./IntroText";

export const BrandBumper: React.FC<{
  mode: Exclude<IntroMode, "none">;
  phrase?: string;
  durationInFrames: number;
}> = ({ mode, phrase, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const compact = mode === "micro";
  const enter = enterSpring(frame, fps, 0);
  const flash = interpolate(frame, [0, 5, 12], [0.75, 0.2, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const shineEnd = Math.max(compact ? 18 : 36, durationInFrames - 2);
  const shine = interpolate(frame, [0, shineEnd], [-80, 160], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(180deg, #C40078 0%, #A80068 42%, #8A0058 100%)",
        overflow: "hidden",
      }}
      aria-label={phrase}
    >
      <Audio src={staticFile("assets/audio/intro-sting.mp3")} volume={0.92} />
      <AbsoluteFill
        style={{
          background: "radial-gradient(90% 55% at 50% 10%, rgba(255,140,200,0.22) 0%, transparent 64%)",
        }}
      />
      <AbsoluteFill
        style={{
          background: `linear-gradient(118deg, transparent ${shine - 18}%, rgba(255,255,255,0.48) ${shine}%, transparent ${shine + 18}%)`,
          mixBlendMode: "screen",
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          background: colors.white,
          opacity: flash,
          mixBlendMode: "screen",
        }}
      />
      <IntroSparkles dense={!compact} layer="back" />
      <div
        style={{
          position: "absolute",
          left: 0,
          width: VIDEO.width,
          top: 40,
          height: VIDEO.height / 2 + 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IntroText compact={compact} />
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: VIDEO.height / 2,
          height: VIDEO.height / 2,
          width: VIDEO.width,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          transform: `translateX(-50%) translateY(${(1 - enter) * 140}px)`,
          opacity: enter,
        }}
      >
        <CreatorDoll pose="idle" />
      </div>
      <IntroSparkles dense={!compact} layer="front" />
    </AbsoluteFill>
  );
};
