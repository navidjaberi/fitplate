import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { AnalysisSchema, type Analysis, type Locale } from "../schema";
import { AnalysisError, AuthError, RateLimitError, SYSTEM_PROMPT, userPrompt, type ImageInput } from "./shared";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";

let client: Anthropic | null = null;

export async function analyzeWithClaude(image: ImageInput, locale: Locale): Promise<Analysis> {
  client ??= new Anthropic();
  try {
    const response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM_PROMPT,
      output_config: { effort: "medium", format: zodOutputFormat(AnalysisSchema) },
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: image.mediaType, data: image.data } },
            { type: "text", text: userPrompt(locale) },
          ],
        },
      ],
    });
    if (response.stop_reason === "refusal") throw new AnalysisError("The model declined to analyze this image");
    if (!response.parsed_output) throw new AnalysisError("Could not read the analysis");
    return response.parsed_output;
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) throw new RateLimitError(error.message);
    if (error instanceof Anthropic.AuthenticationError) throw new AuthError(error.message);
    throw error;
  }
}
