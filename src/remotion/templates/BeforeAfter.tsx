import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene } from "../../content/schema";
import { colors, radii, shadows } from "../../brand/theme";
import { fonts, fontWeights } from "../../brand/typography";
import { slideUp, stagger } from "../animations";
import { SceneContainer } from "../components/SceneContainer";
import { FitHeadline } from "../components/HookText";
import { VisualRenderer } from "../visuals/VisualRenderer";

export const BeforeAfter: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const left = scene.comparison?.left ?? "Before";
  const right = scene.comparison?.right ?? "After";
  const leftMotion = slideUp(frame, fps, stagger(0, 5), 20);
  const rightMotion = slideUp(frame, fps, stagger(1, 5), 20);

  return (
    <SceneContainer>
      <FitHeadline text={scene.headline} emphasis={scene.emphasis} width={960} maxFontSize={104} />
      <div style={{ height: 44 }} />
      <div style={{ display: "flex", gap: 22, alignItems: "stretch" }}>
        <div
          style={{
            ...leftMotion,
            width: 390,
            background: colors.white,
            borderRadius: radii.card,
            boxShadow: shadows.card,
            padding: 28,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div style={{ fontFamily: fonts.sans, fontWeight: fontWeights.sansBold, color: colors.mutedInk, letterSpacing: 1.5 }}>
            {left.toUpperCase()}
          </div>
          <VisualRenderer spec={scene.comparison?.leftVisual ?? scene.visual} delay={4} />
        </div>
        <div
          style={{
            ...rightMotion,
            width: 390,
            background: colors.white,
            borderRadius: radii.card,
            boxShadow: shadows.card,
            padding: 28,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
          }}
        >
          <div style={{ fontFamily: fonts.sans, fontWeight: fontWeights.sansBold, color: colors.mutedInk, letterSpacing: 1.5 }}>
            {right.toUpperCase()}
          </div>
          <VisualRenderer
            spec={scene.comparison?.rightVisual ?? scene.secondaryVisual ?? scene.visual}
            delay={8}
          />
        </div>
      </div>
    </SceneContainer>
  );
};
