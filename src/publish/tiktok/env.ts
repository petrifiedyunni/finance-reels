export function tiktokClientKey(): string {
  return process.env.TIKTOK_CLIENT_KEY?.trim() ?? "";
}

export function tiktokClientSecret(): string {
  return process.env.TIKTOK_CLIENT_SECRET?.trim() ?? "";
}

export function hasTikTokApp(): boolean {
  return Boolean(tiktokClientKey() && tiktokClientSecret());
}

export function tiktokRedirectUriTemplate(): string {
  return process.env.TIKTOK_REDIRECT_URI?.trim() || "http://127.0.0.1:*/callback/";
}

export function tiktokPrivacyLevel(): string {
  return process.env.TIKTOK_PRIVACY_LEVEL?.trim() || "SELF_ONLY";
}

export function tiktokIsAigc(): boolean {
  const raw = process.env.TIKTOK_IS_AIGC?.trim().toLowerCase();
  if (!raw) return true;
  return ["1", "true", "yes", "on"].includes(raw);
}

export function assertTikTokApp(): { clientKey: string; clientSecret: string } {
  const clientKey = tiktokClientKey();
  const clientSecret = tiktokClientSecret();
  if (!clientKey || !clientSecret) {
    throw new Error(
      "TikTok app credentials missing. Add TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET to .env, then run: npm run tiktok -- setup",
    );
  }
  return { clientKey, clientSecret };
}
