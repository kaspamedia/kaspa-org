"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from "react";

import {
  getObserverRootMargin,
  OBSERVER_THRESHOLDS,
  shouldShowFloatingSectionNav,
  type ObserverEntryState,
} from "./floatingSectionNavUtils";
import type { PageSectionLink } from "./types";

export function useSectionNavVisibility({
  mobileNavOpen,
  closeMobileNav,
  markSectionNavActive,
  resetSectionNavIdle,
}: {
  mobileNavOpen: boolean;
  closeMobileNav: () => void;
  markSectionNavActive: () => void;
  resetSectionNavIdle: () => void;
}): boolean {
  const [showSectionNav, setShowSectionNav] = useState(false);
  // While the mobile sheet is open the body scroll is locked, which can reset
  // window.scrollY to 0. Ignore scroll/resize events in that state so the lock
  // artifact doesn't auto-close the sheet.
  const mobileNavOpenRef = useRef(mobileNavOpen);
  useEffect(() => {
    mobileNavOpenRef.current = mobileNavOpen;
  }, [mobileNavOpen]);

  const syncShowSectionNav = useCallback((): void => {
    if (mobileNavOpenRef.current) {
      return;
    }

    const nextShowSectionNav = shouldShowFloatingSectionNav();
    setShowSectionNav(nextShowSectionNav);

    if (!nextShowSectionNav) {
      closeMobileNav();
      resetSectionNavIdle();
      return;
    }

    markSectionNavActive();
  }, [closeMobileNav, markSectionNavActive, resetSectionNavIdle]);

  useEffect(() => {
    const initialSyncId = window.requestAnimationFrame(syncShowSectionNav);

    window.addEventListener("scroll", syncShowSectionNav, { passive: true });
    window.addEventListener("resize", syncShowSectionNav);

    return () => {
      window.cancelAnimationFrame(initialSyncId);
      window.removeEventListener("scroll", syncShowSectionNav);
      window.removeEventListener("resize", syncShowSectionNav);
    };
  }, [syncShowSectionNav]);

  return showSectionNav;
}

export function useSectionObserver<T extends string>({
  links,
  observerStateRef,
  onCleanup,
  onEntriesChange,
}: {
  links: readonly PageSectionLink<T>[];
  observerStateRef: MutableRefObject<Map<T, ObserverEntryState>>;
  onCleanup: () => void;
  onEntriesChange: () => void;
}): void {
  useEffect(() => {
    let observer: IntersectionObserver | null = null;

    const nodes = links
      .map((link) => document.getElementById(link.id))
      .filter((node): node is HTMLElement => node !== null);

    if (nodes.length === 0) {
      return;
    }

    const observeNodes = (): void => {
      observer?.disconnect();
      observerStateRef.current.clear();

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            observerStateRef.current.set(
              (entry.target as HTMLElement).id as T,
              {
                isIntersecting: entry.isIntersecting,
                ratio: entry.intersectionRatio,
                top: entry.boundingClientRect.top,
              },
            );
          }

          onEntriesChange();
        },
        {
          rootMargin: getObserverRootMargin(),
          threshold: OBSERVER_THRESHOLDS,
        },
      );

      for (const node of nodes) {
        observer.observe(node);
      }
    };

    observeNodes();
    window.addEventListener("resize", observeNodes);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", observeNodes);
      onCleanup();
    };
  }, [links, observerStateRef, onCleanup, onEntriesChange]);
}

export function useHashSectionSync<T extends string>(
  setActiveSection: Dispatch<SetStateAction<T>>,
): void {
  useEffect(() => {
    const scrollToHash = (): void => {
      const hash = window.location.hash.slice(1) as T;
      if (!hash) {
        return;
      }

      const section = document.getElementById(hash);
      if (!section) {
        return;
      }

      setActiveSection(hash);
      window.requestAnimationFrame(() => {
        section.scrollIntoView({ block: "start" });
      });
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);

    return () => {
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, [setActiveSection]);
}
