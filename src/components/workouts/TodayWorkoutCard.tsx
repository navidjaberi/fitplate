"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Check, Dumbbell, Moon, Play } from "lucide-react";
import { dayKey } from "@/lib/date";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { estimateKcal, estimateMinutes, nextProgramDay, programDayFor, volume } from "@/lib/workouts";
import { TiltCard } from "../ui/TiltCard";
import { useExerciseName, useWeekdayNames, useWeekOrder } from "./shared";

export function TodayWorkoutCard() {
  const { t, num } = useI18n();
  const router = useRouter();
  const program = useStore((s) => s.program);
  const workouts = useStore((s) => s.workouts);
  const active = useStore((s) => s.activeWorkout);
  const startWorkout = useStore((s) => s.startWorkout);
  const bodyKg = useStore((s) => s.profile?.weightKg ?? 70);
  const exerciseName = useExerciseName();

  if (!program) {
    return (
      <TiltCard className="p-5 sm:p-6">
        <Title />
        <p className="mt-3 text-sm text-muted">{t.wkNoProgram}</p>
        <Link
          href="/workouts"
          className="btn-primary mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
        >
          {t.wkSetupCta}
          <ArrowUpRight className="size-4 rtl:-scale-x-100" />
        </Link>
      </TiltCard>
    );
  }

  const today = programDayFor(program);
  const todayIndex = today ? program.days.indexOf(today) : -1;
  const doneToday = workouts.find((w) => w.day === dayKey());
  const next = nextProgramDay(program);

  const start = () => {
    if (!active) startWorkout(todayIndex);
    router.push("/workouts/session");
  };

  return (
    <TiltCard className="p-5 sm:p-6">
      <Title />

      {active ? (
        <div className="mt-4">
          <div className="text-sm text-muted">{t.wkInProgress}</div>
          <div className="font-display mt-1 text-xl font-bold">{t.focus[active.focus]}</div>
          <Link
            href="/workouts/session"
            className="btn-primary mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            <Play className="size-4 rtl:-scale-x-100" />
            {t.wkContinue}
          </Link>
        </div>
      ) : today && doneToday ? (
        <div className="mt-4 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-accent text-accent-ink shadow-[0_0_24px_-6px_var(--glow)]">
            <Check className="size-5" />
          </div>
          <div>
            <div className="font-semibold">{t.wkDoneToday}</div>
            <div className="text-sm text-muted">
              {t.focus[doneToday.focus]} · {num(volume(doneToday))} {t.kg}
            </div>
          </div>
        </div>
      ) : today ? (
        <div className="mt-4">
          <div className="font-display text-xl font-bold">{t.focus[today.focus]}</div>
          <div className="mt-1 text-sm text-muted">
            {t.wkExercises(num(today.exercises.length))} · {t.wkMinutes(num(estimateMinutes(today)))} ·{" "}
            {t.wkKcal(num(estimateKcal(estimateMinutes(today), bodyKg)))}
          </div>
          <ul className="mt-4 space-y-1.5 text-sm">
            {today.exercises.slice(0, 4).map((p) => (
              <li key={p.exerciseId} className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-accent" />
                {exerciseName(p.exerciseId)}
              </li>
            ))}
            {today.exercises.length > 4 && <li className="ps-3.5 text-muted">+{num(today.exercises.length - 4)}</li>}
          </ul>
          <button
            onClick={start}
            className="btn-primary mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            <Play className="size-4 rtl:-scale-x-100" />
            {t.wkStart}
          </button>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-white/5 text-fat">
            <Moon className="size-5" />
          </div>
          <div>
            <div className="font-semibold">{t.wkRestDay}</div>
            {next && (
              <div className="text-sm text-muted">
                {t.wkNextUp}: {t.focus[next.day.focus]} · {next.offset === 1 ? t.wkTomorrow : t.wkInDays(num(next.offset))}
              </div>
            )}
          </div>
        </div>
      )}

      <WeekStrip />
    </TiltCard>
  );
}

function Title() {
  const { t } = useI18n();
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Dumbbell className="size-4 text-accent" />
        <h2 className="font-display font-bold">{t.wkToday}</h2>
      </div>
      <Link href="/workouts" aria-label={t.wkTitle} className="rounded-full p-2 text-muted hover:bg-white/5 hover:text-ink">
        <ArrowUpRight className="size-4 rtl:-scale-x-100" />
      </Link>
    </div>
  );
}

export function WeekStrip() {
  const program = useStore((s) => s.program);
  const workouts = useStore((s) => s.workouts);
  const names = useWeekdayNames("short");
  const order = useWeekOrder();
  if (!program) return null;

  const now = new Date();
  const todayPos = order.indexOf(now.getDay());
  const days = order.map((weekday, pos) => {
    const d = new Date(now);
    d.setDate(now.getDate() + (pos - todayPos));
    const key = dayKey(d);
    return {
      weekday,
      key,
      training: program.days.some((p) => p.weekday === weekday),
      done: workouts.some((w) => w.day === key),
      today: pos === todayPos,
    };
  });

  return (
    <div className="mt-6 grid grid-cols-7 gap-1.5 border-t border-line pt-4">
      {days.map((d) => (
        <div key={d.key} className="flex flex-col items-center gap-1.5">
          <span className={`text-[10px] ${d.today ? "font-semibold text-ink" : "text-muted"}`}>{names[d.weekday]}</span>
          <span
            className={`flex size-7 items-center justify-center rounded-full text-[10px] transition ${
              d.done
                ? "bg-accent text-accent-ink shadow-[0_0_14px_-3px_var(--glow)]"
                : d.training
                  ? "border border-accent/50"
                  : "bg-white/[0.04]"
            } ${d.today ? "ring-2 ring-white/30 ring-offset-2 ring-offset-bg" : ""}`}
          >
            {d.done && <Check className="size-3.5" />}
          </span>
        </div>
      ))}
    </div>
  );
}
