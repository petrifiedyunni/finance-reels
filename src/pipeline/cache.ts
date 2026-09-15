import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileExists } from "../utils/fs";

export function inputHash(...parts: Array<string | number | boolean | null | undefined>): string {
  return createHash("sha256").update(parts.map((p) => String(p ?? "")).join("|")).digest("hex");
}

export async function fileHash(filePath: string): Promise<string> {
  const buf = await readFile(filePath);
  return createHash("sha256").update(buf).digest("hex");
}

export async function shouldReuse(filePath: string, force: boolean): Promise<boolean> {
  if (force) return false;
  return fileExists(filePath);
}

export function storyboardCacheKey(input: {
  idea: string;
  series?: string;
  template?: string;
  model: string;
}): string {
  return inputHash("storyboard", input.idea.trim().toLowerCase(), input.series, input.template, input.model);
}

export function ttsCacheKey(input: {
  text: string;
  voice: string;
  model: string;
  provider?: string;
  preset?: string;
  speed?: number;
  stability?: number;
  similarity?: number;
  style?: number;
  speakerBoost?: boolean;
}): string {
  return inputHash(
    "tts",
    input.provider,
    input.preset,
    input.text,
    input.voice,
    input.model,
    input.speed,
    input.stability,
    input.similarity,
    input.style,
    input.speakerBoost,
  );
}

export function captionsCacheKey(input: { audioHash: string; model: string }): string {
  return inputHash("captions", input.audioHash, input.model);
}
