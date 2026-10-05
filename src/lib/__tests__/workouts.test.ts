import { describe, expect, it } from "vitest";
import {
  buildProgram,
  completedSets,
  estimateKcal,
  estimateMinutes,
  EXERCISES,
  nextProgramDay,
  prescribe,
  programDayFor,
  splitFor,
  startLog,
  suggestLoad,
  volume,
  type WorkoutLog,
  type WorkoutSetup,
} from "../workouts";

const setup: WorkoutSetup = {
  weekdays: [5, 1, 3],
  equipment: "gym",
  experience: "intermediate",
};

describe("splitFor", () => {
  it("uses full-body days for beginners training three times a week", () => {
    expect(splitFor(3, "beginner")).toEqual(["fullA", "fullB", "fullC"]);
    expect(splitFor(3, "advanced")).toEqual(["push", "pull", "legs"]);
  });
  it("clamps to two through six days", () => {
    expect(splitFor(1, "beginner")).toHaveLength(2);
    expect(splitFor(7, "beginner")).toHaveLength(6);
  });
});

describe("buildProgram", () => {
  it("assigns one split day per chosen weekday, in week order", () => {
    const p = buildProgram({ ...setup }, "gain");
    expect(p.days.map((d) => d.weekday)).toEqual([1, 3, 5]);
    expect(p.days.map((d) => d.focus)).toEqual(["push", "pull", "legs"]);
  });
  it("only picks exercises that exist and match the equipment", () => {
    const p = buildProgram(
      {
        weekdays: [1, 2, 4, 5],
        equipment: "bodyweight",
        experience: "beginner",
      },
      "lose",
    );
    for (const d of p.days)
      for (const e of d.exercises) {
        expect(EXERCISES[e.exerciseId]).toBeDefined();
        expect(e.exerciseId).not.toMatch(/barbell|cable|machine|leg-press|bench-press/);
      }
  });
});

describe("prescribe", () => {
  it("uses heavier, lower-rep work with longer rest when building muscle", () => {
    expect(prescribe("squat", "gain", "advanced", "gym")).toEqual({
      exerciseId: "back-squat",
      sets: 4,
      reps: [6, 10],
      restSec: 120,
    });
    expect(prescribe("squat", "lose", "intermediate", "gym")).toMatchObject({
      sets: 3,
      reps: [8, 12],
      restSec: 90,
    });
  });
  it("gives isolation work higher reps and timed holds seconds", () => {
    expect(prescribe("lateral", "gain", "beginner", "dumbbells")).toMatchObject({ sets: 2, reps: [10, 15], restSec: 60 });
    expect(prescribe("core", "lose", "beginner", "gym")).toMatchObject({
      exerciseId: "plank",
      reps: [20, 40],
    });
  });
});

describe("schedule helpers", () => {
  const p = buildProgram({ ...setup }, "maintain");
  it("finds today's day by weekday", () => {
    expect(programDayFor(p, new Date(2026, 9, 5))?.focus).toBe("push"); // a Monday
    expect(programDayFor(p, new Date(2026, 9, 6))).toBeUndefined(); // Tuesday is rest
  });
  it("finds the next training day", () => {
    expect(nextProgramDay(p, new Date(2026, 9, 6))).toMatchObject({
      offset: 1,
      day: { focus: "pull" },
    });
    expect(nextProgramDay(p, new Date(2026, 9, 5), true)?.offset).toBe(0);
  });
  it("estimates session length and energy", () => {
    const minutes = estimateMinutes(p.days[0]);
    expect(minutes).toBeGreaterThan(20);
    expect(minutes % 5).toBe(0);
    expect(estimateKcal(60, 80)).toBe(400);
  });
});

describe("logging", () => {
  const p = buildProgram({ ...setup }, "gain");
  const bench = p.days[0].exercises[0];
  const log = (kg: number, reps: number[]): WorkoutLog => ({
    id: "x",
    day: "2026-10-01",
    startedAt: "",
    focus: "push",
    entries: [
      {
        exerciseId: bench.exerciseId,
        sets: reps.map((r) => ({ kg, reps: r, done: true })),
      },
    ],
  });

  it("adds load only when every set hit the top of the range", () => {
    expect(suggestLoad(bench.exerciseId, bench, [log(60, [10, 10, 10])])).toBe(62.5);
    expect(suggestLoad(bench.exerciseId, bench, [log(60, [10, 9, 8])])).toBe(60);
    expect(suggestLoad(bench.exerciseId, bench, [])).toBeUndefined();
  });

  it("prefills a new session from history", () => {
    const s = startLog(p.days[0], [log(60, [10, 10, 10])], "2026-10-05");
    expect(s.entries[0].sets).toHaveLength(bench.sets);
    expect(s.entries[0].sets[0]).toEqual({
      kg: 62.5,
      reps: bench.reps[0],
      done: false,
    });
  });

  it("counts volume and sets over completed sets only", () => {
    const l = log(50, [10, 8]);
    l.entries[0].sets.push({ kg: 50, reps: 10, done: false });
    expect(volume(l)).toBe(900);
    expect(completedSets(l)).toBe(2);
  });
});
