import { type ReactNode } from "react";

import { KASPA_ACCENT } from "./content";

export function GridSurface({ className = "" }: { className?: string }) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 hidden sm:block ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(var(--border-subtle) 1px, transparent 1px), linear-gradient(90deg, var(--border-subtle) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        maskImage:
          "radial-gradient(circle at center, black 24%, transparent 78%)",
        opacity: 0.22,
      }}
    />
  );
}

export function MetaPill({
  children,
  accent = false,
}: {
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <span
      className="inline-flex items-center gap-2 self-start rounded-full border px-3 py-1.5 text-[12px] font-medium"
      style={{
        borderColor: accent
          ? `rgba(${KASPA_ACCENT}, 0.18)`
          : "var(--border-subtle)",
        background: accent ? `rgba(${KASPA_ACCENT}, 0.05)` : "var(--surface)",
        color: accent ? "var(--text-primary)" : "var(--text-secondary)",
      }}
    >
      {children}
    </span>
  );
}
