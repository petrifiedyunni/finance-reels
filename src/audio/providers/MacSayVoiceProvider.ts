import path from "node:path";
import type { VoiceProvider, VoiceResult, VoiceSynthesizeInput } from "../../interfaces";
import { resolveFemaleSayVoice, synthesizeWithMacSay } from "../localSay";
import {
  getVoicePresetId,
  resolveVoicePerformance,
  type VoiceSettingsSnapshot,
} from "../voiceSettings";

export class MacSayVoiceProvider implements VoiceProvider {
  readonly id = "local" as const;

  async synthesize(input: VoiceSynthesizeInput): Promise<VoiceResult> {
    const preset = input.preset ?? getVoicePresetId();
    const performance = resolveVoicePerformance(preset);
    const voice = resolveFemaleSayVoice(input.voiceId);
    const result = await synthesizeWithMacSay({
      text: input.text,
      outputPath: input.outputPath,
      speed: performance.speed,
      voice,
    });

    const settings: VoiceSettingsSnapshot = {
      provider: "local",
      model: "macos-say",
      voiceId: voice,
      preset,
      ...performance,
    };

    return {
      ...result,
      filePath: path.resolve(input.outputPath),
      settings,
    };
  }
}
