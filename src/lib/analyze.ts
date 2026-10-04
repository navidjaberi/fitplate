import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { AnalysisSchema, type Analysis, type Locale } from "./schema";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";

const SYSTEM = `You are a registered dietitian estimating the nutrition of a meal from a single photo.
Identify each distinct food or drink that is visible. For each, estimate a realistic portion using visual cues
(plate size, utensils, hands, packaging) and give grams, kilocalories, protein, carbs and fat for that portion,
based on standard food composition data. Account for likely hidden calories such as cooking oil, butter, sauces and dressings,
listing them as their own items when they are significant. Prefer typical home or restaurant portions when unsure,
and lower the confidence instead of guessing wildly. If the photo does not show food or drink, set isFood to false and return no items.`;

const LANGUAGE: Record<Locale, string> = { en: "English", fa: "Persian (Farsi)" };

let client: Anthropic | null = null;

export function isLiveMode() {
  return Boolean(process.env.ANTHROPIC_API_KEY) && process.env.DEMO_MODE !== "true";
}

export class AnalysisError extends Error {}

export async function analyzeImage(dataUrl: string, locale: Locale): Promise<Analysis> {
  client ??= new Anthropic();
  const [, mediaType, data] = dataUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/) ?? [];
  if (!mediaType || !data) throw new AnalysisError("Invalid image");

  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    system: SYSTEM,
    output_config: { effort: "medium", format: zodOutputFormat(AnalysisSchema) },
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType as "image/jpeg" | "image/png" | "image/webp" | "image/gif",
              data,
            },
          },
          {
            type: "text",
            text: `Analyze this meal. Write dishName, item names, portions and notes in ${LANGUAGE[locale]}.`,
          },
        ],
      },
    ],
  });

  if (response.stop_reason === "refusal") throw new AnalysisError("The model declined to analyze this image");
  if (!response.parsed_output) throw new AnalysisError("Could not read the analysis");
  return response.parsed_output;
}
