export const SUPPLY_TEAL = "rgb(118, 167, 158)";

export function LiveDot({ size = 2 }: { size?: 2 | 3 }): React.JSX.Element {
  const dotClassName = size === 3 ? "h-3 w-3" : "h-2 w-2";

  return (
    <span className={`relative inline-flex ${dotClassName}`}>
      <span
        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
        style={{ backgroundColor: SUPPLY_TEAL }}
      />
      <span
        className={`relative inline-flex rounded-full ${dotClassName}`}
        style={{ backgroundColor: SUPPLY_TEAL }}
      />
    </span>
  );
}

export function LoadingDot(): React.JSX.Element {
  return (
    <span
      className="inline-block h-2 w-2 animate-pulse rounded-full"
      style={{ backgroundColor: "var(--text-muted)" }}
    />
  );
}

export function Placeholder({
  className = "h-5 w-36",
}: {
  className?: string;
}): React.JSX.Element {
  return (
    <span
      className={`inline-block animate-pulse rounded ${className}`}
      style={{ backgroundColor: "var(--border-subtle)" }}
    />
  );
}
