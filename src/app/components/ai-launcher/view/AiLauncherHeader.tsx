import { SparklesIcon } from "../../icons";
import { CloseIcon, CollapseIcon, ExpandIcon } from "../icons";
import type { PanelState } from "../types";

type AiLauncherHeaderProps = {
  onClose: () => void;
  onToggleSize: () => void;
  panelState: PanelState;
};

export function AiLauncherHeader({
  onClose,
  onToggleSize,
  panelState,
}: AiLauncherHeaderProps): React.JSX.Element {
  return (
    <div className="border-subtle shrink-0 border-b px-5 py-3 md:px-8 lg:px-10">
      <div className="mx-auto flex max-w-3xl items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-muted)]">
            <SparklesIcon size={15} />
          </span>
          <span className="text-[13px] font-medium text-[var(--text-primary)]">
            Ask anything
          </span>
          <span
            className="rounded-full border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/10 px-1.5 py-px text-[9px] font-semibold tracking-wider text-[var(--accent-primary)] uppercase"
            title="This feature is in active development — occasional issues may occur"
            aria-label="Beta — occasional issues may occur"
          >
            Beta
          </span>
          <span className="hidden text-[10px] text-[var(--text-muted)]/70 min-[360px]:inline">
            Powered by{" "}
            <a
              href="https://kaspa.news/ask"
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-2 transition-colors hover:text-[var(--text-secondary)] hover:underline"
            >
              kaspa.news/ask
            </a>
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleSize}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
            aria-label={
              panelState === "full" ? "Collapse panel" : "Expand panel"
            }
          >
            {panelState === "full" ? (
              <CollapseIcon size={14} />
            ) : (
              <ExpandIcon size={14} />
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-muted)] transition-colors hover:text-[var(--text-secondary)]"
            aria-label="Close panel"
          >
            <CloseIcon size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
