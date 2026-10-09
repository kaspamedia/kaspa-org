"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import ExternalLink from "../../components/ExternalLink";
import { ArrowUpRightIcon } from "../../components/icons";
import { ACCENT } from "../content";
import { initialFilters, WIZARD_STEP_IDS } from "./constants";
import FilterPanel, {
  InlineFilterPanel,
  type FilterPanelProps,
} from "./FilterPanel";
import {
  selectOs,
  selectUser,
  toggleCriterion,
  toggleFeature,
} from "./filterState";
import {
  parseWalletFinderUrl,
  serializeWalletFinderUrl,
  type WalletFinderMode,
} from "./urlState";
import { createWalletFinderModel } from "./walletModel";
import type {
  KaspaWallet,
  WalletCriterion,
  WalletFeature,
  WalletFilters,
  WalletOs,
  WalletUserType,
} from "./types";
import { DesktopResults, MobileResults } from "./WalletResults";
import WizardFlow, { type WizardPanelProps } from "./WizardFlow";

const WALLET_SUBMISSION_GUIDE_URL =
  "https://github.com/kaspamedia/kaspa-org/blob/main/docs/wallet-submissions.md";

type ActiveFilterChip = {
  key: string;
  label: string;
  onRemove: () => void;
};

export default function WalletFinder({ wallets }: { wallets: KaspaWallet[] }) {
  const t = useTranslations("hodl");
  const [mode, setMode] = useState<WalletFinderMode>("guided");
  const [step, setStep] = useState(1);
  const [filters, setFilters] = useState<WalletFilters>(initialFilters);
  const [urlReady, setUrlReady] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  // The mode and step last written to (or read from) the URL. A change to
  // either is a navigation and gets its own history entry; filter changes
  // replace the current entry so Back doesn't step through every toggle.
  const urlPositionRef = useRef<{ mode: WalletFinderMode; step: number }>({
    mode: "guided",
    step: 1,
  });

  useEffect(() => {
    const applyUrl = () => {
      const state = parseWalletFinderUrl(window.location.search) ?? {
        mode: "guided" as const,
        step: 1,
        filters: initialFilters,
      };
      urlPositionRef.current = { mode: state.mode, step: state.step };
      setMode(state.mode);
      setStep(state.step);
      // Re-apply the user type so a link can't combine "new" with
      // experienced-only features.
      setFilters(selectUser(state.filters, state.filters.user));
      setUrlReady(true);
    };
    applyUrl();
    window.addEventListener("popstate", applyUrl);
    return () => window.removeEventListener("popstate", applyUrl);
  }, []);

  useEffect(() => {
    // Wait for the URL-derived state to commit before writing history.
    if (!urlReady) return;
    const href = serializeWalletFinderUrl(
      window.location.href,
      { mode, step, filters },
      "#wallet",
    );
    if (href === window.location.href) return;
    const previous = urlPositionRef.current;
    urlPositionRef.current = { mode, step };
    if (previous.mode !== mode || previous.step !== step) {
      window.history.pushState(null, "", href);
    } else {
      window.history.replaceState(null, "", href);
    }
  }, [mode, step, filters, urlReady]);

  const model = useMemo(
    () => createWalletFinderModel(wallets, filters),
    [filters, wallets],
  );

  const setOs = (os: WalletOs | undefined) =>
    setFilters((current) => selectOs(current, os));

  const setUser = (user: WalletUserType | undefined) =>
    setFilters((current) => selectUser(current, user));

  const handleToggleCriterion = (criterion: WalletCriterion) =>
    setFilters((current) => toggleCriterion(current, criterion));

  const handleToggleFeature = (feature: WalletFeature) =>
    setFilters((current) => toggleFeature(current, feature));

  const resetFilters = () => setFilters(initialFilters);

  const startWizard = () => {
    setFilters(initialFilters);
    setStep(1);
    setMode("guided");
  };

  const enterTable = () => setMode("table");

  const showMobileResults = () => {
    setMobileFiltersOpen(false);
    rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filterPanelProps: FilterPanelProps = {
    filters,
    onSetOs: setOs,
    onSetUser: setUser,
    onToggleCriterion: handleToggleCriterion,
    onToggleFeature: handleToggleFeature,
    onReset: resetFilters,
    isCriterionDisabled: model.isCriterionDisabled,
    isFeatureDisabled: model.isFeatureDisabled,
  };

  const wizardPanelProps: WizardPanelProps = {
    step,
    filters,
    matchCount: model.matches.length,
    totalWallets: model.totalWallets,
    countMatches: model.countMatches,
    unavailableReason: model.unavailableReason,
    onSetOs: setOs,
    onToggleCriterion: handleToggleCriterion,
    onToggleFeature: handleToggleFeature,
    onGoToStep: setStep,
    onNext: () =>
      setStep((current) => Math.min(current + 1, WIZARD_STEP_IDS.length)),
    onBack: () => setStep((current) => Math.max(current - 1, 1)),
    onDone: enterTable,
    onSkip: enterTable,
    isCriterionDisabled: model.isCriterionDisabled,
    isFeatureDisabled: model.isFeatureDisabled,
  };

  const activeChips: ActiveFilterChip[] = [];
  if (filters.os) {
    const osLabel = t(`walletFinder.operatingSystems.${filters.os}`);
    activeChips.push({
      key: `os-${filters.os}`,
      label: osLabel,
      onRemove: () => setOs(undefined),
    });
  }
  if (filters.user === "beginner") {
    activeChips.push({
      key: "hide-advanced",
      label: t("walletFinder.filters.hideAdvanced"),
      onRemove: () => setUser(undefined),
    });
  }
  for (const criterionId of filters.important) {
    const label = t(`walletFinder.criteria.${criterionId}.label`);
    activeChips.push({
      key: `criterion-${criterionId}`,
      label,
      onRemove: () => handleToggleCriterion(criterionId),
    });
  }
  for (const featureId of filters.features) {
    const label = t(`walletFinder.features.${featureId}.label`);
    activeChips.push({
      key: `feature-${featureId}`,
      label,
      onRemove: () => handleToggleFeature(featureId),
    });
  }

  return (
    // overflow-clip, not overflow-hidden: hidden makes the card a scroll
    // container, which pins the sticky filter panel inside it instead of
    // letting it follow the viewport.
    <div
      ref={rootRef}
      data-wallet-finder-root
      className="border-subtle relative mt-12 scroll-mt-24 overflow-clip rounded-[30px] border shadow-[0_4px_6px_-1px_rgba(0,0,0,0.03),0_24px_48px_-8px_rgba(0,0,0,0.05)] md:scroll-mt-32 dark:border-[rgba(255,255,255,0.08)] dark:shadow-none"
      style={{ background: "var(--surface)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          background:
            "radial-gradient(120% 60% at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 100%)",
        }}
      />

      <div className="relative z-10 p-5 md:p-8">
        {mode === "guided" && <WizardFlow {...wizardPanelProps} />}

        {mode === "table" && (
          <>
            <div className="mb-3 lg:hidden">
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="text-secondary text-[13px] whitespace-nowrap">
                    {t.rich("walletFinder.results.compactSummary", {
                      matches: model.matches.length,
                      total: model.totalWallets,
                      strong: (chunks) => (
                        <strong className="text-primary">{chunks}</strong>
                      ),
                    })}
                  </p>
                  <button
                    type="button"
                    onClick={startWizard}
                    className="text-tertiary hover:text-primary inline-flex items-center gap-1.5 text-[12px] font-medium underline-offset-2 transition-colors hover:underline"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                      />
                    </svg>
                    {t("walletFinder.results.helpChoose")}
                  </button>
                </div>
                <button
                  type="button"
                  className="border-subtle flex shrink-0 items-center gap-2 rounded-[10px] border px-3.5 py-1.5 text-[13px] font-medium transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                  onClick={() => setMobileFiltersOpen((open) => !open)}
                  aria-expanded={mobileFiltersOpen}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 6h18M6 12h12M9 18h6"
                    />
                  </svg>
                  {mobileFiltersOpen
                    ? t("walletFinder.filters.hide")
                    : t("walletFinder.filters.show")}
                  {activeChips.length > 0 && (
                    <span
                      className="ml-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold text-white"
                      style={{ background: ACCENT }}
                    >
                      {activeChips.length}
                    </span>
                  )}
                </button>
              </div>

              {activeChips.length > 0 && !mobileFiltersOpen && (
                <div className="mt-2 flex flex-wrap items-center gap-1">
                  {activeChips.map((chip) => (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={chip.onRemove}
                      className="border-subtle inline-flex items-center gap-1 rounded-full border bg-black/[0.02] py-0.5 pr-1.5 pl-2 text-[11.5px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-black/[0.05] dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                      aria-label={t("walletFinder.filters.remove", {
                        filter: chip.label,
                      })}
                    >
                      {chip.label}
                      <svg
                        className="h-2.5 w-2.5 text-[var(--text-muted)]"
                        viewBox="0 0 12 12"
                        fill="none"
                      >
                        <path
                          d="M3 3l6 6M9 3l-6 6"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  ))}
                  {activeChips.length > 1 && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-tertiary hover:text-primary ml-1 text-[11.5px] font-medium underline-offset-2 transition-colors hover:underline"
                    >
                      {t("walletFinder.filters.clearAll")}
                    </button>
                  )}
                </div>
              )}
            </div>

            {mobileFiltersOpen && (
              <div className="mb-6 lg:hidden">
                <InlineFilterPanel
                  {...filterPanelProps}
                  matchCount={model.matches.length}
                  onShowResults={showMobileResults}
                />
              </div>
            )}

            <div className="md:hidden">
              <MobileResults matches={model.matches} />
            </div>

            <div className="hidden md:block lg:hidden">
              <DesktopResults
                matches={model.matches}
                totalWallets={model.totalWallets}
                mode={mode}
                onRestartWizard={startWizard}
                hideHeader
              />
            </div>

            <div className="hidden lg:grid lg:grid-cols-[256px_minmax(0,1fr)] lg:gap-6">
              <aside className="sticky top-32 self-start">
                <FilterPanel {...filterPanelProps} />
              </aside>
              <DesktopResults
                matches={model.matches}
                totalWallets={model.totalWallets}
                mode={mode}
                onRestartWizard={startWizard}
              />
            </div>
          </>
        )}
      </div>

      <div className="border-subtle relative z-10 border-t px-5 py-3.5 text-center md:px-8">
        <p className="text-muted text-[12.5px] leading-relaxed">
          {t("walletFinder.submission.question")}{" "}
          <ExternalLink
            href={WALLET_SUBMISSION_GUIDE_URL}
            className="group text-tertiary hover:text-primary inline-flex items-center gap-1 font-medium underline-offset-2 transition-colors hover:underline"
          >
            {t("walletFinder.submission.action")}
            <span className="opacity-40 transition-opacity group-hover:opacity-75">
              <ArrowUpRightIcon size={9} />
            </span>
          </ExternalLink>
        </p>
      </div>
    </div>
  );
}
