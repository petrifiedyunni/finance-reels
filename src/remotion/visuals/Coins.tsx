import React from "react";
import { colors, strokes } from "../../brand/theme";
import { fonts } from "../../brand/typography";
import { VisualCard, SvgFrame } from "./primitives";
import type { VisualProps } from "./types";

export const Coins: React.FC<VisualProps> = ({ spec, progress }) => {
  const collect = spec.state === "collect";
  const lift = collect ? (1 - progress) * 30 : 0;
  return (
    <VisualCard width={520} height={330} background={colors.backgroundButter} padding={28}>
      <SvgFrame width={464} height={274} viewBox="0 0 280 170">
        {[0, 1, 2].map((i) => {
          const y = 88 - i * 18 - (i === 2 ? lift : 0);
          return (
            <g key={i}>
              <ellipse cx="140" cy={y + 18} rx="70" ry="22" fill={colors.gold} opacity={0.35} />
              <ellipse cx="140" cy={y} rx="70" ry="22" fill={colors.gold} stroke={colors.ink} strokeWidth={strokes.hairline} />
              <text x="140" y={y + 7} textAnchor="middle" fill={colors.ink} fontFamily={fonts.display} fontWeight={700} fontSize="18">
                $
              </text>
            </g>
          );
        })}
        <text x="140" y="160" textAnchor="middle" fill={colors.ink} fontFamily={fonts.sans} fontWeight={600} fontSize="18">
          {spec.label ?? "premium"}
        </text>
      </SvgFrame>
    </VisualCard>
  );
};

export const MoneyStack: React.FC<VisualProps> = ({ progress }) => {
  return (
    <VisualCard width={300} height={210} background={colors.white}>
      <SvgFrame width={240} height={160}>
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={30 + i * 6}
            y={90 - i * 16 - progress * 6}
            width="160"
            height="40"
            rx="8"
            fill={i % 2 === 0 ? colors.green : "#8FBF9F"}
            stroke={colors.ink}
            strokeWidth={2}
          />
        ))}
      </SvgFrame>
    </VisualCard>
  );
};
