import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { SpeechCreateParams } from "openai/resources/audio/speech";
import type { VoiceProvider, VoiceResult, VoiceSynthesizeInput } from "../../interfaces";
import { DEFAULTS, getTtsModel, getTtsVoice } from "../../config";
import { getOpenAI } from "../../ai/openaiClient";
import { ensureDir } from "../../utils/fs";
import { getAudioDuration } from "../getAudioDuration";
import {
  getVoicePresetId,
  PRESET_SPEECH_INSTRUCTIONS,
  resolveVoicePerformance,
  type VoiceSettingsSnapshot,
} from "../voiceSettings";

export class OpenAIVoiceProvider implements VoiceProvider {
  readonly id = "openai" as const;

  async synthesize(input: VoiceSynthesizeInput): Promise<VoiceResult> {
    const client = getOpenAI();
    const model = getTtsModel();
    const voiceId = input.voiceId || getTtsVoice();
    const preset = input.preset ?? getVoicePresetId();
    const performance = resolveVoicePerformance(preset);

    const payload: SpeechCreateParams = {
      model,
      voice: voiceId,
      input: input.text,
      speed: performance.speed,
      response_format: "mp3",
    };
    if (/gpt-4o|mini-tts/i.test(model)) {
      payload.instructions = PRESET_SPEECH_INSTRUCTIONS[preset] ?? DEFAULTS.speechInstructions;
    }

    const response = await client.audio.speech.create(payload);

    const buffer = Buffer.from(await response.arrayBuffer());
    await ensureDir(path.dirname(input.outputPath));
    await writeFile(input.outputPath, buffer);

    const settings: VoiceSettingsSnapshot = {
      provider: "openai",
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
