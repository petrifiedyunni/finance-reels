import React from "react";
import { colors, strokes } from "../../brand/theme";
import { fonts, fontWeights } from "../../brand/typography";
import { VisualCard, SvgFrame } from "./primitives";
import type { VisualProps } from "./types";

export const PriceLine: React.FC<VisualProps> = ({ spec }) => {
  const price = Number(spec.value ?? 105);
  return (
    <VisualCard width={520} height={180} background={colors.white} padding={20}>
      <SvgFrame width={480} height={140}>
        <line x1="30" y1="80" x2="450" y2="80" stroke={colors.ink} strokeWidth={strokes.regular} />
        <circle cx="340" cy="80" r="14" fill={colors.rose} stroke={colors.ink} strokeWidth={2} />
        <text x="340" y="48" textAnchor="middle" fill={colors.ink} fontFamily={fonts.sans} fontWeight={fontWeights.sansBold} fontSize="22">
          ${price}
        </text>
      </SvgFrame>
    </VisualCard>
  );
};

export const StrikeLine: React.FC<VisualProps> = ({ spec }) => {
  const strike = Number(spec.value ?? 100);
  return (
    <VisualCard width={520} height={140} background={colors.backgroundCream} padding={16}>
      <SvgFrame width={480} height={110}>
        <line x1="30" y1="58" x2="450" y2="58" stroke={colors.mutedInk} strokeWidth={3} strokeDasharray="10 10" />
        <text x="450" y="42" textAnchor="end" fill={colors.mutedInk} fontFamily={fonts.sans} fontSize="18">
          strike ${strike}
        </text>
      </SvgFrame>
    </VisualCard>
  );
};

export const PriceVsStrike: React.FC<VisualProps> = ({ spec, progress }) => {
  const above = spec.state !== "below";
  const price = Number(spec.value ?? 105);
  const strike = Number(spec.secondaryValue ?? 100);
  const cx = 70 + progress * 250;

  return (
    <VisualCard width={560} height={240} background={colors.white} padding={18}>
      <SvgFrame width={520} height={200}>
        <text x="26" y="36" fill={colors.mutedInk} fontFamily={fonts.sans} fontSize="16">
          PRICE
        </text>
        <line x1="26" y1="70" x2="490" y2="70" stroke={colors.ink} strokeWidth={4} />
        <circle cx={above ? Math.max(cx, 300) : 220} cy={70} r="13" fill={colors.rose} stroke={colors.ink} strokeWidth={2} />
        <text x={above ? 318 : 200} y="52" fill={colors.ink} fontFamily={fonts.display} fontWeight={700} fontSize="22">
          ${price}
        </text>
        <line x1="26" y1="118" x2="490" y2="118" stroke={colors.mutedInk} strokeWidth={3} strokeDasharray="9 9" />
        <text x="490" y="150" textAnchor="end" fill={colors.mutedInk} fontFamily={fonts.sans} fontSize="18">
          strike ${strike}
        </text>
        <text x="26" y="184" fill={above ? colors.green : colors.red} fontFamily={fonts.sans} fontWeight={700} fontSize="20">
          {above ? "above the strike" : "below the strike"}
        </text>
      </SvgFrame>
    </VisualCard>
  );
};
