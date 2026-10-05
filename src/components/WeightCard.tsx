"use client";

import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { Plus, TrendingDown, TrendingUp } from "lucide-react";
import { parseDayKey } from "@/lib/date";
import { parseLocalizedNumber } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useStore, type WeightEntry } from "@/lib/store";

const W = 320;
const H = 120;
const PAD = 8;

/** Line chart of the weight log, with the target as a dashed line. */
function WeightChart({ entries, target }: { entries: WeightEntry[]; target?: number }) {
  const values = entries.map((e) => e.kg);
  const lo = Math.min(...values, target ?? Infinity) - 1;
  const hi = Math.max(...values, target ?? -Infinity) + 1;
  const x = (i: number) => PAD + (entries.length === 1 ? (W - 2 * PAD) / 2 : (i / (entries.length - 1)) * (W - 2 * PAD));
  const y = (kg: number) => PAD + ((hi - kg) / (hi - lo)) * (H - 2 * PAD);
  const line = entries.map((e, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(e.kg).toFixed(1)}`).join(" ");
  const area = `${line} L${x(entries.length - 1)},${H} L${x(0)},${H} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-32 w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="weight-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {target !== undefined && (
        <line x1={0} x2={W} y1={y(target)} y2={y(target)} stroke="var(--muted)" strokeDasharray="4 4" strokeWidth={1} />
      )}
      {entries.length > 1 && <path d={area} fill="url(#weight-fill)" />}
      <motion.path
        d={line}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      />
      {entries.length > 0 && (
        <circle cx={x(entries.length - 1)} cy={y(entries[entries.length - 1].kg)} r={4} fill="var(--accent)" />
      )}
    </svg>
  );
}

export function WeightCard() {
  const { t, num, tag } = useI18n();
  const weights = useStore((s) => s.weights);
  const plan = useStore((s) => s.plan);
  const logWeight = useStore((s) => s.logWeight);
  const [value, setValue] = useState("");

  const recent = weights.slice(-30);
  const latest = weights.at(-1);
  const first = weights[0];
  const delta = latest && first ? latest.kg - first.kg : 0;
  const Trend = delta <= 0 ? TrendingDown : TrendingUp;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const kg = parseLocalizedNumber(value);
    if (kg >= 35 && kg <= 250) {
      logWeight(Math.round(kg * 10) / 10);
      setValue("");
    }
  };

  return (
    <section className="card flex flex-col p-5 sm:p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-bold">{t.weightTitle}</h2>
        {latest && (
          <span className="text-xs text-muted">
            {parseDayKey(latest.day).toLocaleDateString(tag, { month: "short", day: "numeric" })}
          </span>
        )}
      </div>

      {latest ? (
        <>
          <div className="mt-2 flex items-end gap-3">
            <span className="text-4xl font-extrabold tabular-nums">{num(latest.kg, 1)}</span>
            <span className="pb-1 text-muted">{t.kg}</span>
            {weights.length > 1 && (
              <span
                className={`ms-auto mb-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  (plan?.type === "gain" ? delta >= 0 : delta <= 0) ? "bg-fat/15 text-fat" : "bg-protein/15 text-protein"
                }`}
              >
                <Trend className="size-3.5" />
                {num(Math.abs(delta), 1)} {t.kg} {t.change}
              </span>
            )}
          </div>
          <div className="mt-3">
            <WeightChart entries={recent} target={plan && plan.type !== "maintain" ? plan.targetWeightKg : undefined} />
          </div>
        </>
      ) : (
        <p className="my-6 text-sm text-muted">{t.noWeights}</p>
      )}

      <form onSubmit={submit} className="mt-auto flex gap-2 pt-4">
        <input
          inputMode="decimal"
          placeholder={latest ? num(latest.kg, 1) : "75"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label={`${t.weightTitle} (${t.kg})`}
          className="min-w-0 flex-1 rounded-full border border-line bg-surface-2 px-4 py-2.5 outline-none focus:border-accent"
        />
        <button className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-bg">
          <Plus className="size-4" />
          {t.logWeight}
        </button>
      </form>
    </section>
  );
}
