import React from "react";
import { colors, radii, shadows } from "../../brand/theme";

export const visualShadow = shadows.card;

export const VisualCard: React.FC<{
  children: React.ReactNode;
  width?: number;
  height?: number;
  background?: string;
  radius?: number;
  padding?: number;
  style?: React.CSSProperties;
}> = ({
  children,
  width = 420,
  height = 280,
  background = colors.white,
  radius = radii.visual,
  padding = 24,
  style,
}) => {
  return (
    <div
      style={{
        width,
        height,
        background,
        borderRadius: radius,
        boxShadow: shadows.card,
        padding,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const SvgFrame: React.FC<{
  width: number;
  height: number;
  viewBox?: string;
  children: React.ReactNode;
}> = ({ width, height, viewBox, children }) => (
  <svg
    width={width}
    height={height}
    viewBox={viewBox ?? `0 0 ${width} ${height}`}
    fill="none"
  >
    {children}
  </svg>
);
