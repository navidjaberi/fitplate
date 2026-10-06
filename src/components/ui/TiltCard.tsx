"use client";

import { useRef, type ComponentProps, type PointerEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";

type Props = ComponentProps<typeof motion.div> & {
  max?: number;
};

const SPRING = { stiffness: 220, damping: 22, mass: 0.6 };

export function TiltCard({ max = 6, className = "", children, style, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const rx = useSpring(useMotionValue(0), SPRING);
  const ry = useSpring(useMotionValue(0), SPRING);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    el.style.setProperty("--spot", "1");
    if (!reduced) {
      ry.set((px - 0.5) * 2 * max);
      rx.set(-(py - 0.5) * 2 * max);
    }
  };

  const onLeave = () => {
    ref.current?.style.setProperty("--spot", "0");
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1100, ...style }}
      className={`card spotlight ${className}`}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
