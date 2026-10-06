"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Info, Minus, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { thumbnail } from "@/lib/image";
import { macroSplit, scaleItem, sumMacros } from "@/lib/nutrition";
import type { Analysis } from "@/lib/schema";
import { guessMealType, useStore, type MealType } from "@/lib/store";
import { MacroSplitBar } from "./MacroBar";

const STEPS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3];
const MEAL_TYPES: MealType[] = ["breakfast", "lunch", "snack", "dinner"];

const CONFIDENCE_STYLE = {
  low: "bg-protein/25 text-protein",
  medium: "bg-carbs/25 text-carbs",
  high: "bg-fat/25 text-fat",
};

type Props = { image: string; analysis: Analysis; mode: "live" | "demo"; onReset: () => void };

export function AnalysisResult({ image, analysis, mode, onReset }: Props) {
  const { t, num } = useI18n();
  const addMeal = useStore((s) => s.addMeal);
  const [steps, setSteps] = useState(() => analysis.items.map(() => STEPS.indexOf(1)));
  const [removed, setRemoved] = useState<Set<number>>(new Set());
  const [mealType, setMealType] = useState<MealType>(guessMealType);
  const [saved, setSaved] = useState(false);
  const saving = useRef(false);

  const items = useMemo(
    () =>
      analysis.items
        .map((item, i) => ({ i, item: scaleItem(item, STEPS[steps[i]]), factor: STEPS[steps[i]] }))
        .filter(({ i }) => !removed.has(i)),
    [analysis.items, steps, removed],
  );
  const totals = sumMacros(items.map((x) => x.item));
  const split = macroSplit(totals);

  const step = (i: number, delta: number) =>
    setSteps((s) => s.map((v, idx) => (idx === i ? Math.max(0, Math.min(STEPS.length - 1, v + delta)) : v)));

  const save = async () => {
    if (saving.current) return;
    saving.current = true;
    addMeal({
      type: mealType,
      title: analysis.dishName,
      thumb: await thumbnail(image).catch(() => undefined),
      items: items.map((x) => x.item),
    });
    setSaved(true);
    setTimeout(onReset, 1100);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- local data URL preview */}
        <img src={image} alt={analysis.dishName} className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white sm:p-6">
          <div>
            <div className="mb-2 flex flex-wrap gap-2 text-xs font-semibold">
              {analysis.isFood && (
                <span className={`rounded-full px-2.5 py-1 backdrop-blur ${CONFIDENCE_STYLE[analysis.confidence]}`}>
                  {t.confidence[analysis.confidence]}
                </span>
              )}
              {mode === "demo" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 backdrop-blur">
                  <span className="size-1.5 rounded-full bg-current" /> {t.demoBadge}
                </span>
              )}
            </div>
            <h2 className="font-display text-2xl font-bold leading-tight sm:text-3xl">{analysis.dishName}</h2>
          </div>
          {analysis.isFood && (
            <div className="shrink-0 text-end">
              <div className="font-display text-4xl font-bold tabular-nums text-accent drop-shadow-[0_0_18px_var(--glow)] sm:text-5xl">{num(totals.calories)}</div>
              <div className="text-sm opacity-80">{t.kcal}</div>
            </div>
          )}
        </div>
      </div>

      {!analysis.isFood ? (
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <p className="text-muted">{t.notFood}</p>
          <ResetButton onClick={onReset} label={t.retake} />
        </div>
      ) : (
        <div className="space-y-6 p-5 sm:p-6">
          <div>
            <MacroSplitBar split={split} />
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              {(["protein", "carbs", "fat"] as const).map((k) => (
                <div key={k} className="rounded-2xl border border-line bg-white/[0.03] px-2 py-3">
                  <div className="text-xl font-bold tabular-nums" style={{ color: `var(--${k})` }}>
                    {num(totals[k], 1)}
                    <span className="ms-0.5 text-xs font-medium">{t.g}</span>
                  </div>
                  <div className="text-xs text-muted">{t[k]}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-muted">{t.items}</h3>
            <ul className="divide-y divide-line">
              <AnimatePresence initial={false}>
                {items.map(({ i, item, factor }) => (
                  <motion.li
                    key={i}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-wrap items-center gap-x-3 gap-y-2 py-3"
                  >
                    <div className="min-w-0 basis-full sm:flex-1 sm:basis-auto">
                      <div className="truncate font-semibold">{item.name}</div>
                      <div className="text-xs text-muted">
                        {analysis.items[i].portion}
                        {factor !== 1 && <> × {num(factor, 2)}</>} · {num(item.grams)} {t.g} · {t.abbr.protein} {num(item.protein, 1)} · {t.abbr.carbs} {num(item.carbs, 1)} ·{" "}
                        {t.abbr.fat} {num(item.fat, 1)}
                      </div>
                    </div>
                    <div className="flex items-center rounded-full border border-line max-sm:me-auto" aria-label={t.portion}>
                      <button
                        onClick={() => step(i, -1)}
                        disabled={steps[i] === 0}
                        className="p-1.5 text-muted hover:text-ink disabled:opacity-30"
                        aria-label="−"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-10 text-center text-xs font-semibold tabular-nums">×{num(factor, 2)}</span>
                      <button
                        onClick={() => step(i, 1)}
                        disabled={steps[i] === STEPS.length - 1}
                        className="p-1.5 text-muted hover:text-ink disabled:opacity-30"
                        aria-label="+"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <div className="w-16 text-end font-bold tabular-nums">{num(item.calories)}</div>
                    <button
                      onClick={() => setRemoved((r) => new Set(r).add(i))}
                      className="rounded-full p-1.5 text-muted hover:bg-protein/10 hover:text-protein"
                      aria-label={t.remove}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>

          {analysis.notes && (
            <p className="flex gap-2 rounded-2xl border border-line bg-white/[0.03] p-3 text-sm text-muted">
              <Info className="mt-0.5 size-4 shrink-0" />
              {analysis.notes}
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 rounded-full bg-white/[0.04] p-1 text-sm">
              {MEAL_TYPES.map((m) => (
                <button
                  key={m}
                  onClick={() => setMealType(m)}
                  className={`flex-1 rounded-full px-2 py-2 font-medium transition ${
                    mealType === m ? "seg-on" : "text-muted hover:text-ink"
                  }`}
                >
                  {t.mealTypes[m]}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <ResetButton onClick={onReset} label={t.retake} />
              <button
                onClick={save}
                disabled={saved || items.length === 0}
                className="btn-primary inline-flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-full px-6 py-3 font-semibold disabled:opacity-60 sm:flex-none"
              >
                {saved ? <Check className="size-5" /> : <Plus className="size-5" />}
                {saved ? t.added : t.addToLog}
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
}

function ResetButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="btn-ghost inline-flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-3 text-sm font-semibold"
    >
      <RotateCcw className="size-4" />
      {label}
    </button>
  );
}
