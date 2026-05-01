import type { MutableRefObject } from "react";

import type { PageSectionLink } from "./types";

export type ObserverEntryState = {
  isIntersecting: boolean;
  ratio: number;
  top: number;
};

export const IDLE_DELAY_MS = 1400;
export const PENDING_SECTION_TIMEOUT_MS = 1200;
const BOTTOM_DISTANCE_PX = 140;
const DESKTOP_REVEAL_THRESHOLD_PX = 340;
export const OBSERVER_THRESHOLDS = [0, 0.1, 0.25, 0.5, 0.75, 1];

export function getMobileRevealThreshold(): number {
  return Math.max(600, Math.min(760, Math.round(window.innerHeight * 0.78)));
}

export function getObserverRootMargin(): string {
  if (window.innerWidth < 768) {
    return "-88px 0px -58% 0px";
  }

  return "-120px 0px -52% 0px";
}

export function clearTimeoutRef(
  timerRef: MutableRefObject<number | null>,
): void {
  if (timerRef.current === null) {
    return;
  }

  window.clearTimeout(timerRef.current);
  timerRef.current = null;
}

export function shouldShowFloatingSectionNav(): boolean {
  const revealThreshold =
    window.innerWidth < 768
      ? getMobileRevealThreshold()
      : DESKTOP_REVEAL_THRESHOLD_PX;

  return window.scrollY > revealThreshold;
}

export function getPendingSectionSelection<T extends string>(
  pendingSection: T | null,
  observerState: Map<T, ObserverEntryState>,
): T | null {
  if (!pendingSection) {
    return null;
  }

  const pendingState = observerState.get(pendingSection);
  if (!pendingState?.isIntersecting) {
    return pendingSection;
  }

  return null;
}

export function getBottomPinnedSection<T extends string>(
  links: readonly PageSectionLink<T>[],
): T | null {
  const nearPageBottom =
    window.innerHeight + window.scrollY >=
    document.documentElement.scrollHeight - BOTTOM_DISTANCE_PX;

  if (!nearPageBottom) {
    return null;
  }

  return links[links.length - 1]?.id ?? null;
}

export function getMostVisibleSection<T extends string>(
  links: readonly PageSectionLink<T>[],
  observerState: Map<T, ObserverEntryState>,
): T | null {
  const visibleEntries = links
    .map((link) => {
      const state = observerState.get(link.id);
      return state?.isIntersecting ? { id: link.id, state } : null;
    })
    .filter(
      (
        entry,
      ): entry is {
        id: T;
        state: ObserverEntryState;
      } => entry !== null,
    );

  if (visibleEntries.length === 0) {
    return null;
  }

  visibleEntries.sort(
    (left, right) =>
      right.state.ratio - left.state.ratio ||
      Math.abs(left.state.top) - Math.abs(right.state.top),
  );

  return visibleEntries[0]?.id ?? null;
}
