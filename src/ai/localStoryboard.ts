import { SCHEMA_VERSION } from "../config";
import { DEFAULT_INTRO } from "../content/intro";
import { StoryboardSchema, type Scene, type Storyboard } from "../content/schema";
import { SERIES, type SeriesId, type TemplateId } from "../content/series";
import type { GenerationRequest, ScriptGenerator, UsageTotals } from "../interfaces";
import { datedId } from "../utils/slug";

export function inferSeries(idea: string, preferred?: SeriesId): SeriesId {
  if (preferred) return preferred;
  const text = idea.toLowerCase();
  if (/%|percent|break even|10%|loss needs/.test(text)) return "money_math";
  if (/hawkish|dovish|vocab|what does .* mean/.test(text)) return "wall_street_vocabulary";
  if (/fell|weird|rate cut.*stock|stocks? fell|why did .* go down/.test(text)) {
    return "market_weirdness";
  }
  if (/lose money|why did i|my call|my put/.test(text)) return "why_did_i_lose_money";
  if (/option|put|call|theta|delta|vega|gamma|implied vol|\biv\b|strike|premium/.test(text)) {
    return "options_101";
  }
  return "explain_like_im_five";
}

function titleFromIdea(idea: string): string {
  const cleaned = idea.replace(/[?!.]+$/g, "").trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

function finish(
  idea: string,
  series: SeriesId,
  template: TemplateId,
  draft: Omit<Storyboard, "schemaVersion" | "id" | "idea" | "series" | "template" | "durationTargetSeconds" | "background" | "financeReview" | "intro"> & {
    template?: TemplateId;
    background?: Storyboard["background"];
  },
): Storyboard {
  const resolvedSeries = series;
  return StoryboardSchema.parse({
    schemaVersion: SCHEMA_VERSION,
    id: datedId(idea),
    idea,
    series: resolvedSeries,
    template: draft.template ?? template,
    durationTargetSeconds: 12,
    background: draft.background ?? SERIES[resolvedSeries].background,
    title: draft.title,
    hook: draft.hook,
    voiceover: draft.voiceover,
    scenes: draft.scenes,
    caption: draft.caption,
    hashtags: draft.hashtags,
    intro: DEFAULT_INTRO,
  });
}

function knownRecipe(idea: string, series: SeriesId, template: TemplateId): Storyboard | null {
  const text = idea.toLowerCase();

  if (/sell(ing)? a put|put is bullish/.test(text)) {
    const scenes: Scene[] = [
      {
        id: "scene-1",
        type: "hook",
        headline: "SELLING A PUT\nIS BULLISH?",
        visual: { type: "option_contract", state: "question", label: "PUT", value: "$100", secondaryValue: "$2.40" },
        emphasis: ["PUT", "BULLISH"],
        narrationAnchorStart: "selling a put sounds bearish",
        narrationAnchorEnd: "sounds bearish",
      },
      {
        id: "scene-2",
        type: "concept",
        headline: "YOU WANT THE STOCK\nABOVE YOUR STRIKE",
        visual: { type: "price_vs_strike", state: "above", value: 105, secondaryValue: 100 },
        emphasis: ["ABOVE"],
        narrationAnchorStart: "stock stays above your strike",
        narrationAnchorEnd: "above your strike",
      },
      {
        id: "scene-3",
        type: "payoff",
        headline: "YOU KEEP\nTHE PREMIUM",
        visual: { type: "coins", state: "collect", label: "premium" },
        emphasis: ["PREMIUM"],
        narrationAnchorStart: "You keep the premium",
        narrationAnchorEnd: "keep the premium",
      },
    ];
    return finish(idea, "options_101", template, {
      title: "Why selling a put is bullish",
      hook: "Wait... selling a PUT is bullish?",
      voiceover:
        "Okay, selling a put sounds bearish. But here's the weird part — you're actually hoping the stock stays above your strike. If it does? It expires worthless. You keep the premium.",
      scenes,
      caption: "Selling a put sounds bearish because... put. The trade itself is usually bullish.",
      hashtags: ["options", "finance", "investing", "financialliteracy"],
      template: "price-line",
      background: "cream",
    });
  }

  if (/what is an option|what('?| i)s an option/.test(text)) {
    return finish(idea, "options_101", "centered-explainer", {
      title: "What is an option",
      hook: "Wait... you're not buying the stock?",
      voiceover:
        "Okay, an option is not the stock. It's a contract that gives you the right to buy or sell it at a set price. You can walk away. That's the whole trick.",
      scenes: [
        {
          id: "scene-1",
          type: "hook",
          headline: "AN OPTION\nIS NOT THE STOCK",
          visual: { type: "company_card", state: "default", label: "STOCK" },
          emphasis: ["NOT", "STOCK"],
          narrationAnchorStart: "an option is not the stock",
          narrationAnchorEnd: "not the stock",
        },
        {
          id: "scene-2",
          type: "concept",
          headline: "IT'S A CONTRACT",
          visual: { type: "option_contract", state: "default", label: "OPTION", value: "$100", secondaryValue: "$2.40" },
          emphasis: ["CONTRACT"],
          narrationAnchorStart: "It's a contract",
          narrationAnchorEnd: "a contract",
        },
        {
          id: "scene-3",
          type: "concept",
          headline: "THE RIGHT TO BUY\nOR SELL AT A SET PRICE",
          visual: { type: "strike_line", state: "default", value: 100 },
          emphasis: ["RIGHT", "SET PRICE"],
          narrationAnchorStart: "right to buy or sell",
          narrationAnchorEnd: "set price",
        },
        {
          id: "scene-4",
          type: "payoff",
          headline: "YOU CAN\nWALK AWAY",
          visual: { type: "sparkles", state: "default" },
          emphasis: ["WALK AWAY"],
          narrationAnchorStart: "You can walk away",
          narrationAnchorEnd: "That's the whole trick",
        },
      ],
      caption: "An option is not the stock. It's a contract: the right to buy or sell at a set price.",
      hashtags: ["options", "finance", "investing", "financialliteracy"],
      template: "centered-explainer",
      background: "cream",
    });
  }

  if (/call vs put|call versus put|calls? vs puts?/.test(text)) {
    return finish(idea, "options_101", "price-line", {
      title: "Call vs put",
      hook: "Call and put are not the same bet.",
      voiceover:
        "Okay, a call is the right to buy. You want the stock up. A put is the right to sell. You want it down. Same contract family, opposite bet.",
      scenes: [
        {
          id: "scene-1",
          type: "hook",
          headline: "CALL VS PUT",
          visual: { type: "option_contract", state: "question", label: "OPTION", value: "$100", secondaryValue: "$2.40" },
          emphasis: ["CALL", "PUT"],
          narrationAnchorStart: "a call is the right to buy",
          narrationAnchorEnd: "right to buy",
        },
        {
          id: "scene-2",
          type: "concept",
          headline: "CALL = RIGHT TO BUY\nYOU WANT IT UP",
          visual: { type: "option_contract", state: "default", label: "CALL", value: "$100", secondaryValue: "$2.40" },
          emphasis: ["CALL", "BUY", "UP"],
          narrationAnchorStart: "You want the stock up",
          narrationAnchorEnd: "stock up",
        },
        {
          id: "scene-3",
          type: "concept",
          headline: "PUT = RIGHT TO SELL\nYOU WANT IT DOWN",
          visual: { type: "option_contract", state: "default", label: "PUT", value: "$100", secondaryValue: "$2.40" },
          emphasis: ["PUT", "SELL", "DOWN"],
          narrationAnchorStart: "A put is the right to sell",
          narrationAnchorEnd: "You want it down",
        },
        {
          id: "scene-4",
          type: "payoff",
          headline: "SAME FAMILY.\nOPPOSITE BET.",
          visual: { type: "percent_change", state: "up", value: "CALL ↑", direction: "up" },
          emphasis: ["OPPOSITE"],
          narrationAnchorStart: "opposite bet",
          narrationAnchorEnd: "opposite bet",
        },
      ],
      caption: "A call is the right to buy. A put is the right to sell. Same family, opposite bet.",
      hashtags: ["options", "finance", "investing", "financialliteracy"],
      template: "price-line",
      background: "cream",
    });
  }

  if (/implied vol|\biv\b|what is iv/.test(text)) {
    return finish(idea, "explain_like_im_five", template, {
      title: "What is implied volatility",
      hook: "IV is just the market's fear price tag.",
      voiceover:
        "Okay, implied volatility is just the market's fear price tag. When people get scared, that fear gets baked into option prices. Higher fear, higher IV, pricier options.",
      scenes: [
        {
          id: "scene-1",
          type: "hook",
          headline: "WHAT IS\nIMPLIED VOL?",
          visual: { type: "question_bubble", state: "default" },
          emphasis: ["IMPLIED", "VOL"],
          narrationAnchorStart: "Implied volatility",
          narrationAnchorEnd: "implied volatility",
        },
        {
          id: "scene-2",
          type: "cause_effect",
          headline: "FEAR → IV →\nPRICIER OPTIONS",
          visual: { type: "iv_meter", state: "high" },
          emphasis: ["FEAR", "IV"],
          narrationAnchorStart: "people get scared",
          narrationAnchorEnd: "pricier options",
          causeEffect: [
            { label: "FEAR", visual: { type: "fear_meter", state: "high" } },
            { label: "IV UP", visual: { type: "iv_meter", state: "high" } },
            { label: "PRICEY", visual: { type: "option_contract", state: "default", label: "CALL" } },
          ],
        },
      ],
      caption: "IV is not a villain. It's the market charging more when it expects bigger moves.",
      hashtags: ["options", "finance", "investing", "financialliteracy"],
      template: "cause-effect",
      background: "butter",
    });
  }

  if (/hawkish|dovish/.test(text)) {
    return finish(idea, "wall_street_vocabulary", template, {
      title: "Hawkish vs dovish",
      hook: "'Hawkish' sounds complicated. It isn't.",
      voiceover:
        "'Hawkish' sounds complicated. It isn't. Hawkish means more worried about inflation, so tighter policy. Dovish? More worried about growth, so easier money. Same Fed. Different fear.",
      scenes: [
        {
          id: "scene-1",
          type: "hook",
          headline: "HAWKISH SOUNDS\nCOMPLICATED.\nIT ISN'T.",
          visual: { type: "speech_bubble", state: "default", label: "hawkish??" },
          emphasis: ["HAWKISH"],
          narrationAnchorStart: "Hawkish means",
          narrationAnchorEnd: "Hawkish means",
        },
        {
          id: "scene-2",
          type: "comparison",
          headline: "HAWKISH VS DOVISH",
          visual: { type: "inflation_tag", state: "up" },
          emphasis: ["HAWKISH", "DOVISH"],
          narrationAnchorStart: "worried about inflation",
          narrationAnchorEnd: "easier money",
          comparison: {
            left: "HAWKISH",
            right: "DOVISH",
            leftVisual: { type: "inflation_tag", state: "up" },
            rightVisual: { type: "rate_arrow", state: "down", direction: "down" },
          },
        },
      ],
      caption: "Hawkish vs dovish is just which problem the Fed is more scared of: inflation or growth.",
      hashtags: ["fed", "finance", "investing", "financialliteracy"],
      template: "before-after",
      background: "lavender",
    });
  }

  if (/10%|percent loss|break even/.test(text)) {
    return finish(idea, "money_math", template, {
      title: "Why 10% down isn't fixed by 10% up",
      hook: "This is why +10% doesn't fix a -10% loss.",
      voiceover:
        "Here's the rude part. Start with a hundred. Lose ten percent, you're at ninety. Gain ten percent of ninety... that's ninety-nine. You still need more than ten percent to get back.",
      scenes: [
        {
          id: "scene-1",
          type: "hook",
          headline: "+10% DOESN'T FIX\nA -10% LOSS",
          visual: { type: "percent_change", state: "down", value: "-10%", direction: "down" },
          emphasis: ["10%"],
          narrationAnchorStart: "Start with a hundred",
          narrationAnchorEnd: "one hundred",
        },
        {
          id: "scene-2",
          type: "comparison",
          headline: "$100 → $90\n$90 → $99",
          visual: { type: "calculator", state: "default", value: "99" },
          emphasis: ["$90", "$99"],
          narrationAnchorStart: "Lose ten percent",
          narrationAnchorEnd: "ninety-nine",
          comparison: {
            left: "-10%",
            right: "+10%",
            leftVisual: { type: "percent_change", state: "down", value: "$90", direction: "down" },
            rightVisual: { type: "percent_change", state: "up", value: "$99", direction: "up" },
          },
        },
      ],
      caption: "A 10% loss is not undone by a 10% gain. Math is rude like that.",
      hashtags: ["investing", "finance", "moneymath", "financialliteracy"],
      template: "before-after",
      background: "cream",
    });
  }

  if (/\btheta\b/.test(text)) {
    return finish(idea, series, template, {
      title: "What is theta",
      hook: "Theta is the quiet tax on waiting.",
      voiceover:
        "Theta is the quiet tax on waiting. If the stock does nothing, the clock still works against the option buyer. Time isn't free. That's the catch.",
      scenes: [
        {
          id: "scene-1",
          type: "hook",
          headline: "THETA IS THE\nQUIET TAX ON WAITING",
          visual: { type: "clock", state: "default" },
          emphasis: ["THETA"],
          narrationAnchorStart: "Theta is the quiet tax",
          narrationAnchorEnd: "quiet tax on waiting",
        },
        {
          id: "scene-2",
          type: "concept",
          headline: "STOCK STILL.\nOPTION CAN STILL\nLOSE VALUE.",
          visual: { type: "option_contract", state: "fade", label: "CALL" },
          emphasis: ["LOSE"],
          narrationAnchorStart: "stock does nothing",
          narrationAnchorEnd: "Time isn't free",
        },
      ],
      caption: "Theta is time decay. The calendar can cost you even when the stock sits still.",
      hashtags: ["options", "finance", "investing", "financialliteracy"],
      template: "centered-explainer",
      background: "cream",
    });
  }

  return null;
}

function genericRecipe(idea: string, series: SeriesId, template: TemplateId): Storyboard {
  const title = titleFromIdea(idea).slice(0, 80);
  const topic = idea.replace(/[?!.]+$/g, "").trim();
  const firstWords = topic.split(/\s+/).slice(0, 4).join(" ");
  return finish(idea, series, template, {
    title,
    hook: `Wait... ${topic}?`.slice(0, 90),
    voiceover:
      `Okay, ${topic.charAt(0).toLowerCase()}${topic.slice(1)} sounds messier than it is. ` +
      "Here's the simple version: one idea, no fake numbers, no buy or sell call. " +
      "Wall Street loves making simple things sound difficult.",
    scenes: [
      {
        id: "scene-1",
        type: "hook",
        headline: `${topic.toUpperCase().slice(0, 28)}\nLET'S MAKE IT SIMPLE`.slice(0, 96),
        visual: { type: "question_bubble", state: "default" },
        emphasis: topic.split(/\s+/).slice(0, 2).map((word) => word.toUpperCase()),
        narrationAnchorStart: firstWords || topic,
        narrationAnchorEnd: firstWords || topic,
      },
      {
        id: "scene-2",
        type: "takeaway",
        headline: "ONE IDEA.\nNO FAKE NUMBERS.",
        visual: { type: "magnifying_glass", state: "default" },
        emphasis: ["ONE"],
        narrationAnchorStart: "simple version",
        narrationAnchorEnd: "sound difficult",
      },
    ],
    caption: `${title}. Educational, not a trade idea.`.slice(0, 220),
    hashtags: ["finance", "investing", "financialliteracy"],
    template: "centered-explainer",
    background: SERIES[series].background,
  });
}

export function buildLocalStoryboard(request: GenerationRequest): Storyboard {
  const series = inferSeries(request.idea, request.series);
  const template = request.template ?? SERIES[series].defaultTemplate;
  const storyboard =
    knownRecipe(request.idea, series, template) ?? genericRecipe(request.idea, series, template);
  if (request.template) storyboard.template = request.template;
  if (request.series) storyboard.series = request.series;
  if (request.shorten) {
    storyboard.voiceover = storyboard.voiceover.split(/(?<=[.!?])\s+/).slice(0, 3).join(" ");
  }
  return StoryboardSchema.parse(storyboard);
}

export class LocalScriptGenerator implements ScriptGenerator {
  async generate(request: GenerationRequest): Promise<{
    storyboard: Storyboard;
    usage?: UsageTotals;
    retries: number;
  }> {
    return { storyboard: buildLocalStoryboard(request), retries: 0 };
  }
}
