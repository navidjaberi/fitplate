"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AnimatePresence } from "motion/react";
import { Camera } from "lucide-react";
import { lastDays, parseDayKey } from "@/lib/date";
import { useI18n } from "@/lib/i18n";
import { sumMacros } from "@/lib/nutrition";
import { useStore, type Meal } from "@/lib/store";
import { MealCard } from "./MealCard";
import { useApp } from "./Providers";
import { WeekChart } from "./WeekChart";

export function HistoryView() {
  const { t, num, tag } = useI18n();
  const { hydrated } = useApp();
  const meals = useStore((s) => s.meals);
  const goal = useStore((s) => s.goal);

  const week = useMemo(() => {
    const days = lastDays(7);
    return days.map((day) => ({
      day,
      calories: sumMacros(meals.filter((m) => m.day === day).map((m) => m.totals)).calories,
    }));
  }, [meals]);

  const byDay = useMemo(() => {
    const groups = new Map<string, Meal[]>();
    for (const m of meals) groups.set(m.day, [...(groups.get(m.day) ?? []), m]);
    return [...groups.entries()].sort(([a], [b]) => b.localeCompare(a));
  }, [meals]);

  if (!hydrated) return <div className="card h-96 animate-pulse" />;

  const logged = week.filter((d) => d.calories > 0);
  const avg = logged.length ? logged.reduce((s, d) => s + d.calories, 0) / logged.length : 0;
  // A logged day counts as on target when it stays within 5% over the goal.
  const onTarget = logged.filter((d) => d.calories <= goal.calories * 1.05).length;

  const stats = [
    { label: t.avgPerDay, value: num(avg), unit: t.kcal },
    { label: t.daysOnTarget, value: `${num(onTarget)} / ${num(7)}` },
    { label: t.totalMeals, value: num(meals.length) },
  ];

  return (
    <div className="space-y-6">
      <section className="card p-5 sm:p-6">
        <h1 className="mb-6 text-2xl font-extrabold tracking-tight">{t.historyTitle}</h1>
        <WeekChart days={week} goal={goal.calories} />
        <div className="mt-6 grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-surface-2 p-3 sm:p-4">
              <div className="text-xl font-bold tabular-nums sm:text-2xl">
                {s.value}
                {s.unit && <span className="ms-1 text-xs font-medium text-muted">{s.unit}</span>}
              </div>
              <div className="mt-1 text-xs text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {byDay.length === 0 ? (
        <section className="card flex flex-col items-center gap-4 p-10 text-center">
          <p className="text-muted">{t.noHistory}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-semibold text-accent-ink"
          >
            <Camera className="size-4" /> {t.takePhoto}
          </Link>
        </section>
      ) : (
        byDay.map(([day, dayMeals]) => {
          const total = sumMacros(dayMeals.map((m) => m.totals));
          return (
            <section key={day} className="card p-4 sm:p-5">
              <div className="mb-2 flex items-baseline justify-between px-2">
                <h2 className="font-bold">
                  {parseDayKey(day).toLocaleDateString(tag, { weekday: "long", month: "long", day: "numeric" })}
                </h2>
                <span className="text-sm text-muted">
                  <b className="text-ink tabular-nums">{num(total.calories)}</b> {t.kcal}
                </span>
              </div>
              <ul className="space-y-1">
                <AnimatePresence initial={false}>
                  {dayMeals.map((m) => (
                    <MealCard key={m.id} meal={m} />
                  ))}
                </AnimatePresence>
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
