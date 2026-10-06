"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer, MeshDistortMaterial, Sparkles } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";

export type CoreProps = {
  progress: number;
  macros: { protein: number; carbs: number; fat: number };
};

const COLORS = { accent: "#c6ff3d", over: "#ff5c7a", protein: "#ff5c7a", carbs: "#ffb547", fat: "#45dcff", track: "#1d2130" };
const RING_RADIUS = 1.55;
const TUBE = 0.11;

function ProgressRing({ progress }: { progress: number }) {
  const mesh = useRef<THREE.Mesh>(null);
  const shown = useRef(0);
  const target = Math.min(progress, 1);
  const over = progress > 1;

  useFrame((_, dt) => {
    if (!mesh.current) return;
    const next = THREE.MathUtils.damp(shown.current, target, 3, dt);
    if (Math.abs(next - shown.current) < 0.0005 && mesh.current.geometry.userData.arc === shown.current) return;
    shown.current = next;
    const arc = Math.max(next, 0.001) * Math.PI * 2;
    mesh.current.geometry.dispose();
    mesh.current.geometry = new THREE.TorusGeometry(RING_RADIUS, TUBE, 32, 160, arc);
    mesh.current.geometry.userData.arc = next;
  });

  return (
    <group rotation={[0, 0, Math.PI / 2]} scale={[-1, 1, 1]}>
      <mesh>
        <torusGeometry args={[RING_RADIUS, TUBE * 0.55, 24, 160]} />
        <meshStandardMaterial color={COLORS.track} roughness={0.6} metalness={0.4} />
      </mesh>
      <mesh ref={mesh}>
        <torusGeometry args={[RING_RADIUS, TUBE, 32, 160, 0.001]} />
        <meshStandardMaterial
          color={over ? COLORS.over : COLORS.accent}
          emissive={over ? COLORS.over : COLORS.accent}
          emissiveIntensity={1.6}
          toneMapped={false}
          roughness={0.25}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

function MacroOrb({ color, fill, radius, tilt, speed, phase }: { color: string; fill: number; radius: number; tilt: number; speed: number; phase: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const size = 0.1 + Math.min(fill, 1.2) * 0.13;
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + phase;
    ref.current?.position.set(Math.cos(t) * radius, Math.sin(t) * radius * Math.cos(tilt), Math.sin(t) * radius * Math.sin(tilt));
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 48, 48]} />
      <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={0.9} roughness={0.15} clearcoat={1} toneMapped={false} />
    </mesh>
  );
}

function Parallax({ children }: { children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { pointer } = useThree();
  useFrame((_, dt) => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.x * 0.35, 4, dt);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -pointer.y * 0.25, 4, dt);
  });
  return <group ref={group}>{children}</group>;
}

function Scene({ progress, macros }: CoreProps) {
  const coreColor = progress > 1 ? COLORS.over : COLORS.accent;
  const orbs = useMemo(
    () => [
      { key: "protein", color: COLORS.protein, fill: macros.protein, radius: 2.05, tilt: 1.1, speed: 0.55, phase: 0 },
      { key: "carbs", color: COLORS.carbs, fill: macros.carbs, radius: 2.25, tilt: -0.9, speed: 0.42, phase: 2.1 },
      { key: "fat", color: COLORS.fat, fill: macros.fat, radius: 1.95, tilt: 0.4, speed: 0.68, phase: 4.2 },
    ],
    [macros.protein, macros.carbs, macros.fat],
  );

  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[3, 3, 4]} intensity={30} color={COLORS.accent} />
      <pointLight position={[-4, -2, 3]} intensity={25} color={COLORS.fat} />
      <Environment resolution={128}>
        <Lightformer form="ring" intensity={2} position={[0, 4, -6]} scale={6} />
        <Lightformer intensity={1.2} position={[-6, 0, 0]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer intensity={1.2} color={COLORS.fat} position={[6, 0, 0]} rotation-y={-Math.PI / 2} scale={[8, 2, 1]} />
      </Environment>

      <Parallax>
        <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.5}>
          <ProgressRing progress={progress} />
          <mesh>
            <icosahedronGeometry args={[0.62, 20]} />
            <MeshDistortMaterial
              color={coreColor}
              emissive={coreColor}
              emissiveIntensity={0.35}
              distort={0.35}
              speed={2}
              roughness={0.1}
              metalness={0.6}
            />
          </mesh>
          {orbs.map(({ key, ...orb }) => (
            <MacroOrb key={key} {...orb} />
          ))}
        </Float>
        <Sparkles count={60} scale={[6, 4, 3]} size={2} speed={0.3} opacity={0.5} color={COLORS.accent} />
      </Parallax>

      <EffectComposer>
        <Bloom intensity={0.9} luminanceThreshold={0.55} luminanceSmoothing={0.3} mipmapBlur />
      </EffectComposer>
    </>
  );
}

export default function EnergyCore(props: CoreProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapper} className="size-full [mask-image:radial-gradient(closest-side,#000_78%,transparent)]">
      <Canvas
        dpr={[1, 2]}
        frameloop={visible ? "always" : "never"}
        camera={{ position: [0, 0, 6.2], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <Scene {...props} />
      </Canvas>
    </div>
  );
}
