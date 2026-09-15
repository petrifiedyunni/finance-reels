import React from "react";
import { colors, strokes } from "../../brand/theme";
import { fonts, fontWeights } from "../../brand/typography";
import { VisualCard, SvgFrame } from "./primitives";
import type { VisualProps } from "./types";

export const DollarBubble: React.FC<VisualProps> = ({ spec, progress }) => (
  <VisualCard width={200} height={200} background="transparent" style={{ boxShadow: "none", padding: 0 }}>
    <SvgFrame width={180} height={180}>
      <circle cx="90" cy="90" r={50 + progress * 8} fill={colors.backgroundButter} stroke={colors.ink} strokeWidth={strokes.regular} />
      <text x="90" y="104" textAnchor="middle" fill={colors.ink} fontFamily={fonts.display} fontWeight={700} fontSize="48">
        {String(spec.value ?? "$")}
      </text>
    </SvgFrame>
  </VisualCard>
);

export const SpeechBubble: React.FC<VisualProps> = ({ spec }) => (
  <VisualCard width={320} height={180} background="transparent" style={{ boxShadow: "none" }}>
    <SvgFrame width={300} height={150}>
      <rect x="8" y="8" width="284" height="110" rx="28" fill={colors.white} stroke={colors.ink} strokeWidth={3} />
      <polygon points="48,118 72,118 40,142" fill={colors.white} stroke={colors.ink} strokeWidth={3} />
      <text x="150" y="74" textAnchor="middle" fill={colors.ink} fontFamily={fonts.sans} fontWeight={fontWeights.sansBold} fontSize="22">
        {spec.label ?? "wait... what?"}
      </text>
    </SvgFrame>
  </VisualCard>
);

export const Arrow: React.FC<VisualProps> = ({ spec, progress }) => {
  const down = spec.direction === "down" || spec.state === "down";
  return (
    <VisualCard width={180} height={160} background="transparent" style={{ boxShadow: "none", padding: 0 }}>
      <SvgFrame width={140} height={140}>
        <line
          x1={down ? 70 : 20}
          y1={down ? 20 : 70}
          x2={down ? 70 : 20 + progress * 90}
          y2={down ? 20 + progress * 90 : 70}
          stroke={colors.ink}
          strokeWidth={8}
          strokeLinecap="round"
        />
        <polygon
          points={down ? "70,120 52,92 88,92" : "120,70 92,52 92,88"}
          fill={colors.rose}
          stroke={colors.ink}
          strokeWidth={2}
        />
      </SvgFrame>
    </VisualCard>
  );
};

export const Sparkles: React.FC<VisualProps> = ({ progress }) => (
  <VisualCard width={200} height={140} background="transparent" style={{ boxShadow: "none" }}>
    <div style={{ fontSize: 40 + progress * 8, color: colors.gold, letterSpacing: 12 }}>✦ ✦ ✦</div>
  </VisualCard>
);

export const Heart: React.FC<VisualProps> = () => (
  <VisualCard width={140} height={140} background="transparent" style={{ boxShadow: "none", padding: 0 }}>
    <SvgFrame width={120} height={110}>
      <path
        d="M60 96 C60 96 12 64 12 38 C12 22 24 14 36 14 C48 14 58 22 60 32 C62 22 72 14 84 14 C96 14 108 22 108 38 C108 64 60 96 60 96 Z"
        fill={colors.softPink}
        stroke={colors.deepRose}
        strokeWidth={3}
      />
    </SvgFrame>
  </VisualCard>
);

export const Bow: React.FC<VisualProps> = () => (
  <VisualCard width={180} height={120} background="transparent" style={{ boxShadow: "none", padding: 0 }}>
    <SvgFrame width={160} height={90}>
      <circle cx="80" cy="46" r="12" fill={colors.rose} stroke={colors.ink} strokeWidth={2} />
      <polygon points="80,46 20,18 24,74" fill={colors.softPink} stroke={colors.ink} strokeWidth={2} />
      <polygon points="80,46 140,18 136,74" fill={colors.softPink} stroke={colors.ink} strokeWidth={2} />
    </SvgFrame>
  </VisualCard>
);

export const QuestionBubble: React.FC<VisualProps> = ({ progress }) => (
  <VisualCard width={180} height={180} background="transparent" style={{ boxShadow: "none", padding: 0 }}>
    <SvgFrame width={160} height={160}>
      <circle cx="80" cy="80" r={52 + progress * 4} fill={colors.white} stroke={colors.ink} strokeWidth={4} />
      <text x="80" y="100" textAnchor="middle" fill={colors.deepRose} fontFamily={fonts.display} fontWeight={700} fontSize="64">
        ?
      </text>
    </SvgFrame>
  </VisualCard>
);
