/** Fixed ambient background: drifting colour fields (soft radial gradients; no filter blur, which repaints badly while animating), a faint grid, and grain. Pure CSS, no JS. */
export function Backdrop() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="aurora absolute -top-1/3 start-1/4 size-[60vw] max-w-[900px] rounded-full bg-[radial-gradient(circle,rgb(198_255_61/0.16),transparent_65%)]" />
      <div
        className="aurora absolute top-1/3 -end-1/4 size-[55vw] max-w-[800px] rounded-full bg-[radial-gradient(circle,rgb(69_220_255/0.13),transparent_65%)]"
        style={{ animationDelay: "-8s" }}
      />
      <div
        className="aurora absolute -bottom-1/3 -start-1/4 size-[50vw] max-w-[700px] rounded-full bg-[radial-gradient(circle,rgb(255_92_122/0.12),transparent_65%)]"
        style={{ animationDelay: "-15s" }}
      />
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgb(255 255 255 / 0.04) 1px, transparent 1px), linear-gradient(90deg, rgb(255 255 255 / 0.04) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, #000 30%, transparent 75%)",
        }}
      />
    </div>
  );
}
