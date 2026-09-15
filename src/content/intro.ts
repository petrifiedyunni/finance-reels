import { z } from "zod";
import { INTRO, type IntroMode } from "../config";

export const IntroModeSchema = z.enum(["none", "micro", "full"]);
export const IntroAudioModeSchema = z.enum(["spoken", "sting", "spoken_and_sting"]);

export const IntroSchema = z
  .object({
    mode: IntroModeSchema.default(INTRO.defaultMode),
    enabled: z.boolean().default(true),
    phrase: z.string().min(3).max(48).default(INTRO.phrase),
    character: z.literal("creator_doll").default("creator_doll"),
    introVoiceLineEnabled: z.boolean().default(true),
    audioMode: IntroAudioModeSchema.default("spoken_and_sting"),
  })
  .strict();

export type Intro = z.infer<typeof IntroSchema>;

export const DEFAULT_INTRO: Intro = {
  mode: INTRO.defaultMode,
  enabled: true,
  phrase: INTRO.phrase,
  character: "creator_doll",
  introVoiceLineEnabled: true,
  audioMode: "spoken_and_sting",
};

export function resolveIntro(intro: Partial<Intro> | undefined, override?: IntroMode): Intro {
  const resolved = IntroSchema.parse({ ...DEFAULT_INTRO, ...intro });
  if (override) resolved.mode = override;
  if (resolved.mode === "none") resolved.enabled = false;
  if (!resolved.enabled) resolved.mode = "none";
  return resolved;
}

export function introDurationSeconds(intro: Intro): number {
  if (!intro.enabled || intro.mode === "none") return 0;
  return intro.mode === "full" ? INTRO.fullSeconds : INTRO.microSeconds;
}

export function introSpokenText(intro: Intro): string {
  if (!intro.enabled || intro.mode === "none" || !intro.introVoiceLineEnabled) return "";
  if (intro.audioMode === "sting") return "";
  if (intro.mode === "micro") return "Diva finance.";
  return "Diva finance timeee.";
}

export function shouldPlayIntroVoice(intro: Intro): boolean {
  return Boolean(introSpokenText(intro));
}

export function shouldPlayIntroSting(intro: Intro): boolean {
  if (!intro.enabled || intro.mode === "none") return false;
  return intro.audioMode === "sting" || intro.audioMode === "spoken_and_sting";
}

export function isIntroMode(value: string): value is IntroMode {
  return value === "none" || value === "micro" || value === "full";
}

export function shiftTiming<T extends { start: number; end: number }>(item: T, offset: number): T {
  return { ...item, start: item.start + offset, end: item.end + offset };
}
