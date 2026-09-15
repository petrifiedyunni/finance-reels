export type LogLevel = "silent" | "default" | "verbose";

const RESET = "\x1b[0m";
const PINK = "\x1b[38;5;175m";
const MUTED = "\x1b[38;5;245m";
const GREEN = "\x1b[38;5;108m";
const GOLD = "\x1b[38;5;179m";
const RED = "\x1b[38;5;167m";

export class Logger {
  constructor(private level: LogLevel = "default") {}

  banner(idea: string): void {
    if (this.level === "silent") return;
    console.log(`${PINK}🎀 Finance Reels${RESET}`);
    console.log(`${MUTED}────────────────────────${RESET}`);
    console.log(`Idea: ${idea}`);
    console.log("");
  }

  ok(message: string): void {
    if (this.level === "silent") return;
    console.log(`${GREEN}✓${RESET} ${message}`);
  }

  warn(message: string): void {
    if (this.level === "silent") return;
    console.log(`${GOLD}!${RESET} ${message}`);
  }

  error(message: string): void {
    console.error(`${RED}✗${RESET} ${message}`);
  }

  info(message: string): void {
    if (this.level === "silent") return;
    console.log(message);
  }

  verbose(message: string): void {
    if (this.level !== "verbose") return;
    console.log(`${MUTED}${message}${RESET}`);
  }

  done(outputPath: string): void {
    if (this.level === "silent") return;
    console.log("");
    console.log(`${PINK}→${RESET} ${outputPath}`);
  }
}
