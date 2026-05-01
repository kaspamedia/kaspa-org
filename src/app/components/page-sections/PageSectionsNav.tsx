"use client";

import type { MouseEventHandler } from "react";

import SectionNavDesktop from "./SectionNavDesktop";
import SectionNavMobileBar from "./SectionNavMobileBar";
import SectionNavMobileSheet from "./SectionNavMobileSheet";
import type { PageSectionLink } from "./types";

type PageSectionsNavProps<T extends string> = {
  sheetId: string;
  sectionLinks: readonly PageSectionLink<T>[];
  mobileSectionLinks: readonly PageSectionLink<T>[];
  activeSection: T;
  activeSectionLink: PageSectionLink<T>;
  showSectionNav: boolean;
  sectionNavIdle: boolean;
  mobileNavOpen: boolean;
  mobileCurrentLabel: string;
  onNavInteract: () => void;
  onOpenMobileNav: () => void;
  onCloseMobileNav: () => void;
  onHashClick: (href: `#${T}`) => MouseEventHandler<HTMLAnchorElement>;
  sheetLinkLabelKey?: "label" | "compactLabel";
};

export default function PageSectionsNav<T extends string>({
  sheetId,
  sectionLinks,
  mobileSectionLinks,
  activeSection,
  activeSectionLink,
  showSectionNav,
  sectionNavIdle,
  mobileNavOpen,
  mobileCurrentLabel,
  onNavInteract,
  onOpenMobileNav,
  onCloseMobileNav,
  onHashClick,
  sheetLinkLabelKey,
}: PageSectionsNavProps<T>): React.JSX.Element {
  const navStateClass =
    sectionNavIdle && !mobileNavOpen ? "opacity-[0.78]" : "opacity-100";

  return (
    <>
      <SectionNavDesktop
        sectionLinks={sectionLinks}
        activeSection={activeSection}
        showSectionNav={showSectionNav}
        navStateClass={navStateClass}
        onNavInteract={onNavInteract}
        onHashClick={onHashClick}
      />
      <SectionNavMobileBar
        activeSectionLink={activeSectionLink}
        currentLabel={mobileCurrentLabel}
        showSectionNav={showSectionNav}
        navStateClass={navStateClass}
        mobileNavOpen={mobileNavOpen}
        onNavInteract={onNavInteract}
        onOpenMobileNav={onOpenMobileNav}
        sheetId={sheetId}
      />
      <SectionNavMobileSheet
        sheetId={sheetId}
        mobileNavOpen={mobileNavOpen}
        activeSection={activeSection}
        sectionLinks={mobileSectionLinks}
        onCloseMobileNav={onCloseMobileNav}
        onHashClick={onHashClick}
        sheetLinkLabelKey={sheetLinkLabelKey}
      />
    </>
  );
}
