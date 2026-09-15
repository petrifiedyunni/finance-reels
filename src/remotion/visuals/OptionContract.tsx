import React from "react";
import { colors, strokes } from "../../brand/theme";
import { fonts, fontWeights } from "../../brand/typography";
import { VisualCard, SvgFrame } from "./primitives";
import type { VisualProps } from "./types";

export const OptionContract: React.FC<VisualProps> = ({ spec, progress }) => {
  const fade = spec.state === "fade" || spec.state === "worthless";
  const question = spec.state === "question";
  const opacity = fade ? 1 - progress * 0.55 : 1;
  const scale = fade ? 1 - progress * 0.08 : 0.92 + progress * 0.08;
  const label = spec.label?.toUpperCase() ?? "";
  const kind = label.includes("CALL") ? "CALL" : label.includes("PUT") ? "PUT" : "OPTION";

  return (
    <div style={{ opacity, transform: `scale(${scale})` }}>
      <VisualCard width={800} height={430} background={colors.white} padding={30}>
        <SvgFrame width={740} height={370} viewBox="0 0 342 192">
          <rect x="8" y="10" width="326" height="172" rx="22" fill={colors.backgroundCream} stroke={colors.ink} strokeWidth={strokes.regular} />
          <rect x="8" y="10" width="326" height="48" rx="22" fill={question ? colors.softPink : colors.backgroundBlush} />
          <rect x="8" y="34" width="326" height="24" fill={question ? colors.softPink : colors.backgroundBlush} />
          <text x="28" y="42" fill={colors.ink} fontFamily={fonts.sans} fontWeight={fontWeights.sansBold} fontSize="22">
            {kind} CONTRACT{question ? "?" : ""}
          </text>
          <text x="28" y="96" fill={colors.mutedInk} fontFamily={fonts.sans} fontSize="16">
            STRIKE
          </text>
          <text x="28" y="128" fill={colors.ink} fontFamily={fonts.display} fontWeight={700} fontSize="36">
            {String(spec.value ?? "$100")}
          </text>
          <text x="210" y="96" fill={colors.mutedInk} fontFamily={fonts.sans} fontSize="16">
            PREMIUM
          </text>
          <text x="210" y="128" fill={colors.rose} fontFamily={fonts.display} fontWeight={700} fontSize="36">
            {String(spec.secondaryValue ?? "$2.40")}
          </text>
          {fade ? (
            <text x="28" y="164" fill={colors.mutedInk} fontFamily={fonts.sans} fontSize="16">
              expires worthless
            </text>
          ) : null}
        </SvgFrame>
      </VisualCard>
    </div>
  );
};
