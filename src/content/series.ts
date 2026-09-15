export const SERIES_IDS = [
  "explain_like_im_five",
  "why_did_i_lose_money",
  "wall_street_vocabulary",
  "market_weirdness",
  "options_101",
  "money_math",
] as const;

export type SeriesId = (typeof SERIES_IDS)[number];

export const TEMPLATE_IDS = [
  "centered-explainer",
  "before-after",
  "cause-effect",
  "price-line",
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

export type HookPattern =
  | "contradiction"
  | "pain"
  | "curiosity"
  | "translation"
  | "mistake"
  | "surprise";

export type BackgroundKey = "cream" | "blush" | "butter" | "blue" | "lavender";

export interface SeriesConfig {
  id: SeriesId;
  label: string;
  hookStyle: HookPattern;
  defaultTemplate: TemplateId;
  background: BackgroundKey;
  accent: "rose" | "gold" | "blue" | "green" | "deepRose";
  tone: string;
  decorative: string;
}

export const SERIES: Record<SeriesId, SeriesConfig> = {
  explain_like_im_five: {
    id: "explain_like_im_five",
    label: "EXPLAIN LIKE I'M FIVE",
    hookStyle: "translation",
    defaultTemplate: "centered-explainer",
    background: "butter",
    accent: "gold",
    tone: "Warm, extremely plain language. Translate one idea as if to a bright friend, never a child.",
    decorative: "✨",
  },
  why_did_i_lose_money: {
    id: "why_did_i_lose_money",
    label: "WHY DID I LOSE MONEY",
    hookStyle: "pain",
    defaultTemplate: "cause-effect",
    background: "blush",
    accent: "deepRose",
    tone: "Empathetic and precise. Name the trap without mocking the viewer.",
    decorative: "🎀",
  },
  wall_street_vocabulary: {
    id: "wall_street_vocabulary",
    label: "WALL STREET VOCABULARY",
    hookStyle: "translation",
    defaultTemplate: "before-after",
    background: "lavender",
    accent: "blue",
    tone: "Clever decoder. Make the jargon feel smaller than the idea.",
    decorative: "♡",
  },
  market_weirdness: {
    id: "market_weirdness",
    label: "MARKET WEIRDNESS",
    hookStyle: "curiosity",
    defaultTemplate: "cause-effect",
    background: "blue",
    accent: "blue",
    tone: "Curious and calm. Explain the counterintuitive chain, not a conspiracy.",
    decorative: "✦",
  },
  options_101: {
    id: "options_101",
    label: "OPTIONS 101",
    hookStyle: "contradiction",
    defaultTemplate: "price-line",
    background: "cream",
    accent: "rose",
    tone: "Finance-literate and clean. Mechanics first, wit second.",
    decorative: "🎀",
  },
  money_math: {
    id: "money_math",
    label: "MONEY MATH",
    hookStyle: "mistake",
    defaultTemplate: "before-after",
    background: "cream",
    accent: "gold",
    tone: "Crisp and visual. Let the numbers teach; keep the copy short.",
    decorative: "✦",
  },
};

export function getSeries(id: SeriesId): SeriesConfig {
  return SERIES[id];
}

export function isSeriesId(value: string): value is SeriesId {
  return (SERIES_IDS as readonly string[]).includes(value);
}
