export const colors = {
  backgroundCream: "#FFF9F3",
  backgroundBlush: "#FCECEF",
  backgroundButter: "#FFF3C8",
  backgroundBlue: "#EAF3FF",
  backgroundLavender: "#F1ECFF",
  ink: "#28252B",
  mutedInk: "#6C6570",
  rose: "#D86F86",
  deepRose: "#B95770",
  softPink: "#F7CAD5",
  green: "#70A889",
  red: "#D66C75",
  gold: "#E3AE55",
  blue: "#7095C8",
  white: "#FFFFFF",
} as const;

export type BrandColor = keyof typeof colors;

export const radii = {
  card: 36,
  pill: 999,
  visual: 28,
  small: 18,
} as const;

export const shadows = {
  card: "0 18px 40px rgba(40, 37, 43, 0.08)",
  soft: "0 10px 24px rgba(40, 37, 43, 0.06)",
  caption: "0 8px 18px rgba(40, 37, 43, 0.16)",
} as const;

export const strokes = {
  hairline: 2,
  regular: 3.5,
  heavy: 5,
} as const;

export const spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 36,
  xl: 48,
  xxl: 72,
} as const;

export const motion = {
  enterDamping: 14,
  enterMass: 0.72,
  enterStiffness: 128,
  popDamping: 11,
  popStiffness: 180,
  transitionFrames: 10,
} as const;

export const brand = {
  name: "Finance Reels",
  mark: "🎀",
  colors,
  radii,
  shadows,
  strokes,
  spacing,
  motion,
} as const;

export const backgroundByKey = {
  cream: colors.backgroundCream,
  blush: colors.backgroundBlush,
  butter: colors.backgroundButter,
  blue: colors.backgroundBlue,
  lavender: colors.backgroundLavender,
} as const;

export type BackgroundKey = keyof typeof backgroundByKey;
