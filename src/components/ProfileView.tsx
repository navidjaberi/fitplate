"use client";

import { useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { planTargets, type GoalPlan, type Macros } from "@/lib/nutrition";
import { useStore, type Profile } from "@/lib/store";
import {
  ActivityPicker,
  BodyFields,
  DEFAULT_PLAN,
  DEFAULT_PROFILE,
  Field,
  GoalPicker,
  inputClass,
  isPlanValid,
  isProfileValid,
  TargetsSummary,
} from "./PlanForm";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="mb-4 text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

export function ProfileView() {
  const { t, locale } = useI18n();
  const store = useStore();
  const [profile, setProfile] = useState<Profile>(store.profile ?? DEFAULT_PROFILE);
  const [plan, setPlan] = useState<GoalPlan>(store.plan ?? DEFAULT_PLAN);
  const [editing, setEditing] = useState(false);
  const [custom, setCustom] = useState<Macros>(store.goal);
  const [saved, setSaved] = useState(false);

  const valid = isProfileValid(profile) && isPlanValid(plan, profile.weightKg);
  const computed = planTargets(profile, plan);

  const save = () => {
    if (!valid) return;
    store.setPlan(profile, plan);
    if (editing) store.setCustomTargets(custom);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-extrabold tracking-tight">{t.profileTitle}</h1>

      <Section title={t.bodySection}>
        <BodyFields value={profile} onChange={setProfile} />
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-medium text-muted">{t.activity}</h3>
          <ActivityPicker value={profile.activity} onChange={(activity) => setProfile({ ...profile, activity })} />
        </div>
      </Section>

      <Section title={t.goalTitle}>
        <GoalPicker value={plan} weightKg={profile.weightKg} onChange={setPlan} />
      </Section>

      <Section title={t.targetsSection}>
        {editing ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {(["calories", "protein", "carbs", "fat"] as const).map((k) => (
              <Field key={k} label={k === "calories" ? t.kcal : `${t[k]} (${t.g})`}>
                <input
                  type="number"
                  min={0}
                  value={custom[k]}
                  onChange={(e) => setCustom({ ...custom, [k]: Number(e.target.value) })}
                  className={inputClass}
                />
              </Field>
            ))}
          </div>
        ) : (
          <TargetsSummary targets={store.customTargets ? store.goal : computed} profile={profile} />
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-muted">{store.customTargets || editing ? t.customTargetsLabel : t.autoTargets}</span>
          <div className="flex gap-2">
            {(store.customTargets || editing) && (
              <button
                onClick={() => {
                  store.setCustomTargets(null);
                  setEditing(false);
                }}
                className="rounded-full border border-line px-4 py-2 font-medium hover:border-ink/30"
              >
                {t.resetTargets}
              </button>
            )}
            {!editing && (
              <button
                onClick={() => {
                  setCustom(store.customTargets ? store.goal : computed);
                  setEditing(true);
                }}
                className="rounded-full border border-line px-4 py-2 font-medium hover:border-ink/30"
              >
                {t.editTargets}
              </button>
            )}
          </div>
        </div>
      </Section>

      <Section title={t.language}>
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-surface-2 p-1">
          {(["en", "fa"] as const).map((l) => (
            <button
              key={l}
              onClick={() => store.setLocale(l)}
              className={`rounded-xl py-2.5 font-medium transition ${locale === l ? "bg-surface shadow-sm" : "text-muted"}`}
            >
              {l === "en" ? "English" : "فارسی"}
            </button>
          ))}
        </div>
      </Section>

      <div className="sticky bottom-20 z-20 flex items-center justify-between gap-3 rounded-full border border-line bg-surface/90 p-2 ps-5 shadow-lg backdrop-blur md:bottom-4">
        <button
          onClick={() => window.confirm(t.clearConfirm) && store.clearAll()}
          className="text-sm font-medium text-protein hover:underline"
        >
          {t.clearData}
        </button>
        <button
          onClick={save}
          disabled={!valid}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 font-semibold text-bg disabled:opacity-40"
        >
          {saved && <Check className="size-4" />}
          {saved ? t.saved : t.save}
        </button>
      </div>
    </div>
  );
}
