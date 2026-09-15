import { afterEach, describe, expect, it } from "vitest";
import { DURATION, resolveVoiceProviderId } from "../src/config";
import { VOICE_PRESETS, getVoicePresetId, resolveVoicePerformance } from "../src/audio/voiceSettings";
import { sanitizeSpokenCopy } from "../src/utils/spokenCopy";
import { ttsCacheKey } from "../src/pipeline/cache";

const saved: Record<string, string | undefined> = {};

function setEnv(key: string, value: string | undefined): void {
  if (!(key in saved)) saved[key] = process.env[key];
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}

afterEach(() => {
  for (const [key, value] of Object.entries(saved)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
    delete saved[key];
  }
});

describe("voice presets", () => {
  it("defaults to smart_friend", () => {
    setEnv("VOICE_PRESET", undefined);
    setEnv("VOICE_SPEED", undefined);
    expect(getVoicePresetId()).toBe("smart_friend");
    expect(resolveVoicePerformance().speed).toBeCloseTo(1.06);
    expect(VOICE_PRESETS.playful.style).toBeGreaterThan(VOICE_PRESETS.smart_friend.style);
  });

  it("lets env override preset performance without changing voice identity", () => {
    setEnv("VOICE_PRESET", "soft_explainer");
    setEnv("VOICE_SPEED", "1.02");
    expect(getVoicePresetId()).toBe("soft_explainer");
    expect(resolveVoicePerformance().speed).toBeCloseTo(1.02);
    expect(resolveVoicePerformance().stability).toBe(VOICE_PRESETS.soft_explainer.stability);
  });
});

describe("voice provider selection", () => {
  it("prefers ElevenLabs when credentials exist", () => {
    setEnv("MOCK_AI", "false");
    setEnv("VOICE_PROVIDER", "elevenlabs");
    setEnv("ELEVENLABS_API_KEY", "test-key");
    setEnv("ELEVENLABS_VOICE_ID", "premade-voice");
    setEnv("OPENAI_API_KEY", "openai-key");
    expect(resolveVoiceProviderId()).toBe("elevenlabs");
  });

  it("falls back to OpenAI, then local", () => {
    setEnv("MOCK_AI", "false");
    setEnv("VOICE_PROVIDER", "elevenlabs");
    setEnv("ELEVENLABS_API_KEY", undefined);
    setEnv("ELEVENLABS_VOICE_ID", undefined);
    setEnv("OPENAI_API_KEY", "openai-key");
    expect(resolveVoiceProviderId()).toBe("openai");
    setEnv("OPENAI_API_KEY", undefined);
    expect(resolveVoiceProviderId()).toBe("local");
  });
});

describe("speech-first copy", () => {
  it("strips visual formatting from spoken copy", () => {
    expect(sanitizeSpokenCopy("**Okay**, selling a put. [more](https://x)")).toBe(
      "Okay, selling a put. more",
    );
  });
});

describe("tts cache", () => {
  it("changes when provider or preset settings change", () => {
    const base = ttsCacheKey({
      text: "hello",
      voice: "coral",
      model: "eleven_multilingual_v2",
      provider: "elevenlabs",
      preset: "smart_friend",
      speed: 1.05,
    });
    const faster = ttsCacheKey({
      text: "hello",
      voice: "coral",
      model: "eleven_multilingual_v2",
      provider: "elevenlabs",
      preset: "smart_friend",
      speed: 1.2,
    });
    expect(base).not.toBe(faster);
  });
});

describe("duration targets", () => {
  it("prefers a natural 10.5–13.5s window", () => {
    expect(DURATION.targetMin).toBe(10.5);
    expect(DURATION.targetMax).toBe(13.5);
    expect(DURATION.minSeconds).toBe(9);
    expect(DURATION.maxSeconds).toBe(16);
  });
});
