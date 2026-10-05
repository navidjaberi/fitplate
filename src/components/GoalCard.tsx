"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Pencil, Target } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { TiltCard } from "./ui/TiltCard";
import { bmi, weeksToGoal } from "@/lib/nutrition";
import { useStore } from "@/lib/store";

export function GoalCard() {
  const { t, num } = useI18n();
  const profile = useStore((s) => s.profile);
  const plan = useStore((s) => s.plan);
  const weights = useStore((s) => s.weights);
  if (!profile || !plan) return null;

  const current = profile.weightKg;
  const start = weights[0]?.kg ?? current;
  const weeks = weeksToGoal(current, plan);
  const span = Math.abs(plan.targetWeightKg - start);
  const done = Math.abs(current - start);
  const progress = plan.type === "maintain" || span === 0 ? 1 : Math.min(done / span, 1);

  return (
    <TiltCard className="p-5 sm:p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-accent/12 text-accent">
            <Target className="size-5" />
          </div>
          <div>
            <div className="text-xs text-muted">{t.goalTitle}</div>
            <h2 className="font-display font-bold">{t.goalTypes[plan.type]}</h2>
          </div>
        </div>
        <Link href="/profile" aria-label={t.navProfile} className="rounded-full p-2 text-muted hover:bg-white/5 hover:text-ink">
          <Pencil className="size-4" />
        </Link>
      </div>

      {plan.type !== "maintain" && (
        <div className="mt-5">
          <div className="mb-2 flex justify-between text-sm tabular-nums">
            <span>
              {num(start, 1)} {t.kg}
            </span>
            <span className="font-semibold">
              {num(plan.targetWeightKg, 1)} {t.kg}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
            <motion.div
              className="h-full rounded-full bg-accent shadow-[0_0_12px_var(--glow)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <p className="mt-2 text-sm text-muted">{weeks ? t.weeksLeft(num(weeks)) : t.goalReached}</p>
        </div>
      )}

      <dl className="mt-5 grid grid-cols-3 gap-2 text-center [&>div]:px-1.5">
        <div className="rounded-2xl border border-line bg-white/[0.03] p-3">
          <dd className="font-bold tabular-nums">{num(bmi(current, profile.heightCm), 1)}</dd>
          <dt className="text-xs text-muted">{t.bmi}</dt>
        </div>
        <div className="rounded-2xl border border-line bg-white/[0.03] p-3">
          <dd className="font-bold tabular-nums">{plan.type === "maintain" ? "—" : num(plan.pace, 2)}</dd>
          <dt className="text-xs text-muted">
            {t.kg} {t.perWeek}
          </dt>
        </div>
        <div className="rounded-2xl border border-line bg-white/[0.03] p-3">
          <dd className="truncate text-[13px] leading-6 font-bold">{t.activities[profile.activity]}</dd>
          <dt className="text-xs text-muted">{t.activity}</dt>
        </div>
      </dl>
    </TiltCard>
  );
}
