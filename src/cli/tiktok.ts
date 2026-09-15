import { loadEnv } from "../utils/env";
import { Logger } from "../utils/logger";
import { hasTikTokApp } from "../publish/tiktok/env";
import { loginWithTikTok } from "../publish/tiktok/oauth";
import { loadTokens } from "../publish/tiktok/tokenStore";
import { getValidTokens } from "../publish/tiktok/session";
import { publishReelToTikTok, type TikTokPublishMode } from "../publish/tiktok/publishReel";
import { printTikTokSetup } from "../publish/tiktok/setupCopy";

function readArg(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  return args[index + 1];
}

function parseMode(args: string[]): TikTokPublishMode {
  if (args.includes("--direct")) return "direct";
  const raw = readArg(args, "--mode");
  if (raw === "direct") return "direct";
  return "inbox";
}

async function main(): Promise<void> {
  loadEnv();
  const log = new Logger();
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === "setup" || command === "--help" || command === "-h") {
    printTikTokSetup();
    return;
  }

  if (command === "login") {
    log.info("Open the TikTok window in a private browser and sign into the BRAND account.");
    const tokens = await loginWithTikTok();
    log.ok(`Connected ${tokens.displayName ?? tokens.openId}`);
    log.done(".tiktok/token.json");
    return;
  }

  if (command === "whoami") {
    if (!hasTikTokApp()) {
      throw new Error("Add TIKTOK_CLIENT_KEY and TIKTOK_CLIENT_SECRET to .env first.");
    }
    const stored = await loadTokens();
    if (!stored) {
      log.warn("No account connected. Run: npm run tiktok -- login");
      return;
    }
    const tokens = await getValidTokens();
    log.ok(tokens.displayName ? `${tokens.displayName}` : "TikTok account connected");
    log.info(`open_id  ${tokens.openId}`);
    log.info(`scopes   ${tokens.scope}`);
    return;
  }

  if (command === "publish") {
    const target = args[1];
    if (!target || target.startsWith("--")) {
      throw new Error("Usage: npm run tiktok -- publish generated/<id> [--direct]");
    }
    const mode = parseMode(args);
    const result = await publishReelToTikTok({ outputDir: target, mode });
    if (mode === "inbox") {
      log.ok("Video sent to TikTok inbox");
      log.info("Open TikTok → notifications → finish the draft.");
      log.info("Caption is in tiktok-caption.txt (paste it before you post).");
    } else {
      log.ok(`Direct post ${result.status}`);
    }
    log.done(result.videoPath);
    return;
  }

  throw new Error(`Unknown tiktok command "${command}". Use setup, login, whoami, or publish.`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\n✗ ${message}\n`);
  process.exitCode = 1;
});
