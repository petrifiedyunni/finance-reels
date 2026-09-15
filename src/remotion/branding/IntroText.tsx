import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { fonts } from "../../brand/typography";
import { enterSpring, pop } from "../animations";

const DEPTH = 22;
const FACE = "#FFFFFF";
const SIDE = "#FF7AB8";
const SIDE_DEEP = "#FF4FA3";
const RIM = "#FF6EB4";

const DivaWord: React.FC<{
  text: string;
  size: number;
  opacity: number;
  shift: number;
  tilt?: number;
  depth?: number;
}> = ({ text, size, opacity, shift, tilt = 0, depth = DEPTH }) => {
  const layers = Array.from({ length: depth }, (_, i) => depth - 1 - i);
  const stroke = Math.max(6, size * 0.034);
  const step = 2.15;

  return (
    <div
      style={{
        position: "relative",
        opacity,
        transform: `translateY(${shift}px) rotate(${tilt}deg)`,
        paddingRight: depth * 2.4,
        paddingBottom: depth * 2.6,
        filter: "drop-shadow(0 3px 0 #8F005C) drop-shadow(12px 22px 16px rgba(70,0,50,0.4))",
      }}
    >
      {layers.map((n) => {
        const isFace = n === 0;
        return (
          <div
            key={n}
            style={{
              position: isFace ? "relative" : "absolute",
              left: 0,
              top: 0,
              transform: `translate(${n * step}px, ${n * (step + 0.2)}px)`,
              fontFamily: fonts.script,
              fontSize: size,
              lineHeight: 0.86,
              letterSpacing: 1,
              whiteSpace: "nowrap",
              color: isFace ? FACE : n > depth - 4 ? SIDE_DEEP : SIDE,
              WebkitTextStroke: isFace ? `${stroke}px ${RIM}` : undefined,
              paintOrder: "stroke fill",
            }}
          >
            {text}
          </div>
        );
      })}
    </div>
  );
};

export const IntroText: React.FC<{
  compact?: boolean;
}> = ({ compact = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lead = enterSpring(frame, fps, compact ? 1 : 4);
  const tail = pop(frame, fps, compact ? 5 : 11);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transform: "rotate(-10deg)",
        width: "100%",
      }}
    >
      <DivaWord
        text="Finance for"
        size={compact ? 168 : 188}
        opacity={lead}
        shift={(1 - lead) * 16}
      />
      <div style={{ position: "relative", marginTop: compact ? 12 : 18 }}>
        <DivaWord
          text="Divas"
          size={compact ? 340 : 380}
          opacity={tail}
          shift={(1 - tail) * 14}
          tilt={-3}
        />
        <div
          style={{
            position: "absolute",
            right: compact ? 8 : 20,
            top: compact ? 8 : 16,
            fontSize: compact ? 42 : 52,
            color: "#F4F4F4",
            opacity: tail * 0.9,
            textShadow: "0 4px 0 #C2185A",
            transform: "rotate(12deg)",
          }}
        >
          ✦
        </div>
      </div>
    </div>
  );
};
