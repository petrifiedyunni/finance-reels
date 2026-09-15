import React from "react";
import { colors, strokes } from "../../brand/theme";
import { fonts, fontWeights } from "../../brand/typography";
import { VisualCard, SvgFrame } from "./primitives";
import type { VisualProps } from "./types";

export const Candlestick: React.FC<VisualProps> = ({ spec }) => {
  const up = spec.state !== "down";
  const fill = up ? colors.green : colors.red;
  return (
    <VisualCard width={180} height={220} background={colors.white}>
      <SvgFrame width={80} height={160}>
        <line x1="40" y1="12" x2="40" y2="148" stroke={colors.ink} strokeWidth={3} />
        <rect x="22" y={up ? 44 : 70} width="36" height="56" rx="6" fill={fill} stroke={colors.ink} strokeWidth={2} />
      </SvgFrame>
    </VisualCard>
  );
};

export const MiniCandlestickChart: React.FC<VisualProps> = ({ spec, progress }) => {
  const downs = spec.state === "down";
  const candles = [
    { x: 36, h: 40, up: true },
    { x: 86, h: 54, up: true },
    { x: 136, h: 36, up: false },
    { x: 186, h: 70, up: !downs },
    { x: 236, h: 48, up: !downs },
  ];
  return (
    <VisualCard width={360} height={220} background={colors.white}>
      <SvgFrame width={300} height={170}>
        {candles.map((c, i) => {
          const visible = progress > i * 0.15;
          const fill = c.up ? colors.green : colors.red;
          const y = 120 - c.h;
          return (
            <g key={c.x} opacity={visible ? 1 : 0.15}>
              <line x1={c.x} y1={y - 14} x2={c.x} y2={y + c.h + 14} stroke={colors.ink} strokeWidth={2} />
              <rect x={c.x - 10} y={y} width="20" height={c.h} rx="4" fill={fill} stroke={colors.ink} strokeWidth={2} />
            </g>
          );
        })}
      </SvgFrame>
    </VisualCard>
  );
};

export const FearMeter: React.FC<VisualProps> = ({ spec, progress }) => {
  const high = spec.state === "high";
  const angle = -120 + (high ? 180 : 70) * progress;
  return (
    <VisualCard width={300} height={220} background={colors.backgroundBlush}>
      <SvgFrame width={240} height={170}>
        <path d="M30 130 A90 90 0 0 1 210 130" stroke={colors.softPink} strokeWidth={18} fill="none" strokeLinecap="round" />
        <path d="M30 130 A90 90 0 0 1 210 130" stroke={colors.ink} strokeWidth={2} fill="none" opacity={0.2} />
        <line
          x1="120"
          y1="130"
          x2={120 + Math.cos((angle * Math.PI) / 180) * 70}
          y2={130 + Math.sin((angle * Math.PI) / 180) * 70}
          stroke={colors.deepRose}
          strokeWidth={strokes.heavy}
          strokeLinecap="round"
        />
        <circle cx="120" cy="130" r="8" fill={colors.ink} />
        <text x="120" y="30" textAnchor="middle" fill={colors.ink} fontFamily={fonts.sans} fontWeight={fontWeights.sansBold} fontSize="18">
          FEAR {high ? "HIGH" : "CALM"}
        </text>
      </SvgFrame>
    </VisualCard>
  );
};

export const IVMeter: React.FC<VisualProps> = ({ spec, progress }) => {
  const high = spec.state !== "low";
  const width = 40 + progress * (high ? 200 : 90);
  return (
    <VisualCard width={360} height={180} background={colors.white}>
      <SvgFrame width={320} height={130}>
        <text x="16" y="32" fill={colors.ink} fontFamily={fonts.sans} fontWeight={700} fontSize="20">
          IMPLIED VOL
        </text>
        <rect x="16" y="58" width="288" height="28" rx="14" fill={colors.backgroundLavender} />
        <rect x="16" y="58" width={width} height="28" rx="14" fill={high ? colors.rose : colors.blue} />
        <text x="16" y="114" fill={colors.mutedInk} fontFamily={fonts.sans} fontSize="16">
          {high ? "expensive options" : "quieter options"}
        </text>
      </SvgFrame>
    </VisualCard>
  );
};
