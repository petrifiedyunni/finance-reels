import {
  LlmFinanceReviewSchema,
  type FinanceReview,
  type Storyboard,
} from "../content/schema";
import { GENERATION, isOfflineText } from "../config";
import type { FinanceReviewer, UsageTotals } from "../interfaces";
import { parseWithGrok } from "./parseStructured";
import { reviewerSystemPrompt, reviewerUserPrompt } from "./prompts/reviewerPrompt";
import { generateStoryboard } from "./generateStoryboard";

const ADVICE_RE =
  /\b(buy this|sell this now|you should buy|you should sell|guaranteed return|this will definitely go up|can't lose)\b/i;

export function heuristicFlags(storyboard: Storyboard): string[] {
  const issues: string[] = [];
  const blob = `${storyboard.hook} ${storyboard.voiceover} ${storyboard.scenes.map((s) => s.headline).join(" ")}`;
  if (ADVICE_RE.test(blob)) {
    issues.push("Looks like personalized advice or a guarantee.");
  }
  if (/\b\d{1,3}(\.\d+)?%\s+(return|yield guaranteed)/i.test(blob)) {
    issues.push("Contains a return promise.");
  }
  return issues;
}

export class GrokFinanceReviewer implements FinanceReviewer {
  async review(input: {
    idea: string;
    storyboard: Storyboard;
  }): Promise<{
    storyboard: Storyboard;
    usage?: UsageTotals;
    retries: number;
  }> {
    let usage: UsageTotals = {};
    let retries = 0;
    let current = input.storyboard;

    for (let attempt = 0; attempt <= GENERATION.maxReviewRetries; attempt++) {
      let parsed;
      try {
        const response = await parseWithGrok({
          schema: LlmFinanceReviewSchema,
          name: "finance_review",
          system: reviewerSystemPrompt(),
          user: reviewerUserPrompt({ idea: input.idea, storyboard: current }),
        });
        usage = {
          textInputTokens: (usage.textInputTokens ?? 0) + (response.usage.textInputTokens ?? 0),
          textOutputTokens: (usage.textOutputTokens ?? 0) + (response.usage.textOutputTokens ?? 0),
        };
        parsed = response.data;
      } catch {
        retries += 1;
        continue;
      }

      const extra = heuristicFlags(current);
      const issues = [...parsed.issues, ...extra];
      const failed =
        !parsed.passed ||
        parsed.containsPersonalizedAdvice ||
        parsed.containsFabricatedData ||
        parsed.containsGuarantee ||
        extra.length > 0;

      if (!failed) {
        const review: FinanceReview = {
          passed: true,
          warnings: parsed.warnings,
          issues: [],
          reviewedAt: new Date().toISOString(),
        };
        if (parsed.correctedVoiceover) current.voiceover = parsed.correctedVoiceover;
        if (parsed.correctedHook) current.hook = parsed.correctedHook;
        current.financeReview = review;
        return { storyboard: current, usage, retries };
      }

      if (attempt === GENERATION.maxReviewRetries) {
        current.financeReview = {
          passed: false,
          warnings: parsed.warnings,
          issues,
          reviewedAt: new Date().toISOString(),
        };
        throw new Error(
          `Finance review did not pass:\n- ${issues.join("\n- ") || "unspecified accuracy issue"}`,
        );
      }

      retries += 1;
      const regenerated = await generateStoryboard({
        idea: input.idea,
        series: current.series,
        template: current.template,
        previousIssues: issues,
      });
      usage = {
        textInputTokens: (usage.textInputTokens ?? 0) + (regenerated.usage?.textInputTokens ?? 0),
        textOutputTokens: (usage.textOutputTokens ?? 0) + (regenerated.usage?.textOutputTokens ?? 0),
      };
      current = regenerated.storyboard;
    }

    throw new Error("Finance review failed unexpectedly.");
  }
}

export async function reviewFinance(input: { idea: string; storyboard: Storyboard }) {
  if (isOfflineText()) {
    const flags = heuristicFlags(input.storyboard);
    const warnings = [
      "Offline mode: heuristic finance review only. No cloud model.",
      ...flags.filter((flag) => !/advice|guarantee/i.test(flag)),
    ];
    const blocking = flags.filter((flag) => /advice|guarantee/i.test(flag));
    input.storyboard.financeReview = {
      passed: blocking.length === 0,
      warnings,
      issues: blocking,
      reviewedAt: new Date().toISOString(),
    };
    if (blocking.length > 0) {
      throw new Error(`Finance review did not pass:\n- ${blocking.join("\n- ")}`);
    }
    return { storyboard: input.storyboard, retries: 0 };
  }
  return new GrokFinanceReviewer().review(input);
}
