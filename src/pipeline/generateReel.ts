import path from "node:path";
import {
  DURATION,
  GENERATION,
  INTRO,
  RENDERER_VERSION,
  SCHEMA_VERSION,
  VIDEO,
  getTextModel,
  getTtsModel,
  getTtsVoice,
  getTranscribeModel,
  hasOpenAIKey,
  isMockAi,
  isOfflineText,
  resolveVoiceProviderId,
  type IntroMode,
  type VoicePresetId,
} from "../config";
import { parseStoryboard, type SocialMetadata, type Storyboard, type WordTimestamp } from "../content/schema";
import { introDurationSeconds, introSpokenText, resolveIntro, shouldPlayIntroSting, shouldPlayIntroVoice } from "../content/intro";
import { SERIES, type SeriesId, type TemplateId } from "../content/series";
import { generateStoryboard } from "../ai/generateStoryboard";
import { heuristicFlags, reviewFinance } from "../ai/reviewFinance";
import { generateVoiceover } from "../audio/generateVoiceover";
import { buildSoundtrack } from "../audio/buildSoundtrack";
import { getAudioDuration, videoDurationFromAudio } from "../audio/getAudioDuration";
import { transcribeForTimestamps, proportionalFallbackWords } from "../audio/transcribeForTimestamps";
import {
  elevenLabsModelId,
  elevenLabsVoiceId,
  getLocalTtsVoice,
  getVoicePresetId,
  resolveVoicePerformance,
  type VoiceSettingsSnapshot,
} from "../audio/voiceSettings";
import { buildSceneTimeline } from "../timing/buildSceneTimeline";
import { groupCaptions } from "../timing/groupCaptions";
import { ensureDir, fileExists, readJson, resolveFromRoot, writeJson, writeText } from "../utils/fs";
import { Logger } from "../utils/logger";
import { captionsCacheKey, fileHash, shouldReuse, ttsCacheKey } from "./cache";
import { renderReel } from "./renderReel";
import { countWords } from "../utils/words";
import { metadataDisclaimer } from "../content/disclaimer";
import { publishReelToTikTok, tiktokCaptionFromSocial, type TikTokPublishMode } from "../publish/tiktok/publishReel";

export interface CliOptions {
  idea?: string;
  series?: SeriesId;
  template?: TemplateId;
  voice?: string;
  preset?: VoicePresetId;
  intro?: IntroMode;
  dryRun?: boolean;
  skipAi?: boolean;
  spec?: string;
  output?: string;
  open?: boolean;
  verbose?: boolean;
  force?: boolean;
  publish?: TikTokPublishMode;
}

export interface GenerationLog {
  schemaVersion: string;
  rendererVersion: string;
  startedAt: string;
  endedAt?: string;
  model?: string;
  ttsModel?: string;
  transcribeModel?: string;
  voice?: VoiceSettingsSnapshot;
  intro?: import("../content/intro").Intro;
  retries: {
    storyboard: number;
    financeReview: number;
    shorten: number;
  };
  audioDuration?: number;
  renderDuration?: number;
  template?: string;
  warnings: string[];
  errorsRecovered: string[];
  usage?: {
    textInputTokens?: number;
    textOutputTokens?: number;
    ttsCharacters?: number;
  };
  mock?: boolean;
  cacheHits: string[];
}

export async function loadStoryboardFile(specPath: string): Promise<Storyboard> {
  const absolute = path.isAbsolute(specPath) ? specPath : resolveFromRoot(specPath);
  if (!(await fileExists(absolute))) {
    throw new Error(`Spec not found: ${absolute}`);
  }
  return parseStoryboard(await readJson(absolute));
}

function validateTemplate(storyboard: Storyboard): Storyboard {
  const allowed: TemplateId[] = [
    "centered-explainer",
    "before-after",
    "cause-effect",
    "price-line",
  ];
  if (!allowed.includes(storyboard.template)) {
    storyboard.template = SERIES[storyboard.series].defaultTemplate;
  }
  return storyboard;
}

async function maybeOpen(filePath: string): Promise<void> {
  if (process.platform !== "darwin") return;
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  await promisify(execFile)("open", [filePath]);
}

export async function generateReel(options: CliOptions): Promise<{
  outputDir: string;
  videoPath?: string;
  storyboard: Storyboard;
}> {
  const log = new Logger(options.verbose ? "verbose" : "default");
  const generationLog: GenerationLog = {
    schemaVersion: SCHEMA_VERSION,
    rendererVersion: RENDERER_VERSION,
    startedAt: new Date().toISOString(),
    retries: { storyboard: 0, financeReview: 0, shorten: 0 },
    warnings: [],
    errorsRecovered: [],
    cacheHits: [],
    mock: isOfflineText(),
    model: isOfflineText() ? "offline-local" : getTextModel(),
    ttsModel: undefined,
    transcribeModel: getTranscribeModel(),
  };

  if (!options.spec && !options.idea) {
    throw new Error('Provide --idea "..." or --spec path/to/spec.json');
  }
  log.banner(options.idea ?? `spec ${options.spec}`);

  let storyboard: Storyboard;
  if (options.spec) {
    storyboard = await loadStoryboardFile(options.spec);
    if (options.idea) storyboard.idea = options.idea;
    log.ok("Storyboard loaded from spec");
  } else if (options.skipAi) {
    throw new Error("--skip-ai requires --spec path/to/spec.json");
  } else {
    const generated = await generateStoryboard({
      idea: options.idea as string,
      series: options.series,
      template: options.template,
    });
    generationLog.retries.storyboard = generated.retries;
    generationLog.usage = { ...generationLog.usage, ...generated.usage };
    if (!generated.usage) {
      generationLog.warnings.push("Offline storyboard: no cloud text model.");
      log.ok("Storyboard generated offline");
    } else {
      log.ok("Storyboard generated");
    }
    const reviewed = await reviewFinance({
      idea: options.idea as string,
      storyboard: generated.storyboard,
    });
    generationLog.retries.financeReview = reviewed.retries;
    generationLog.usage = {
      ...generationLog.usage,
      textInputTokens:
        (generationLog.usage?.textInputTokens ?? 0) + (reviewed.usage?.textInputTokens ?? 0),
      textOutputTokens:
        (generationLog.usage?.textOutputTokens ?? 0) + (reviewed.usage?.textOutputTokens ?? 0),
    };
    storyboard = reviewed.storyboard;
  }

  if (options.series) storyboard.series = options.series;
  if (options.template) storyboard.template = options.template;
  storyboard.intro = resolveIntro(storyboard.intro, options.intro);
  storyboard = validateTemplate(storyboard);
  storyboard.schemaVersion = SCHEMA_VERSION;
  if (!storyboard.financeReview) {
    const flags = heuristicFlags(storyboard);
    storyboard.financeReview = {
      passed: flags.length === 0,
      warnings: flags,
      issues: flags,
      reviewedAt: new Date().toISOString(),
    };
  }
  if (storyboard.financeReview.passed) {
    log.ok("Finance review passed");
  } else {
    log.warn("Finance review has issues — see finance-review.json");
    generationLog.warnings.push(...(storyboard.financeReview.issues ?? []));
  }

  const outputDir = options.output
    ? path.resolve(options.output)
    : resolveFromRoot("generated", storyboard.id);
  await ensureDir(outputDir);
  await writeJson(path.join(outputDir, "spec.json"), storyboard);
  await writeJson(path.join(outputDir, "finance-review.json"), storyboard.financeReview);

  if (options.dryRun) {
    log.info(JSON.stringify({
      id: storyboard.id,
      hook: storyboard.hook,
      voiceover: storyboard.voiceover,
      words: countWords(storyboard.voiceover),
      template: storyboard.template,
      intro: storyboard.intro,
      scenes: storyboard.scenes.map((s) => ({ id: s.id, headline: s.headline, visual: s.visual.type })),
    }, null, 2));
    generationLog.endedAt = new Date().toISOString();
    generationLog.template = storyboard.template;
    await writeJson(path.join(outputDir, "generation-log.json"), generationLog);
    log.ok("Dry run complete — spec written, no TTS/render");
    log.done(path.join(outputDir, "spec.json"));
    return { outputDir, storyboard };
  }

  const preset = options.preset ?? getVoicePresetId();
  const providerId = resolveVoiceProviderId();
  const performance = resolveVoicePerformance(preset);
  const voiceName =
    options.voice ??
    (providerId === "elevenlabs" ? elevenLabsVoiceId() : undefined) ??
    (providerId === "openai" ? getTtsVoice() : getLocalTtsVoice());
  const voiceModel =
    providerId === "elevenlabs"
      ? elevenLabsModelId()
      : providerId === "openai"
        ? getTtsModel()
        : "macos-say";
  const voicePath = path.join(outputDir, "voiceover.mp3");
  const voiceMetaPath = path.join(outputDir, "voice-cache.json");
  const captionsPath = path.join(outputDir, "captions.json");
  const ttsKey = ttsCacheKey({
    text: storyboard.voiceover,
    voice: voiceName,
    model: voiceModel,
    provider: providerId,
    preset,
    ...performance,
  });
  const canTranscribe = hasOpenAIKey() && !isMockAi();
  let audioDuration: number;
  const cachedVoiceMeta =
    (await fileExists(voiceMetaPath)) && !options.force
      ? await readJson<{ key?: string; settings?: VoiceSettingsSnapshot }>(voiceMetaPath).catch(() => null)
      : null;

  if (
    (await shouldReuse(voicePath, Boolean(options.force))) &&
    cachedVoiceMeta?.key === ttsKey &&
    !options.force
  ) {
    audioDuration = await getAudioDuration(voicePath);
    generationLog.cacheHits.push(`tts:${ttsKey}`);
    generationLog.voice = cachedVoiceMeta.settings;
    generationLog.ttsModel = cachedVoiceMeta.settings?.model ?? voiceModel;
    log.ok(`Voiceover reused — ${audioDuration.toFixed(1)}s`);
  } else {
    let current = storyboard;
    let voiceResult = await generateVoiceover({
      text: current.voiceover,
      voice: options.voice,
      outputPath: voicePath,
      preset,
    });
    generationLog.usage = {
      ...generationLog.usage,
      ttsCharacters: voiceResult.characters,
    };

    for (let i = 0; i < GENERATION.maxShortenRetries && voiceResult.durationSeconds > DURATION.maxSeconds; i++) {
      generationLog.retries.shorten += 1;
      generationLog.errorsRecovered.push(
        `Voiceover ${voiceResult.durationSeconds.toFixed(1)}s exceeded ${DURATION.maxSeconds}s; shortening script.`,
      );
      log.warn(`Voiceover ${voiceResult.durationSeconds.toFixed(1)}s is long — shortening script (not speeding up)`);
      if (options.skipAi || options.spec) {
        break;
      }
      const shortened = await generateStoryboard({
        idea: current.idea,
        series: current.series,
        template: current.template,
        shorten: true,
      });
      const reviewed = await reviewFinance({ idea: current.idea, storyboard: shortened.storyboard });
      current = reviewed.storyboard;
      storyboard = current;
      await writeJson(path.join(outputDir, "spec.json"), storyboard);
      voiceResult = await generateVoiceover({
        text: current.voiceover,
        voice: options.voice,
        outputPath: voicePath,
        preset,
      });
    }

    if (voiceResult.durationSeconds > DURATION.maxSeconds && !options.spec) {
      throw new Error(
        `Voiceover is ${voiceResult.durationSeconds.toFixed(1)}s, above the ${DURATION.maxSeconds}s limit. Shorten the script and retry. Do not raise VOICE_SPEED to squeeze it in.`,
      );
    }
    if (voiceResult.durationSeconds > DURATION.maxSeconds) {
      generationLog.warnings.push(
        `Voiceover ${voiceResult.durationSeconds.toFixed(1)}s is above ${DURATION.maxSeconds}s; rendering spec anyway.`,
      );
    }
    if (voiceResult.durationSeconds < DURATION.minSeconds) {
      generationLog.warnings.push(
        `Voiceover ${voiceResult.durationSeconds.toFixed(1)}s is under ${DURATION.minSeconds}s. Prefer a slightly longer script over a faster voice.`,
      );
    }
    audioDuration = voiceResult.durationSeconds;
    generationLog.voice = voiceResult.settings;
    generationLog.ttsModel = voiceResult.settings.model;
    await writeJson(voiceMetaPath, { key: ttsKey, settings: voiceResult.settings });
    if (voiceResult.settings.provider === "local") {
      generationLog.warnings.push("Used local macOS say voiceover (no ElevenLabs/OpenAI voice credentials).");
    }
    log.ok(`Voiceover generated (${voiceResult.settings.provider}) — ${audioDuration.toFixed(1)}s`);
  }

  generationLog.audioDuration = audioDuration;

  let words: WordTimestamp[] = [];
  const fixtureCaptions = resolveFromRoot("public/fixtures/selling-put.captions.json");
  const sameAsFixture =
    storyboard.id.includes("selling-put") &&
    /When you sell a put/i.test(storyboard.voiceover);

  if ((await shouldReuse(captionsPath, Boolean(options.force))) && !options.force) {
    words = await readJson(captionsPath);
    generationLog.cacheHits.push("captions");
    log.ok("Word timestamps reused");
  } else if (!canTranscribe && sameAsFixture && (await fileExists(fixtureCaptions))) {
    words = await readJson(fixtureCaptions);
    await writeJson(captionsPath, words);
    generationLog.warnings.push("Used fixture word timestamps (mock / no API key).");
    log.ok("Word timestamps loaded from fixture");
  } else if (!canTranscribe) {
    words = proportionalFallbackWords(storyboard.voiceover, audioDuration);
    await writeJson(captionsPath, words);
    generationLog.warnings.push("Local/no-transcribe mode: labeled proportional timestamps (not API word timings).");
    log.warn("Using labeled mock timestamps");
  } else {
    const audioHash = await fileHash(voicePath);
    const capKey = captionsCacheKey({ audioHash, model: getTranscribeModel() });
    const transcribed = await transcribeForTimestamps({
      audioPath: voicePath,
      expectedText: storyboard.voiceover,
    });
    words = transcribed.words;
    if (transcribed.source !== "api") {
      generationLog.warnings.push(`Timestamp source: ${transcribed.source} (${transcribed.model ?? "n/a"})`);
      log.warn(`Timestamps used ${transcribed.source} mode`);
    }
    generationLog.cacheHits.push(capKey);
    await writeJson(captionsPath, words);
    log.ok("Word timestamps generated");
  }

  if (words.length === 0) {
    words = proportionalFallbackWords(storyboard.voiceover, audioDuration);
    generationLog.warnings.push("No word timestamps; using labeled proportional fallback.");
    log.warn("No word timestamps — using labeled fallback timing");
    await writeJson(captionsPath, words);
  }

  const captions = groupCaptions(words);
  const intro = resolveIntro(storyboard.intro, options.intro);
  storyboard.intro = intro;
  const introSeconds = introDurationSeconds(intro);
  const overlap = introSeconds > 0 ? INTRO.overlapSeconds : 0;
  const startPad = introSeconds > 0 ? 0 : DURATION.startPaddingSeconds;
  const contentDuration = videoDurationFromAudio(audioDuration, {
    start: startPad,
    end: DURATION.endPaddingSeconds,
  });
  const timeline = buildSceneTimeline({
    scenes: storyboard.scenes,
    words,
    totalSeconds: contentDuration,
  }).map((timing) => ({
    ...timing,
    startSeconds: timing.startSeconds + Math.max(0, introSeconds - overlap),
    endSeconds: timing.endSeconds + Math.max(0, introSeconds - overlap),
  }));
  const captionsShifted = captions.map((phrase) => ({
    ...phrase,
    start: phrase.start + introSeconds,
    end: phrase.end + introSeconds,
    words: phrase.words.map((word) => ({
      ...word,
      start: word.start + introSeconds,
      end: word.end + introSeconds,
    })),
  }));
  const durationSeconds = introSeconds + contentDuration - overlap;
  log.ok(`Timeline built — ${durationSeconds.toFixed(1)}s${introSeconds ? ` (intro ${intro.mode} ${introSeconds.toFixed(1)}s)` : ""}`);

  const stingPath = resolveFromRoot("public/assets/audio/intro-sting.mp3");
  const introVoicePath = path.join(outputDir, "intro-voice.mp3");
  const soundtrackPath = path.join(outputDir, "soundtrack.mp3");

  if (introSeconds > 0 && shouldPlayIntroVoice(intro)) {
    const spoken = introSpokenText(intro);
    if (!(await shouldReuse(introVoicePath, Boolean(options.force))) || options.force) {
      try {
        await generateVoiceover({
          text: spoken,
          voice: options.voice,
          outputPath: introVoicePath,
          preset: "playful",
        });
        log.ok("Intro voice line generated");
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        generationLog.warnings.push(`Intro voice skipped: ${message}`);
        log.warn("Intro voice line skipped — bumper will play visually");
      }
    }
  }

  await buildSoundtrack({
    introSeconds,
    narrationPath: voicePath,
    outputPath: soundtrackPath,
    introVoicePath: introSeconds > 0 && shouldPlayIntroVoice(intro) ? introVoicePath : undefined,
    stingPath: introSeconds > 0 && shouldPlayIntroSting(intro) && (await fileExists(stingPath)) ? stingPath : undefined,
  });

  const audioSrc = "";
  const props = {
    storyboard,
    timeline,
    captions: captionsShifted,
    audioSrc,
    durationInFrames: Math.max(1, Math.round(durationSeconds * VIDEO.fps)),
  };

  const videoPath = path.join(outputDir, "render.mp4");
  try {
    const rendered = await renderReel({
      props,
      outputPath: videoPath,
      audioPath: soundtrackPath,
      audioDelaySeconds: introSeconds > 0 ? 0 : DURATION.startPaddingSeconds,
    });
    generationLog.renderDuration = rendered.durationSeconds;
    log.ok("Video rendered");
  } catch (error) {
    generationLog.endedAt = new Date().toISOString();
    generationLog.template = storyboard.template;
    await writeJson(path.join(outputDir, "generation-log.json"), generationLog);
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Render failed. Spec, voice, and captions were preserved in ${outputDir} so you can rerun without paying for AI/TTS.\n${message}`,
    );
  }

  const social: SocialMetadata = {
    title: storyboard.title,
    caption: `${storyboard.caption} ${SERIES[storyboard.series].decorative}\n\n${storyboard.hashtags.map((h) => `#${h.replace(/^#/, "")}`).join(" ")}`,
    hashtags: storyboard.hashtags,
    series: storyboard.series,
    createdAt: new Date().toISOString(),
    publishStatus: "draft",
    disclaimer: metadataDisclaimer,
  };
  await writeJson(path.join(outputDir, "social.json"), social);
  await writeText(path.join(outputDir, "tiktok-caption.txt"), `${tiktokCaptionFromSocial(social)}\n`);

  generationLog.endedAt = new Date().toISOString();
  generationLog.template = storyboard.template;
  generationLog.intro = intro;
  await writeJson(path.join(outputDir, "generation-log.json"), generationLog);
  log.done(videoPath);

  if (options.publish) {
    log.info(`Uploading to TikTok (${options.publish})…`);
    const posted = await publishReelToTikTok({
      outputDir,
      mode: options.publish,
    });
    if (posted.mode === "inbox") {
      log.ok("Sent to TikTok inbox — finish the draft in the app");
    } else {
      log.ok(`TikTok ${posted.status}`);
    }
  }

  if (options.open) {
    await maybeOpen(videoPath);
  }

  return { outputDir, videoPath, storyboard };
}
