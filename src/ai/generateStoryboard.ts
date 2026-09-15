import {
  LlmStoryboardSchema,
  StoryboardSchema,
  type LlmStoryboard,
  type Scene,
  type Storyboard,
  type VisualSpec,
} from "../content/schema";
import { SERIES, type SeriesId } from "../content/series";
import { GENERATION, SCHEMA_VERSION, WORD_COUNT, isOfflineText } from "../config";
import { datedId } from "../utils/slug";
import { sanitizeSpokenCopy } from "../utils/spokenCopy";
import { countWords } from "../utils/words";
import type { GenerationRequest, ScriptGenerator, UsageTotals } from "../interfaces";
import { parseWithGrok } from "./parseStructured";
import { LocalScriptGenerator } from "./localStoryboard";
import { creatorSystemPrompt, creatorUserPrompt } from "./prompts/creatorPrompt";
import { DEFAULT_INTRO } from "../content/intro";

function toVisual(llm: LlmStoryboard["scenes"][number]["visual"]): VisualSpec {
  return {
    type: llm.type,
    state: llm.state || "default",
    label: llm.label,
    value: llm.value,
    secondaryValue: llm.secondaryValue,
    direction: llm.direction === "none" ? null : llm.direction,
    items: llm.items.length ? llm.items : undefined,
  };
}

export function llmToStoryboard(
  llm: LlmStoryboard,
  idea: string,
  preferredSeries?: SeriesId,
): Storyboard {
  const series = preferredSeries ?? llm.series;
  const scenes: Scene[] = llm.scenes.map((scene) => {
    const comparison =
      scene.comparisonLeft && scene.comparisonRight
        ? { left: scene.comparisonLeft, right: scene.comparisonRight }
        : undefined;
    const causeEffect =
      scene.causeEffectLabels.length >= 2
        ? scene.causeEffectLabels.map((label) => ({ label }))
        : undefined;

    return {
      id: scene.id,
      type: scene.type,
      headline: scene.headline,
      subtext: scene.subtext,
      visual: toVisual(scene.visual),
      emphasis: scene.emphasis,
      narrationAnchorStart: scene.narrationAnchorStart,
      narrationAnchorEnd: scene.narrationAnchorEnd,
      comparison,
      causeEffect,
    };
  });

  const draft: Storyboard = {
    schemaVersion: SCHEMA_VERSION,
    id: datedId(idea),
    idea,
    title: llm.title,
    series,
    template: llm.template,
    durationTargetSeconds: llm.durationTargetSeconds,
    hook: llm.hook,
    voiceover: sanitizeSpokenCopy(llm.voiceover),
    scenes,
    caption: llm.caption,
    hashtags: llm.hashtags.map((h) => h.replace(/^#/, "")),
    background: llm.background ?? SERIES[series].background,
    intro: DEFAULT_INTRO,
  };

  return StoryboardSchema.parse(draft);
}

export class GrokScriptGenerator implements ScriptGenerator {
  async generate(request: GenerationRequest): Promise<{
    storyboard: Storyboard;
    usage?: UsageTotals;
    retries: number;
  }> {
    let lastError = "unknown validation error";
    let retries = 0;
    let usage: UsageTotals = {};

    for (let attempt = 0; attempt <= GENERATION.maxStoryboardRetries; attempt++) {
      if (attempt > 0) retries += 1;
      const issues = [...(request.previousIssues ?? [])];
      if (attempt > 0) {
        issues.push(`Previous output failed validation: ${lastError}. Return valid schema only.`);
      }
      const wordIssue =
        attempt > 0
          ? `Keep the spoken voiceover between ${WORD_COUNT.targetMin} and ${WORD_COUNT.targetMax} words.`
          : undefined;
      if (wordIssue) issues.push(wordIssue);

      try {
        const response = await parseWithGrok({
          schema: LlmStoryboardSchema,
          name: "storyboard",
          system: creatorSystemPrompt(),
          user: creatorUserPrompt({
            ...request,
            previousIssues: issues,
          }),
        });

        usage = {
          textInputTokens: (usage.textInputTokens ?? 0) + (response.usage.textInputTokens ?? 0),
          textOutputTokens: (usage.textOutputTokens ?? 0) + (response.usage.textOutputTokens ?? 0),
        };

        const storyboard = llmToStoryboard(response.data, request.idea, request.series);
        const words = countWords(storyboard.voiceover);
        if (words < WORD_COUNT.min || words > WORD_COUNT.max) {
          lastError = `voiceover word count ${words} is outside ${WORD_COUNT.min}–${WORD_COUNT.max}`;
          continue;
        }
        if (request.template) {
          storyboard.template = request.template;
        }
        return { storyboard, usage, retries };
      } catch (error) {
        lastError = error instanceof Error ? error.message : String(error);
      }
    }

    throw new Error(
      `Storyboard generation failed after ${GENERATION.maxStoryboardRetries + 1} attempts.\n${lastError}`,
    );
  }
}

export async function generateStoryboard(request: GenerationRequest) {
  if (isOfflineText()) {
    return new LocalScriptGenerator().generate(request);
  }
  return new GrokScriptGenerator().generate(request);
}
