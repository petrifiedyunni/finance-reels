import { DEFAULTS, type VoicePresetId } from "../config";

export interface VoicePerformanceSettings {
  speed: number;
  stability: number;
  similarity: number;
  style: number;
  speakerBoost: boolean;
}

export interface VoiceSettingsSnapshot extends VoicePerformanceSettings {
  provider: "elevenlabs" | "openai" | "local";
  model: string;
  voiceId: string;
  preset: VoicePresetId;
}

export const VOICE_PRESETS: Record<VoicePresetId, VoicePerformanceSettings> = {
  smart_friend: {
    speed: 1.06,
    stability: 0.34,
    similarity: 0.78,
    style: 0.24,
    speakerBoost: true,
  },
  soft_explainer: {
    speed: 0.98,
    stability: 0.5,
    similarity: 0.82,
    style: 0.08,
    speakerBoost: true,
  },
  market_news: {
    speed: 1.07,
    stability: 0.52,
    similarity: 0.78,
    style: 0.12,
    speakerBoost: true,
  },
  playful: {
    speed: 1.07,
    stability: 0.28,
    similarity: 0.76,
    style: 0.32,
    speakerBoost: true,
  },
};

export const PRESET_SPEECH_INSTRUCTIONS: Record<VoicePresetId, string> = {
  smart_friend:
    "Speak like a bright, bubbly young woman, about 22 or 23, explaining finance to a smart friend on FaceTime. Youthful, warm, naturally feminine, a smile in the voice. Conversational and confident. Lift fun lines a little. Amused when the idea is backwards. Not childish, not fake-hype, not seductive. Easy pace. Contractions.",
  soft_explainer:
    "Speak softly and clearly, still young and warm, like a patient friend walking through a tricky idea. No baby-talk. No radio voice.",
  market_news:
    "Speak with bright confidence, like a young market correspondent talking to a friend, not a newsreader. Clear, lively, not shouted.",
  playful:
    "Speak extra bubbly, with a real smile. Young, sparkly, still precise about the finance. Playful, never cutesy or cartoonish.",
};

function envNumber(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function envBool(name: string, fallback: boolean): boolean {
  const raw = process.env[name]?.trim();
  if (!raw) return fallback;
  return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
}

export function getVoicePresetId(): VoicePresetId {
  const raw = process.env.VOICE_PRESET?.trim() as VoicePresetId | undefined;
  if (raw && raw in VOICE_PRESETS) return raw;
  return "smart_friend";
}

export function resolveVoicePerformance(
  preset: VoicePresetId = getVoicePresetId(),
): VoicePerformanceSettings {
  const base = VOICE_PRESETS[preset] ?? VOICE_PRESETS.smart_friend;
  return {
    speed: envNumber("VOICE_SPEED", base.speed),
    stability: envNumber("VOICE_STABILITY", base.stability),
    similarity: envNumber("VOICE_SIMILARITY", base.similarity),
    style: envNumber("VOICE_STYLE", base.style),
    speakerBoost: envBool("VOICE_SPEAKER_BOOST", base.speakerBoost),
  };
}

export function elevenLabsModelId(): string {
  return process.env.ELEVENLABS_MODEL_ID?.trim() || "eleven_multilingual_v2";
}

export function elevenLabsVoiceId(): string | undefined {
  return process.env.ELEVENLABS_VOICE_ID?.trim() || undefined;
}

export function getLocalTtsVoice(): string {
  return process.env.LOCAL_TTS_VOICE?.trim() || DEFAULTS.localTtsVoice;
}
