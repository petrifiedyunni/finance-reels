import React from "react";
import { Img, staticFile } from "remotion";

export type DollPose = "idle" | "pop" | "swipe";

export const CREATOR_DOLL_SRC = staticFile("assets/branding/creator-doll-head.png");

export const CreatorDoll: React.FC<{
  pose?: DollPose;
}> = () => {
  return (
    <div
      style={{
        height: "100%",
        width: "140%",
        filter: "drop-shadow(0 24px 36px rgba(230,0,122,0.38))",
      }}
    >
      <Img
        src={CREATOR_DOLL_SRC}
        alt="Creator doll"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "50% 12%",
          display: "block",
        }}
      />
    </div>
  );
};
