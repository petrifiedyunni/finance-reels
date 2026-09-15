import { chmod } from "node:fs/promises";
import { resolveFromRoot, fileExists, readJson, writeJson } from "../../utils/fs";

export interface TikTokTokenFile {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  refreshExpiresAt: string;
  openId: string;
  scope: string;
  displayName?: string;
}

export function tokenPath(): string {
  return resolveFromRoot(".tiktok", "token.json");
}

export async function loadTokens(): Promise<TikTokTokenFile | null> {
  const path = tokenPath();
  if (!(await fileExists(path))) return null;
  return readJson<TikTokTokenFile>(path);
}

export async function saveTokens(tokens: TikTokTokenFile): Promise<void> {
  const path = tokenPath();
  await writeJson(path, tokens);
  await chmod(path, 0o600);
}

export function accessTokenValid(tokens: TikTokTokenFile, skewMs = 60_000): boolean {
  return Date.parse(tokens.expiresAt) - skewMs > Date.now();
}
