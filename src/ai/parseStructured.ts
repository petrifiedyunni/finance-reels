import { zodResponseFormat, zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";
import { getXai } from "./xaiClient";
import { getTextModel } from "../config";
import type { UsageTotals } from "../interfaces";

export async function parseWithGrok<T>(input: {
  schema: z.ZodType<T>;
  name: string;
  system: string;
  user: string;
}): Promise<{ data: T; usage: UsageTotals }> {
  const client = getXai();
  const model = getTextModel();

  try {
    const response = await client.responses.parse({
      model,
      store: false,
      input: [
        { role: "system", content: input.system },
        { role: "user", content: input.user },
      ],
      text: { format: zodTextFormat(input.schema, input.name) },
    });

    if (!response.output_parsed) {
      throw new Error(`Grok did not return a ${input.name} object.`);
    }

    return {
      data: response.output_parsed,
      usage: {
        textInputTokens: response.usage?.input_tokens,
        textOutputTokens: response.usage?.output_tokens,
      },
    };
  } catch (error) {
    const status = (error as { status?: number }).status;
    const message = error instanceof Error ? error.message : String(error);
    const shouldFallback =
      status === 404 ||
      /\/responses|unrecognized request|not implemented/i.test(message);
    if (!shouldFallback) {
      throw error;
    }

    const completion = await client.chat.completions.parse({
      model,
      messages: [
        { role: "system", content: input.system },
        { role: "user", content: input.user },
      ],
      response_format: zodResponseFormat(input.schema, input.name),
    });

    const parsed = completion.choices[0]?.message.parsed;
    if (!parsed) {
      throw new Error(`Grok did not return a ${input.name} object.`);
    }

    return {
      data: parsed,
      usage: {
        textInputTokens: completion.usage?.prompt_tokens,
        textOutputTokens: completion.usage?.completion_tokens,
      },
    };
  }
}
