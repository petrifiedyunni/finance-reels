import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "OPENAI_API_KEY is missing. Needed for TTS and word timestamps. Copy .env.example to .env, or set MOCK_AI=true.",
    );
  }
  if (!client) {
    client = new OpenAI({ apiKey });
  }
  return client;
}

export function resetOpenAIClient(): void {
  client = null;
}

export function usageFromResponse(response: {
  usage?: {
    input_tokens?: number;
    output_tokens?: number;
    total_tokens?: number;
  } | null;
}): { textInputTokens?: number; textOutputTokens?: number } {
  return {
    textInputTokens: response.usage?.input_tokens,
    textOutputTokens: response.usage?.output_tokens,
  };
}
