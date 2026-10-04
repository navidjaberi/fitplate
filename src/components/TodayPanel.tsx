"use client";

import { AnimatePresence } from "motion/react";
import { dayKey } from "@/lib/date";
import { useI18n } from "@/lib/i18n";
import { sumMacros } from "@/lib/nutrition";
import { mealsForDay, useStore } from "@/lib/store";
import { CalorieRing } from "./CalorieRing";
import { MacroBar } from "./MacroBar";
import { MealCard } from "./MealCard";
import { useApp } from "./Providers";

export function TodayPanel() {
  const { t, num, tag } = useI18n();
  const { hydrated } = useApp();
  const meals = useStore((s) => s.meals);
  const goal = useStore((s) => s.goal);

  const today = mealsForDay(meals, dayKey());
  const totals = sumMacros(today.map((m) => m.totals));
  const dateLabel = new Date().toLocaleDateString(tag, { weekday: "long", month: "long", day: "numeric" });

  if (!hydrated) return <div className="card h-[32rem] animate-pulse" />;

  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-xl font-bold">{t.today}</h2>
        <span className="text-sm text-muted">{dateLabel}</span>
      </div>

      <div className="flex flex-col items-center gap-4">
        <CalorieRing eaten={totals.calories} goal={goal.calories} />
        <div className="flex w-full justify-around text-center text-sm">
          <div>
            <div className="text-lg font-bold tabular-nums">{num(totals.calories)}</div>
            <div className="text-muted">{t.eaten}</div>
          </div>
          <div className="w-px bg-line" />
          <div>
            <div className="text-lg font-bold tabular-nums">{num(goal.calories)}</div>
            <div className="text-muted">{t.goal}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <MacroBar macro="protein" value={totals.protein} target={goal.protein} />
        <MacroBar macro="carbs" value={totals.carbs} target={goal.carbs} />
        <MacroBar macro="fat" value={totals.fat} target={goal.fat} />
      </div>

      <div className="mt-6 border-t border-line pt-4">
        {today.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">{t.noMeals}</p>
        ) : (
          <ul className="-mx-2 space-y-1">
            <AnimatePresence initial={false}>
              {today.map((m) => (
                <MealCard key={m.id} meal={m} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </section>
  );
}
