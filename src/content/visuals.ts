export const VISUAL_TYPES = [
  "money_stack",
  "coins",
  "option_contract",
  "price_line",
  "strike_line",
  "price_vs_strike",
  "bull_character",
  "bear_character",
  "candlestick",
  "mini_candlestick_chart",
  "fear_meter",
  "iv_meter",
  "rate_arrow",
  "inflation_tag",
  "bond",
  "bank",
  "company_card",
  "earnings_card",
  "percent_change",
  "balance_scale",
  "magnifying_glass",
  "calendar",
  "clock",
  "piggy_bank",
  "calculator",
  "dollar_bubble",
  "speech_bubble",
  "arrow",
  "sparkles",
  "heart",
  "bow",
  "question_bubble",
] as const;

export type VisualType = (typeof VISUAL_TYPES)[number];

export function isVisualType(value: string): value is VisualType {
  return (VISUAL_TYPES as readonly string[]).includes(value);
}

export const TEMPLATE_COMPATIBILITY: Record<
  string,
  readonly VisualType[]
> = {
  "centered-explainer": VISUAL_TYPES,
  "before-after": VISUAL_TYPES,
  "cause-effect": VISUAL_TYPES,
  "price-line": [
    "price_line",
    "strike_line",
    "price_vs_strike",
    "option_contract",
    "percent_change",
    "mini_candlestick_chart",
    "candlestick",
    "arrow",
  ],
};
