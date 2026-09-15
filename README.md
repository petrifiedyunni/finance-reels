# Finance Reels

A local-first studio that turns one finance idea into a polished 9:16 explainer video.

AI writes the explanation, hook, and storyboard. Code owns typography, color, layout, motion, captions, and rendering — so every reel looks like the same feminine, premium finance media brand.

```
IDEA → script → storyboard JSON → voiceover → word timestamps
    → animated 1080×1920 video → captions → MP4 + social metadata
```

V1 stops before publishing.

## Quickstart

No API keys required on macOS.

```bash
npm install
npm run reel -- --idea "why is selling a put bullish"
```

That uses a local storyboard, macOS `say` for voice, and labeled caption timing.

Want Grok to write the script and a studio voice? Add keys to `.env`:

```bash
cp .env.example .env
# XAI_API_KEY=...
# ELEVENLABS_API_KEY=...
# ELEVENLABS_VOICE_ID=...   # premade/licensed voice only — never clone a real person
# OPENAI_API_KEY=...        # fallback TTS + word timestamps
npm run reel -- --idea "why is selling a put bullish"
```

Output:

`generated/<video-id>/render.mp4`

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `XAI_API_KEY` | — | Optional. Grok script + finance review |
| `XAI_TEXT_MODEL` | `grok-4.6` | xAI model id |
| `VOICE_PROVIDER` | `elevenlabs` | `elevenlabs` (preferred), `openai` (fallback), or `local` |
| `VOICE_PRESET` | `smart_friend` | Performance style: `smart_friend`, `soft_explainer`, `market_news`, `playful` |
| `ELEVENLABS_API_KEY` | — | Preferred production TTS |
| `ELEVENLABS_VOICE_ID` | — | Premade/licensed voice ID (not a celebrity clone) |
| `ELEVENLABS_MODEL_ID` | `eleven_multilingual_v2` | ElevenLabs model |
| `VOICE_SPEED` | `1.06` | Delivery speed. Do not raise this to squeeze a long script |
| `VOICE_STABILITY` | `0.34` | ElevenLabs stability |
| `VOICE_SIMILARITY` | `0.78` | ElevenLabs similarity_boost |
| `VOICE_STYLE` | `0.24` | ElevenLabs style exaggeration |
| `VOICE_SPEAKER_BOOST` | `true` | ElevenLabs speaker boost |
| `LOCAL_TTS_VOICE` | `Nicky` | On-device female Siri voice (smooth). Not `say -v Nicky`, which falls back to a man. |
| `OPENAI_API_KEY` | — | Fallback TTS + word-level timestamps |
| `OPENAI_TTS_MODEL` | `gpt-4o-mini-tts` | OpenAI speech model |
| `OPENAI_TTS_VOICE` | `nova` | OpenAI fallback voice |
| `OPENAI_TRANSCRIBE_MODEL` | `whisper-1` | Word-level timestamps |
| `MOCK_AI` | `false` | Force local/offline generation even if keys exist |
| `FALLBACK_TIMESTAMPS` | `false` | Labeled proportional timing if transcription has no words |

Never put API keys in client/Remotion code. The CLI reads `.env` on the server side only.

## Generate your first reel

```bash
npm run reel -- --idea "why is selling a put bullish"
npm run reel -- --idea "why can rate cuts make stocks fall" --series market_weirdness
npm run reel -- --idea "what is theta" --dry-run
```

`--dry-run` writes and prints a validated storyboard. It does not call TTS or render.

## Render from an existing spec

```bash
npm run reel -- --spec examples/selling-put.json --skip-ai
npm run reel -- --spec examples/implied-volatility.json --skip-ai
npm run reel -- --spec examples/hawkish-dovish.json --skip-ai
npm run reel -- --spec examples/percent-loss.json --skip-ai
```

`--skip-ai` never calls the script-generation model. It still generates voice and timestamps unless there is no TTS/transcription key (then it uses local `say` + labeled timing).

Useful flags: `--template cause-effect`, `--voice <id>`, `--preset smart_friend`, `--output custom/path`, `--open`, `--force`, `--verbose`.

## Open Remotion Studio

```bash
npm run studio
```

Design templates and visuals against the selling-put preview composition.

## Project architecture

```
src/
  ai/           storyboard generation + finance reviewer
  audio/        interchangeable VoiceProviders, presets, timestamps
  brand/        colors, type, safe zones (single source of truth)
  content/      Zod schema, series, visual vocabulary
  timing/       scene timeline + caption grouping
  remotion/     compositions, templates, visuals, motion
  pipeline/     generate → render, caching
  cli/          npm run reel, npm run voice-test
  interfaces/   future Publisher + Analytics placeholders
```

Pipeline stages are separate artifacts under `generated/<id>/`:

- `spec.json`
- `finance-review.json`
- `voiceover.mp3`
- `captions.json`
- `render.mp4`
- `social.json`
- `generation-log.json`

If render fails, earlier files are kept so you can rerun without paying for AI/TTS again.

## How to create a new visual

1. Add the id to `VISUAL_TYPES` in `src/content/visuals.ts`.
2. Build a React/SVG component under `src/remotion/visuals/`.
3. Register it in `src/remotion/visuals/visualRegistry.ts`.
4. Use only brand tokens from `src/brand/theme.ts`.

Storyboards may only name registered visual types. Arbitrary JSX from the model is rejected.

## How to create a new template

1. Add an id to `TEMPLATE_IDS` in `src/content/series.ts`.
2. Create a component in `src/remotion/templates/` that accepts a `Scene`.
3. Register it in `src/remotion/FinanceReel.tsx`.
4. Keep the same `CompositionProps` shape — templates should not invent a second spec.

Current templates: `centered-explainer`, `before-after`, `cause-effect`, `price-line`.

## How to change brand colors

Edit `src/brand/theme.ts`. That file owns backgrounds, ink, accents, radii, shadows, and stroke widths. Do not scatter hex values in components.

Typography lives in `src/brand/typography.ts` (Fraunces display + Outfit captions). Safe zones live in `src/brand/safeZones.ts`.

## How to change voice

Preferred production provider is ElevenLabs. OpenAI is the fallback. macOS `say` is last-resort local.

Set `VOICE_PROVIDER=elevenlabs` and a **premade or licensed** `ELEVENLABS_VOICE_ID`. Do not clone a real person's voice.

Performance style is separate from identity:

- `smart_friend` (default) — bubbly, young, conversational
- `soft_explainer` — slower, gentler
- `market_news` — calmer, more composed
- `playful` — a little more smile, still precise

```bash
# Audition the same line on candidate voices (no full video render)
npm run voice-test -- \
  --text "Okay, selling a put sounds bearish. But here's the weird part — you're actually hoping the stock stays above your strike." \
  --voices id1,id2,id3 \
  --preset smart_friend
```

Output: `generated/voice-tests/<timestamp>/voice-1.mp3` plus `manifest.json`.

Speech duration target is **10.5–13.5s** (acceptable 9–16). If it feels rushed, shorten the script — do not crank `VOICE_SPEED`.

Narration copy is written to be spoken (contractions, fragments, delivery punctuation). Visual markdown never belongs in the voiceover.

## How to change the writing model

Set `XAI_TEXT_MODEL` in `.env`. Default is `grok-4.6`.

Grok writes the storyboard and finance review. ElevenLabs (preferred) or OpenAI speaks it. OpenAI Whisper times captions.

## How to add a new series

Add the id to `SERIES_IDS` and a config row in `src/content/series.ts`. Series control hook style, default template, background, accent, and the small pill label.

Queue ideas (no dashboard yet) in `content/ideas.json`.

## Troubleshooting

**`XAI_API_KEY is missing`**  
That's fine. The CLI writes a local storyboard instead of calling Grok.

**`OPENAI_API_KEY is missing`**  
That's fine on macOS if ElevenLabs is also unset. Voice is generated with `say`, and captions use labeled local timing.

**Storyboard validation retries then fails**  
Run `--verbose`. The model must use supported visual types and about 28–42 spoken words (hard range 24–48).

**Finance review failed**  
The reviewer blocks advice, guarantees, and inverted mechanics. Fix the idea or inspect `finance-review.json`.

**No word timestamps**  
The pipeline will not invent fake precise timings. Use `whisper-1`, or set `FALLBACK_TIMESTAMPS=true` / `MOCK_AI=true` for labeled fallback timing.

**Render failed**  
`spec.json` / `voiceover.mp3` / `captions.json` are preserved. Rerun the same command; caches reuse unchanged audio.

**ffmpeg / ffprobe not found**  
Install ffmpeg (`brew install ffmpeg` on macOS). Needed for duration and final audio mux.

**Video has no audio**  
The renderer muxes `voiceover.mp3` if Remotion did not embed it. Check `ffprobe generated/<id>/render.mp4`.

## Scripts

```bash
npm run reel
npm run voice-test
npm run studio
npm test
npm run typecheck
npm run lint
```

## Future roadmap

- Publisher adapters for TikTok, Instagram, YouTube Shorts
- Analytics ingest (views, completion, rewatches, posting time)
- Content queue UI on top of `content/ideas.json`
- Sourced live-market data providers (V1 stays conceptual when numbers cannot be verified)
- Tone presets and A/B hooks from performance data

Interfaces for `Publisher` and `AnalyticsProvider` already exist. They are intentionally unimplemented in V1.
