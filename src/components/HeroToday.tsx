"use client";

import { motion } from "motion/react";
import { dayKey } from "@/lib/date";
import { useI18n } from "@/lib/i18n";
import { sumMacros } from "@/lib/nutrition";
import { mealsForDay, useStore } from "@/lib/store";
import { Core3D } from "./three/Core3D";
import { AnimatedNumber } from "./ui/AnimatedNumber";
import { TiltCard } from "./ui/TiltCard";
import { MacroBar } from "./MacroBar";

export function HeroToday() {
  const { t, num, locale } = useI18n();
  const meals = useStore((s) => s.meals);
  const goal = useStore((s) => s.goal);
  const totals = sumMacros(mealsForDay(meals, dayKey()).map((m) => m.totals));

  const ratio = (v: number, target: number) => (target > 0 ? v / target : 0);
  const progress = ratio(totals.calories, goal.calories);
  const over = totals.calories > goal.calories;
  const left = Math.abs(goal.calories - totals.calories);

  return (
    <TiltCard max={3} className="overflow-hidden">
      <div className="grid items-center md:grid-cols-[1.1fr_1fr]">
        <div className="relative h-72 sm:h-80 md:h-[22rem]">
          <Core3D
            progress={progress}
            macros={{
              protein: ratio(totals.protein, goal.protein),
              carbs: ratio(totals.carbs, goal.carbs),
              fat: ratio(totals.fat, goal.fat),
            }}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-xs font-medium tracking-wide text-muted uppercase">
            {locale === "fa" ? `٪${num(Math.round(progress * 100))}` : `${num(Math.round(progress * 100))}%`} {t.of} {t.goal}
          </div>
        </div>

        <div className="p-6 pt-0 md:p-8 md:ps-2">
          <div className="text-sm font-medium text-muted">{t.today}</div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-1 flex items-baseline gap-2"
          >
            <AnimatedNumber
              value={left}
              className={`font-display text-6xl font-bold tracking-tight ${over ? "text-protein" : "text-accent"}`}
            />
            <span className="text-muted">
              {t.kcal} {over ? t.over : t.remaining}
            </span>
          </motion.div>

          <div className="mt-4 flex gap-6 text-sm">
            <div>
              <AnimatedNumber value={totals.calories} className="text-lg font-semibold" />
              <div className="text-muted">{t.eaten}</div>
            </div>
            <div className="w-px bg-line" />
            <div>
              <AnimatedNumber value={goal.calories} className="text-lg font-semibold" />
              <div className="text-muted">{t.goal}</div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <MacroBar macro="protein" value={totals.protein} target={goal.protein} />
            <MacroBar macro="carbs" value={totals.carbs} target={goal.carbs} />
            <MacroBar macro="fat" value={totals.fat} target={goal.fat} />
          </div>
        </div>
      </div>
    </TiltCard>
  );
}
