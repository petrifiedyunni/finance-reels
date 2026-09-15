import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../../brand/theme";
import { fonts } from "../../brand/typography";
import { pop } from "../animations";

type Spark = {
  x: number;
  y: number;
  delay: number;
  size: number;
  color: string;
  glyph: string;
  drift: number;
};

const BACK: Spark[] = [
  { x: 70, y: 220, delay: 1, size: 22, color: "#FFE36E", glyph: "✦", drift: 10 },
  { x: 980, y: 260, delay: 3, size: 18, color: colors.white, glyph: "✧", drift: -8 },
  { x: 140, y: 480, delay: 2, size: 28, color: colors.barbieGloss, glyph: "✦", drift: 14 },
  { x: 900, y: 520, delay: 4, size: 24, color: "#FFE36E", glyph: "★", drift: -12 },
  { x: 40, y: 760, delay: 1, size: 16, color: colors.white, glyph: "✦", drift: 6 },
  { x: 1020, y: 800, delay: 5, size: 20, color: colors.barbiePink, glyph: "✧", drift: -10 },
  { x: 200, y: 1080, delay: 2, size: 18, color: "#FFE36E", glyph: "✦", drift: 8 },
  { x: 860, y: 1120, delay: 3, size: 26, color: colors.white, glyph: "✦", drift: -16 },
  { x: 80, y: 1400, delay: 0, size: 14, color: colors.barbieGloss, glyph: "✧", drift: 12 },
  { x: 980, y: 1480, delay: 4, size: 22, color: "#FFE36E", glyph: "★", drift: -7 },
];

const FRONT: Spark[] = [
  { x: 500, y: 980, delay: 2, size: 22, color: "#FFE36E", glyph: "✦", drift: 8 },
  { x: 430, y: 1020, delay: 3, size: 16, color: colors.white, glyph: "✧", drift: -6 },
  { x: 620, y: 1010, delay: 4, size: 18, color: colors.barbieGloss, glyph: "★", drift: 7 },
  { x: 160, y: 1120, delay: 3, size: 26, color: "#FFE36E", glyph: "✦", drift: 10 },
  { x: 80, y: 1280, delay: 2, size: 20, color: colors.white, glyph: "✧", drift: -8 },
  { x: 40, y: 1460, delay: 5, size: 16, color: colors.barbieGloss, glyph: "✦", drift: 9 },
  { x: 120, y: 1640, delay: 4, size: 22, color: "#FFE36E", glyph: "★", drift: -7 },
  { x: 210, y: 1780, delay: 6, size: 14, color: colors.white, glyph: "✦", drift: 5 },
  { x: 880, y: 1100, delay: 3, size: 24, color: "#FFE36E", glyph: "✦", drift: -10 },
  { x: 960, y: 1260, delay: 2, size: 18, color: colors.white, glyph: "✧", drift: 8 },
  { x: 1000, y: 1440, delay: 5, size: 20, color: colors.barbieGloss, glyph: "★", drift: -9 },
  { x: 920, y: 1620, delay: 4, size: 26, color: "#FFE36E", glyph: "✦", drift: 7 },
  { x: 820, y: 1760, delay: 6, size: 16, color: colors.white, glyph: "✧", drift: -6 },
  { x: 280, y: 1220, delay: 4, size: 13, color: colors.barbiePink, glyph: "✦", drift: 6 },
  { x: 760, y: 1210, delay: 5, size: 13, color: "#FFE36E", glyph: "✧", drift: -5 },
  { x: 200, y: 1520, delay: 3, size: 15, color: colors.white, glyph: "★", drift: 8 },
  { x: 840, y: 1500, delay: 4, size: 15, color: colors.barbieGloss, glyph: "✦", drift: -8 },
  { x: 540, y: 188, delay: 1, size: 18, color: "#FFE36E", glyph: "✦", drift: 4 },
  { x: 180, y: 260, delay: 3, size: 14, color: colors.white, glyph: "✧", drift: -6 },
  { x: 860, y: 250, delay: 4, size: 16, color: colors.barbieGloss, glyph: "★", drift: 5 },
];

const GLITTER = Array.from({ length: 28 }, (_, i) => ({
  x: (i * 137 + 40) % 1040,
  y: (i * 211 + 80) % 1880,
  size: 4 + (i % 5) * 2,
  color: i % 3 === 0 ? "#FFE36E" : i % 3 === 1 ? colors.white : colors.barbieGloss,
}));

export const IntroSparkles: React.FC<{
  dense?: boolean;
  layer?: "back" | "front";
}> = ({ dense = false, layer = "back" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const stars = layer === "front" ? FRONT : dense ? BACK : BACK.slice(0, 6);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {layer === "back"
        ? GLITTER.map((dot, index) => {
            const fall = (dot.y + frame * (2.2 + (index % 4))) % 1920;
            const twinkle = interpolate(Math.sin((frame + index * 11) / 4), [-1, 1], [0.15, 1]);
            return (
              <div
                key={`g-${index}`}
                style={{
                  position: "absolute",
                  left: dot.x,
                  top: fall,
                  width: dot.size,
                  height: dot.size,
                  borderRadius: "50%",
                  background: dot.color,
                  opacity: twinkle * (dense ? 0.95 : 0.7),
                  boxShadow: `0 0 ${dot.size * 2}px ${dot.color}`,
                }}
              />
            );
          })
        : null}
      {stars.map((spark, index) => {
        const appear = pop(frame, fps, spark.delay);
        const twinkle = interpolate(Math.sin((frame + index * 7) / 5), [-1, 1], [0.35, 1]);
        const y = spark.y + Math.sin((frame + index * 5) / 8) * spark.drift;
        return (
          <div
            key={`${spark.x}-${spark.y}-${spark.glyph}`}
            style={{
              position: "absolute",
              left: spark.x,
              top: y,
              fontSize: spark.size,
              color: spark.color,
              opacity: appear * twinkle,
              transform: `scale(${0.65 + appear * 0.7}) rotate(${Math.sin(frame / 6 + index) * 18}deg)`,
              fontFamily: fonts.sans,
              textShadow: `0 0 16px ${spark.color}`,
              filter: "drop-shadow(0 0 8px rgba(255,227,110,0.8))",
            }}
          >
            {spark.glyph}
          </div>
        );
      })}
    </div>
  );
};
