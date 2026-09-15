import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { copyFile, unlink } from "node:fs/promises";
import path from "node:path";
import { ensureDir, fileExists } from "../utils/fs";

const execFileAsync = promisify(execFile);

async function toMono44100(inputPath: string, outputPath: string): Promise<void> {
  await execFileAsync("ffmpeg", ["-y", "-i", inputPath, "-ar", "44100", "-ac", "1", outputPath]);
}

export async function buildSoundtrack(input: {
  introSeconds: number;
  narrationPath: string;
  outputPath: string;
  introVoicePath?: string;
  stingPath?: string;
}): Promise<void> {
  await ensureDir(path.dirname(input.outputPath));
  if (input.introSeconds <= 0) {
    await copyFile(input.narrationPath, input.outputPath);
    return;
  }

  const dir = path.dirname(input.outputPath);
  const narration = path.join(dir, ".narration-44k.wav");
  const introBed = path.join(dir, ".intro-bed.wav");
  await toMono44100(input.narrationPath, narration);

  const mixInputs: string[] = ["-y", "-f", "lavfi", "-t", input.introSeconds.toFixed(3), "-i", "anullsrc=r=44100:cl=mono"];
  const filters: string[] = ["[0]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=mono[bed]"];
  const mixParts = ["[bed]"];
  let index = 1;

  if (input.introVoicePath && (await fileExists(input.introVoicePath))) {
    mixInputs.push("-i", input.introVoicePath);
    filters.push(
      `[${index}]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=mono,atrim=0:${input.introSeconds.toFixed(3)},apad=whole_dur=${input.introSeconds.toFixed(3)}[voice]`,
    );
    mixParts.push("[voice]");
    index += 1;
  }

  if (input.stingPath && (await fileExists(input.stingPath))) {
    mixInputs.push("-i", input.stingPath);
    filters.push(
      `[${index}]aformat=sample_fmts=fltp:sample_rates=44100:channel_layouts=mono,atrim=0:${input.introSeconds.toFixed(3)},adelay=30|30,apad=whole_dur=${input.introSeconds.toFixed(3)}[sting]`,
    );
    mixParts.push("[sting]");
  }

  const mixCount = mixParts.length;
  const volume = mixCount > 1 ? 1.4 : 1;
  filters.push(`${mixParts.join("")}amix=inputs=${mixCount}:duration=first:dropout_transition=0,volume=${volume}[intro]`);

  await execFileAsync("ffmpeg", [
    ...mixInputs,
    "-filter_complex",
    filters.join(";"),
    "-map",
    "[intro]",
    introBed,
  ]);

  await execFileAsync("ffmpeg", [
    "-y",
    "-i",
    introBed,
    "-i",
    narration,
    "-filter_complex",
    "[0][1]concat=n=2:v=0:a=1[out]",
    "-map",
    "[out]",
    "-ar",
    "44100",
    "-ac",
    "1",
    "-b:a",
    "192k",
    input.outputPath,
  ]);
  await Promise.allSettled([unlink(narration), unlink(introBed)]);
}
