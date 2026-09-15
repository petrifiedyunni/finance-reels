import { accessTokenValid, loadTokens, type TikTokTokenFile } from "./tokenStore";
import { refreshAccessToken } from "./oauth";

export async function getValidTokens(): Promise<TikTokTokenFile> {
  const existing = await loadTokens();
  if (!existing) {
    throw new Error("No TikTok account connected. Run: npm run tiktok -- login");
  }
  if (accessTokenValid(existing)) return existing;
  if (Date.parse(existing.refreshExpiresAt) <= Date.now()) {
    throw new Error("TikTok login expired. Run: npm run tiktok -- login");
  }
  return refreshAccessToken(existing.refreshToken);
}
