"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { ArrowUpRight, Camera } from "lucide-react";
import { dayKey } from "@/lib/date";
import { useI18n } from "@/lib/i18n";
import { mealsForDay, useStore } from "@/lib/store";
import { GoalCard } from "./GoalCard";
import { MealCard } from "./MealCard";
import { useApp } from "./Providers";
import { TodayPanel } from "./TodayPanel";
import { WeightCard } from "./WeightCard";

function greetingKey(hour: number) {
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

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
      <div className="grid gap-6 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card h-80 animate-pulse" />
        ))}
      </div>
    );
  }

  const now = new Date();
  const today = mealsForDay(meals, dayKey(now));

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm text-muted">
          {now.toLocaleDateString(tag, { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight">{t.greeting[greetingKey(now.getHours())]}</h1>
        <p className="mt-1 text-muted">{t.dashSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="min-w-0 space-y-6 lg:order-2">
          <Link
            href="/scan"
            className="group relative flex items-center gap-4 overflow-hidden rounded-[1.75rem] bg-accent p-5 text-accent-ink shadow-lg shadow-accent/25 transition hover:-translate-y-0.5 sm:p-6"
          >
            <div className="absolute -end-8 -top-8 size-32 rounded-full bg-white/15" />
            <div className="flex size-12 items-center justify-center rounded-2xl bg-white/20">
              <Camera className="size-6" />
            </div>
            <div className="flex-1">
              <div className="text-lg font-bold">{t.scanCta}</div>
              <div className="text-sm opacity-85">{t.scanCtaHint}</div>
            </div>
            <ArrowUpRight className="size-5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100" />
          </Link>
          <GoalCard />
        </div>

        <div className="min-w-0 lg:order-1">
          <TodayPanel showMeals={false} />
        </div>

        <div className="min-w-0 space-y-6 lg:order-3">
          <WeightCard />
          <section className="card p-5 sm:p-6">
            <h2 className="mb-2 font-bold">{t.today}</h2>
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
          </section>
        </div>
      </div>
    </div>
  );
}
