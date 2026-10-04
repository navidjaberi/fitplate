"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { dayKey } from "./date";
import { macroTargets, sumMacros, type Activity, type Macros, type Sex } from "./nutrition";
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

type State = {
  locale: Locale;
  goal: Macros;
  profile: Profile | null;
  meals: Meal[];
  setLocale: (locale: Locale) => void;
  setGoal: (calories: number, profile?: Profile) => void;
  addMeal: (meal: Omit<Meal, "id" | "day" | "createdAt" | "totals">) => void;
  removeMeal: (id: string) => void;
  clearAll: () => void;
};

const DEFAULT_CALORIES = 2000;

export const useStore = create<State>()(
  persist(
    (set) => ({
      locale: "en",
      goal: { calories: DEFAULT_CALORIES, ...macroTargets(DEFAULT_CALORIES) },
      profile: null,
      meals: [],
      setLocale: (locale) => set({ locale }),
      setGoal: (calories, profile) =>
        set((s) => ({ goal: { calories, ...macroTargets(calories) }, profile: profile ?? s.profile })),
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
      clearAll: () => set({ meals: [] }),
    }),
    {
      name: "kalori",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
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
