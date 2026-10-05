"use client";

import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-line py-6 text-center text-xs text-muted max-md:mb-16">
      {t.appName} · {t.footer}
    </footer>
  );
}
