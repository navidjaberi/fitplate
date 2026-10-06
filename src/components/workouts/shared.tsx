"use client";

import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { EXERCISES, type Prescription } from "@/lib/workouts";

export function useWeekOrder() {
  const { locale } = useI18n();
  return locale === "fa" ? [6, 0, 1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 0];
}

export function useWeekdayNames(style: "short" | "long" = "short") {
  const { tag } = useI18n();
  return useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => new Date(2026, 9, 4 + i).toLocaleDateString(tag, { weekday: style }));
  }, [tag, style]);
}

export function useExerciseName() {
  const { locale } = useI18n();
  return (id: string) => EXERCISES[id]?.name[locale] ?? id;
}

export function useDose() {
  const { t, num } = useI18n();
  return (p: Prescription) => {
    const unit = EXERCISES[p.exerciseId]?.unit === "seconds" ? ` ${t.wkSec}` : "";
    return `${num(p.sets)} × ${num(p.reps[0])}–${num(p.reps[1])}${unit}`;
  };
}
