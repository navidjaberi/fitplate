"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { useStore } from "@/lib/store";

type AppInfo = { hydrated: boolean; mode: "live" | "demo" | null };

const AppContext = createContext<AppInfo>({ hydrated: false, mode: null });

export const useApp = () => useContext(AppContext);

export function Providers({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [mode, setMode] = useState<AppInfo["mode"]>(null);
  const locale = useStore((s) => s.locale);

  useEffect(() => {
    const isFirstVisit = !localStorage.getItem("kalori");
    Promise.resolve(useStore.persist.rehydrate()).then(() => {
      if (isFirstVisit && navigator.language.toLowerCase().startsWith("fa")) {
        useStore.getState().setLocale("fa");
      }
      setHydrated(true);
    });
    fetch("/api/analyze")
      .then((r) => r.json())
      .then((d: { mode: "live" | "demo" }) => setMode(d.mode))
      .catch(() => setMode(null));
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "fa" ? "rtl" : "ltr";
  }, [locale]);

  return (
    <AppContext.Provider value={{ hydrated, mode }}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </AppContext.Provider>
  );
}
