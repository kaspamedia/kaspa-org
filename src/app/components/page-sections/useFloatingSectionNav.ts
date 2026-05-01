"use client";

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type MouseEventHandler,
} from "react";
import { flushSync } from "react-dom";

import {
  getBottomPinnedSection,
  getMostVisibleSection,
  getPendingSectionSelection,
  type ObserverEntryState,
} from "./floatingSectionNavUtils";
import {
  useHashSectionSync,
  useSectionNavVisibility,
  useSectionObserver,
} from "./useSectionNavObservers";
import {
  useMobileSectionNav,
  usePendingSection,
  useSectionNavIdleState,
} from "./useSectionNavState";
import type { PageSectionLink } from "./types";

type UseFloatingSectionNavOptions<T extends string> = {
  initialSection: T;
  links: readonly PageSectionLink<T>[];
};

export function useFloatingSectionNav<T extends string>({
  initialSection,
  links,
}: UseFloatingSectionNavOptions<T>): {
  activeSection: T;
  activeSectionLink: PageSectionLink<T>;
  showSectionNav: boolean;
  sectionNavIdle: boolean;
  mobileNavOpen: boolean;
  markSectionNavActive: () => void;
  openMobileNav: () => void;
  closeMobileNav: () => void;
  handleHashClick: (href: `#${T}`) => MouseEventHandler<HTMLAnchorElement>;
} {
  const [activeSection, setActiveSection] = useState<T>(initialSection);
  const observerStateRef = useRef(new Map<T, ObserverEntryState>());

  const activeSectionLink = useMemo(
    () => links.find((link) => link.id === activeSection) ?? links[0],
    [activeSection, links],
  );

  const {
    sectionNavIdle,
    markSectionNavActive,
    resetSectionNavIdle,
    clearSectionNavIdleTimer,
  } = useSectionNavIdleState();
  const { pendingSectionRef, setPendingSection, releasePendingSection } =
    usePendingSection<T>();
  const { mobileNavOpen, openMobileNav, closeMobileNav } =
    useMobileSectionNav(markSectionNavActive);
  const showSectionNav = useSectionNavVisibility({
    mobileNavOpen,
    closeMobileNav,
    markSectionNavActive,
    resetSectionNavIdle,
  });

  const computeActiveSection = useCallback((): void => {
    const pendingSection = getPendingSectionSelection(
      pendingSectionRef.current,
      observerStateRef.current,
    );
    if (pendingSection) {
      setActiveSection((previous) =>
        previous === pendingSection ? previous : pendingSection,
      );
      return;
    }

    if (pendingSectionRef.current) {
      releasePendingSection();
    }

    const bottomPinnedSection = getBottomPinnedSection(links);
    if (bottomPinnedSection) {
      setActiveSection((previous) =>
        previous === bottomPinnedSection ? previous : bottomPinnedSection,
      );
      return;
    }

    const mostVisibleSection = getMostVisibleSection(
      links,
      observerStateRef.current,
    );
    if (!mostVisibleSection) {
      return;
    }

    setActiveSection((previous) =>
      previous === mostVisibleSection ? previous : mostVisibleSection,
    );
  }, [links, pendingSectionRef, releasePendingSection]);

  const handleObserverCleanup = useCallback((): void => {
    releasePendingSection();
    clearSectionNavIdleTimer();
  }, [clearSectionNavIdleTimer, releasePendingSection]);

  useSectionObserver({
    links,
    observerStateRef,
    onCleanup: handleObserverCleanup,
    onEntriesChange: computeActiveSection,
  });
  useHashSectionSync(setActiveSection);

  const handleHashClick = useCallback(
    (href: `#${T}`): MouseEventHandler<HTMLAnchorElement> =>
      (event) => {
        const id = href.slice(1) as T;
        const target = document.getElementById(id);
        if (!target) {
          return;
        }

        event.preventDefault();
        // Release the body scroll lock synchronously before scrolling, so the
        // lock's scroll-position restore doesn't fight scrollIntoView.
        flushSync(() => {
          closeMobileNav();
        });
        setPendingSection(id);
        setActiveSection(id);
        window.history.replaceState(null, "", href);
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    [closeMobileNav, setPendingSection],
  );

  return {
    activeSection,
    activeSectionLink,
    showSectionNav,
    sectionNavIdle,
    mobileNavOpen,
    markSectionNavActive,
    openMobileNav,
    closeMobileNav,
    handleHashClick,
  };
}
