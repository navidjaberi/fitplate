"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { dailyCalorieTarget, type Activity } from "@/lib/nutrition";
import { useStore, type Profile } from "@/lib/store";

const ACTIVITIES: Activity[] = ["sedentary", "light", "moderate", "active"];
const DEFAULT_PROFILE: Profile = { sex: "male", age: 30, heightCm: 175, weightKg: 75, activity: "light" };

export function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { t, num, locale } = useI18n();
  const { goal, profile, setGoal, setLocale, clearAll } = useStore();
  const [calories, setCalories] = useState(goal.calories);
  const [form, setForm] = useState<Profile>(profile ?? DEFAULT_PROFILE);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setCalories(goal.calories);
      setForm(profile ?? DEFAULT_PROFILE);
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, goal.calories, profile]);

  const suggested = dailyCalorieTarget(form);
  const update = <K extends keyof Profile>(key: K, value: Profile[K]) => setForm((f) => ({ ...f, [key]: value }));

  const save = () => {
    if (calories >= 800 && calories <= 6000) setGoal(calories, form);
    onClose();
  };

  const input =
    "w-full rounded-xl border border-line bg-surface-2 px-3 py-2 text-sm outline-none transition focus:border-accent";

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto w-[min(92vw,30rem)] rounded-3xl border border-line bg-surface p-0 text-ink shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <h2 className="text-lg font-bold">{t.settings}</h2>
        <button onClick={onClose} aria-label={t.close} className="rounded-full p-1.5 text-muted hover:bg-surface-2">
          <X className="size-5" />
        </button>
      </div>

      <div className="space-y-6 px-6 py-5">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">{t.dailyGoal}</span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={800}
              max={6000}
              step={10}
              value={calories}
              onChange={(e) => setCalories(Number(e.target.value))}
              className={`${input} text-lg font-bold`}
            />
            <span className="text-sm text-muted">{t.kcal}</span>
          </div>
        </label>

        <fieldset className="rounded-2xl bg-surface-2/60 p-4">
          <legend className="px-1 text-sm font-semibold">{t.calculate}</legend>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label>
              <span className="mb-1 block text-xs text-muted">{t.sex}</span>
              <select className={input} value={form.sex} onChange={(e) => update("sex", e.target.value as Profile["sex"])}>
                <option value="male">{t.male}</option>
                <option value="female">{t.female}</option>
              </select>
            </label>
            <label>
              <span className="mb-1 block text-xs text-muted">{t.age}</span>
              <input className={input} type="number" value={form.age} onChange={(e) => update("age", Number(e.target.value))} />
            </label>
            <label>
              <span className="mb-1 block text-xs text-muted">{t.height}</span>
              <input
                className={input}
                type="number"
                value={form.heightCm}
                onChange={(e) => update("heightCm", Number(e.target.value))}
              />
            </label>
            <label>
              <span className="mb-1 block text-xs text-muted">{t.weight}</span>
              <input
                className={input}
                type="number"
                value={form.weightKg}
                onChange={(e) => update("weightKg", Number(e.target.value))}
              />
            </label>
            <label className="col-span-2">
              <span className="mb-1 block text-xs text-muted">{t.activity}</span>
              <select
                className={input}
                value={form.activity}
                onChange={(e) => update("activity", e.target.value as Activity)}
              >
                {ACTIVITIES.map((a) => (
                  <option key={a} value={a}>
                    {t.activities[a]}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm">
              {t.suggested}: <b className="text-base">{num(suggested)}</b> {t.kcal}
            </span>
            <button
              onClick={() => setCalories(suggested)}
              className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold hover:border-accent"
            >
              {t.useThis}
            </button>
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">{t.language}</span>
          <select className={input} value={locale} onChange={(e) => setLocale(e.target.value as "en" | "fa")}>
            <option value="en">English</option>
            <option value="fa">فارسی</option>
          </select>
        </label>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line px-6 py-4">
        <button
          onClick={() => window.confirm(t.clearConfirm) && clearAll()}
          className="text-sm font-medium text-protein hover:underline"
        >
          {t.clearData}
        </button>
        <button onClick={save} className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-bg hover:opacity-90">
          {t.save}
        </button>
      </div>
    </dialog>
  );
}
