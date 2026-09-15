import OpenAI from "openai";

let client: OpenAI | null = null;

export function getXai(): OpenAI {
  const apiKey =
    process.env.XAI_API_KEY?.trim() || process.env.GROK_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "XAI_API_KEY is missing. Copy .env.example to .env and add your xAI/Grok key, or set MOCK_AI=true.",
    );
  }
  if (!client) {
    client = new OpenAI({
      apiKey,
      baseURL: "https://api.x.ai/v1",
    });
  }
  return client;
}

export function resetXaiClient(): void {
  client = null;
}
