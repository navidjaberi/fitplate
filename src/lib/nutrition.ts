import type { FoodItem } from "./schema";

export type Macros = { calories: number; protein: number; carbs: number; fat: number };

export const ZERO: Macros = { calories: 0, protein: 0, carbs: 0, fat: 0 };

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Scale one item by a portion multiplier (0.5 = half, 2 = double). */
export function scaleItem(item: FoodItem, factor: number): FoodItem {
  return {
    ...item,
    grams: Math.round(item.grams * factor),
    calories: Math.round(item.calories * factor),
    protein: round1(item.protein * factor),
    carbs: round1(item.carbs * factor),
    fat: round1(item.fat * factor),
  };
}

export function sumMacros(items: Macros[]): Macros {
  const total = items.reduce(
    (acc, i) => ({
      calories: acc.calories + i.calories,
      protein: acc.protein + i.protein,
      carbs: acc.carbs + i.carbs,
      fat: acc.fat + i.fat,
    }),
    ZERO,
  );
  return {
    calories: Math.round(total.calories),
    protein: round1(total.protein),
    carbs: round1(total.carbs),
    fat: round1(total.fat),
  };
}

/** Share of calories coming from each macro (4/4/9 kcal per gram). */
export function macroSplit(m: Macros) {
  const p = m.protein * 4;
  const c = m.carbs * 4;
  const f = m.fat * 9;
  const total = p + c + f;
  if (total === 0) return { protein: 0, carbs: 0, fat: 0 };
  return { protein: p / total, carbs: c / total, fat: f / total };
}

export type Sex = "male" | "female";
export type Activity = "sedentary" | "light" | "moderate" | "active";

const ACTIVITY_FACTOR: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
};

/** Mifflin-St Jeor resting energy times an activity factor, rounded to 10 kcal. */
export function dailyCalorieTarget(input: {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: Activity;
}): number {
  const base =
    10 * input.weightKg + 6.25 * input.heightCm - 5 * input.age + (input.sex === "male" ? 5 : -161);
  return Math.round((base * ACTIVITY_FACTOR[input.activity]) / 10) * 10;
}

/** Gram targets for a calorie goal, using a 30% protein / 40% carbs / 30% fat split. */
export function macroTargets(calories: number): Omit<Macros, "calories"> {
  return {
    protein: Math.round((calories * 0.3) / 4),
    carbs: Math.round((calories * 0.4) / 4),
    fat: Math.round((calories * 0.3) / 9),
  };
}
