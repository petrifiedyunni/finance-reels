import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene } from "../../content/schema";
import { slideUp } from "../animations";
import { SceneContainer } from "../components/SceneContainer";
import { FitHeadline } from "../components/HookText";
import { VisualRenderer } from "../visuals/VisualRenderer";
import { colors } from "../../brand/theme";
import { fonts } from "../../brand/typography";

export const PriceLineTemplate: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const motion = slideUp(frame, fps, 0, 18);

  return (
    <SceneContainer>
      <div style={motion}>
        <FitHeadline text={scene.headline} emphasis={scene.emphasis} width={900} maxFontSize={80} />
      </div>
      <div style={{ height: 48 }} />
      <VisualRenderer spec={scene.visual} delay={0} />
      {scene.subtext ? (
        <div
          style={{
            marginTop: 32,
            fontFamily: fonts.sans,
            fontSize: 36,
            color: colors.mutedInk,
            textAlign: "center",
          }}
        >
          {scene.subtext}
        </div>
      ) : null}
    </SceneContainer>
  );
};
