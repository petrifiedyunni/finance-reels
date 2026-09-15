import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { Scene } from "../../content/schema";
import { colors, radii, shadows } from "../../brand/theme";
import { fonts, fontWeights } from "../../brand/typography";
import { enterSpring, stagger } from "../animations";
import { SceneContainer } from "../components/SceneContainer";
import { FitHeadline } from "../components/HookText";
import { VisualRenderer } from "../visuals/VisualRenderer";

export const CauseEffect: React.FC<{ scene: Scene }> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const nodes = scene.causeEffect?.length
    ? scene.causeEffect
    : [
        { label: scene.emphasis?.[0] ?? "CAUSE", visual: scene.visual },
        { label: scene.emphasis?.[1] ?? "THEN", visual: scene.visual },
        { label: scene.emphasis?.[2] ?? "EFFECT", visual: scene.secondaryVisual ?? scene.visual },
      ];

  return (
    <SceneContainer>
      <FitHeadline text={scene.headline} emphasis={scene.emphasis} width={900} maxFontSize={74} />
      <div style={{ height: 48 }} />
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {nodes.map((node, i) => {
          const p = enterSpring(frame, fps, stagger(i, 6));
          return (
            <React.Fragment key={`${node.label}-${i}`}>
              <div
                style={{
                  opacity: p,
                  transform: `translateY(${(1 - p) * 18}px)`,
                  width: 250,
                  minHeight: 280,
                  background: colors.white,
                  borderRadius: radii.card,
                  boxShadow: shadows.soft,
                  padding: 18,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                }}
              >
                {node.visual ? <VisualRenderer spec={node.visual} delay={stagger(i, 6)} /> : null}
                <div
                  style={{
                    fontFamily: fonts.sans,
                    fontWeight: fontWeights.sansBold,
                    fontSize: 22,
                    textAlign: "center",
                    color: colors.ink,
                  }}
                >
                  {node.label}
                </div>
              </div>
              {i < nodes.length - 1 ? (
                <div
                  style={{
                    opacity: enterSpring(frame, fps, stagger(i, 6) + 4),
                    fontFamily: fonts.sans,
                    fontSize: 36,
                    color: colors.rose,
                    paddingBottom: 24,
                  }}
                >
                  →
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </SceneContainer>
  );
};
