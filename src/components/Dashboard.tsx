"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { ArrowUpRight, ScanLine } from "lucide-react";
import { dayKey } from "@/lib/date";
import { useI18n } from "@/lib/i18n";
import { mealsForDay, useStore } from "@/lib/store";
import { GoalCard } from "./GoalCard";
import { HeroToday } from "./HeroToday";
import { MealCard } from "./MealCard";
import { useApp } from "./Providers";
import { TiltCard } from "./ui/TiltCard";
import { WeightCard } from "./WeightCard";
import { TodayWorkoutCard } from "./workouts/TodayWorkoutCard";

function greetingKey(hour: number) {
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

const container: Variants = { show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };
const item: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export function Dashboard() {
  const { t, tag } = useI18n();
  const { hydrated } = useApp();
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const meals = useStore((s) => s.meals);

  // First visit: set up a profile before showing numbers that depend on it.
  useEffect(() => {
    if (hydrated && !profile) router.replace("/onboarding");
  }, [hydrated, profile, router]);

  if (!hydrated || !profile) {
    return (
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card h-96 animate-pulse lg:col-span-2" />
        <div className="card h-96 animate-pulse" />
      </div>
    );
  }

  const now = new Date();
  const today = mealsForDay(meals, dayKey(now));

  return (
    <motion.div variants={container} initial="hidden" animate="show">
      <motion.header variants={item} className="mb-7">
        <p className="text-sm text-muted">{now.toLocaleDateString(tag, { weekday: "long", month: "long", day: "numeric" })}</p>
        <h1 className="font-display mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="text-gradient">{t.greeting[greetingKey(now.getHours())]}</span>
        </h1>
        <p className="mt-2 text-muted">{t.dashSubtitle}</p>
      </motion.header>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
        <motion.div variants={item} className="min-w-0 lg:col-span-2">
          <HeroToday />
        </motion.div>

        <div className="min-w-0 space-y-5">
          <motion.div variants={item}>
            <Link
              href="/scan"
              className="group relative flex items-center gap-4 overflow-hidden rounded-[1.75rem] bg-accent p-5 text-accent-ink shadow-[0_20px_60px_-15px_var(--glow)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_70px_-12px_var(--glow)] sm:p-6"
            >
              <div className="absolute -end-10 -top-10 size-36 rounded-full bg-white/25 blur-2xl transition duration-500 group-hover:scale-125" />
              <div className="relative flex size-12 items-center justify-center rounded-2xl bg-black/10">
                <ScanLine className="size-6" />
              </div>
              <div className="relative flex-1">
                <div className="font-display text-lg font-bold">{t.scanCta}</div>
                <div className="text-sm opacity-75">{t.scanCtaHint}</div>
              </div>
              <ArrowUpRight className="relative size-5 transition duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100" />
            </Link>
          </motion.div>
          <motion.div variants={item}>
            <GoalCard />
          </motion.div>
        </div>

        <motion.div variants={item} className="min-w-0 lg:col-span-2">
          <WeightCard />
        </motion.div>

        <div className="min-w-0 space-y-5">
          <motion.div variants={item}>
            <TodayWorkoutCard />
          </motion.div>
          <motion.div variants={item}>
            <TiltCard className="p-5 sm:p-6">
              <h2 className="font-display mb-2 font-bold">{t.today}</h2>
              {today.length === 0 ? (
                <p className="py-4 text-sm text-muted">{t.noMeals}</p>
              ) : (
                <ul className="-mx-2 space-y-1">
                  <AnimatePresence initial={false}>
                    {today.map((m) => (
                      <MealCard key={m.id} meal={m} />
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </TiltCard>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
