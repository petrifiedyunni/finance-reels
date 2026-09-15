import { isSeriesId, SERIES_IDS, TEMPLATE_IDS, type SeriesId, type TemplateId } from "../content/series";
import type { VoicePresetId } from "../config";
import type { CliOptions } from "../pipeline/generateReel";
import { isIntroMode } from "../content/intro";
import type { TikTokPublishMode } from "../publish/tiktok/publishReel";

const PRESETS: VoicePresetId[] = ["smart_friend", "soft_explainer", "market_news", "playful"];

function readArg(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  return args[index + 1];
}

function hasFlag(args: string[], name: string): boolean {
  return args.includes(name);
}

function parsePublish(args: string[]): TikTokPublishMode | undefined {
  const raw = readArg(args, "--publish");
  if (!raw) return undefined;
  if (raw === "inbox" || raw === "tiktok") return "inbox";
  if (raw === "direct") return "direct";
  throw new Error(`Unknown --publish "${raw}". Use inbox or direct.`);
}

export function parseArgs(argv: string[]): CliOptions {
  const args = argv.slice(2);
  const seriesRaw = readArg(args, "--series");
  const templateRaw = readArg(args, "--template");
  const presetRaw = readArg(args, "--preset");
  const introRaw = readArg(args, "--intro");

  if (seriesRaw && !isSeriesId(seriesRaw)) {
    throw new Error(`Unknown series "${seriesRaw}". Use one of: ${SERIES_IDS.join(", ")}`);
  }
  if (templateRaw && !(TEMPLATE_IDS as readonly string[]).includes(templateRaw)) {
    throw new Error(`Unknown template "${templateRaw}". Use one of: ${TEMPLATE_IDS.join(", ")}`);
  }
  if (presetRaw && !PRESETS.includes(presetRaw as VoicePresetId)) {
    throw new Error(`Unknown voice preset "${presetRaw}". Use one of: ${PRESETS.join(", ")}`);
  }

  if (introRaw && !isIntroMode(introRaw)) {
    throw new Error(`Unknown intro "${introRaw}". Use one of: none, micro, full`);
  }

  return {
    idea: readArg(args, "--idea"),
    series: seriesRaw as SeriesId | undefined,
    template: templateRaw as TemplateId | undefined,
    voice: readArg(args, "--voice"),
    preset: presetRaw as VoicePresetId | undefined,
    intro: introRaw as CliOptions["intro"],
    spec: readArg(args, "--spec"),
    output: readArg(args, "--output"),
    dryRun: hasFlag(args, "--dry-run"),
    skipAi: hasFlag(args, "--skip-ai"),
    open: hasFlag(args, "--open"),
    verbose: hasFlag(args, "--verbose"),
    force: hasFlag(args, "--force"),
    publish: parsePublish(args),
  };
}

export function hasHelp(argv: string[]): boolean {
  return argv.includes("--help") || argv.includes("-h");
}

export function printHelp(): void {
  console.log(`
🎀 Finance Reels

Usage:
  npm run reel -- --idea "why is selling a put bullish"
  npm run reel -- --idea "what is implied volatility" --series explain_like_im_five
  npm run reel -- --spec examples/selling-put.json --skip-ai
  npm run reel -- --idea "what is theta" --dry-run
  npm run voice-test -- --text "Okay, selling a put sounds bearish."

Options:
  --idea        Finance idea to explain
  --series      ${SERIES_IDS.join(" | ")}
  --template    ${TEMPLATE_IDS.join(" | ")}
  --voice       Voice ID (ElevenLabs) or OpenAI voice name
  --preset      ${PRESETS.join(" | ")} (default: smart_friend)
  --intro       none | micro | full (default: micro)
  --spec        Path to an existing storyboard JSON
  --skip-ai     Use --spec; skip script generation
  --dry-run     Generate/validate spec only
  --output      Custom output directory
  --open        Open the MP4 on macOS
  --force       Ignore caches and regenerate
  --verbose     Extra logs
  --publish     inbox | direct  (upload to TikTok after render)

TikTok:
  npm run tiktok -- setup
  npm run tiktok -- login
  npm run tiktok -- publish generated/<id>
`);
}
