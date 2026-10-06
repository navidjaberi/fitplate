"use client";

import { Onboarding } from "@/components/Onboarding";
import { useApp } from "@/components/Providers";

export default function OnboardingPage() {
  const { hydrated } = useApp();
  return hydrated ? <Onboarding /> : <div className="card mx-auto h-96 max-w-xl animate-pulse" />;
}
