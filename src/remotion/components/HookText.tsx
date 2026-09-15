import React from "react";
import { colors } from "../../brand/theme";
import { fonts, fontWeights, letterSpacing, lineHeight, typeScale } from "../../brand/typography";

export function autoSize(
  text: string,
  range: { min: number; max: number },
  maxChars = 28,
): number {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= 10) return range.max;
  if (compact.length >= maxChars) return range.min;
  const t = (compact.length - 10) / (maxChars - 10);
  return range.max - t * (range.max - range.min);
}

export function splitHeadline(text: string, maxLineChars = 16): string[] {
  if (text.includes("\n")) {
    return text.split(/\n/).map((l) => l.trim()).filter(Boolean);
  }
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLineChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 4);
}

export const FitHeadline: React.FC<{
  text: string;
  width?: number;
  color?: string;
  align?: "left" | "center" | "right";
  maxFontSize?: number;
  minFontSize?: number;
  emphasis?: string[];
}> = ({
  text,
  width = 860,
  color = colors.ink,
  align = "center",
  maxFontSize = typeScale.hook.max,
  minFontSize = typeScale.hook.min,
  emphasis = [],
}) => {
  const lines = splitHeadline(text);
  const longest = lines.reduce((a, b) => (a.length >= b.length ? a : b), text);
  const fontSize = autoSize(longest, { min: minFontSize, max: maxFontSize }, 22);
  const emph = emphasis.map((e) => e.toLowerCase());

  return (
    <div
      style={{
        width,
        textAlign: align,
        fontFamily: fonts.display,
        fontWeight: fontWeights.display,
        fontSize,
        lineHeight: lineHeight.hook,
        letterSpacing: letterSpacing.hook,
        color,
      }}
    >
      {lines.map((line, i) => (
        <div key={`${line}-${i}`} style={{ marginBottom: 4 }}>
          {line.split(/(\s+)/).map((token, j) => {
            const bare = token.replace(/[^\p{L}\p{N}]+/gu, "");
            const hot = bare && emph.some((e) => bare.toLowerCase().includes(e.toLowerCase()) || e.toLowerCase().includes(bare.toLowerCase()));
            return (
              <span
                key={`${token}-${j}`}
                style={{
                  color: hot ? colors.deepRose : color,
                  background: hot ? colors.softPink : "transparent",
                  borderRadius: 12,
                  padding: hot ? "0 6px" : 0,
                }}
              >
                {token}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export const HookText: React.FC<{
  text: string;
  emphasis?: string[];
  width?: number;
}> = ({ text, emphasis, width }) => (
  <FitHeadline
    text={text}
    emphasis={emphasis}
    width={width}
    maxFontSize={typeScale.hook.max}
    minFontSize={typeScale.hook.min}
  />
);

export const EmphasisText: React.FC<{
  text: string;
  emphasis?: string[];
  size?: number;
  color?: string;
}> = ({ text, emphasis = [], size = typeScale.primary.max, color = colors.ink }) => {
  const emph = emphasis.map((e) => e.toLowerCase());
  return (
    <div
      style={{
        fontFamily: fonts.display,
        fontWeight: fontWeights.display,
        fontSize: size,
        lineHeight: lineHeight.headline,
        letterSpacing: letterSpacing.headline,
        textAlign: "center",
        color,
      }}
    >
      {text.split(/(\s+)/).map((token, i) => {
        const bare = token.replace(/[^\p{L}\p{N}]+/gu, "");
        const hot =
          bare &&
          emph.some(
            (e) =>
              bare.toLowerCase() === e ||
              e.includes(bare.toLowerCase()) ||
              bare.toLowerCase().includes(e),
          );
        return (
          <span
            key={`${token}-${i}`}
            style={{
              color: hot ? colors.deepRose : color,
              background: hot ? "rgba(247, 202, 213, 0.7)" : "transparent",
              borderRadius: 14,
              padding: hot ? "0 8px" : 0,
            }}
          >
            {token}
          </span>
        );
      })}
    </div>
  );
};
