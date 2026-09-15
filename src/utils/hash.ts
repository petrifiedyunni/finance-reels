import { createHash } from "node:crypto";

export function hashKey(...parts: Array<string | number | boolean | null | undefined>): string {
  const payload = parts.map((p) => String(p ?? "")).join("|");
  return createHash("sha256").update(payload).digest("hex").slice(0, 16);
}

export function cacheKey(kind: string, ...parts: Array<string | number | boolean | null | undefined>): string {
  return `${kind}:${hashKey(...parts)}`;
}
