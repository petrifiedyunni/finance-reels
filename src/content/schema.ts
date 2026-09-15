import { z } from "zod";
import { VISUAL_TYPES } from "./visuals";
import { SERIES_IDS, TEMPLATE_IDS } from "./series";
import { SCHEMA_VERSION } from "../config";

export const SeriesSchema = z.enum(SERIES_IDS);
export const TemplateSchema = z.enum(TEMPLATE_IDS);
export const VisualTypeSchema = z.enum(VISUAL_TYPES);

export const SceneTypeSchema = z.enum([
  "hook",
  "concept",
  "payoff",
  "comparison",
  "cause_effect",
  "takeaway",
]);

export const VisualSchema = z
  .object({
    type: VisualTypeSchema,
    state: z.string().min(1).max(40).optional().default("default"),
    label: z.string().max(48).nullable().optional(),
    value: z.union([z.string(), z.number()]).nullable().optional(),
    secondaryValue: z.union([z.string(), z.number()]).nullable().optional(),
    direction: z.enum(["up", "down", "flat", "left", "right"]).nullable().optional(),
    items: z.array(z.string().max(32)).max(6).optional(),
  })
  .strict();

export const ComparisonSchema = z
  .object({
    left: z.string().min(1).max(48),
    right: z.string().min(1).max(48),
    leftVisual: VisualSchema.optional(),
    rightVisual: VisualSchema.optional(),
  })
  .strict();

export const CauseEffectNodeSchema = z
  .object({
    label: z.string().min(1).max(40),
    visual: VisualSchema.optional(),
  })
  .strict();

export const SceneSchema = z
  .object({
    id: z.string().min(1).max(64),
    type: SceneTypeSchema,
    startIntent: z.number().min(0).max(18).optional(),
    headline: z.string().min(1).max(96),
    subtext: z.string().max(96).nullable().optional(),
    visual: VisualSchema,
    secondaryVisual: VisualSchema.optional(),
    emphasis: z.array(z.string().min(1).max(40)).max(6).optional(),
    narrationAnchorStart: z.string().min(1).max(80).optional(),
    narrationAnchorEnd: z.string().min(1).max(80).optional(),
    comparison: ComparisonSchema.optional(),
    causeEffect: z.array(CauseEffectNodeSchema).min(2).max(4).optional(),
  })
  .strict();

export const FinanceReviewSchema = z
  .object({
    passed: z.boolean(),
    warnings: z.array(z.string()),
    issues: z.array(z.string()).optional(),
    reviewedAt: z.string().optional(),
    corrected: z.boolean().optional(),
  })
  .strict();

export const StoryboardSchema = z
  .object({
    schemaVersion: z.string().default(SCHEMA_VERSION),
    id: z.string().min(3).max(80),
    idea: z.string().min(3).max(200),
    title: z.string().min(3).max(80),
    series: SeriesSchema,
    template: TemplateSchema,
    durationTargetSeconds: z.number().min(9).max(16),
    hook: z.string().min(3).max(90),
    voiceover: z.string().min(20).max(420),
    scenes: z.array(SceneSchema).min(2).max(6),
    caption: z.string().min(8).max(220),
    hashtags: z.array(z.string().min(2).max(32)).min(3).max(6),
    financeReview: FinanceReviewSchema.optional(),
    background: z.enum(["cream", "blush", "butter", "blue", "lavender"]).optional(),
  })
  .strict();

/**
 * Strict LLM output: every field present, nulls instead of omitted keys.
 * Compatible with OpenAI structured outputs (additionalProperties: false).
 */
export const LlmVisualSchema = z
  .object({
    type: VisualTypeSchema,
    state: z.string().min(1).max(40),
    label: z.string().max(48).nullable(),
    value: z.string().max(24).nullable(),
    secondaryValue: z.string().max(24).nullable(),
    direction: z.enum(["up", "down", "flat", "left", "right", "none"]),
    items: z.array(z.string().max(32)).max(6),
  })
  .strict();

export const LlmSceneSchema = z
  .object({
    id: z.string().min(1).max(64),
    type: SceneTypeSchema,
    headline: z.string().min(1).max(96),
    subtext: z.string().max(96).nullable(),
    visual: LlmVisualSchema,
    emphasis: z.array(z.string().min(1).max(40)).max(6),
    narrationAnchorStart: z.string().min(1).max(80),
    narrationAnchorEnd: z.string().min(1).max(80),
    comparisonLeft: z.string().max(48).nullable(),
    comparisonRight: z.string().max(48).nullable(),
    causeEffectLabels: z.array(z.string().max(40)).max(4),
  })
  .strict();

export const LlmStoryboardSchema = z
  .object({
    title: z.string().min(3).max(80),
    series: SeriesSchema,
    template: TemplateSchema,
    durationTargetSeconds: z.number().min(9).max(16),
    hook: z.string().min(3).max(90),
    voiceover: z.string().min(20).max(420),
    scenes: z.array(LlmSceneSchema).min(2).max(6),
    caption: z.string().min(8).max(220),
    hashtags: z.array(z.string().min(2).max(32)).min(3).max(6),
    background: z.enum(["cream", "blush", "butter", "blue", "lavender"]),
  })
  .strict();

export const LlmFinanceReviewSchema = z
  .object({
    passed: z.boolean(),
    warnings: z.array(z.string().max(200)).max(8),
    issues: z.array(z.string().max(220)).max(8),
    containsPersonalizedAdvice: z.boolean(),
    containsFabricatedData: z.boolean(),
    containsGuarantee: z.boolean(),
    correctedVoiceover: z.string().max(420).nullable(),
    correctedHook: z.string().max(90).nullable(),
  })
  .strict();

export const WordTimestampSchema = z
  .object({
    word: z.string(),
    start: z.number().min(0),
    end: z.number().min(0),
  })
  .strict()
  .refine((w) => w.end >= w.start, { message: "word end must be >= start" });

export const CaptionPhraseSchema = z
  .object({
    text: z.string(),
    words: z.array(WordTimestampSchema).min(1),
    start: z.number().min(0),
    end: z.number().min(0),
  })
  .strict();

export const SceneTimingSchema = z
  .object({
    sceneId: z.string(),
    startSeconds: z.number().min(0),
    endSeconds: z.number().positive(),
    source: z.enum(["anchor", "sentence", "proportional"]),
  })
  .strict()
  .refine((s) => s.endSeconds > s.startSeconds, {
    message: "scene end must be after start",
  });

export const CompositionPropsSchema = z
  .object({
    storyboard: StoryboardSchema,
    timeline: z.array(SceneTimingSchema).min(1),
    captions: z.array(CaptionPhraseSchema),
    audioSrc: z.string(),
    durationInFrames: z.number().int().positive(),
  })
  .strict();

export const SocialMetadataSchema = z
  .object({
    title: z.string(),
    caption: z.string(),
    hashtags: z.array(z.string()),
    series: SeriesSchema,
    createdAt: z.string(),
    publishStatus: z.literal("draft"),
    disclaimer: z.string().optional(),
  })
  .strict();

export const IdeaStatusSchema = z.enum([
  "idea",
  "generating",
  "draft",
  "approved",
  "posted",
  "failed",
]);

export const ContentIdeaSchema = z
  .object({
    idea: z.string(),
    series: SeriesSchema.optional(),
    status: IdeaStatusSchema.default("idea"),
  })
  .strict();

export type VisualSpec = z.infer<typeof VisualSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type Storyboard = z.infer<typeof StoryboardSchema>;
export type LlmStoryboard = z.infer<typeof LlmStoryboardSchema>;
export type LlmFinanceReview = z.infer<typeof LlmFinanceReviewSchema>;
export type FinanceReview = z.infer<typeof FinanceReviewSchema>;
export type WordTimestamp = z.infer<typeof WordTimestampSchema>;
export type CaptionPhrase = z.infer<typeof CaptionPhraseSchema>;
export type SceneTiming = z.infer<typeof SceneTimingSchema>;
export type CompositionProps = z.infer<typeof CompositionPropsSchema>;
export type SocialMetadata = z.infer<typeof SocialMetadataSchema>;
export type ContentIdea = z.infer<typeof ContentIdeaSchema>;

export function parseStoryboard(input: unknown): Storyboard {
  return StoryboardSchema.parse(input);
}

export function safeParseStoryboard(input: unknown) {
  return StoryboardSchema.safeParse(input);
}
