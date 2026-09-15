import fs from "node:fs";
import OpenAI from "openai";
import type { TimestampProvider, WordTimestamp } from "../interfaces";
import {
  allowFallbackTimestamps,
  DEFAULTS,
  getTranscribeModel,
} from "../config";
import { getOpenAI } from "../ai/openaiClient";
import { wordsArray } from "../utils/words";
import { getAudioDuration } from "./getAudioDuration";

interface VerboseWord {
  word?: string;
  start?: number;
  end?: number;
}

function asWords(value: unknown): WordTimestamp[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const row = item as VerboseWord;
      const word = String(row.word ?? "").trim();
      const start = Number(row.start);
      const end = Number(row.end);
      if (!word || !Number.isFinite(start) || !Number.isFinite(end)) return null;
      return { word, start, end };
    })
    .filter((w): w is WordTimestamp => w !== null);
}

async function transcribeWithModel(
  client: OpenAI,
  audioPath: string,
  model: string,
): Promise<{ words: WordTimestamp[]; text?: string }> {
  const file = fs.createReadStream(audioPath);
  const result = await client.audio.transcriptions.create({
    file,
    model,
    response_format: "verbose_json",
    timestamp_granularities: ["word"],
  });

  const record = result as unknown as {
    words?: unknown;
    text?: string;
  };
  return { words: asWords(record.words), text: record.text };
}

export function proportionalFallbackWords(
  text: string,
  durationSeconds: number,
): WordTimestamp[] {
  const tokens = wordsArray(text);
  if (tokens.length === 0 || durationSeconds <= 0) return [];
  const slice = durationSeconds / tokens.length;
  return tokens.map((word, i) => ({
    word,
    start: Number((i * slice).toFixed(3)),
    end: Number(((i + 1) * slice).toFixed(3)),
  }));
}

export class OpenAITimestampProvider implements TimestampProvider {
  async transcribe(input: {
    audioPath: string;
    expectedText?: string;
  }): Promise<{
    words: WordTimestamp[];
    source: "api" | "mock" | "fallback";
    model?: string;
  }> {
    const client = getOpenAI();
    const preferred = getTranscribeModel();
    const attempts = [preferred];
    if (preferred !== DEFAULTS.transcribeFallbackModel) {
      attempts.push(DEFAULTS.transcribeFallbackModel);
    }

    let lastError: unknown;
    for (const model of attempts) {
      try {
        const { words } = await transcribeWithModel(client, input.audioPath, model);
        if (words.length > 0) {
          return { words, source: "api", model };
        }
      } catch (error) {
        lastError = error;
      }
    }

    if (allowFallbackTimestamps() && input.expectedText) {
      const duration = await getAudioDuration(input.audioPath);
      return {
        words: proportionalFallbackWords(input.expectedText, duration),
        source: "fallback",
        model: "proportional-fallback",
      };
    }

    const detail =
      lastError instanceof Error ? lastError.message : "no word timestamps returned";
    throw new Error(
      [
        "Could not generate word-level timestamps from the voiceover.",
        "The pipeline will not invent fake precise timings.",
        "Fix: use whisper-1 (OPENAI_TRANSCRIBE_MODEL=whisper-1), or set FALLBACK_TIMESTAMPS=true for labeled mock timing, or MOCK_AI=true.",
        `Details: ${detail}`,
      ].join("\n"),
    );
  }
}

export async function transcribeForTimestamps(input: {
  audioPath: string;
  expectedText?: string;
}): Promise<{
  words: WordTimestamp[];
  source: "api" | "mock" | "fallback";
  model?: string;
}> {
  return new OpenAITimestampProvider().transcribe(input);
}
