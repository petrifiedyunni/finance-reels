import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { CaptionPhrase } from "../../content/schema";
import { colors, radii, shadows } from "../../brand/theme";
import { fonts, fontWeights, letterSpacing, typeScale } from "../../brand/typography";
import { captionBand } from "../../brand/safeZones";
import { VIDEO } from "../../config";

export const KineticCaptions: React.FC<{
  phrases: CaptionPhrase[];
  startPadding?: number;
  introOffsetSeconds?: number;
}> = ({ phrases, startPadding = 0, introOffsetSeconds = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const now = frame / fps - startPadding - introOffsetSeconds;

  const active = phrases.find((p) => now >= p.start - 0.04 && now <= p.end + 0.12);
  if (!active) return null;

  const currentWord = active.words.find((w) => now >= w.start && now <= w.end + 0.06);

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 8 }}>
      <div
        style={{
          position: "absolute",
          left: 70,
          right: 130,
          bottom: VIDEO.height - captionBand.maxY,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: "rgba(40, 37, 43, 0.90)",
            color: colors.backgroundCream,
            fontFamily: fonts.sans,
            fontWeight: fontWeights.sansBold,
            fontSize: typeScale.captionWord,
            letterSpacing: letterSpacing.caption,
            lineHeight: 1.15,
            borderRadius: radii.pill,
            padding: "14px 28px",
            boxShadow: shadows.caption,
            textAlign: "center",
            maxWidth: 860,
          }}
        >
          {active.words.map((word, i) => {
            const isActive = currentWord
              ? word.start === currentWord.start && word.end === currentWord.end
              : false;
            return (
              <span
                key={`${word.start}-${i}`}
                style={{
                  color: isActive ? colors.gold : colors.white,
                  marginRight: 10,
                  display: "inline-block",
                  transform: isActive ? "translateY(-2px) scale(1.04)" : "none",
                  textShadow: isActive ? "0 2px 0 rgba(0,0,0,0.15)" : "none",
                }}
              >
                {word.word}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
