import type { Storyboard } from "../content/schema";
import type { SeriesId, TemplateId } from "../content/series";
import type { VoiceSettingsSnapshot } from "../audio/voiceSettings";
import type { VoicePresetId } from "../config";

export interface GenerationRequest {
  idea: string;
  series?: SeriesId;
  template?: TemplateId;
  previousIssues?: string[];
  shorten?: boolean;
}

export interface UsageTotals {
  textInputTokens?: number;
  textOutputTokens?: number;
  ttsCharacters?: number;
}

export interface ScriptGenerator {
  generate(request: GenerationRequest): Promise<{
    storyboard: Storyboard;
    usage?: UsageTotals;
    retries: number;
  }>;
}

export interface FinanceReviewer {
  review(input: {
    idea: string;
    storyboard: Storyboard;
  }): Promise<{
    storyboard: Storyboard;
    usage?: UsageTotals;
    retries: number;
  }>;
}

export interface VoiceResult {
  filePath: string;
  durationSeconds: number;
  characters: number;
  cached: boolean;
  settings: VoiceSettingsSnapshot;
}

export interface VoiceSynthesizeInput {
  text: string;
  outputPath: string;
  voiceId?: string;
  preset?: VoicePresetId;
}

export interface VoiceProvider {
  readonly id: "elevenlabs" | "openai" | "local";
  synthesize(input: VoiceSynthesizeInput): Promise<VoiceResult>;
}

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export interface TimestampProvider {
  transcribe(input: {
    audioPath: string;
    expectedText?: string;
  }): Promise<{
    words: WordTimestamp[];
    source: "api" | "mock" | "fallback";
    model?: string;
  }>;
}

export interface RenderRequest {
  compositionId: string;
  outputPath: string;
  props: Record<string, unknown>;
  durationInFrames: number;
}

export interface Renderer {
  render(request: RenderRequest): Promise<{
    outputPath: string;
    durationSeconds?: number;
  }>;
}

export interface ContentIdeaSource {
  list(): Promise<Array<{ idea: string; series?: SeriesId; status: string }>>;
}

export interface Publisher {
  readonly name: string;
  publish(input: {
    videoPath: string;
    caption: string;
    hashtags: string[];
  }): Promise<{ platformId: string }>;
}

export interface AnalyticsProvider {
  ingest(event: import("./analytics").VideoAnalytics): Promise<void>;
}
