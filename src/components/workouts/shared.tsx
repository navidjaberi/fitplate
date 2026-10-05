"use client";

import { useMemo } from "react";
import { useI18n } from "@/lib/i18n";
import { EXERCISES, type Prescription } from "@/lib/workouts";

/** Weekday indexes (Date#getDay) in the order a week is read: Saturday first in Persian, Monday first in English. */
export function useWeekOrder() {
  const { locale } = useI18n();
  return locale === "fa" ? [6, 0, 1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 0];
}

/** Localized weekday names indexed by Date#getDay. */
export function useWeekdayNames(style: "short" | "long" = "short") {
  const { tag } = useI18n();
  return useMemo(() => {
    // 2026-10-04 is a Sunday.
    return Array.from({ length: 7 }, (_, i) => new Date(2026, 9, 4 + i).toLocaleDateString(tag, { weekday: style }));
  }, [tag, style]);
}

export function useExerciseName() {
  const { locale } = useI18n();
  return (id: string) => EXERCISES[id]?.name[locale] ?? id;
}

/** "3 × 8–12" or "3 × 30–60 s". */
export function useDose() {
  const { t, num } = useI18n();
  return (p: Prescription) => {
    const unit = EXERCISES[p.exerciseId]?.unit === "seconds" ? ` ${t.wkSec}` : "";
    return `${num(p.sets)} × ${num(p.reps[0])}–${num(p.reps[1])}${unit}`;
  };
}
