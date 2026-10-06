"use client";

import dynamic from "next/dynamic";
import { Component, useSyncExternalStore, type ReactNode } from "react";
import type { CoreProps } from "./EnergyCore";

const EnergyCore = dynamic(() => import("./EnergyCore"), { ssr: false, loading: () => <Glow /> });

function Glow() {
  return (
    <div className="flex size-full items-center justify-center">
      <div className="size-1/2 animate-pulse rounded-full bg-[radial-gradient(circle,rgb(198_255_61/0.35),transparent_65%)] blur-xl" />
    </div>
  );
}

class WebGLBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <Glow /> : this.props.children;
  }
}

let webgl: boolean | undefined;

function hasWebGL() {
  if (webgl === undefined) {
    try {
      const canvas = document.createElement("canvas");
      webgl = Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

const subscribe = () => () => {};

export function Core3D(props: CoreProps) {
  const supported = useSyncExternalStore(subscribe, hasWebGL, () => false);
  if (!supported) return <Glow />;
  return (
    <WebGLBoundary>
      <EnergyCore {...props} />
    </WebGLBoundary>
  );
}
