import type { VoiceProviderId } from "../../config";
import type { VoiceProvider } from "../../interfaces";
import { resolveVoiceProviderId } from "../../config";
import { ElevenLabsVoiceProvider } from "./ElevenLabsVoiceProvider";
import { OpenAIVoiceProvider } from "./OpenAIVoiceProvider";
import { MacSayVoiceProvider } from "./MacSayVoiceProvider";

export function createVoiceProvider(id: VoiceProviderId = resolveVoiceProviderId()): VoiceProvider {
  if (id === "elevenlabs") return new ElevenLabsVoiceProvider();
  if (id === "openai") return new OpenAIVoiceProvider();
  return new MacSayVoiceProvider();
}

export function fallbackProviderIds(primary: VoiceProviderId): VoiceProviderId[] {
  if (primary === "elevenlabs") return ["openai", "local"];
  if (primary === "openai") return ["local"];
  return [];
}
