import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type { VisualSpec } from "../../content/schema";
import { enterSpring } from "../animations";
import { getVisualComponent } from "./visualRegistry";

export const VisualRenderer: React.FC<{
  spec: VisualSpec;
  delay?: number;
}> = ({ spec, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = enterSpring(frame, fps, delay);
  const Comp = getVisualComponent(spec.type);
  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${(1 - progress) * 22}px) scale(${0.94 + progress * 0.06})`,
      }}
    >
      <Comp spec={spec} progress={progress} />
    </div>
  );
};
