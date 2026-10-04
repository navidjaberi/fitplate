"use client";

import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n";

export type MacroKey = "protein" | "carbs" | "fat";

const COLOR: Record<MacroKey, string> = {
  protein: "var(--protein)",
  carbs: "var(--carbs)",
  fat: "var(--fat)",
};

export function MacroBar({ macro, value, target }: { macro: MacroKey; value: number; target: number }) {
  const { t, num } = useI18n();
  const pct = target > 0 ? Math.min(value / target, 1) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between text-sm">
        <span className="flex items-center gap-2 font-medium">
          <span className="size-2.5 rounded-full" style={{ background: COLOR[macro] }} />
          {t[macro]}
        </span>
        <span className="tabular-nums text-muted">
          <b className="text-ink">{num(value)}</b> / {num(target)} {t.g}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
        <motion.div
          className="h-full rounded-full"
          style={{ background: COLOR[macro] }}
          initial={{ width: 0 }}
          animate={{ width: `${pct * 100}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

/** Stacked bar showing where a meal's calories come from. */
export function MacroSplitBar({ split }: { split: Record<MacroKey, number> }) {
  return (
    <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-surface-2">
      {(Object.keys(COLOR) as MacroKey[]).map((k) => (
        <motion.div
          key={k}
          className="h-full first:rounded-s-full last:rounded-e-full"
          style={{ background: COLOR[k] }}
          initial={{ width: 0 }}
          animate={{ width: `${split[k] * 100}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  );
}
