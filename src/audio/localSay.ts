import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tmpdir } from "node:os";
import { stat } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { VoiceResult } from "../interfaces";
import { ensureDir, fileExists, resolveFromRoot } from "../utils/fs";
import { getAudioDuration } from "./getAudioDuration";
import { getLocalTtsVoice, getVoicePresetId, resolveVoicePerformance } from "./voiceSettings";

const execFileAsync = promisify(execFile);

const FEMALE_SAY_VOICES = [
  "Samantha",
  "Karen",
  "Moira",
  "Tessa",
] as const;

export function resolveFemaleSayVoice(requested?: string): string {
  const name = (requested?.trim() || getLocalTtsVoice()).trim();
  if (/^nicky$/i.test(name)) return "Nicky";
  const match = FEMALE_SAY_VOICES.find((voice) => voice.toLowerCase() === name.toLowerCase());
  if (match) return match;
  if (/^flo$/i.test(name) || /^shelley$/i.test(name) || /^kathy$/i.test(name)) {
    return "Samantha";
  }
  return "Nicky";
}

function shapeSpokenText(text: string): string {
  return text
    .replace(/\s+—\s+/g, ", ")
    .replace(/\s+-\s+/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

async function ensureTtsBinary(): Promise<string> {
  const source = resolveFromRoot("scripts/macos-tts.swift");
  const binary = resolveFromRoot("generated/.cache/macos-tts");
  await ensureDir(path.dirname(binary));
  const sourceStat = await stat(source);
  const binaryOk = await fileExists(binary);
  if (binaryOk) {
    const binaryStat = await stat(binary);
    if (binaryStat.mtimeMs >= sourceStat.mtimeMs) return binary;
  }
  await execFileAsync("swiftc", ["-O", "-o", binary, source, "-framework", "AVFoundation"], {
    timeout: 120_000,
  });
  return binary;
}

async function synthesizeNeural(input: {
  text: string;
  outputPath: string;
  voice: string;
  speed: number;
}): Promise<string> {
  const binary = await ensureTtsBinary();
  const caf = path.join(tmpdir(), `finance-reels-${randomUUID()}.caf`);
  const avRate = Math.min(0.53, Math.max(0.48, 0.515 + (input.speed - 1) * 0.08));
  const { stdout } = await execFileAsync(binary, [
    "--text",
    input.text,
    "--out",
    caf,
    "--voice",
    input.voice,
    "--rate",
    avRate.toFixed(3),
    "--pitch",
    "1.04",
  ], { timeout: 45_000 });
  await execFileAsync("ffmpeg", [
    "-y",
    "-i",
    caf,
    "-ar",
    "44100",
    "-ac",
    "1",
    "-b:a",
    "192k",
    input.outputPath,
  ]);
  const reported = stdout.trim().split("\t")[0]?.trim();
  return reported || input.voice;
}

async function synthesizeSayFallback(input: {
  text: string;
  outputPath: string;
  speed: number;
}): Promise<void> {
  const aiff = path.join(tmpdir(), `finance-reels-${randomUUID()}.aiff`);
  const rate = Math.round(165 * Math.min(1.08, Math.max(0.95, input.speed)));
  await execFileAsync("say", ["-v", "Samantha", "-r", String(rate), "-o", aiff, input.text]);
  await execFileAsync("ffmpeg", ["-y", "-i", aiff, "-ar", "44100", "-ac", "1", "-b:a", "192k", input.outputPath]);
}

export async function synthesizeWithMacSay(input: {
  text: string;
  outputPath: string;
  speed?: number;
  voice?: string;
}): Promise<Omit<VoiceResult, "settings">> {
  if (process.platform !== "darwin") {
    throw new Error("Local neural TTS is only available on macOS.");
  }
  await ensureDir(path.dirname(input.outputPath));
  const speed = input.speed ?? resolveVoicePerformance(getVoicePresetId()).speed;
  const voice = resolveFemaleSayVoice(input.voice);
  const spoken = shapeSpokenText(input.text);

  try {
    await synthesizeNeural({
      text: spoken,
      outputPath: input.outputPath,
      voice,
      speed,
    });
    return {
      filePath: input.outputPath,
      durationSeconds: await getAudioDuration(input.outputPath),
      characters: input.text.length,
      cached: false,
    };
  } catch {
    await synthesizeSayFallback({ text: spoken, outputPath: input.outputPath, speed });
    return {
      filePath: input.outputPath,
      durationSeconds: await getAudioDuration(input.outputPath),
      characters: input.text.length,
      cached: false,
    };
  }
}
