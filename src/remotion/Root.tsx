import React from "react";
import { Composition } from "remotion";
import { CompositionPropsSchema } from "../content/schema";
import { VIDEO } from "../config";
import { FinanceReel } from "./FinanceReel";
import { previewProps } from "./previewProps";
import "../brand/fonts";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="FinanceReel"
      component={FinanceReel}
      schema={CompositionPropsSchema}
      width={VIDEO.width}
      height={VIDEO.height}
      fps={VIDEO.fps}
      durationInFrames={previewProps.durationInFrames}
      defaultProps={previewProps}
      calculateMetadata={({ props }) => ({
        durationInFrames: props.durationInFrames,
        fps: VIDEO.fps,
        width: VIDEO.width,
        height: VIDEO.height,
      })}
    />
  );
};
