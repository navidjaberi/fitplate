"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { useI18n } from "@/lib/i18n";

/** Counts up to `value` when it scrolls into view, then eases between later values. */
export function AnimatedNumber({ value, digits = 0, className }: { value: number; digits?: number; className?: string }) {
  const { num } = useI18n();
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(0);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView) return;
    if (reduced) {
      el.textContent = num(value, digits);
      return;
    }
    const controls = animate(from.current, value, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent = num(v, digits);
      },
    });
    from.current = value;
    return () => controls.stop();
  }, [value, digits, inView, reduced, num]);

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {num(0, digits)}
    </span>
  );
}
