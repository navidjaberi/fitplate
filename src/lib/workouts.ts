import type { GoalType } from "./nutrition";

export type Equipment = "gym" | "dumbbells" | "bodyweight";
export type Experience = "beginner" | "intermediate" | "advanced";

/** What the user tells us before we build a program. Weekdays use Date#getDay (0 = Sunday). */
export type WorkoutSetup = {
  weekdays: number[];
  equipment: Equipment;
  experience: Experience;
};

type Pattern =
  | "squat"
  | "hinge"
  | "lunge"
  | "hPush"
  | "vPush"
  | "incline"
  | "hPull"
  | "vPull"
  | "lateral"
  | "legCurl"
  | "biceps"
  | "triceps"
  | "calves"
  | "core";

export type Exercise = {
  id: string;
  name: { en: string; fa: string };
  /** Timed holds are logged in seconds instead of reps. */
  unit: "reps" | "seconds";
  /** Bodyweight moves don't ask for a load. */
  loaded: boolean;
};

const ex = (id: string, en: string, fa: string, unit: Exercise["unit"] = "reps", loaded = true): Exercise => ({
  id,
  name: { en, fa },
  unit,
  loaded,
});

export const EXERCISES: Record<string, Exercise> = Object.fromEntries(
  [
    ex("back-squat", "Barbell back squat", "اسکات هالتر"),
    ex("goblet-squat", "Goblet squat", "گابلت اسکات"),
    ex("air-squat", "Bodyweight squat", "اسکات وزن بدن", "reps", false),
    ex("romanian-deadlift", "Romanian deadlift", "ددلیفت رومانیایی هالتر"),
    ex("db-rdl", "Dumbbell Romanian deadlift", "ددلیفت رومانیایی دمبل"),
    ex("glute-bridge", "Glute bridge", "پل باسن", "reps", false),
    ex("leg-press", "Leg press", "پرس پا"),
    ex("db-lunge", "Dumbbell walking lunge", "لانج دمبل"),
    ex("reverse-lunge", "Reverse lunge", "لانج معکوس", "reps", false),
    ex("bench-press", "Barbell bench press", "پرس سینه هالتر"),
    ex("db-bench", "Dumbbell bench press", "پرس سینه دمبل"),
    ex("push-up", "Push-up", "شنا سوئدی", "reps", false),
    ex("overhead-press", "Overhead press", "پرس سرشانه هالتر"),
    ex("db-shoulder-press", "Dumbbell shoulder press", "پرس سرشانه دمبل"),
    ex("pike-push-up", "Pike push-up", "شنا پایک", "reps", false),
    ex("incline-db-press", "Incline dumbbell press", "پرس بالاسینه دمبل"),
    ex("decline-push-up", "Feet-elevated push-up", "شنا با پای بالا", "reps", false),
    ex("cable-row", "Seated cable row", "قایقی سیم‌کش"),
    ex("db-row", "One-arm dumbbell row", "زیربغل دمبل تک‌خم"),
    ex("inverted-row", "Inverted row", "بارفیکس استرالیایی", "reps", false),
    ex("lat-pulldown", "Lat pulldown", "لت پول‌داون"),
    ex("db-pullover", "Dumbbell pullover", "پول‌اور دمبل"),
    ex("pull-up", "Pull-up", "بارفیکس", "reps", false),
    ex("lateral-raise", "Lateral raise", "نشر جانب دمبل"),
    ex("prone-y-raise", "Prone Y raise", "نشر Y خوابیده", "reps", false),
    ex("leg-curl", "Lying leg curl", "پشت پا ماشین"),
    ex("single-leg-rdl", "Single-leg Romanian deadlift", "ددلیفت تک‌پا", "reps", false),
    ex("db-curl", "Dumbbell curl", "جلو بازو دمبل"),
    ex("chin-up", "Chin-up", "بارفیکس دست‌برعکس", "reps", false),
    ex("triceps-pushdown", "Triceps pushdown", "پشت بازو سیم‌کش"),
    ex("db-overhead-extension", "Overhead dumbbell extension", "پشت بازو دمبل از بالای سر"),
    ex("bench-dip", "Bench dip", "دیپ روی نیمکت", "reps", false),
    ex("calf-raise", "Standing calf raise", "ساق پا ایستاده"),
    ex("bw-calf-raise", "Single-leg calf raise", "ساق پا تک‌پا", "reps", false),
    ex("plank", "Plank", "پلانک", "seconds", false),
  ].map((e) => [e.id, e]),
);

/** For each movement pattern, the exercise to use with each kind of equipment. */
const PICK: Record<Pattern, Record<Equipment, string>> = {
  squat: {
    gym: "back-squat",
    dumbbells: "goblet-squat",
    bodyweight: "air-squat",
  },
  hinge: {
    gym: "romanian-deadlift",
    dumbbells: "db-rdl",
    bodyweight: "glute-bridge",
  },
  lunge: {
    gym: "leg-press",
    dumbbells: "db-lunge",
    bodyweight: "reverse-lunge",
  },
  hPush: { gym: "bench-press", dumbbells: "db-bench", bodyweight: "push-up" },
  vPush: {
    gym: "overhead-press",
    dumbbells: "db-shoulder-press",
    bodyweight: "pike-push-up",
  },
  incline: {
    gym: "incline-db-press",
    dumbbells: "incline-db-press",
    bodyweight: "decline-push-up",
  },
  hPull: { gym: "cable-row", dumbbells: "db-row", bodyweight: "inverted-row" },
  vPull: {
    gym: "lat-pulldown",
    dumbbells: "db-pullover",
    bodyweight: "pull-up",
  },
  lateral: {
    gym: "lateral-raise",
    dumbbells: "lateral-raise",
    bodyweight: "prone-y-raise",
  },
  legCurl: {
    gym: "leg-curl",
    dumbbells: "single-leg-rdl",
    bodyweight: "single-leg-rdl",
  },
  biceps: { gym: "db-curl", dumbbells: "db-curl", bodyweight: "chin-up" },
  triceps: {
    gym: "triceps-pushdown",
    dumbbells: "db-overhead-extension",
    bodyweight: "bench-dip",
  },
  calves: {
    gym: "calf-raise",
    dumbbells: "calf-raise",
    bodyweight: "bw-calf-raise",
  },
  core: { gym: "plank", dumbbells: "plank", bodyweight: "plank" },
};

const COMPOUND = new Set<Pattern>(["squat", "hinge", "lunge", "hPush", "vPush", "incline", "hPull", "vPull"]);

export type Focus = "fullA" | "fullB" | "fullC" | "upperA" | "upperB" | "lowerA" | "lowerB" | "push" | "pull" | "legs";

const TEMPLATES: Record<Focus, Pattern[]> = {
  fullA: ["squat", "hPush", "hPull", "lateral", "core"],
  fullB: ["hinge", "vPush", "vPull", "lunge", "core"],
  fullC: ["lunge", "incline", "hPull", "legCurl", "biceps", "triceps"],
  upperA: ["hPush", "hPull", "vPush", "vPull", "biceps", "triceps"],
  upperB: ["incline", "vPull", "lateral", "hPull", "triceps", "biceps"],
  lowerA: ["squat", "hinge", "lunge", "calves", "core"],
  lowerB: ["hinge", "lunge", "legCurl", "calves", "core"],
  push: ["hPush", "vPush", "incline", "lateral", "triceps"],
  pull: ["vPull", "hPull", "hinge", "biceps", "core"],
  legs: ["squat", "lunge", "legCurl", "calves", "core"],
};

/** The weekly split for a number of training days. Beginners get full-body days at three per week. */
export function splitFor(days: number, experience: Experience): Focus[] {
  switch (Math.max(2, Math.min(6, days))) {
    case 2:
      return ["fullA", "fullB"];
    case 3:
      return experience === "beginner" ? ["fullA", "fullB", "fullC"] : ["push", "pull", "legs"];
    case 4:
      return ["upperA", "lowerA", "upperB", "lowerB"];
    case 5:
      return ["upperA", "lowerA", "push", "pull", "legs"];
    default:
      return ["push", "pull", "legs", "push", "pull", "legs"];
  }
}

export type Prescription = {
  exerciseId: string;
  sets: number;
  reps: [number, number];
  restSec: number;
};
export type ProgramDay = {
  weekday: number;
  focus: Focus;
  exercises: Prescription[];
};
export type Program = {
  createdAt: string;
  setup: WorkoutSetup;
  goal: GoalType;
  days: ProgramDay[];
};

/** Sets, rep range and rest for one exercise, from the goal and training age. */
export function prescribe(pattern: Pattern, goal: GoalType, experience: Experience, equipment: Equipment): Prescription {
  const exerciseId = PICK[pattern][equipment];
  const compound = COMPOUND.has(pattern);
  const timed = EXERCISES[exerciseId].unit === "seconds";

  const sets = experience === "advanced" && compound ? 4 : experience === "beginner" && !compound ? 2 : 3;
  let reps: [number, number];
  if (timed) reps = experience === "beginner" ? [20, 40] : [30, 60];
  // Without load, progress comes from more reps.
  else if (!EXERCISES[exerciseId].loaded) reps = [8, 15];
  else if (!compound) reps = [10, 15];
  else reps = goal === "gain" ? [6, 10] : [8, 12];
  const restSec = compound ? (goal === "gain" ? 120 : 90) : 60;
  return { exerciseId, sets, reps, restSec };
}

/** Three spread-out days, avoiding the weekend: Mon/Wed/Fri, or Sat/Mon/Wed where Friday is the day off. */
export const DEFAULT_WEEKDAYS = { en: [1, 3, 5], fa: [6, 1, 3] };

export function buildProgram(setup: WorkoutSetup, goal: GoalType, now = new Date()): Program {
  const weekdays = [...new Set(setup.weekdays)].sort((a, b) => a - b);
  const split = splitFor(weekdays.length, setup.experience);
  return {
    createdAt: now.toISOString(),
    setup: { ...setup, weekdays },
    goal,
    days: split.map((focus, i) => ({
      weekday: weekdays[i],
      focus,
      exercises: TEMPLATES[focus].map((p) => prescribe(p, goal, setup.experience, setup.equipment)),
    })),
  };
}

export function programDayFor(program: Program, date = new Date()): ProgramDay | undefined {
  return program.days.find((d) => d.weekday === date.getDay());
}

/** The next training day after today (or today itself when `includeToday`). */
export function nextProgramDay(program: Program, date = new Date(), includeToday = false) {
  for (let offset = includeToday ? 0 : 1; offset <= 7; offset++) {
    const d = new Date(date);
    d.setDate(d.getDate() + offset);
    const day = programDayFor(program, d);
    if (day) return { day, date: d, offset };
  }
  return undefined;
}

export type LoggedSet = { kg: number; reps: number; done: boolean };
export type LoggedExercise = { exerciseId: string; sets: LoggedSet[] };
export type WorkoutLog = {
  id: string;
  day: string;
  startedAt: string;
  finishedAt?: string;
  focus: Focus;
  entries: LoggedExercise[];
};

/** Weight moved: kg × reps over completed sets. */
export function volume(log: Pick<WorkoutLog, "entries">) {
  let total = 0;
  for (const e of log.entries) for (const s of e.sets) if (s.done) total += s.kg * s.reps;
  return Math.round(total);
}

export function completedSets(log: Pick<WorkoutLog, "entries">) {
  return log.entries.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0);
}

/** Rough session length: about 40 s of work per set plus the prescribed rest. */
export function estimateMinutes(day: ProgramDay) {
  const seconds = day.exercises.reduce((sum, p) => sum + p.sets * (40 + p.restSec), 0);
  return Math.round(seconds / 60 / 5) * 5;
}

/** Energy for moderate-to-vigorous resistance training (MET ≈ 5). */
export function estimateKcal(minutes: number, bodyKg: number) {
  return Math.round(5 * bodyKg * (minutes / 60));
}

/**
 * Load to try next time: add 2.5 kg once every set of the last session reached the top of
 * the rep range, otherwise repeat the last load. Undefined when the exercise was never logged.
 */
export function suggestLoad(exerciseId: string, prescription: Prescription, history: WorkoutLog[]) {
  for (const log of history) {
    const entry = log.entries.find((e) => e.exerciseId === exerciseId);
    const done = entry?.sets.filter((s) => s.done) ?? [];
    if (!done.length) continue;
    const kg = Math.max(...done.map((s) => s.kg));
    const allTop = done.length >= prescription.sets && done.every((s) => s.reps >= prescription.reps[1]);
    return allTop && EXERCISES[exerciseId].loaded ? kg + 2.5 : kg;
  }
  return undefined;
}

/** A fresh log for a program day, prefilled with suggested loads and the low end of the rep range. */
export function startLog(day: ProgramDay, history: WorkoutLog[], dayKey: string, now = new Date()): WorkoutLog {
  return {
    id: crypto.randomUUID(),
    day: dayKey,
    startedAt: now.toISOString(),
    focus: day.focus,
    entries: day.exercises.map((p) => {
      const kg = suggestLoad(p.exerciseId, p, history) ?? 0;
      return {
        exerciseId: p.exerciseId,
        sets: Array.from({ length: p.sets }, () => ({
          kg,
          reps: p.reps[0],
          done: false,
        })),
      };
    }),
  };
}
