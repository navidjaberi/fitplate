"use client";

import type { ReactNode } from "react";
import { Dumbbell, Flame, Scale, TrendingDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { dailyCalorieTarget, type Activity, type GoalPlan, type GoalType, type Macros } from "@/lib/nutrition";
import type { Profile } from "@/lib/store";

export const ACTIVITIES: Activity[] = ["sedentary", "light", "moderate", "active"];
const GOALS: GoalType[] = ["lose", "maintain", "gain"];
const PACES = [0.25, 0.5, 0.75, 1];
const GOAL_ICON = { lose: TrendingDown, maintain: Scale, gain: Dumbbell };

export const DEFAULT_PROFILE: Profile = { sex: "male", age: 28, heightCm: 175, weightKg: 75, activity: "light" };
export const DEFAULT_PLAN: GoalPlan = { type: "lose", pace: 0.5, targetWeightKg: 70 };

export const inputClass =
  "w-full rounded-2xl border border-line bg-surface-2 px-4 py-3 text-base outline-none transition focus:border-accent focus:shadow-[0_0_0_4px_rgb(198_255_61/0.12)]";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

function NumberInput({ value, onChange, min, max, step = 1 }: { value: number; onChange: (n: number) => void; min: number; max: number; step?: number }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      min={min}
      max={max}
      step={step}
      value={Number.isFinite(value) ? value : ""}
      onChange={(e) => onChange(Number(e.target.value))}
      className={inputClass}
    />
  );
}

export function Choice({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full rounded-2xl border p-4 text-start transition duration-200 active:scale-[0.98] ${
        selected
          ? "border-accent/70 bg-accent/[0.07] shadow-[0_0_0_1px_var(--accent),0_12px_40px_-16px_var(--glow)]"
          : "border-line bg-white/[0.03] hover:border-white/20"
      }`}
    >
      {children}
    </button>
  );
}

export function BodyFields({ value, onChange }: { value: Profile; onChange: (p: Profile) => void }) {
  const { t } = useI18n();
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="col-span-2 grid grid-cols-2 gap-2 rounded-2xl bg-white/[0.04] p-1">
        {(["male", "female"] as const).map((sex) => (
          <button
            key={sex}
            type="button"
            onClick={() => set("sex", sex)}
            className={`rounded-xl py-2.5 font-medium transition ${value.sex === sex ? "seg-on" : "text-muted"}`}
          >
            {t[sex]}
          </button>
        ))}
      </div>
      <Field label={t.age}>
        <NumberInput value={value.age} onChange={(n) => set("age", n)} min={14} max={99} />
      </Field>
      <Field label={t.height}>
        <NumberInput value={value.heightCm} onChange={(n) => set("heightCm", n)} min={120} max={230} />
      </Field>
      <Field label={t.weight}>
        <NumberInput value={value.weightKg} onChange={(n) => set("weightKg", n)} min={35} max={250} step={0.1} />
      </Field>
    </div>
  );
}

export function ActivityPicker({ value, onChange }: { value: Activity; onChange: (a: Activity) => void }) {
  const { t } = useI18n();
  return (
    <div className="grid gap-3">
      {ACTIVITIES.map((a, i) => (
        <Choice key={a} selected={value === a} onClick={() => onChange(a)}>
          <div className="flex items-center gap-3">
            <div className="flex gap-0.5" aria-hidden>
              {ACTIVITIES.map((_, j) => (
                <span key={j} className={`h-5 w-1.5 rounded-full ${j <= i ? "bg-accent" : "bg-white/10"}`} />
              ))}
            </div>
            <div>
              <div className="font-semibold">{t.activities[a]}</div>
              <div className="text-sm text-muted">{t.activityHints[a]}</div>
            </div>
          </div>
        </Choice>
      ))}
    </div>
  );
}

export function GoalPicker({ value, weightKg, onChange }: { value: GoalPlan; weightKg: number; onChange: (g: GoalPlan) => void }) {
  const { t, num } = useI18n();
  const pick = (type: GoalType) =>
    onChange({
      type,
      pace: type === "maintain" ? 0 : value.pace || 0.5,
      // Suggest a sensible target in the right direction when switching goals.
      targetWeightKg: type === "lose" ? Math.round(weightKg * 0.92) : type === "gain" ? Math.round(weightKg * 1.05) : weightKg,
    });

  return (
    <div className="space-y-5">
      <div className="grid gap-3">
        {GOALS.map((g) => {
          const Icon = GOAL_ICON[g];
          return (
            <Choice key={g} selected={value.type === g} onClick={() => pick(g)}>
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-10 items-center justify-center rounded-xl transition ${
                    value.type === g ? "bg-accent text-accent-ink" : "bg-white/5"
                  }`}
                >
                  <Icon className="size-5" />
                </div>
                <div>
                  <div className="font-semibold">{t.goalTypes[g]}</div>
                  <div className="text-sm text-muted">{t.goalHints[g]}</div>
                </div>
              </div>
            </Choice>
          );
        })}
      </div>

      {value.type !== "maintain" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={`${t.targetWeight} (${t.kg})`}>
            <NumberInput
              value={value.targetWeightKg}
              onChange={(n) => onChange({ ...value, targetWeightKg: n })}
              min={35}
              max={250}
              step={0.5}
            />
          </Field>
          <Field label={`${t.pace} (${t.kg} ${t.perWeek})`}>
            <div className="grid grid-cols-4 gap-1 rounded-2xl bg-white/[0.04] p-1">
              {PACES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onChange({ ...value, pace: p })}
                  className={`rounded-xl py-2.5 text-sm font-semibold tabular-nums transition ${
                    value.pace === p ? "seg-on" : "text-muted"
                  }`}
                >
                  {num(p, 2)}
                </button>
              ))}
            </div>
          </Field>
        </div>
      )}
    </div>
  );
}

export function TargetsSummary({ targets, profile }: { targets: Macros; profile: Profile }) {
  const { t, num } = useI18n();
  const macros = [
    { key: "protein", value: targets.protein },
    { key: "carbs", value: targets.carbs },
    { key: "fat", value: targets.fat },
  ] as const;
  return (
    <div>
      <div className="relative flex items-center gap-4 overflow-hidden rounded-3xl border border-accent/30 bg-[radial-gradient(120%_120%_at_0%_0%,rgb(198_255_61/0.18),transparent_60%)] p-5">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-ink shadow-[0_0_30px_-4px_var(--glow)]">
          <Flame className="size-7" />
        </div>
        <div>
          <div className="font-display text-4xl font-bold tabular-nums">
            {num(targets.calories)} <span className="text-base font-medium text-muted">{t.kcal}</span>
          </div>
          <div className="text-sm text-muted">
            {t.maintenance}: {num(dailyCalorieTarget(profile))} {t.kcal}
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {macros.map((m) => (
          <div key={m.key} className="rounded-2xl border border-line bg-white/[0.03] p-3 text-center">
            <div className="text-xl font-bold tabular-nums" style={{ color: `var(--${m.key})` }}>
              {num(m.value)}
              <span className="ms-0.5 text-xs font-medium">{t.g}</span>
            </div>
            <div className="text-xs text-muted">{t[m.key]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Basic sanity bounds so a half-typed number never produces a nonsense plan. */
export function isProfileValid(p: Profile) {
  return p.age >= 14 && p.age <= 99 && p.heightCm >= 120 && p.heightCm <= 230 && p.weightKg >= 35 && p.weightKg <= 250;
}

export function isPlanValid(g: GoalPlan, weightKg: number) {
  if (g.type === "maintain") return true;
  if (!(g.targetWeightKg >= 35 && g.targetWeightKg <= 250)) return false;
  return g.type === "lose" ? g.targetWeightKg < weightKg : g.targetWeightKg > weightKg;
}
