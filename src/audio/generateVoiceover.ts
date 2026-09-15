import type { VoiceProviderId, VoicePresetId } from "../config";
import type { VoiceResult } from "../interfaces";
import {
  getTtsModel,
  getTtsVoice,
  hasElevenLabs,
  hasOpenAIKey,
  resolveVoiceProviderId,
} from "../config";
import { fileExists } from "../utils/fs";
import { getAudioDuration } from "./getAudioDuration";
import { createVoiceProvider, fallbackProviderIds } from "./providers/resolveVoiceProvider";
import {
  elevenLabsModelId,
  elevenLabsVoiceId,
  getVoicePresetId,
  resolveVoicePerformance,
} from "./voiceSettings";

function voiceIdForProvider(providerId: VoiceProviderId, requested?: string): string | undefined {
  if (providerId !== "local") return requested;
  if (!requested) return undefined;
  return /^[A-Za-z][A-Za-z -]*$/.test(requested) ? requested : undefined;
}

export async function generateVoiceover(input: {
  text: string;
  voice?: string;
  outputPath: string;
  preset?: VoicePresetId;
  provider?: VoiceProviderId;
  reuseIfExists?: boolean;
}): Promise<VoiceResult> {
  const providerId = input.provider ?? resolveVoiceProviderId();
  const preset = input.preset ?? getVoicePresetId();
  const performance = resolveVoicePerformance(preset);

  if (input.reuseIfExists && (await fileExists(input.outputPath))) {
    return {
      filePath: input.outputPath,
      durationSeconds: await getAudioDuration(input.outputPath),
      characters: input.text.length,
      cached: true,
      settings: {
        provider: providerId,
        model:
          providerId === "elevenlabs"
            ? elevenLabsModelId()
            : providerId === "openai"
              ? getTtsModel()
              : "macos-say",
        voiceId: input.voice || elevenLabsVoiceId() || getTtsVoice(),
        preset,
        ...performance,
      },
    };
  }

  const chain = [providerId, ...fallbackProviderIds(providerId)].filter((id, index, all) => {
    if (all.indexOf(id) !== index) return false;
    if (id === "elevenlabs") return hasElevenLabs() || providerId === "elevenlabs";
    if (id === "openai") return hasOpenAIKey() || providerId === "openai";
    return true;
  });

  const errors: string[] = [];
  for (const id of chain) {
    try {
      const provider = createVoiceProvider(id);
      return await provider.synthesize({
        text: input.text,
        outputPath: input.outputPath,
        voiceId: voiceIdForProvider(id, input.voice),
        preset,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${id}: ${message}`);
    }
  }

  throw new Error(
    [
      "Voiceover generation failed across providers.",
      "Set ELEVENLABS_API_KEY + ELEVENLABS_VOICE_ID, or OPENAI_API_KEY, or run on macOS for local say.",
      ...errors.map((line) => `- ${line}`),
    ].join("\n"),
  );
}
