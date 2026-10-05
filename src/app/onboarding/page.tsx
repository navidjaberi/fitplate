"use client";

import { Onboarding } from "@/components/Onboarding";
import { useApp } from "@/components/Providers";

export default function OnboardingPage() {
  const { hydrated } = useApp();
  // Wait for saved data so editing starts from the user's own values.
  return hydrated ? <Onboarding /> : <div className="card mx-auto h-96 max-w-xl animate-pulse" />;
}
