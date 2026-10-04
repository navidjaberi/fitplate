"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Languages, Settings2, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { useApp } from "./Providers";
import { SettingsDialog } from "./SettingsDialog";
import { Logo } from "./Logo";

export function Header() {
  const { t, locale } = useI18n();
  const { mode } = useApp();
  const setLocale = useStore((s) => s.setLocale);
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const links = [
    { href: "/", label: t.navToday },
    { href: "/history", label: t.navHistory },
  ];

  return (
    <header className="sticky top-0 z-30 -mx-4 mb-6 px-4 pt-4 backdrop-blur-md sm:-mx-6 sm:px-6">
      <div className="flex items-center gap-3 rounded-full border border-line bg-surface/80 py-2 ps-4 pe-2 shadow-sm">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <Logo />
          <span className="text-lg">{t.appName}</span>
        </Link>

        {mode === "demo" && (
          <span
            title={t.demoHint}
            className="hidden items-center gap-1 rounded-full bg-carbs/15 px-2.5 py-1 text-xs font-semibold text-carbs sm:inline-flex"
          >
            <Sparkles className="size-3.5" />
            {t.demoBadge}
          </span>
        )}

        <nav className="ms-auto flex items-center gap-1 rounded-full bg-surface-2 p-1 text-sm font-medium">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3.5 py-1.5 transition ${
                  active ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setLocale(locale === "fa" ? "en" : "fa")}
          className="flex size-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink"
          aria-label={t.language}
          title={locale === "fa" ? "English" : "فارسی"}
        >
          <Languages className="size-4.5" />
        </button>
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex size-9 items-center justify-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink"
          aria-label={t.settings}
        >
          <Settings2 className="size-4.5" />
        </button>
      </div>
      <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </header>
  );
}
