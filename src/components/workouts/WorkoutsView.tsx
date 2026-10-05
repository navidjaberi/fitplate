"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { ChevronDown, Play, Settings2, Trash2 } from "lucide-react";
import { parseDayKey } from "@/lib/date";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { completedSets, estimateMinutes, volume, type ProgramDay, type WorkoutLog } from "@/lib/workouts";
import { useApp } from "../Providers";
import { TiltCard } from "../ui/TiltCard";
import { useDose, useExerciseName, useWeekdayNames } from "./shared";
import { TodayWorkoutCard } from "./TodayWorkoutCard";
import { WorkoutSetupForm } from "./WorkoutSetupForm";

const container: Variants = { show: { transition: { staggerChildren: 0.07 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export function WorkoutsView() {
  const { t } = useI18n();
  const { hydrated } = useApp();
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const plan = useStore((s) => s.plan);
  const program = useStore((s) => s.program);
  const workouts = useStore((s) => s.workouts);
  const createProgram = useStore((s) => s.createProgram);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (hydrated && !profile) router.replace("/onboarding");
  }, [hydrated, profile, router]);

  if (!hydrated || !profile) return <div className="card h-96 animate-pulse" />;

  if (!program || editing) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-gradient text-3xl font-bold tracking-tight sm:text-4xl">{t.wkSetupTitle}</h1>
        <p className="mt-2 mb-6 text-muted">{t.wkSetupIntro}</p>
        <section className="card p-5 sm:p-7">
          <WorkoutSetupForm onDone={() => setEditing(false)} />
        </section>
      </div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.header variants={item} className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-gradient text-3xl font-bold tracking-tight sm:text-4xl">{t.wkTitle}</h1>
          <p className="mt-2 text-muted">
            {t.wkBuiltFor}: {t.goalTypes[program.goal]} · {t.equipment[program.setup.equipment]} ·{" "}
            {t.experience[program.setup.experience]}
          </p>
          {plan && plan.type !== program.goal && (
            <p className="mt-2 text-sm text-carbs">
              {t.wkGoalChanged}{" "}
              <button onClick={() => createProgram(program.setup)} className="font-semibold underline underline-offset-4">
                {t.wkUpdate}
              </button>
            </p>
          )}
        </div>
        <button
          onClick={() => setEditing(true)}
          className="btn-ghost inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
        >
          <Settings2 className="size-4" />
          {t.wkEdit}
        </button>
      </motion.header>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3 [&>*]:min-w-0">
        <motion.div variants={item}>
          <TodayWorkoutCard />
        </motion.div>
        <motion.div variants={item} className="space-y-3 lg:col-span-2">
          {program.days.map((d, i) => (
            <ProgramDayCard key={`${d.weekday}-${d.focus}`} day={d} index={i} />
          ))}
        </motion.div>
      </div>

      <motion.section variants={item}>
        <h2 className="font-display mb-3 text-lg font-bold">{t.wkHistory}</h2>
        {workouts.length === 0 ? (
          <p className="card p-6 text-sm text-muted">{t.wkNoHistory}</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            <AnimatePresence initial={false}>
              {workouts.slice(0, 10).map((w) => (
                <SessionCard key={w.id} log={w} />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </motion.section>
    </motion.div>
  );
}

function ProgramDayCard({ day, index }: { day: ProgramDay; index: number }) {
  const { t, num } = useI18n();
  const router = useRouter();
  const names = useWeekdayNames("short");
  const exerciseName = useExerciseName();
  const dose = useDose();
  const active = useStore((s) => s.activeWorkout);
  const startWorkout = useStore((s) => s.startWorkout);
  const isToday = new Date().getDay() === day.weekday;
  const [open, setOpen] = useState(isToday);

  const start = () => {
    if (!active) startWorkout(index);
    router.push("/workouts/session");
  };

  return (
    <TiltCard
      max={2}
      className={`overflow-hidden ${isToday ? "shadow-[0_0_0_1px_rgb(198_255_61/0.35),0_24px_60px_-24px_rgb(0_0_0/0.7)]" : ""}`}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-4 text-start sm:p-5"
      >
        <div
          className={`flex h-12 w-14 shrink-0 items-center justify-center rounded-2xl px-1 text-center text-[11px] leading-tight font-bold ${
            isToday ? "bg-accent text-accent-ink" : "bg-white/5 text-muted"
          }`}
        >
          {names[day.weekday]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{t.focus[day.focus]}</div>
          <div className="text-sm text-muted">
            {t.wkExercises(num(day.exercises.length))} · {t.wkMinutes(num(estimateMinutes(day)))}
          </div>
        </div>
        <ChevronDown className={`size-5 shrink-0 text-muted transition ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <ol className="divide-y divide-line border-t border-line px-4 sm:px-5">
              {day.exercises.map((p, i) => (
                <li key={p.exerciseId} className="flex items-center gap-3 py-3 text-sm">
                  <span className="w-5 text-muted tabular-nums">{num(i + 1)}</span>
                  <span className="min-w-0 flex-1 truncate font-medium">{exerciseName(p.exerciseId)}</span>
                  <span className="shrink-0 font-semibold tabular-nums" dir="ltr">
                    {dose(p)}
                  </span>
                  <span className="hidden shrink-0 text-end whitespace-nowrap text-muted sm:block">
                    {t.wkRest} {num(p.restSec)} {t.wkSec}
                  </span>
                </li>
              ))}
            </ol>
            <div className="flex justify-end border-t border-line p-4 sm:px-5">
              <button
                onClick={start}
                className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
              >
                <Play className="size-4 rtl:-scale-x-100" />
                {active ? t.wkContinue : t.wkStart}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </TiltCard>
  );
}

function SessionCard({ log }: { log: WorkoutLog }) {
  const { t, num, tag } = useI18n();
  const removeWorkout = useStore((s) => s.removeWorkout);
  const minutes = log.finishedAt ? Math.max(1, Math.round((Date.parse(log.finishedAt) - Date.parse(log.startedAt)) / 60000)) : 0;
  const stats = [
    { label: t.wkVolume, value: `${num(volume(log))} ${t.kg}` },
    { label: t.wkSetsDone, value: num(completedSets(log)) },
    { label: t.wkDuration, value: `${num(minutes)} ${t.wkMin}` },
  ];
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="card group p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate font-semibold">{t.focus[log.focus]}</div>
          <div className="text-xs text-muted">
            {parseDayKey(log.day).toLocaleDateString(tag, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
        <button
          onClick={() => removeWorkout(log.id)}
          aria-label={t.delete}
          className="rounded-full p-1.5 text-muted opacity-0 transition group-hover:opacity-100 hover:text-protein focus:opacity-100 max-md:opacity-100"
        >
          <Trash2 className="size-4" />
        </button>
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-line bg-white/[0.03] px-2 py-2 text-center">
            <dd className="text-sm font-bold tabular-nums">{s.value}</dd>
            <dt className="text-[11px] text-muted">{s.label}</dt>
          </div>
        ))}
      </dl>
    </motion.li>
  );
}
