import React from "react";
import { colors, strokes } from "../../brand/theme";
import { fonts, fontWeights } from "../../brand/typography";
import { VisualCard, SvgFrame } from "./primitives";
import type { VisualProps } from "./types";

export const PercentChange: React.FC<VisualProps> = ({ spec, progress }) => {
  const down = spec.state === "down" || spec.direction === "down";
  const value = spec.value ?? (down ? "-10%" : "+10%");
  return (
    <VisualCard width={280} height={180} background={down ? colors.backgroundBlush : colors.backgroundCream}>
      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: 64,
          color: down ? colors.red : colors.green,
          transform: `scale(${0.9 + progress * 0.1})`,
        }}
      >
        {String(value)}
      </div>
    </VisualCard>
  );
};

export const BalanceScale: React.FC<VisualProps> = ({ spec, progress }) => {
  const tilt = spec.state === "left" ? -8 * progress : spec.state === "right" ? 8 * progress : 0;
  return (
    <VisualCard width={320} height={220} background={colors.white}>
      <SvgFrame width={280} height={180}>
        <line x1="140" y1="30" x2="140" y2="150" stroke={colors.ink} strokeWidth={4} />
        <g transform={`rotate(${tilt} 140 50)`}>
          <line x1="40" y1="50" x2="240" y2="50" stroke={colors.ink} strokeWidth={4} />
          <rect x="28" y="70" width="70" height="44" rx="10" fill={colors.backgroundButter} stroke={colors.ink} strokeWidth={2} />
          <rect x="182" y="70" width="70" height="44" rx="10" fill={colors.backgroundBlue} stroke={colors.ink} strokeWidth={2} />
        </g>
      </SvgFrame>
    </VisualCard>
  );
};

export const MagnifyingGlass: React.FC<VisualProps> = () => (
  <VisualCard width={200} height={200} background={colors.white}>
    <SvgFrame width={150} height={150}>
      <circle cx="62" cy="62" r="36" stroke={colors.ink} strokeWidth={strokes.heavy} fill={colors.backgroundBlue} />
      <line x1="90" y1="90" x2="132" y2="132" stroke={colors.ink} strokeWidth={10} strokeLinecap="round" />
    </SvgFrame>
  </VisualCard>
);

export const Calendar: React.FC<VisualProps> = ({ spec }) => (
  <VisualCard width={200} height={210} background={colors.white}>
    <SvgFrame width={150} height={170}>
      <rect x="15" y="28" width="120" height="120" rx="16" fill={colors.backgroundCream} stroke={colors.ink} strokeWidth={3} />
      <rect x="15" y="28" width="120" height="36" fill={colors.rose} />
      <text x="75" y="104" textAnchor="middle" fill={colors.ink} fontFamily={fonts.display} fontWeight={700} fontSize="36">
        {String(spec.value ?? "15")}
      </text>
    </SvgFrame>
  </VisualCard>
);

export const Clock: React.FC<VisualProps> = ({ progress }) => (
  <VisualCard width={200} height={200} background={colors.white}>
    <SvgFrame width={150} height={150}>
      <circle cx="75" cy="75" r="54" fill={colors.backgroundButter} stroke={colors.ink} strokeWidth={4} />
      <line x1="75" y1="75" x2="75" y2="40" stroke={colors.ink} strokeWidth={4} />
      <line
        x1="75"
        y1="75"
        x2={75 + Math.cos(progress * 6.28 - 1.57) * 32}
        y2={75 + Math.sin(progress * 6.28 - 1.57) * 32}
        stroke={colors.deepRose}
        strokeWidth={4}
      />
    </SvgFrame>
  </VisualCard>
);

export const PiggyBank: React.FC<VisualProps> = () => (
  <VisualCard width={240} height={200} background={colors.backgroundBlush}>
    <SvgFrame width={190} height={150}>
      <ellipse cx="100" cy="84" rx="70" ry="44" fill={colors.softPink} stroke={colors.ink} strokeWidth={3} />
      <circle cx="158" cy="70" r="16" fill={colors.softPink} stroke={colors.ink} strokeWidth={3} />
      <rect x="78" y="58" width="28" height="8" rx="3" fill={colors.ink} />
      <circle cx="78" cy="80" r="4" fill={colors.ink} />
    </SvgFrame>
  </VisualCard>
);

export const Calculator: React.FC<VisualProps> = ({ spec }) => (
  <VisualCard width={220} height={240} background={colors.white}>
      <SvgFrame width={170} height={200}>
      <rect x="20" y="10" width="130" height="180" rx="18" fill={colors.backgroundCream} stroke={colors.ink} strokeWidth={3} />
      <rect x="34" y="24" width="102" height="40" rx="8" fill={colors.white} stroke={colors.ink} strokeWidth={2} />
      <text x="128" y="52" textAnchor="end" fill={colors.ink} fontFamily={fonts.sans} fontWeight={fontWeights.sansBold} fontSize="20">
        {String(spec.value ?? "99")}
      </text>
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => (
          <rect key={`${r}-${c}`} x={38 + c * 34} y={80 + r * 34} width="26" height="26" rx="6" fill={colors.white} stroke={colors.ink} />
        )),
      )}
    </SvgFrame>
  </VisualCard>
);
