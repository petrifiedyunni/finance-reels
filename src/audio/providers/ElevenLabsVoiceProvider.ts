import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { VoiceProvider, VoiceResult, VoiceSynthesizeInput } from "../../interfaces";
import { ensureDir } from "../../utils/fs";
import { getAudioDuration } from "../getAudioDuration";
import {
  elevenLabsModelId,
  elevenLabsVoiceId,
  getVoicePresetId,
  resolveVoicePerformance,
  type VoiceSettingsSnapshot,
} from "../voiceSettings";

/** Premade/licensed voices only. This provider never clones a real person. */
export class ElevenLabsVoiceProvider implements VoiceProvider {
  readonly id = "elevenlabs" as const;

  async synthesize(input: VoiceSynthesizeInput): Promise<VoiceResult> {
    const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
    if (!apiKey) {
      throw new Error("ELEVENLABS_API_KEY is missing.");
    }

    const voiceId = input.voiceId || elevenLabsVoiceId();
    if (!voiceId) {
      throw new Error("ELEVENLABS_VOICE_ID is missing. Set a premade/licensed voice ID — do not clone a real person.");
    }

    const preset = input.preset ?? getVoicePresetId();
    const performance = resolveVoicePerformance(preset);
    const model = elevenLabsModelId();

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: input.text,
        model_id: model,
        voice_settings: {
          stability: performance.stability,
          similarity_boost: performance.similarity,
          style: performance.style,
          use_speaker_boost: performance.speakerBoost,
          speed: performance.speed,
        },
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`ElevenLabs TTS failed (${response.status}): ${detail.slice(0, 400)}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    await ensureDir(path.dirname(input.outputPath));
    await writeFile(input.outputPath, buffer);

    const settings: VoiceSettingsSnapshot = {
      provider: "elevenlabs",
      model,
      voiceId,
      preset,
      ...performance,
    };

    return {
      filePath: input.outputPath,
      durationSeconds: await getAudioDuration(input.outputPath),
      characters: input.text.length,
      cached: false,
      settings,
    };
  }
}
