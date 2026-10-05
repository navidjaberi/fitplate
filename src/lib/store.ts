"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { dayKey } from "./date";
import { macroTargets, planTargets, sumMacros, type Activity, type GoalPlan, type Macros, type Sex } from "./nutrition";
import type { FoodItem, Locale } from "./schema";
import { buildProgram, startLog, type LoggedSet, type Program, type WorkoutLog, type WorkoutSetup } from "./workouts";

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
  program: Program | null;
  /** Finished sessions, newest first. */
  workouts: WorkoutLog[];
  /** The session in progress, kept here so a reload doesn't lose it. */
  activeWorkout: WorkoutLog | null;
  setLocale: (locale: Locale) => void;
  /** Save profile and goal from onboarding or the profile page, and recompute targets. */
  setPlan: (profile: Profile, plan: GoalPlan) => void;
  /** Override the computed targets by hand. Pass null to go back to computed ones. */
  setCustomTargets: (targets: Macros | null) => void;
  logWeight: (kg: number) => void;
  addMeal: (meal: Omit<Meal, "id" | "day" | "createdAt" | "totals">) => void;
  removeMeal: (id: string) => void;
  /** Build (or rebuild) the weekly program from the setup and the current goal. */
  createProgram: (setup: WorkoutSetup) => void;
  /** Start a session for one of the program's days. */
  startWorkout: (dayIndex: number) => void;
  updateSet: (exercise: number, set: number, patch: Partial<LoggedSet>) => void;
  addSet: (exercise: number) => void;
  finishWorkout: () => void;
  discardWorkout: () => void;
  removeWorkout: (id: string) => void;
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
      program: null,
      workouts: [],
      activeWorkout: null,
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
      createProgram: (setup) => set((s) => ({ program: buildProgram(setup, s.plan?.type ?? "maintain") })),
      startWorkout: (dayIndex) =>
        set((s) => {
          const day = s.program?.days[dayIndex];
          return day ? { activeWorkout: startLog(day, s.workouts, dayKey()) } : {};
        }),
      updateSet: (exercise, setIndex, patch) =>
        set((s) => {
          if (!s.activeWorkout) return {};
          const entries = s.activeWorkout.entries.map((e, i) =>
            i !== exercise ? e : { ...e, sets: e.sets.map((x, j) => (j === setIndex ? { ...x, ...patch } : x)) },
          );
          return { activeWorkout: { ...s.activeWorkout, entries } };
        }),
      addSet: (exercise) =>
        set((s) => {
          if (!s.activeWorkout) return {};
          const entries = s.activeWorkout.entries.map((e, i) => {
            if (i !== exercise) return e;
            const last = e.sets.at(-1) ?? { kg: 0, reps: 8, done: false };
            return { ...e, sets: [...e.sets, { ...last, done: false }] };
          });
          return { activeWorkout: { ...s.activeWorkout, entries } };
        }),
      finishWorkout: () =>
        set((s) => {
          if (!s.activeWorkout) return {};
          // Keep only exercises with at least one completed set.
          const entries = s.activeWorkout.entries
            .map((e) => ({ ...e, sets: e.sets.filter((x) => x.done) }))
            .filter((e) => e.sets.length);
          if (!entries.length) return { activeWorkout: null };
          const log = { ...s.activeWorkout, entries, finishedAt: new Date().toISOString() };
          return { activeWorkout: null, workouts: [log, ...s.workouts] };
        }),
      discardWorkout: () => set({ activeWorkout: null }),
      removeWorkout: (id) => set((s) => ({ workouts: s.workouts.filter((w) => w.id !== id) })),
      clearAll: () => set({ meals: [], weights: [], workouts: [], activeWorkout: null }),
    }),
    {
      name: "fitplate",
      version: 3,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      migrate: (persisted, version) => {
        const state = persisted as Partial<State>;
        // v1 had a hand-set calorie goal and no plan or weight log.
        let next = state;
        if (version < 2) next = { ...next, plan: null, customTargets: true, weights: [] };
        // v3 adds workout programs and logs.
        if (version < 3) next = { ...next, program: null, workouts: [], activeWorkout: null };
        return next as State;
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
