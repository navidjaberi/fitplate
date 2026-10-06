"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { planTargets, type GoalPlan } from "@/lib/nutrition";
import { useStore, type Profile } from "@/lib/store";
import {
  ActivityPicker,
  BodyFields,
  DEFAULT_PLAN,
  DEFAULT_PROFILE,
  GoalPicker,
  isPlanValid,
  isProfileValid,
  TargetsSummary,
} from "./PlanForm";

export function Onboarding() {
  const { t, dir } = useI18n();
  const router = useRouter();
  const setPlan = useStore((s) => s.setPlan);
  const savedProfile = useStore((s) => s.profile);
  const savedPlan = useStore((s) => s.plan);
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Profile>(savedProfile ?? DEFAULT_PROFILE);
  const [plan, setPlanDraft] = useState<GoalPlan>(savedPlan ?? DEFAULT_PLAN);

  const last = t.obSteps.length - 1;
  const canContinue = step === 0 ? isProfileValid(profile) : step === 2 ? isPlanValid(plan, profile.weightKg) : true;
  const Back = dir === "rtl" ? ArrowRight : ArrowLeft;
  const Next = dir === "rtl" ? ArrowLeft : ArrowRight;

  const finish = () => {
    setPlan(profile, plan);
    router.replace("/");
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 text-center">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{t.obWelcome}</h1>
        <p className="mt-2 text-muted">{t.obIntro}</p>
      </div>

      <ol className="mb-6 grid grid-cols-4 gap-2" aria-label="progress">
        {t.obSteps.map((label, i) => (
          <li key={label} className="text-center">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-accent shadow-[0_0_12px_var(--glow)]"
                initial={false}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <span className={`mt-2 block text-xs ${i === step ? "font-semibold text-ink" : "text-muted"}`}>{label}</span>
          </li>
        ))}
      </ol>

      <section className="card overflow-hidden bg-surface/85 p-5 [backdrop-filter:none] sm:p-7">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={step}
            initial={{ opacity: 0, rotateY: dir === "rtl" ? 35 : -35, x: dir === "rtl" ? -30 : 30 }}
            animate={{ opacity: 1, rotateY: 0, x: 0 }}
            style={{ transformPerspective: 1200 }}
            exit={{ opacity: 0, rotateY: dir === "rtl" ? -35 : 35, x: dir === "rtl" ? 30 : -30 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 && <BodyFields value={profile} onChange={setProfile} />}
            {step === 1 && (
              <ActivityPicker value={profile.activity} onChange={(activity) => setProfile({ ...profile, activity })} />
            )}
            {step === 2 && <GoalPicker value={plan} weightKg={profile.weightKg} onChange={setPlanDraft} />}
            {step === 3 && (
              <div>
                <p className="mb-4 text-muted">{t.obResultIntro}</p>
                <TargetsSummary targets={planTargets(profile, plan)} profile={profile} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-3 font-medium text-muted hover:text-ink ${
              step === 0 ? "invisible" : ""
            }`}
          >
            <Back className="size-4" />
            {t.back}
          </button>
          <button
            type="button"
            disabled={!canContinue}
            onClick={() => (step === last ? finish() : setStep((s) => s + 1))}
            className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold disabled:opacity-40"
          >
            {step === last ? t.finish : t.next}
            {step === last ? <Check className="size-4" /> : <Next className="size-4" />}
          </button>
        </div>
      </section>
    </div>
  );
}
