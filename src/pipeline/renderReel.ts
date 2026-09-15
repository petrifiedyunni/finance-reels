import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { DURATION, VIDEO } from "../config";
import { ensureDir, fileExists } from "../utils/fs";
import { resolveFromRoot } from "../utils/fs";
import type { CompositionProps } from "../content/schema";
import type { Renderer, RenderRequest } from "../interfaces";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

let bundledServeUrl: string | null = null;

async function getBundle(): Promise<string> {
  if (bundledServeUrl) return bundledServeUrl;
  const entryPoint = resolveFromRoot("src/remotion/index.ts");
  bundledServeUrl = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });
  return bundledServeUrl;
}

export class RemotionRenderer implements Renderer {
  async render(request: RenderRequest): Promise<{ outputPath: string; durationSeconds?: number }> {
    await ensureDir(path.dirname(request.outputPath));
    const serveUrl = await getBundle();
    const composition = await selectComposition({
      serveUrl,
      id: request.compositionId,
      inputProps: request.props,
    });

    await renderMedia({
      composition: {
        ...composition,
        durationInFrames: request.durationInFrames,
        fps: VIDEO.fps,
        width: VIDEO.width,
        height: VIDEO.height,
      },
      serveUrl,
      codec: "h264",
      outputLocation: request.outputPath,
      inputProps: request.props,
      jpegQuality: 90,
      overwrite: true,
      chromiumOptions: {
        enableMultiProcessOnLinux: true,
      },
    });

    return { outputPath: request.outputPath };
  }
}

export async function muxAudio(videoPath: string, audioPath: string, startDelaySeconds = 0): Promise<void> {
  if (!(await fileExists(audioPath))) {
    throw new Error(`Cannot mux audio; file missing: ${audioPath}`);
  }

  const { stdout: videoDurationRaw } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    videoPath,
  ]);
  const videoDuration = Number.parseFloat(videoDurationRaw.trim());
  const tmp = videoPath.replace(/\.mp4$/, ".mux.mp4");
  const args = ["-y", "-i", videoPath];
  if (startDelaySeconds > 0) {
    args.push("-itsoffset", String(startDelaySeconds));
  }
  args.push(
    "-i",
    audioPath,
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-map",
    "0:v:0",
    "-map",
    "1:a:0",
    "-movflags",
    "+faststart",
  );
  if (Number.isFinite(videoDuration) && videoDuration > 0) {
    args.push("-t", videoDuration.toFixed(3));
  }
  args.push(tmp);
  await execFileAsync("ffmpeg", args);
  const { rename } = await import("node:fs/promises");
  await rename(tmp, videoPath);
}

export async function muxAudioIfMissing(
  videoPath: string,
  audioPath: string,
  startDelaySeconds = 0,
): Promise<void> {
  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-select_streams",
    "a",
    "-show_entries",
    "stream=codec_type",
    "-of",
    "csv=p=0",
    videoPath,
  ]);
  if (stdout.trim().includes("audio")) return;
  await muxAudio(videoPath, audioPath, startDelaySeconds);
}

export async function renderReel(input: {
  props: CompositionProps;
  outputPath: string;
  audioPath: string;
}): Promise<{ outputPath: string; durationSeconds: number }> {
  const renderer = new RemotionRenderer();
  await renderer.render({
    compositionId: "FinanceReel",
    outputPath: input.outputPath,
    props: input.props,
    durationInFrames: input.props.durationInFrames,
  });
  await muxAudio(input.outputPath, input.audioPath, DURATION.startPaddingSeconds);

  const { stdout } = await execFileAsync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    input.outputPath,
  ]);
  return {
    outputPath: input.outputPath,
    durationSeconds: Number.parseFloat(stdout.trim()),
  };
}
