"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartNoAxesColumn, House, Languages, ScanLine, Sparkles, UserRound, type LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useStore } from "@/lib/store";
import { useApp } from "./Providers";
import { Logo } from "./Logo";

type NavItem = { href: string; label: string; icon: LucideIcon };

export function Header() {
  const { t, locale } = useI18n();
  const { mode } = useApp();
  const setLocale = useStore((s) => s.setLocale);
  const pathname = usePathname();

  const links: NavItem[] = [
    { href: "/", label: t.navDashboard, icon: House },
    { href: "/scan", label: t.navScan, icon: ScanLine },
    { href: "/history", label: t.navProgress, icon: ChartNoAxesColumn },
    { href: "/profile", label: t.navProfile, icon: UserRound },
  ];
  // Onboarding is a focused flow: no navigation to wander off into.
  const showNav = pathname !== "/onboarding";

  return (
    <>
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

          {showNav && (
            <nav className="ms-auto hidden items-center gap-1 rounded-full bg-surface-2 p-1 text-sm font-medium md:flex">
              {links.map((l) => (
                <NavLink key={l.href} item={l} active={pathname === l.href} />
              ))}
            </nav>
          )}

          <button
            onClick={() => setLocale(locale === "fa" ? "en" : "fa")}
            className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-muted transition hover:bg-surface-2 hover:text-ink ${
              showNav ? "max-md:ms-auto" : "ms-auto"
            }`}
            aria-label={t.language}
          >
            <Languages className="size-4" />
            {locale === "fa" ? "EN" : "فا"}
          </button>
        </div>
      </header>

      {showNav && (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
          <div className="mx-auto flex max-w-md justify-around px-2 py-1.5">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[11px] font-medium transition ${
                    active ? "text-accent" : "text-muted"
                  }`}
                >
                  <Icon className="size-5" />
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`rounded-full px-3.5 py-1.5 transition ${
        active ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
      }`}
    >
      {item.label}
    </Link>
  );
}
