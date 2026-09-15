export const fonts = {
  display: "Fraunces",
  sans: "Outfit",
} as const;

export const typeScale = {
  hook: { min: 70, max: 100 },
  primary: { min: 55, max: 80 },
  secondary: { min: 38, max: 52 },
  captions: { min: 48, max: 64 },
  pill: 22,
  label: 26,
  captionWord: 52,
} as const;

export const fontWeights = {
  display: 700,
  displayMedium: 600,
  sans: 600,
  sansBold: 700,
  sansMedium: 500,
} as const;

export const letterSpacing = {
  hook: -1.6,
  headline: -1.1,
  caption: -0.4,
  pill: 1.4,
} as const;

export const lineHeight = {
  hook: 0.95,
  headline: 1.02,
  body: 1.15,
  caption: 1.1,
} as const;
