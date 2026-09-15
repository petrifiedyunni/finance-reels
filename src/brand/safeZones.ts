import { VIDEO } from "../config";

/**
 * Mobile safe zones for TikTok / Reels / Shorts.
 * Essential text must stay inside this rectangle.
 */
export const safeZones = {
  top: 168,
  bottom: 360,
  left: 56,
  right: 112,
} as const;

export const contentFrame = {
  x: safeZones.left,
  y: safeZones.top,
  width: VIDEO.width - safeZones.left - safeZones.right,
  height: VIDEO.height - safeZones.top - safeZones.bottom,
} as const;

export const captionBand = {
  bottom: safeZones.bottom + 24,
  minY: VIDEO.height - 560,
  maxY: VIDEO.height - safeZones.bottom - 8,
} as const;

export const seriesPillY = safeZones.top + 8;
