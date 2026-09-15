import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../brand/theme";
import { fonts, fontWeights, letterSpacing } from "../../brand/typography";
import { seriesPillY } from "../../brand/safeZones";
import { getSeries, type SeriesId } from "../../content/series";
import { enterSpring, floatY } from "../animations";

export const SeriesPill: React.FC<{ series: SeriesId }> = ({ series }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const config = getSeries(series);
  const p = enterSpring(frame, fps, 0);
  return (
    <div
      style={{
        position: "absolute",
        top: seriesPillY,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: p,
        transform: `translateY(${(1 - p) * 12}px)`,
        zIndex: 4,
      }}
    >
      <div
        style={{
          fontFamily: fonts.sans,
          fontWeight: fontWeights.sansBold,
          fontSize: 20,
          letterSpacing: letterSpacing.pill,
          color: colors.ink,
          background: colors.white,
          borderRadius: 999,
          padding: "12px 22px",
          boxShadow: "0 10px 24px rgba(40,37,43,0.06)",
        }}
      >
        {config.label} {config.decorative}
      </div>
    </div>
  );
};

export const DecorativeElements: React.FC<{
  variant?: "sparse" | "payoff";
}> = ({ variant = "sparse" }) => {
  const frame = useCurrentFrame();
  const sparkles = variant === "payoff"
    ? [
        { x: 120, y: 420, s: 16 },
        { x: 900, y: 520, s: 12 },
        { x: 180, y: 1100, s: 10 },
        { x: 860, y: 980, s: 14 },
      ]
    : [
        { x: 86, y: 390, s: 11 },
        { x: 940, y: 480, s: 9 },
      ];

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 1 }}>
      {sparkles.map((sp, i) => {
        const opacity = interpolate(
          Math.sin((frame + i * 10) / 14),
          [-1, 1],
          [0.25, 0.8],
        );
        return (
          <div
            key={`${sp.x}-${sp.y}`}
            style={{
              position: "absolute",
              left: sp.x,
              top: sp.y + floatY(frame + i * 6, 6, 16),
              width: sp.s,
              height: sp.s,
              opacity,
              color: i % 2 === 0 ? colors.gold : colors.rose,
              fontSize: sp.s,
              fontFamily: fonts.sans,
            }}
          >
            ✦
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
