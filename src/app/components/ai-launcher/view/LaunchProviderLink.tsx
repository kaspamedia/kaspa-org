import { ArrowUpRightIcon } from "../../icons";
import type { ProviderLink } from "../types";

type LaunchProviderLinkProps = {
  compact?: boolean;
  link: ProviderLink;
};

export function LaunchProviderLink({
  compact = false,
  link,
}: LaunchProviderLinkProps): React.JSX.Element {
  if (compact) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium whitespace-nowrap text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
      >
        <span>{link.label}</span>
        <ArrowUpRightIcon size={9} />
      </a>
    );
  }

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between rounded-lg border border-[var(--border-subtle)] px-2.5 py-2.5 text-[var(--text-primary)] transition-colors hover:border-[var(--btn-ghost-hover-border)] hover:bg-[var(--btn-ghost-hover-bg)] sm:px-4 sm:py-3"
    >
      <span className="text-[12px] font-medium sm:text-[13px]">
        {link.label}
      </span>
      <span className="opacity-30 transition-opacity group-hover:opacity-60">
        <ArrowUpRightIcon />
      </span>
    </a>
  );
}
