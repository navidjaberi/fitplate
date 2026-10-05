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

export type GoalType = "lose" | "maintain" | "gain";

export type GoalPlan = {
  type: GoalType;
  /** Planned change in kg per week (positive number; direction comes from `type`). */
  pace: number;
  targetWeightKg: number;
};

export type BodyProfile = Parameters<typeof dailyCalorieTarget>[0];

const KCAL_PER_KG = 7700;
/** Never plan below these, whatever the pace. */
const MIN_CALORIES = { male: 1500, female: 1200 } as const;
/** Protein per kg of body weight: higher while cutting to protect muscle. */
const PROTEIN_PER_KG: Record<GoalType, number> = { lose: 2, maintain: 1.6, gain: 1.8 };

/**
 * Daily calorie and macro targets for a person and goal.
 * Calories: maintenance ± the deficit or surplus for the pace (7700 kcal per kg).
 * Protein from body weight, fat at 25% of calories, carbs fill the rest.
 */
export function planTargets(body: BodyProfile, goal: GoalPlan): Macros {
  const maintenance = dailyCalorieTarget(body);
  const delta = goal.type === "maintain" ? 0 : (goal.pace * KCAL_PER_KG) / 7;
  const raw = goal.type === "lose" ? maintenance - delta : maintenance + delta;
  const calories = Math.round(Math.max(raw, MIN_CALORIES[body.sex]) / 10) * 10;

  const protein = Math.round(body.weightKg * PROTEIN_PER_KG[goal.type]);
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  return { calories, protein, carbs, fat };
}

/** Weeks to reach the target weight at the planned pace, or null when there is nothing to reach. */
export function weeksToGoal(currentKg: number, goal: GoalPlan): number | null {
  if (goal.type === "maintain" || goal.pace <= 0) return null;
  const diff = goal.type === "lose" ? currentKg - goal.targetWeightKg : goal.targetWeightKg - currentKg;
  return diff > 0 ? Math.ceil(diff / goal.pace) : null;
}

/** Body mass index, rounded to one decimal. */
export function bmi(weightKg: number, heightCm: number): number {
  const m = heightCm / 100;
  return Math.round((weightKg / (m * m)) * 10) / 10;
}
