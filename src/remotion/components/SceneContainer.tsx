import React from "react";
import { AbsoluteFill } from "remotion";
import { contentFrame } from "../../brand/safeZones";

export const SceneContainer: React.FC<{
  children: React.ReactNode;
  align?: "center" | "top";
}> = ({ children, align = "center" }) => {
  return (
    <AbsoluteFill
      style={{
        paddingTop: 280,
        paddingLeft: contentFrame.x,
        paddingRight: 56,
        paddingBottom: 400,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: align === "center" ? "center" : "flex-start",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
