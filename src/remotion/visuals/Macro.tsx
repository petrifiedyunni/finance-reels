import React from "react";
import { colors, strokes } from "../../brand/theme";
import { fonts, fontWeights } from "../../brand/typography";
import { VisualCard, SvgFrame } from "./primitives";
import type { VisualProps } from "./types";

export const RateArrow: React.FC<VisualProps> = ({ spec, progress }) => {
  const down = spec.state === "down" || spec.direction === "down";
  const y = down ? 40 + progress * 50 : 110 - progress * 50;
  return (
    <VisualCard width={220} height={220} background={colors.backgroundBlue}>
      <SvgFrame width={160} height={170}>
        <text x="80" y="28" textAnchor="middle" fill={colors.ink} fontFamily={fonts.sans} fontWeight={700} fontSize="18">
          RATES
        </text>
        <line x1="80" y1="50" x2="80" y2="140" stroke={colors.ink} strokeWidth={6} strokeLinecap="round" />
        <polygon
          points={down ? `80,${y + 40} 58,${y} 102,${y}` : `80,${y} 58,${y + 40} 102,${y + 40}`}
          fill={down ? colors.blue : colors.rose}
          stroke={colors.ink}
          strokeWidth={2}
        />
      </SvgFrame>
    </VisualCard>
  );
};

export const InflationTag: React.FC<VisualProps> = ({ spec }) => (
  <VisualCard width={260} height={140} background={colors.backgroundButter}>
    <div
      style={{
        fontFamily: fonts.sans,
        fontWeight: fontWeights.sansBold,
        fontSize: 28,
        color: colors.ink,
        border: `${strokes.regular}px solid ${colors.ink}`,
        borderRadius: 18,
        padding: "12px 18px",
      }}
    >
      INFLATION {spec.state === "up" ? "↑" : spec.state === "down" ? "↓" : ""}
    </div>
  </VisualCard>
);

export const Bond: React.FC<VisualProps> = ({ spec }) => (
  <VisualCard width={280} height={170} background={colors.white}>
    <SvgFrame width={240} height={130}>
      <rect x="12" y="24" width="216" height="84" rx="16" fill={colors.backgroundLavender} stroke={colors.ink} strokeWidth={3} />
      <text x="120" y="62" textAnchor="middle" fill={colors.ink} fontFamily={fonts.display} fontWeight={700} fontSize="22">
        BOND
      </text>
      <text x="120" y="90" textAnchor="middle" fill={colors.mutedInk} fontFamily={fonts.sans} fontSize="16">
        {spec.state === "down" ? "price down" : spec.state === "up" ? "price up" : "yield ↔ price"}
      </text>
    </SvgFrame>
  </VisualCard>
);

export const Bank: React.FC<VisualProps> = () => (
  <VisualCard width={260} height={200} background={colors.white}>
    <SvgFrame width={200} height={160}>
      <polygon points="100,18 18,60 182,60" fill={colors.backgroundBlue} stroke={colors.ink} strokeWidth={3} />
      <rect x="28" y="60" width="144" height="80" fill={colors.white} stroke={colors.ink} strokeWidth={3} />
      <rect x="50" y="78" width="18" height="62" fill={colors.backgroundBlue} />
      <rect x="91" y="78" width="18" height="62" fill={colors.backgroundBlue} />
      <rect x="132" y="78" width="18" height="62" fill={colors.backgroundBlue} />
    </SvgFrame>
  </VisualCard>
);

export const CompanyCard: React.FC<VisualProps> = ({ spec }) => (
  <VisualCard width={720} height={280} background={colors.white}>
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: fonts.sans, fontSize: 22, color: colors.mutedInk, letterSpacing: 3 }}>COMPANY</div>
      <div style={{ fontFamily: fonts.display, fontSize: 64, color: colors.ink, marginTop: 12 }}>
        {spec.label ?? "ACME"}
      </div>
    </div>
  </VisualCard>
);

export const EarningsCard: React.FC<VisualProps> = ({ spec }) => (
  <VisualCard width={320} height={180} background={colors.backgroundCream}>
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: fonts.sans, fontWeight: 700, color: colors.mutedInk }}>EARNINGS</div>
      <div style={{ fontFamily: fonts.display, fontSize: 42, color: spec.state === "miss" ? colors.red : colors.green }}>
        {spec.state === "miss" ? "MISS" : "BEAT"}
      </div>
    </div>
  </VisualCard>
);
