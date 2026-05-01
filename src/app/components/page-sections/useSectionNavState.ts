"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from "react";

import { useBodyScrollLock } from "../useBodyScrollLock";
import {
  clearTimeoutRef,
  IDLE_DELAY_MS,
  PENDING_SECTION_TIMEOUT_MS,
} from "./floatingSectionNavUtils";

export type SectionNavIdleState = {
  sectionNavIdle: boolean;
  markSectionNavActive: () => void;
  resetSectionNavIdle: () => void;
  clearSectionNavIdleTimer: () => void;
};

export type PendingSectionState<T extends string> = {
  pendingSectionRef: MutableRefObject<T | null>;
  setPendingSection: (sectionId: T) => void;
  releasePendingSection: () => void;
};

export function useSectionNavIdleState(): SectionNavIdleState {
  const [sectionNavIdle, setSectionNavIdle] = useState(false);
  const sectionNavIdleTimeoutRef = useRef<number | null>(null);

  const clearSectionNavIdleTimer = useCallback((): void => {
    clearTimeoutRef(sectionNavIdleTimeoutRef);
  }, []);

  const resetSectionNavIdle = useCallback((): void => {
    setSectionNavIdle(false);
    clearSectionNavIdleTimer();
  }, [clearSectionNavIdleTimer]);

  const markSectionNavActive = useCallback((): void => {
    setSectionNavIdle(false);
    clearSectionNavIdleTimer();
    sectionNavIdleTimeoutRef.current = window.setTimeout(() => {
      setSectionNavIdle(true);
      sectionNavIdleTimeoutRef.current = null;
    }, IDLE_DELAY_MS);
  }, [clearSectionNavIdleTimer]);

  useEffect(() => clearSectionNavIdleTimer, [clearSectionNavIdleTimer]);

  return {
    sectionNavIdle,
    markSectionNavActive,
    resetSectionNavIdle,
    clearSectionNavIdleTimer,
  };
}

export function usePendingSection<T extends string>(): PendingSectionState<T> {
  const pendingSectionRef = useRef<T | null>(null);
  const pendingSectionTimeoutRef = useRef<number | null>(null);

  const releasePendingSection = useCallback((): void => {
    pendingSectionRef.current = null;
    clearTimeoutRef(pendingSectionTimeoutRef);
  }, []);

  const setPendingSection = useCallback(
    (sectionId: T): void => {
      pendingSectionRef.current = sectionId;
      clearTimeoutRef(pendingSectionTimeoutRef);
      pendingSectionTimeoutRef.current = window.setTimeout(() => {
        releasePendingSection();
      }, PENDING_SECTION_TIMEOUT_MS);
    },
    [releasePendingSection],
  );

  useEffect(() => releasePendingSection, [releasePendingSection]);

  return {
    pendingSectionRef,
    setPendingSection,
    releasePendingSection,
  };
}

export function useMobileSectionNav(markSectionNavActive: () => void): {
  mobileNavOpen: boolean;
  openMobileNav: () => void;
  closeMobileNav: () => void;
} {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useBodyScrollLock(mobileNavOpen);

  useEffect(() => {
    if (!mobileNavOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileNavOpen]);

  const openMobileNav = useCallback((): void => {
    setMobileNavOpen(true);
    markSectionNavActive();
  }, [markSectionNavActive]);

  const closeMobileNav = useCallback((): void => {
    setMobileNavOpen(false);
  }, []);

  return {
    mobileNavOpen,
    openMobileNav,
    closeMobileNav,
  };
}
