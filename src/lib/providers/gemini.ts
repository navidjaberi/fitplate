import "server-only";
import { ApiError, GoogleGenAI } from "@google/genai";
import { z } from "zod/v4";
import { AnalysisSchema, type Analysis, type Locale } from "../schema";
import { AnalysisError, AuthError, RateLimitError, SYSTEM_PROMPT, userPrompt, type ImageInput } from "./shared";

const MODEL = process.env.GEMINI_MODEL || "gemini-flash-latest";
const RESPONSE_SCHEMA = z.toJSONSchema(AnalysisSchema);

let client: GoogleGenAI | null = null;

export async function analyzeWithGemini(image: ImageInput, locale: Locale): Promise<Analysis> {
  client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await client.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [{ inlineData: { mimeType: image.mediaType, data: image.data } }, { text: userPrompt(locale) }],
        },
      ],
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseJsonSchema: RESPONSE_SCHEMA,
      },
    });
    const parsed = AnalysisSchema.safeParse(JSON.parse(response.text ?? "null"));
    if (!parsed.success) throw new AnalysisError("Could not read the analysis");
    return parsed.data;
  } catch (error) {
    if (error instanceof SyntaxError) throw new AnalysisError("The model returned invalid JSON");
    if (error instanceof ApiError) {
      if (error.status === 429) throw new RateLimitError(error.message);
      if (error.status === 401 || error.status === 403 || /api key/i.test(error.message)) throw new AuthError(error.message);
    }
    throw error;
  }
}
