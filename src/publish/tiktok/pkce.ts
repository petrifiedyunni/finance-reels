import { createHash, randomBytes } from "node:crypto";

const VERIFIER_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";

export function randomVerifier(length = 64): string {
  const bytes = randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += VERIFIER_CHARS[bytes[i] % VERIFIER_CHARS.length];
  }
  return out;
}

/** TikTok desktop Login Kit: hex SHA-256 of the verifier, method S256. */
export function challengeFromVerifier(verifier: string): string {
  return createHash("sha256").update(verifier).digest("hex");
}

export function randomState(): string {
  return randomBytes(24).toString("hex");
}
