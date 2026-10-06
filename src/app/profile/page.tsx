"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProfileView } from "@/components/ProfileView";
import { useApp } from "@/components/Providers";
import { useStore } from "@/lib/store";

export default function ProfilePage() {
  const { hydrated } = useApp();
  const profile = useStore((s) => s.profile);
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !profile) router.replace("/onboarding");
  }, [hydrated, profile, router]);

  return hydrated && profile ? <ProfileView /> : <div className="card mx-auto h-96 max-w-3xl animate-pulse" />;
}
