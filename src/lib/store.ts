"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { dayKey } from "./date";
import { macroTargets, planTargets, sumMacros, type Activity, type GoalPlan, type Macros, type Sex } from "./nutrition";
import type { FoodItem, Locale } from "./schema";

export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export type Meal = {
  id: string;
  day: string;
  createdAt: string;
  type: MealType;
  title: string;
  thumb?: string;
  items: FoodItem[];
  totals: Macros;
};

export type Profile = { sex: Sex; age: number; heightCm: number; weightKg: number; activity: Activity };

export type WeightEntry = { day: string; kg: number };

type State = {
  locale: Locale;
  profile: Profile | null;
  plan: GoalPlan | null;
  /** Daily targets. Derived from profile + plan unless the user edited them by hand. */
  goal: Macros;
  customTargets: boolean;
  meals: Meal[];
  weights: WeightEntry[];
  setLocale: (locale: Locale) => void;
  /** Save profile and goal from onboarding or the profile page, and recompute targets. */
  setPlan: (profile: Profile, plan: GoalPlan) => void;
  /** Override the computed targets by hand. Pass null to go back to computed ones. */
  setCustomTargets: (targets: Macros | null) => void;
  logWeight: (kg: number) => void;
  addMeal: (meal: Omit<Meal, "id" | "day" | "createdAt" | "totals">) => void;
  removeMeal: (id: string) => void;
  clearAll: () => void;
};

const DEFAULT_CALORIES = 2000;
const DEFAULT_GOAL: Macros = { calories: DEFAULT_CALORIES, ...macroTargets(DEFAULT_CALORIES) };

/** Keep one weight entry per day, sorted oldest first. */
function upsertWeight(weights: WeightEntry[], entry: WeightEntry) {
  return [...weights.filter((w) => w.day !== entry.day), entry].sort((a, b) => a.day.localeCompare(b.day));
}

export const useStore = create<State>()(
  persist(
    (set) => ({
      locale: "en",
      profile: null,
      plan: null,
      goal: DEFAULT_GOAL,
      customTargets: false,
      meals: [],
      weights: [],
      setLocale: (locale) => set({ locale }),
      setPlan: (profile, plan) =>
        set((s) => ({
          profile,
          plan,
          goal: s.customTargets ? s.goal : planTargets(profile, plan),
          weights: upsertWeight(s.weights, { day: dayKey(), kg: profile.weightKg }),
        })),
      setCustomTargets: (targets) =>
        set((s) => {
          if (targets) return { goal: targets, customTargets: true };
          const goal = s.profile && s.plan ? planTargets(s.profile, s.plan) : DEFAULT_GOAL;
          return { goal, customTargets: false };
        }),
      logWeight: (kg) =>
        set((s) => {
          const profile = s.profile ? { ...s.profile, weightKg: kg } : null;
          // Targets follow body weight, so recompute them unless they were set by hand.
          const goal = profile && s.plan && !s.customTargets ? planTargets(profile, s.plan) : s.goal;
          return { weights: upsertWeight(s.weights, { day: dayKey(), kg }), profile, goal };
        }),
      addMeal: (meal) =>
        set((s) => {
          const now = new Date();
          return {
            meals: [
              {
                ...meal,
                id: crypto.randomUUID(),
                day: dayKey(now),
                createdAt: now.toISOString(),
                totals: sumMacros(meal.items),
              },
              ...s.meals,
            ],
          };
        }),
      removeMeal: (id) => set((s) => ({ meals: s.meals.filter((m) => m.id !== id) })),
      clearAll: () => set({ meals: [], weights: [] }),
    }),
    {
      name: "fitplate",
      version: 2,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      migrate: (persisted, version) => {
        const state = persisted as Partial<State>;
        // v1 had a hand-set calorie goal and no plan or weight log.
        if (version < 2) return { ...state, plan: null, customTargets: true, weights: [] } as State;
        return state as State;
      },
    },
  ),
);

export function mealsForDay(meals: Meal[], day: string) {
  return meals.filter((m) => m.day === day);
}

/** Suggest a meal slot from the time of day. */
export function guessMealType(date = new Date()): MealType {
  const h = date.getHours();
  if (h < 11) return "breakfast";
  if (h < 16) return "lunch";
  if (h < 18) return "snack";
  return "dinner";
}
