import { mkdir, readFile, writeFile, access, copyFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";

export function projectRoot(): string {
  return process.cwd();
}

export function resolveFromRoot(...parts: string[]): string {
  return path.resolve(projectRoot(), ...parts);
}

export async function ensureDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
}

export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function readJson<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

export async function writeJson(filePath: string, value: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

export async function copyIfNeeded(from: string, to: string): Promise<void> {
  await ensureDir(path.dirname(to));
  await copyFile(from, to);
}

export async function writeText(filePath: string, value: string): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await writeFile(filePath, value, "utf8");
}
