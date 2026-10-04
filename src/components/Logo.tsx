export function Logo({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <circle cx="16" cy="16" r="15" fill="var(--accent)" />
      <circle cx="16" cy="16" r="9.5" fill="none" stroke="var(--accent-ink)" strokeWidth="2.5" opacity="0.9" />
      <path
        d="M16 6.5a9.5 9.5 0 0 1 9.5 9.5"
        fill="none"
        stroke="var(--accent-ink)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="3" fill="var(--accent-ink)" />
    </svg>
  );
}
