"use client";

import { motion } from "motion/react";
import { Trash2, Utensils } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useStore, type Meal } from "@/lib/store";

export function MealCard({ meal }: { meal: Meal }) {
  const { t, num, tag } = useI18n();
  const removeMeal = useStore((s) => s.removeMeal);
  const time = new Date(meal.createdAt).toLocaleTimeString(tag, { hour: "2-digit", minute: "2-digit" });

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      className="group flex items-center gap-3 rounded-2xl p-2 transition hover:bg-surface-2"
    >
      {meal.thumb ? (
        // eslint-disable-next-line @next/next/no-img-element -- stored data URL thumbnail
        <img src={meal.thumb} alt="" className="size-14 shrink-0 rounded-xl object-cover" />
      ) : (
        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-muted">
          <Utensils className="size-5" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="truncate font-semibold">{meal.title}</div>
        <div className="text-xs text-muted">
          {t.mealTypes[meal.type]} · {time}
        </div>
      </div>
      <div className="text-end">
        <div className="font-bold tabular-nums">{num(meal.totals.calories)}</div>
        <div className="text-xs text-muted">{t.kcal}</div>
      </div>
      <button
        onClick={() => removeMeal(meal.id)}
        aria-label={t.delete}
        className="rounded-full p-1.5 text-muted opacity-0 transition group-hover:opacity-100 hover:text-protein focus:opacity-100"
      >
        <Trash2 className="size-4" />
      </button>
    </motion.li>
  );
}
