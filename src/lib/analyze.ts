import "server-only";
import type { Analysis, Locale } from "./schema";
import { analyzeWithClaude } from "./providers/claude";
import { analyzeWithGemini } from "./providers/gemini";
import { AnalysisError, type ImageInput } from "./providers/shared";

export { AnalysisError, AuthError, RateLimitError } from "./providers/shared";

export type Provider = "claude" | "gemini";

export function activeProvider(): Provider | null {
  if (process.env.DEMO_MODE === "true") return null;
  const hasClaude = Boolean(process.env.ANTHROPIC_API_KEY);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const preferred = process.env.AI_PROVIDER;
  if (preferred === "gemini" && hasGemini) return "gemini";
  if (preferred === "claude" && hasClaude) return "claude";
  if (hasClaude) return "claude";
  if (hasGemini) return "gemini";
  return null;
}

export async function analyzeImage(provider: Provider, dataUrl: string, locale: Locale): Promise<Analysis> {
  const [, mediaType, data] = dataUrl.match(/^data:(image\/[a-z]+);base64,(.+)$/) ?? [];
  if (!mediaType || !data) throw new AnalysisError("Invalid image");
  const image = { mediaType, data } as ImageInput;
  return provider === "gemini" ? analyzeWithGemini(image, locale) : analyzeWithClaude(image, locale);
}
