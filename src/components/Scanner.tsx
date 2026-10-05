"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Camera, ImageUp, RotateCcw, TriangleAlert } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useScanner } from "@/lib/useScanner";
import { AnalysisResult } from "./AnalysisResult";

export function Scanner() {
  const { t, locale } = useI18n();
  const { state, scan, reset } = useScanner(locale);
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  // Paste a photo straight from the clipboard.
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files ?? []).find((f) => f.type.startsWith("image/"));
      if (file) scan(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [scan]);

  const onFiles = (files: FileList | null) => {
    const file = files?.[0];
    if (file) scan(file);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    onFiles(e.dataTransfer.files);
  };

  const pickers = (
    <>
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onFiles(e.target.files)} />
      <input ref={uploadRef} type="file" accept="image/*" hidden onChange={(e) => onFiles(e.target.files)} />
    </>
  );

  if (state.status === "result") {
    return (
      <AnalysisResult
        key={state.image.length}
        image={state.image}
        analysis={state.analysis}
        mode={state.mode}
        onReset={reset}
      />
    );
  }

  const image = "image" in state ? state.image : undefined;

  return (
    <section
      className={`card relative overflow-hidden transition ${dragging ? "shadow-[0_0_0_2px_var(--accent),0_0_60px_-10px_var(--glow)]" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      {pickers}
      <AnimatePresence mode="wait">
        {state.status === "analyzing" && image ? (
          <motion.div key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="relative aspect-[4/3] overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element -- local data URL preview */}
              <img src={image} alt="" className="size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="scan-line absolute inset-x-0 top-0 h-full">
                <div className="h-1/3 bg-gradient-to-b from-transparent via-accent/35 to-transparent" />
                <div className="h-0.5 bg-accent shadow-[0_0_24px_4px_var(--accent)]" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-lg font-bold">{t.analyzing}</p>
                <AnalyzingSteps steps={t.analyzingSteps} />
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center px-6 py-12 text-center sm:py-16"
          >
            <div className="relative mb-8 size-40 [perspective:600px]" aria-hidden>
              <div className="absolute inset-0 [transform-style:preserve-3d]">
                <span className="gyro text-accent [--dur:7s] [--rx:68deg] [--ry:0deg]" />
                <span className="gyro text-fat/80 [--dur:9s] [--rx:68deg] [--ry:60deg]" />
                <span className="gyro text-protein/80 [--dur:11s] [--rx:68deg] [--ry:-60deg]" />
              </div>
              <div className="absolute inset-0 m-auto size-20 rounded-full bg-accent/30 blur-2xl" />
              <div className="absolute inset-0 m-auto flex size-20 items-center justify-center rounded-full bg-accent text-accent-ink shadow-[0_0_50px_-6px_var(--glow),inset_0_2px_0_rgb(255_255_255/0.5)]">
                <Camera className="size-9" />
              </div>
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-balance sm:text-4xl">
              {dragging ? t.dropHere : t.scanTitle}
            </h1>
            <p className="mt-3 max-w-md text-muted">{t.scanSubtitle}</p>

            {state.status === "error" && (
              <div className="mt-6 flex items-center gap-2 rounded-2xl bg-protein/10 px-4 py-3 text-sm font-medium text-protein">
                <TriangleAlert className="size-4 shrink-0" />
                {t.errors[state.error] ?? t.errors.server_error}
              </div>
            )}

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => cameraRef.current?.click()}
                className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold"
              >
                <Camera className="size-5" />
                {t.takePhoto}
              </button>
              <button
                onClick={() => uploadRef.current?.click()}
                className="btn-ghost inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold"
              >
                <ImageUp className="size-5" />
                {t.upload}
              </button>
              {state.status === "error" && (
                <button onClick={reset} className="inline-flex items-center gap-2 px-3 py-3 text-sm text-muted hover:text-ink">
                  <RotateCcw className="size-4" />
                  {t.tryAgain}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function AnalyzingSteps({ steps }: { steps: string[] }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => Math.min(n + 1, steps.length - 1)), 1600);
    return () => clearInterval(id);
  }, [steps.length]);
  return (
    <ol className="mt-3 flex flex-wrap gap-2 text-xs">
      {steps.map((s, idx) => (
        <li
          key={s}
          className={`rounded-full px-3 py-1 backdrop-blur transition ${
            idx <= i ? "bg-accent text-accent-ink" : "bg-white/10 text-white/70"
          }`}
        >
          {s}
        </li>
      ))}
    </ol>
  );
}
