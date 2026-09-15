import path from "node:path";
import { loadEnv } from "../utils/env";
import { generateVoiceover } from "../audio/generateVoiceover";
import {
  elevenLabsVoiceId,
  getLocalTtsVoice,
  getVoicePresetId,
  resolveVoicePerformance,
} from "../audio/voiceSettings";
import { getTtsVoice, resolveVoiceProviderId, type VoicePresetId } from "../config";
import { ensureDir, resolveFromRoot, writeJson } from "../utils/fs";

const PRESETS: VoicePresetId[] = ["smart_friend", "soft_explainer", "market_news", "playful"];

const DEFAULT_TEXT =
  "Okay, selling a put sounds bearish. But here's the weird part — you're actually hoping the stock stays above your strike.";

function readArg(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  return args[index + 1];
}

function configuredVoiceId(): string {
  const provider = resolveVoiceProviderId();
  if (provider === "elevenlabs") return elevenLabsVoiceId() || getLocalTtsVoice();
  if (provider === "openai") return getTtsVoice();
  return getLocalTtsVoice();
}

function printHelp(): void {
  console.log(`
🎀 Voice audition

Usage:
  npm run voice-test -- --text "Okay, selling a put sounds bearish."
  npm run voice-test -- --text "..." --voices id1,id2,id3 --preset smart_friend

Renders the same phrase with candidate voices. Does not render a full video.
Never clones a real person. Pass premade/licensed voice IDs only.

Options:
  --text     Spoken line to audition (default: sample selling-put line)
  --voices   Comma-separated voice IDs (default: currently configured voice)
  --preset   smart_friend | soft_explainer | market_news | playful
  --output   Optional output directory
`);
}

async function main(): Promise<void> {
  loadEnv();
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  const text = readArg(args, "--text")?.trim() || DEFAULT_TEXT;
  const presetRaw = readArg(args, "--preset")?.trim() as VoicePresetId | undefined;
  if (presetRaw && !PRESETS.includes(presetRaw)) {
    throw new Error(`Unknown voice preset "${presetRaw}". Use one of: ${PRESETS.join(", ")}`);
  }
  const preset = presetRaw ?? getVoicePresetId();
  const voicesRaw = readArg(args, "--voices")?.trim();
  const voices = (voicesRaw ? voicesRaw.split(",") : [configuredVoiceId()])
    .map((id) => id.trim())
    .filter(Boolean);

  if (voices.length === 0) {
    throw new Error("No voices to audition. Set ELEVENLABS_VOICE_ID / OPENAI_TTS_VOICE or pass --voices.");
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const outputDir = readArg(args, "--output")
    ? path.resolve(readArg(args, "--output") as string)
    : resolveFromRoot("generated", "voice-tests", stamp);
  await ensureDir(outputDir);

  const provider = resolveVoiceProviderId();
  const performance = resolveVoicePerformance(preset);
  const results: Array<{
    index: number;
    voiceId: string;
    file: string;
    durationSeconds: number;
    provider: string;
    model: string;
  }> = [];

  for (const [index, voiceId] of voices.entries()) {
    const file = `voice-${index + 1}.mp3`;
    const outputPath = path.join(outputDir, file);
    const result = await generateVoiceover({
      text,
      voice: voiceId,
      outputPath,
      preset,
      provider,
    });
    results.push({
      index: index + 1,
      voiceId,
      file,
      durationSeconds: Number(result.durationSeconds.toFixed(3)),
      provider: result.settings.provider,
      model: result.settings.model,
    });
    console.log(`✓ ${file}  ${voiceId}  ${result.durationSeconds.toFixed(2)}s  (${result.settings.provider})`);
  }

  const manifest = {
    createdAt: new Date().toISOString(),
    text,
    provider,
    preset,
    settings: performance,
    voices: results,
    notes: [
      "Voice identity is separate from performance preset.",
      "Do not clone a real person's voice. Use premade or explicitly consented custom voices.",
    ],
  };
  await writeJson(path.join(outputDir, "manifest.json"), manifest);
  console.log(`\nAudition written to ${outputDir}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\n✗ ${message}\n`);
  process.exitCode = 1;
});
