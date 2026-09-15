import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileExists } from "../utils/fs";

const execFileAsync = promisify(execFile);

export async function getAudioDuration(filePath: string): Promise<number> {
  if (!(await fileExists(filePath))) {
    throw new Error(`Audio file not found: ${filePath}`);
  }

  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);
    const duration = Number.parseFloat(stdout.trim());
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error(`ffprobe returned an invalid duration: ${stdout}`);
    }
    return duration;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Could not measure audio duration with ffprobe. Is ffmpeg installed?\n${message}`,
    );
  }
}

export function videoDurationFromAudio(
  audioSeconds: number,
  padding: { start: number; end: number },
): number {
  return audioSeconds + padding.start + padding.end;
}
