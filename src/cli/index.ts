import { loadEnv } from "../utils/env";
import { generateReel } from "../pipeline/generateReel";
import { hasHelp, parseArgs, printHelp } from "./parseArgs";

async function main(): Promise<void> {
  loadEnv();
  try {
    const options = parseArgs(process.argv);
    if (hasHelp(process.argv)) {
      printHelp();
      return;
    }
    await generateReel(options);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\n✗ ${message}\n`);
    process.exitCode = 1;
  }
}

main();
