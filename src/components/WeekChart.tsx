"use client";

import { motion } from "motion/react";
import { parseDayKey } from "@/lib/date";
import { useI18n } from "@/lib/i18n";

type Day = { day: string; calories: number };

export function WeekChart({ days, goal }: { days: Day[]; goal: number }) {
  const { t, num, tag } = useI18n();
  const max = Math.max(goal * 1.25, ...days.map((d) => d.calories), 1);
  const goalPct = (goal / max) * 100;

  return (
    <div className="relative h-64">
      <div
        className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-accent/40"
        style={{ bottom: `calc(2rem + (100% - 2rem) * ${goalPct / 100})` }}
      >
        <span className="absolute -top-5 end-0 text-xs font-medium text-muted">
          {t.goal} {num(goal)}
        </span>
      </div>
      <div className="flex h-full items-end gap-2 sm:gap-4">
        {days.map((d, i) => {
          const pct = (d.calories / max) * 100;
          const over = d.calories > goal;
          const date = parseDayKey(d.day);
          return (
            <div key={d.day} className="group flex h-full flex-1 flex-col items-center justify-end">
              <div className="relative flex w-full flex-1 items-end justify-center">
                <motion.div
                  className="relative w-full max-w-12 rounded-t-xl rounded-b-md transition-[filter] group-hover:brightness-125"
                  style={
                    d.calories === 0
                      ? { background: "rgb(255 255 255 / 0.06)" }
                      : {
                          background: `linear-gradient(180deg, var(--${over ? "protein" : "accent"}), color-mix(in srgb, var(--${over ? "protein" : "accent"}) 25%, transparent))`,
                          boxShadow: `0 0 24px -4px var(--${over ? "protein" : "accent"}), inset 0 1px 0 rgb(255 255 255 / 0.5)`,
                        }
                  }
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(pct, 1.5)}%` }}
                  transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                >
                  {d.calories > 0 && (
                    <span className="absolute -top-6 inset-x-0 text-center text-xs font-semibold tabular-nums opacity-0 transition group-hover:opacity-100">
                      {num(d.calories)}
                    </span>
                  )}
                </motion.div>
              </div>
              <div className="mt-2 flex h-6 items-center text-xs text-muted">
                {date.toLocaleDateString(tag, { weekday: "short" })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
