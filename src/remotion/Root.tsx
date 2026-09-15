import React from "react";
import { AbsoluteFill, Composition } from "remotion";
import { CompositionPropsSchema } from "../content/schema";
import { INTRO, VIDEO } from "../config";
import { FinanceReel } from "./FinanceReel";
import { BrandBumper } from "./branding/BrandBumper";
import { previewProps } from "./previewProps";
import "../brand/fonts";

const microFrames = Math.round(INTRO.microSeconds * VIDEO.fps);
const fullFrames = Math.round(INTRO.fullSeconds * VIDEO.fps);

const MicroBumperPreview: React.FC = () => (
  <AbsoluteFill>
    <BrandBumper mode="micro" phrase={INTRO.phrase} durationInFrames={microFrames} />
  </AbsoluteFill>
);

const FullBumperPreview: React.FC = () => (
  <AbsoluteFill>
    <BrandBumper mode="full" phrase={INTRO.phrase} durationInFrames={fullFrames} />
  </AbsoluteFill>
);

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
      <Composition
        id="BrandBumperMicro"
        component={MicroBumperPreview}
        width={VIDEO.width}
        height={VIDEO.height}
        fps={VIDEO.fps}
        durationInFrames={microFrames}
      />
      <Composition
        id="BrandBumperFull"
        component={FullBumperPreview}
        width={VIDEO.width}
        height={VIDEO.height}
        fps={VIDEO.fps}
        durationInFrames={fullFrames}
      />
    </>
  );
};
