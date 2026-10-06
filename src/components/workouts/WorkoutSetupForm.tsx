"use client";

import { useState } from "react";
import { Building2, Dumbbell, PersonStanding } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { DEFAULT_WEEKDAYS, type Equipment, type Experience, type WorkoutSetup } from "@/lib/workouts";
import { Choice } from "../PlanForm";
import { useWeekdayNames, useWeekOrder } from "./shared";

const EQUIPMENT: Equipment[] = ["gym", "dumbbells", "bodyweight"];
const EQUIPMENT_ICON = {
  gym: Building2,
  dumbbells: Dumbbell,
  bodyweight: PersonStanding,
};
const EXPERIENCE: Experience[] = ["beginner", "intermediate", "advanced"];

export function WorkoutSetupForm({ onDone }: { onDone?: () => void }) {
  const { t, num, locale } = useI18n();
  const existing = useStore((s) => s.program?.setup);
  const createProgram = useStore((s) => s.createProgram);
  const names = useWeekdayNames("short");
  const order = useWeekOrder();
  const [setup, setSetup] = useState<WorkoutSetup>(
    existing ?? {
      weekdays: DEFAULT_WEEKDAYS[locale],
      equipment: "gym",
      experience: "beginner",
    },
  );

  const count = setup.weekdays.length;
  const valid = count >= 2 && count <= 6;
  const toggle = (d: number) =>
    setSetup((s) => ({
      ...s,
      weekdays: s.weekdays.includes(d) ? s.weekdays.filter((x) => x !== d) : [...s.weekdays, d],
    }));

  return (
    <div className="space-y-7">
      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="text-sm font-medium text-muted">{t.wkDays}</h3>
          <span className={`text-sm ${valid ? "text-muted" : "text-protein"}`}>
            {valid ? t.wkDaysHint(num(count)) : t.wkDaysError}
          </span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {order.map((d) => {
            const on = setup.weekdays.includes(d);
            return (
              <button
                key={d}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(d)}
                className={`rounded-xl py-3 text-xs font-semibold transition sm:text-sm ${
                  on
                    ? "bg-accent text-accent-ink shadow-[0_0_20px_-6px_var(--glow)]"
                    : "border border-line bg-white/[0.03] text-muted hover:border-white/20 hover:text-ink"
                }`}
              >
                {names[d]}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-muted">{t.wkEquipment}</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {EQUIPMENT.map((e) => {
            const Icon = EQUIPMENT_ICON[e];
            const on = setup.equipment === e;
            return (
              <Choice key={e} selected={on} onClick={() => setSetup({ ...setup, equipment: e })}>
                <div
                  className={`mb-3 flex size-10 items-center justify-center rounded-xl transition ${
                    on ? "bg-accent text-accent-ink" : "bg-white/5"
                  }`}
                >
                  <Icon className="size-5" />
                </div>
                <div className="font-semibold">{t.equipment[e]}</div>
                <div className="text-sm text-muted">{t.equipmentHints[e]}</div>
              </Choice>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-medium text-muted">{t.wkExperience}</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {EXPERIENCE.map((x) => (
            <Choice key={x} selected={setup.experience === x} onClick={() => setSetup({ ...setup, experience: x })}>
              <div className="font-semibold">{t.experience[x]}</div>
              <div className="text-sm text-muted">{t.experienceHints[x]}</div>
            </Choice>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        {onDone && existing && (
          <button type="button" onClick={onDone} className="btn-ghost rounded-full px-5 py-3 font-semibold">
            {t.cancel}
          </button>
        )}
        <button
          type="button"
          disabled={!valid}
          onClick={() => {
            createProgram(setup);
            onDone?.();
          }}
          className="btn-primary rounded-full px-6 py-3 font-semibold disabled:opacity-40"
        >
          {existing ? t.wkUpdate : t.wkCreate}
        </button>
      </div>
    </div>
  );
}
