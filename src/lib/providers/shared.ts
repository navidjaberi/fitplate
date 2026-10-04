import type { Locale } from "../schema";

export const SYSTEM_PROMPT = `You are a registered dietitian estimating the nutrition of a meal from a single photo.
Identify each distinct food or drink that is visible. For each, estimate a realistic portion using visual cues
(plate size, utensils, hands, packaging) and give grams, kilocalories, protein, carbs and fat for that portion,
based on standard food composition data. Account for likely hidden calories such as cooking oil, butter, sauces and dressings,
listing them as their own items when they are significant. Prefer typical home or restaurant portions when unsure,
and lower the confidence instead of guessing wildly. If the photo does not show food or drink, set isFood to false and return no items.`;

const LANGUAGE: Record<Locale, string> = { en: "English", fa: "Persian (Farsi)" };

export const userPrompt = (locale: Locale) =>
  `Analyze this meal. Write dishName, item names, portions and notes in ${LANGUAGE[locale]}.`;

export type ImageInput = { mediaType: "image/jpeg" | "image/png" | "image/webp" | "image/gif"; data: string };

/** The model answered but the result is unusable (refusal, bad JSON). */
export class AnalysisError extends Error {}
/** The provider is throttling us (free tiers hit this quickly). */
export class RateLimitError extends Error {}
/** The configured API key was rejected. */
export class AuthError extends Error {}
