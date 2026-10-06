import { describe, expect, it } from "vitest";
import { dailyCalorieTarget, macroSplit, macroTargets, scaleItem, sumMacros } from "../nutrition";
import { lastDays, dayKey } from "../date";
import { mockAnalysis } from "../mock";
import { AnalysisSchema, AnalyzeRequestSchema } from "../schema";

const rice = { name: "Rice", portion: "1 cup", grams: 180, calories: 234, protein: 4.8, carbs: 51, fat: 0.5 };

describe("scaleItem", () => {
  it("scales grams and macros by the portion factor", () => {
    expect(scaleItem(rice, 1.5)).toMatchObject({ grams: 270, calories: 351, protein: 7.2, carbs: 76.5, fat: 0.8 });
  });
  it("keeps the name and portion text", () => {
    expect(scaleItem(rice, 2)).toMatchObject({ name: "Rice", portion: "1 cup" });
  });
});

describe("sumMacros", () => {
  it("adds items and rounds", () => {
    expect(sumMacros([rice, rice])).toEqual({ calories: 468, protein: 9.6, carbs: 102, fat: 1 });
  });
  it("returns zeros for an empty list", () => {
    expect(sumMacros([])).toEqual({ calories: 0, protein: 0, carbs: 0, fat: 0 });
  });
});

describe("macroSplit", () => {
  it("weights fat at 9 kcal per gram", () => {
    const s = macroSplit({ calories: 0, protein: 10, carbs: 10, fat: 10 });
    expect(s.fat).toBeCloseTo(90 / 170);
    expect(s.protein + s.carbs + s.fat).toBeCloseTo(1);
  });
  it("handles a zero meal", () => {
    expect(macroSplit({ calories: 0, protein: 0, carbs: 0, fat: 0 })).toEqual({ protein: 0, carbs: 0, fat: 0 });
  });
});

describe("goals", () => {
  it("matches Mifflin-St Jeor for a reference adult", () => {
    expect(dailyCalorieTarget({ sex: "male", age: 30, heightCm: 180, weightKg: 80, activity: "moderate" })).toBe(2760);
  });
  it("derives gram targets from a calorie goal", () => {
    expect(macroTargets(2000)).toEqual({ protein: 150, carbs: 200, fat: 67 });
  });
});

describe("dates", () => {
  it("lists the last n days ending today", () => {
    const days = lastDays(7, new Date(2026, 0, 3));
    expect(days).toHaveLength(7);
    expect(days[0]).toBe("2025-12-28");
    expect(days[6]).toBe(dayKey(new Date(2026, 0, 3)));
  });
});

describe("schemas", () => {
  it("demo meals satisfy the analysis schema in both languages", () => {
    for (const seed of ["a", "bb", "ccc", "dddd", "eeeee"]) {
      expect(AnalysisSchema.safeParse(mockAnalysis(seed, "en")).success).toBe(true);
      expect(AnalysisSchema.safeParse(mockAnalysis(seed, "fa")).success).toBe(true);
    }
  });
  it("rejects requests that are not image data URLs", () => {
    expect(AnalyzeRequestSchema.safeParse({ image: "hello" }).success).toBe(false);
    expect(AnalyzeRequestSchema.safeParse({ image: "data:image/jpeg;base64,AAAA" }).data?.locale).toBe("en");
  });
});

import { bmi, planTargets, weeksToGoal } from "../nutrition";

const body = { sex: "male" as const, age: 30, heightCm: 180, weightKg: 80, activity: "moderate" as const };

describe("planTargets", () => {
  it("keeps maintenance calories for a maintain goal", () => {
    const t = planTargets(body, { type: "maintain", pace: 0, targetWeightKg: 80 });
    expect(t.calories).toBe(2760);
    expect(t.protein).toBe(128);
  });
  it("subtracts 550 kcal a day for losing 0.5 kg a week", () => {
    expect(planTargets(body, { type: "lose", pace: 0.5, targetWeightKg: 72 }).calories).toBe(2210);
  });
  it("adds a surplus for gaining", () => {
    expect(planTargets(body, { type: "gain", pace: 0.25, targetWeightKg: 85 }).calories).toBe(3040);
  });
  it("never goes below the safety floor", () => {
    const small = { ...body, sex: "female" as const, weightKg: 50, heightCm: 155, activity: "sedentary" as const };
    expect(planTargets(small, { type: "lose", pace: 1, targetWeightKg: 45 }).calories).toBe(1200);
  });
  it("macro calories add up to roughly the calorie target", () => {
    const t = planTargets(body, { type: "lose", pace: 0.5, targetWeightKg: 72 });
    expect(Math.abs(t.protein * 4 + t.carbs * 4 + t.fat * 9 - t.calories)).toBeLessThan(15);
  });
});

describe("weeksToGoal and bmi", () => {
  it("counts weeks at the planned pace", () => {
    expect(weeksToGoal(80, { type: "lose", pace: 0.5, targetWeightKg: 72 })).toBe(16);
    expect(weeksToGoal(80, { type: "maintain", pace: 0, targetWeightKg: 80 })).toBeNull();
    expect(weeksToGoal(70, { type: "lose", pace: 0.5, targetWeightKg: 72 })).toBeNull();
  });
  it("computes BMI", () => {
    expect(bmi(80, 180)).toBe(24.7);
  });
});

import { parseLocalizedNumber } from "../format";

describe("parseLocalizedNumber", () => {
  it("reads Latin, Persian and Arabic digits", () => {
    expect(parseLocalizedNumber("72.5")).toBe(72.5);
    expect(parseLocalizedNumber("۷۲٫۵")).toBe(72.5);
    expect(parseLocalizedNumber("٧٢,٥")).toBe(72.5);
    expect(parseLocalizedNumber("")).toBeNaN();
  });
});
