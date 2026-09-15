import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene } from "../../content/schema";
import { slideUp } from "../animations";
import { SceneContainer } from "../components/SceneContainer";
import { FitHeadline } from "../components/HookText";
import { VisualRenderer } from "../visuals/VisualRenderer";
import { colors } from "../../brand/theme";
import { fonts, fontWeights } from "../../brand/typography";
import { typeScale } from "../../brand/typography";

export const CenteredExplainer: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headline = slideUp(frame, fps, 0, 24);
  const sub = slideUp(frame, fps, 4, 16);

  return (
    <SceneContainer>
      <div style={headline}>
        <FitHeadline text={scene.headline} emphasis={scene.emphasis} width={960} />
      </div>
      <div style={{ height: 40 }} />
      <VisualRenderer spec={scene.visual} delay={2} />
      {scene.subtext ? (
        <div
          style={{
            ...sub,
            marginTop: 28,
            fontFamily: fonts.sans,
            fontWeight: fontWeights.sansMedium,
            fontSize: typeScale.secondary.min,
            color: colors.mutedInk,
            textAlign: "center",
            maxWidth: 760,
          }}
        >
          {scene.subtext}
        </div>
      ) : null}
    </SceneContainer>
  );
};
