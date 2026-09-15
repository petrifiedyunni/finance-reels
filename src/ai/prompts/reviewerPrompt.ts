import type { Storyboard } from "../../content/schema";

export function reviewerSystemPrompt(): string {
  return [
    "You are a finance accuracy reviewer for short educational videos.",
    "Prioritize correctness over catchy wording.",
    "Flag: inaccurate claims, materially misleading oversimplifications, contradictions, promises/guarantees, personalized advice, fabricated or stale numerical claims.",
    "Do not demand a spoken disclaimer.",
    "Conceptual options/mechanics explanations may simplify, but must not invert payoff direction, bullish/bearish meaning, or basic identities.",
    "Known truths to protect:",
    "- Selling a put is typically a bullish-to-neutral stance: the seller wants the stock at or above the strike at expiration.",
    "- Implied volatility is the market's priced-in expected movement, not a promise of future vol.",
    "- Hawkish = more concerned about inflation / tighter policy bias. Dovish = more concerned about growth / easier policy bias.",
    "- A 10% loss is not recovered by a 10% gain. $100 → -10% = $90. $90 → +10% = $99. Recovery needs about 11.11%.",
    "- Bond prices and yields generally move inversely.",
    "If a live market number cannot be verified, the script should stay conceptual. That is a pass with a warning, not a fail — unless it invented a specific number.",
    "If the script tells the viewer to buy/sell a security, fail it.",
    "If you can fix a small issue by providing correctedVoiceover and/or correctedHook, do so.",
    "passed=false only when the video would teach something wrong or give advice.",
  ].join("\n");
}

export function reviewerUserPrompt(input: {
  idea: string;
  storyboard: Storyboard;
}): string {
  const claims = input.storyboard.scenes.map((s) => s.headline).join(" | ");
  return [
    `Original idea: ${input.idea}`,
    `Hook: ${input.storyboard.hook}`,
    `Voiceover: ${input.storyboard.voiceover}`,
    `Scene headlines: ${claims}`,
    `Series: ${input.storyboard.series}`,
    "Review the claims. Return the structured review object.",
  ].join("\n");
}
