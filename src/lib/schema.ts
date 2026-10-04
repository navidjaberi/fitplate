import { z } from "zod/v4";

export const FoodItemSchema = z.object({
  name: z.string().describe("Short name of the food item, in the requested language"),
  portion: z
    .string()
    .describe("Human-friendly portion, e.g. '1 cup', '2 slices', in the requested language"),
  grams: z.number().describe("Estimated weight of this portion in grams"),
  calories: z.number().describe("Estimated kilocalories for this portion"),
  protein: z.number().describe("Protein in grams for this portion"),
  carbs: z.number().describe("Carbohydrates in grams for this portion"),
  fat: z.number().describe("Fat in grams for this portion"),
});

export const AnalysisSchema = z.object({
  isFood: z.boolean().describe("False when the photo does not show food or drink"),
  dishName: z.string().describe("A short title for the whole meal, in the requested language"),
  items: z.array(FoodItemSchema),
  confidence: z.enum(["low", "medium", "high"]),
  notes: z
    .string()
    .describe("One short sentence about assumptions or hidden ingredients, in the requested language"),
});

export type FoodItem = z.infer<typeof FoodItemSchema>;
export type Analysis = z.infer<typeof AnalysisSchema>;

export const LOCALES = ["en", "fa"] as const;
export type Locale = (typeof LOCALES)[number];

export const AnalyzeRequestSchema = z.object({
  image: z
    .string()
    .regex(/^data:image\/(jpeg|png|webp|gif);base64,/, "Expected a base64 image data URL"),
  locale: z.enum(LOCALES).default("en"),
});

export type AnalyzeResponse =
  | { ok: true; analysis: Analysis; mode: "live" | "demo" }
  | { ok: false; error: string };
