"use client";

import { useCallback, useReducer, useRef } from "react";
import { compressImage } from "./image";
import type { Analysis, AnalyzeResponse, Locale } from "./schema";

export type ScanState =
  | { status: "idle" }
  | { status: "analyzing"; image: string }
  | { status: "result"; image: string; analysis: Analysis; mode: "live" | "demo" }
  | { status: "error"; image?: string; error: string };

type Action =
  | { type: "start"; image: string }
  | { type: "done"; analysis: Analysis; mode: "live" | "demo" }
  | { type: "fail"; error: string }
  | { type: "reset" };

function reducer(state: ScanState, action: Action): ScanState {
  switch (action.type) {
    case "start":
      return { status: "analyzing", image: action.image };
    case "done":
      return state.status === "analyzing"
        ? { status: "result", image: state.image, analysis: action.analysis, mode: action.mode }
        : state;
    case "fail":
      return { status: "error", error: action.error, image: "image" in state ? state.image : undefined };
    case "reset":
      return { status: "idle" };
  }
}

/** Owns the photo → API → result flow, including cancelling a stale request when a new photo arrives. */
export function useScanner(locale: Locale) {
  const [state, dispatch] = useReducer(reducer, { status: "idle" });
  const abortRef = useRef<AbortController | null>(null);

  const scan = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return dispatch({ type: "fail", error: "invalid_request" });
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      let image: string;
      try {
        image = await compressImage(file);
      } catch {
        return dispatch({ type: "fail", error: "invalid_request" });
      }
      dispatch({ type: "start", image });

      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image, locale }),
          signal: controller.signal,
        });
        const data = (await res.json()) as AnalyzeResponse;
        if (data.ok) dispatch({ type: "done", analysis: data.analysis, mode: data.mode });
        else dispatch({ type: "fail", error: data.error });
      } catch (err) {
        if ((err as Error).name !== "AbortError") dispatch({ type: "fail", error: "network" });
      }
    },
    [locale],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    dispatch({ type: "reset" });
  }, []);

  return { state, scan, reset };
}
