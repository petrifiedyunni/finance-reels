import { interpolate, spring, type SpringConfig } from "remotion";
import { motion } from "../../brand/theme";

const enterConfig: SpringConfig = {
  damping: motion.enterDamping,
  mass: motion.enterMass,
  stiffness: motion.enterStiffness,
  overshootClamping: false,
};

const popConfig: SpringConfig = {
  damping: motion.popDamping,
  mass: 0.55,
  stiffness: motion.popStiffness,
  overshootClamping: false,
};

export function enterSpring(
  frame: number,
  fps: number,
  delay = 0,
  config: Partial<SpringConfig> = {},
): number {
  return spring({
    frame: Math.max(0, frame - delay) + 12,
    fps,
    config: { ...enterConfig, ...config },
  });
}

export function fade(
  frame: number,
  _fps: number,
  delay = 0,
  durationFrames = 10,
): number {
  return interpolate(frame - delay, [0, durationFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export function pop(frame: number, fps: number, delay = 0): number {
  return spring({
    frame: Math.max(0, frame - delay) + 8,
    fps,
    config: popConfig,
  });
}

export function slideUp(
  frame: number,
  fps: number,
  delay = 0,
  distance = 28,
): { opacity: number; transform: string } {
  const p = enterSpring(frame, fps, delay);
  return {
    opacity: p,
    transform: `translateY(${(1 - p) * distance}px)`,
  };
}

export function pulse(frame: number, fps: number, delay = 0): number {
  const p = spring({
    frame: Math.max(0, frame - delay),
    fps,
    config: { damping: 8, stiffness: 160, mass: 0.4 },
  });
  return 0.96 + p * 0.08;
}

export function highlightSweep(frame: number, delay = 0): number {
  return interpolate(frame - delay, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

export function stagger(index: number, gap = 4): number {
  return index * gap;
}

export function floatY(frame: number, amplitude = 8, speed = 18): number {
  return Math.sin(frame / speed) * amplitude;
}
