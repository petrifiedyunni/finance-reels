import React from "react";
import { colors, strokes } from "../../brand/theme";
import { fonts } from "../../brand/typography";
import { VisualCard, SvgFrame } from "./primitives";
import type { VisualProps } from "./types";

export const BullCharacter: React.FC<VisualProps> = ({ progress }) => {
  return (
    <VisualCard width={240} height={240} background={colors.backgroundBlush}>
      <SvgFrame width={180} height={180}>
        <circle cx="90" cy="100" r="52" fill={colors.softPink} stroke={colors.ink} strokeWidth={strokes.regular} />
        <path d="M40 70 L28 38 L58 62" stroke={colors.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M140 70 L152 38 L122 62" stroke={colors.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
        <circle cx="74" cy="96" r="5" fill={colors.ink} />
        <circle cx="106" cy="96" r="5" fill={colors.ink} />
        <path d="M76 118 Q90 128 104 118" stroke={colors.deepRose} strokeWidth={3} fill="none" />
        <ellipse cx="64" cy="112" rx="8" ry="5" fill={colors.rose} opacity={0.45} />
        <ellipse cx="116" cy="112" rx="8" ry="5" fill={colors.rose} opacity={0.45} />
        <text x="90" y="172" textAnchor="middle" fill={colors.ink} fontFamily={fonts.sans} fontWeight={700} fontSize="16">
          bullish {progress > 0.5 ? "✦" : ""}
        </text>
      </SvgFrame>
    </VisualCard>
  );
};

export const BearCharacter: React.FC<VisualProps> = () => {
  return (
    <VisualCard width={240} height={240} background={colors.backgroundBlue}>
      <SvgFrame width={180} height={180}>
        <circle cx="58" cy="62" r="18" fill={colors.blue} stroke={colors.ink} strokeWidth={3} />
        <circle cx="122" cy="62" r="18" fill={colors.blue} stroke={colors.ink} strokeWidth={3} />
        <circle cx="90" cy="102" r="52" fill="#C9D9EE" stroke={colors.ink} strokeWidth={strokes.regular} />
        <circle cx="74" cy="98" r="5" fill={colors.ink} />
        <circle cx="106" cy="98" r="5" fill={colors.ink} />
        <path d="M78 122 Q90 114 102 122" stroke={colors.ink} strokeWidth={3} fill="none" />
        <text x="90" y="172" textAnchor="middle" fill={colors.ink} fontFamily={fonts.sans} fontWeight={700} fontSize="16">
          bearish
        </text>
      </SvgFrame>
    </VisualCard>
  );
};
