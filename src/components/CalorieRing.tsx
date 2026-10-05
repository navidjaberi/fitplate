"use client";

import { motion } from "motion/react";
import { useI18n } from "@/lib/i18n";

export function CalorieRing({ eaten, goal, size = 200 }: { eaten: number; goal: number; size?: number }) {
  const { t, num } = useI18n();
  const stroke = size * 0.085;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = goal > 0 ? Math.min(eaten / goal, 1) : 0;
  const over = eaten > goal;
  const left = Math.abs(goal - eaten);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 overflow-visible">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--ring-track)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={over ? "var(--protein)" : "var(--accent)"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          style={{ filter: `drop-shadow(0 0 ${size * 0.04}px ${over ? "var(--protein)" : "var(--accent)"})` }}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - progress) }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="font-display text-4xl font-bold tracking-tight tabular-nums">{num(left)}</span>
        <span className="text-sm text-muted">
          {t.kcal} {over ? t.over : t.remaining}
        </span>
      </div>
    </div>
  );
}
