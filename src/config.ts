export const SCHEMA_VERSION = "1.0";
export const RENDERER_VERSION = "1.0.0";

export const VIDEO = {
  width: 1080,
  height: 1920,
  fps: 30,
} as const;

export const DURATION = {
  minSeconds: 9,
  maxSeconds: 16,
  targetMin: 10.5,
  targetMax: 13.5,
  startPaddingSeconds: 0.2,
  endPaddingSeconds: 0.55,
  minSceneSeconds: 1.35,
} as const;

export const INTRO = {
  phrase: "diva finance timeee",
  phraseLead: "diva finance",
  phraseTail: "timeee",
  kicker: "finance for divas",
  character: "creator_doll",
  defaultMode: "micro",
  microSeconds: 0.9,
  fullSeconds: 2.4,
  overlapSeconds: 0.18,
} as const;

export type IntroMode = "none" | "micro" | "full";
export type IntroAudioMode = "spoken" | "sting" | "spoken_and_sting";

export const WORD_COUNT = {
  min: 24,
  max: 48,
  targetMin: 28,
  targetMax: 42,
} as const;

export const GENERATION = {
  maxStoryboardRetries: 3,
  maxReviewRetries: 2,
  maxShortenRetries: 2,
  maxTranscriptionRetries: 2,
} as const;

export const DEFAULTS = {
  textModel: "grok-4.6",
  ttsModel: "gpt-4o-mini-tts",
  ttsVoice: "nova",
  transcribeModel: "whisper-1",
  transcribeFallbackModel: "whisper-1",
  localTtsVoice: "Nicky",
  speechInstructions:
    "Speak like a bright, bubbly young woman, about 22 or 23, explaining finance to a smart friend on FaceTime. Warm, naturally feminine, youthful, a little sparkle and a smile in the voice. Conversational, quick-witted, confident. Lift the ends of fun lines. Slightly amused when the idea is backwards. Never robotic, corporate, radio-announcer, seductive, or fake-hype. Not a child and not a shouting influencer. Keep it easy, not rushed. Contractions. Emphasize the key term the way a person would, not a textbook.",
} as const;

export type VoiceProviderId = "elevenlabs" | "openai" | "local";
export type VoicePresetId = "smart_friend" | "soft_explainer" | "market_news" | "playful";

export function envFlag(name: string): boolean {
  const value = process.env[name];
  if (!value) return false;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

export function getTextModel(): string {
  return (
    process.env.XAI_TEXT_MODEL?.trim() ||
    process.env.GROK_TEXT_MODEL?.trim() ||
    DEFAULTS.textModel
  );
}

export function getTtsModel(): string {
  return process.env.OPENAI_TTS_MODEL?.trim() || DEFAULTS.ttsModel;
}

export function getTtsVoice(): string {
  return process.env.OPENAI_TTS_VOICE?.trim() || DEFAULTS.ttsVoice;
}

export function getTranscribeModel(): string {
  return process.env.OPENAI_TRANSCRIBE_MODEL?.trim() || DEFAULTS.transcribeModel;
}

export function hasXaiKey(): boolean {
  return Boolean(process.env.XAI_API_KEY?.trim() || process.env.GROK_API_KEY?.trim());
}

export function hasOpenAIKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function isMockAi(): boolean {
  return envFlag("MOCK_AI");
}

export function isOfflineText(): boolean {
  return isMockAi() || !hasXaiKey();
}

export function hasElevenLabsKey(): boolean {
  return Boolean(process.env.ELEVENLABS_API_KEY?.trim());
}

export function hasElevenLabsVoice(): boolean {
  return Boolean(process.env.ELEVENLABS_VOICE_ID?.trim());
}

export function hasElevenLabs(): boolean {
  return hasElevenLabsKey() && hasElevenLabsVoice();
}

export function requestedVoiceProvider(): VoiceProviderId {
  const raw = process.env.VOICE_PROVIDER?.trim().toLowerCase();
  if (raw === "openai") return "openai";
  if (raw === "local") return "local";
  return "elevenlabs";
}

export function resolveVoiceProviderId(): VoiceProviderId {
  if (isMockAi()) return "local";
  const requested = requestedVoiceProvider();
  if (requested === "local") return "local";
  if (requested === "elevenlabs") {
    if (hasElevenLabs()) return "elevenlabs";
    if (hasOpenAIKey()) return "openai";
    return "local";
  }
  if (requested === "openai") {
    if (hasOpenAIKey()) return "openai";
    if (hasElevenLabs()) return "elevenlabs";
    return "local";
  }
  if (hasElevenLabs()) return "elevenlabs";
  if (hasOpenAIKey()) return "openai";
  return "local";
}

export function isOfflineVoice(): boolean {
  return resolveVoiceProviderId() === "local";
}

export function allowFallbackTimestamps(): boolean {
  return envFlag("FALLBACK_TIMESTAMPS");
}
