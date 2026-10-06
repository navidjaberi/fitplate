"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Check, Plus, Timer, X } from "lucide-react";
import { parseLocalizedNumber } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { completedSets, EXERCISES, volume, type LoggedExercise, type Prescription, type WorkoutLog } from "@/lib/workouts";
import { useApp } from "../Providers";
import { useDose, useExerciseName } from "./shared";

export function WorkoutSession() {
  const { t, num } = useI18n();
  const { hydrated } = useApp();
  const router = useRouter();
  const active = useStore((s) => s.activeWorkout);
  const program = useStore((s) => s.program);
  const history = useStore((s) => s.workouts);
  const finishWorkout = useStore((s) => s.finishWorkout);
  const discardWorkout = useStore((s) => s.discardWorkout);
  const [rest, setRest] = useState<{ endsAt: number; total: number } | null>(null);
  const now = useNow();
  const closeRest = useCallback(() => setRest(null), []);

  useEffect(() => {
    if (hydrated && !active) router.replace("/workouts");
  }, [hydrated, active, router]);

  if (!hydrated || !active) return <div className="card mx-auto h-96 max-w-3xl animate-pulse" />;

  const plan = program?.days.find((d) => d.focus === active.focus);
  const total = active.entries.reduce((n, e) => n + e.sets.length, 0);
  const done = completedSets(active);
  const elapsed = Math.max(0, Math.floor((now - Date.parse(active.startedAt)) / 1000));

  const finish = () => {
    finishWorkout();
    router.push("/workouts");
  };

  return (
    <div className="mx-auto max-w-3xl pb-28">
      <header className="sticky top-24 z-20 mb-6 rounded-[1.75rem] border border-line bg-bg/70 p-4 backdrop-blur-xl sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs text-muted">{t.wkInProgress}</div>
            <h1 className="font-display truncate text-xl font-bold sm:text-2xl">{t.focus[active.focus]}</h1>
          </div>
          <div className="font-display shrink-0 text-2xl font-bold text-accent tabular-nums" dir="ltr">
            {clock(elapsed, num)}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs text-muted">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-accent shadow-[0_0_12px_var(--glow)]"
              animate={{ width: `${total ? (done / total) * 100 : 0}%` }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <span className="tabular-nums">
            {num(done)} / {num(total)}
          </span>
          <span className="tabular-nums">
            {num(volume(active))} {t.kg}
          </span>
        </div>
      </header>

      <ol className="space-y-4">
        {active.entries.map((entry, i) => (
          <ExerciseCard
            key={entry.exerciseId}
            index={i}
            entry={entry}
            prescription={entry.plan ?? plan?.exercises.find((p) => p.exerciseId === entry.exerciseId)}
            last={lastSession(history, entry.exerciseId)}
            onSetDone={(restSec) => setRest({ endsAt: Date.now() + restSec * 1000, total: restSec })}
          />
        ))}
      </ol>

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          onClick={() => window.confirm(t.wkDiscardConfirm) && discardWorkout()}
          className="text-sm font-medium text-protein hover:underline"
        >
          {t.wkDiscard}
        </button>
        <button
          onClick={finish}
          disabled={done === 0}
          className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold disabled:opacity-40"
        >
          <Check className="size-5" />
          {t.wkFinish}
        </button>
      </div>

      <AnimatePresence>{rest && <RestTimer {...rest} now={now} onClose={closeRest} />}</AnimatePresence>
    </div>
  );
}

function ExerciseCard({
  index,
  entry,
  prescription,
  last,
  onSetDone,
}: {
  index: number;
  entry: LoggedExercise;
  prescription?: Prescription;
  last?: LoggedExercise;
  onSetDone: (restSec: number) => void;
}) {
  const { t, num } = useI18n();
  const name = useExerciseName();
  const dose = useDose();
  const updateSet = useStore((s) => s.updateSet);
  const addSet = useStore((s) => s.addSet);
  const info = EXERCISES[entry.exerciseId];
  const timed = info?.unit === "seconds";
  const allDone = entry.sets.every((s) => s.done);
  const carry = (j: number, key: "kg" | "reps", n: number) => {
    const old = entry.sets[j][key];
    entry.sets.forEach((s, k) => {
      if (k === j || (k > j && !s.done && s[key] === old)) updateSet(index, k, { [key]: n });
    });
  };

  return (
    <motion.li
      layout
      className={`card p-4 transition-shadow sm:p-5 ${allDone ? "shadow-[0_0_0_1px_rgb(198_255_61/0.4),0_20px_50px_-24px_var(--glow)]" : ""}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-semibold">
            <span className="me-2 text-muted tabular-nums">{num(index + 1)}</span>
            {name(entry.exerciseId)}
          </h2>
          {last && (
            <p className="mt-0.5 text-xs text-muted">
              {t.wkLast}: {last.sets.map((s) => (info?.loaded ? `${num(s.kg, 1)}×${num(s.reps)}` : num(s.reps))).join("، ")}
            </p>
          )}
        </div>
        {prescription && (
          <span className="shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-xs font-semibold tabular-nums" dir="ltr">
            {dose(prescription)}
          </span>
        )}
      </div>

      <div className="mt-4 space-y-2">
        <div className="grid grid-cols-[2rem_1fr_1fr_2.75rem] gap-2 px-1 text-[11px] text-muted">
          <span>{t.wkSet}</span>
          <span>{info?.loaded ? t.kg : ""}</span>
          <span>{timed ? t.wkSec : t.wkReps}</span>
          <span />
        </div>
        {entry.sets.map((set, j) => (
          <div
            key={j}
            className={`grid grid-cols-[2rem_1fr_1fr_2.75rem] items-center gap-2 rounded-2xl p-1 transition ${set.done ? "bg-accent/[0.07]" : ""}`}
          >
            <span className="text-center text-sm font-semibold text-muted tabular-nums">{num(j + 1)}</span>
            {info?.loaded ? (
              <NumberCell value={set.kg} onChange={(kg) => carry(j, "kg", kg)} label={t.kg} />
            ) : (
              <span className="text-center text-muted">—</span>
            )}
            <NumberCell value={set.reps} onChange={(reps) => carry(j, "reps", reps)} label={timed ? t.wkSec : t.wkReps} />
            <button
              aria-label={t.wkSet}
              aria-pressed={set.done}
              onClick={() => {
                updateSet(index, j, { done: !set.done });
                if (!set.done && prescription) onSetDone(prescription.restSec);
              }}
              className={`flex size-11 items-center justify-center rounded-xl transition active:scale-95 ${
                set.done
                  ? "bg-accent text-accent-ink shadow-[0_0_18px_-4px_var(--glow)]"
                  : "border border-line bg-white/[0.03] text-muted hover:text-ink"
              }`}
            >
              <Check className="size-5" />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => addSet(index)}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-sm font-medium text-muted hover:text-ink"
      >
        <Plus className="size-4" />
        {t.wkAddSet}
      </button>
    </motion.li>
  );
}

function NumberCell({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  const { num, locale } = useI18n();
  const show = (n: number) => num(n, 2).replace(/[,٬]/g, "");
  const [text, setText] = useState(() => show(value));
  const [synced, setSynced] = useState(value);
  const [shownIn, setShownIn] = useState(locale);
  if (value !== synced || locale !== shownIn) {
    setSynced(value);
    setShownIn(locale);
    if (locale !== shownIn || parseLocalizedNumber(text) !== value) setText(show(value));
  }
  return (
    <input
      inputMode="decimal"
      aria-label={label}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        const n = parseLocalizedNumber(e.target.value);
        if (Number.isFinite(n) && n >= 0) {
          setSynced(n);
          onChange(n);
        }
      }}
      onFocus={(e) => e.target.select()}
      className="h-11 w-full min-w-0 rounded-xl border border-line bg-surface-2 text-center font-semibold tabular-nums outline-none transition focus:border-accent"
    />
  );
}

function RestTimer({ endsAt, total, now, onClose }: { endsAt: number; total: number; now: number; onClose: () => void }) {
  const { t, num } = useI18n();
  const left = Math.max(0, Math.ceil((endsAt - now) / 1000));
  const r = 22;
  const c = 2 * Math.PI * r;
  const over = left === 0;
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!over) return;
    navigator.vibrate?.([120, 80, 120]);
    const id = setTimeout(() => closeRef.current(), 1200);
    return () => clearTimeout(id);
  }, [over, endsAt]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className="fixed inset-x-0 bottom-24 z-40 mx-auto flex w-fit items-center gap-4 rounded-full border border-line bg-bg/80 py-2 ps-2 pe-4 shadow-[0_20px_60px_-10px_rgb(0_0_0/0.9)] backdrop-blur-xl md:bottom-8"
      role="timer"
      aria-live="polite"
    >
      <div className="relative size-14">
        <svg viewBox="0 0 56 56" className="size-full -rotate-90">
          <circle cx="28" cy="28" r={r} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="5" />
          <circle
            cx="28"
            cy="28"
            r={r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - left / total)}
            style={{
              transition: "stroke-dashoffset 1s linear",
              filter: "drop-shadow(0 0 6px var(--accent))",
            }}
          />
        </svg>
        <Timer className="absolute inset-0 m-auto size-5 text-accent" />
      </div>
      <div>
        <div className="text-xs text-muted">{t.wkRest}</div>
        <div className="font-display text-xl font-bold tabular-nums" dir="ltr">
          {left === 0 ? <Check className="size-6 text-accent" /> : clock(left, num)}
        </div>
      </div>
      <button
        onClick={onClose}
        className="ms-2 inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm text-muted hover:bg-white/5 hover:text-ink"
      >
        <X className="size-4" />
        {t.wkSkip}
      </button>
    </motion.div>
  );
}

function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function clock(seconds: number, num: (n: number) => string) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${num(m)}:${s < 10 ? num(0) : ""}${num(s)}`;
}

function lastSession(history: WorkoutLog[], exerciseId: string) {
  for (const log of history) {
    const entry = log.entries.find((e) => e.exerciseId === exerciseId);
    if (entry?.sets.length) return entry;
  }
}
