"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ACCENT, accentAlpha } from "../content";
import { OS_GUIDANCE_GROUPS, WIZARD_STEP_IDS } from "./constants";
import { getVisibleFeatures } from "./filterState";
import { getOsIcon } from "./icons";
import InfoTooltip from "./InfoTooltip";
import type {
  WalletCriterion,
  WalletFeature,
  WalletFilters,
  WalletOs,
} from "./types";
import { walletCriteria } from "./walletMetadata";
import type { WalletFinderModel } from "./walletModel";

const TOTAL_STEPS = WIZARD_STEP_IDS.length;
// Long enough to see the selection land before the next step slides in.
const AUTO_ADVANCE_MS = 280;

export type WizardPanelProps = {
  step: number;
  filters: WalletFilters;
  matchCount: number;
  totalWallets: number;
  countMatches: (patch: Partial<WalletFilters>) => number;
  unavailableReason: WalletFinderModel["unavailableReason"];
  onSetOs: (os: WalletOs | undefined) => void;
  onToggleCriterion: (criterion: WalletCriterion) => void;
  onToggleFeature: (feature: WalletFeature) => void;
  onGoToStep: (step: number) => void;
  onNext: () => void;
  onBack: () => void;
  onDone: () => void;
  onSkip: () => void;
  isCriterionDisabled: (criterion: WalletCriterion) => boolean;
  isFeatureDisabled: (feature: WalletFeature) => boolean;
};

function CheckIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M2.5 7l3 3 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ActiveCheck({ active }: { active: boolean }) {
  return (
    <span
      className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border-[1.5px] text-white transition-colors"
      style={
        active
          ? { borderColor: ACCENT, background: ACCENT }
          : { borderColor: "var(--border-subtle)" }
      }
    >
      {active && <CheckIcon className="h-2.5 w-2.5" />}
    </span>
  );
}

function activeStyle(active: boolean) {
  return active
    ? {
        borderColor: "transparent",
        background: accentAlpha(0.08),
        boxShadow: `0 0 0 2px ${accentAlpha(0.5)}`,
      }
    : { borderColor: "var(--border-subtle)" };
}

function ToggleTile({
  active,
  disabled,
  label,
  description,
  count,
  details,
  onToggle,
}: {
  active: boolean;
  disabled: boolean;
  label: string;
  description: string;
  count: string;
  details: { text: string; ariaLabel: string };
  onToggle: () => void;
}) {
  return (
    <div
      className={`relative rounded-[14px] border transition-all ${
        disabled
          ? "opacity-40"
          : "hover:bg-black/[0.02] dark:hover:bg-white/[0.03]"
      }`}
      style={activeStyle(active)}
    >
      <button
        type="button"
        disabled={disabled}
        aria-pressed={active}
        onClick={onToggle}
        className="flex h-full w-full items-start gap-3.5 rounded-[14px] p-4 pr-11 text-left disabled:cursor-not-allowed"
      >
        <ActiveCheck active={active} />
        <span className="min-w-0">
          <span className="block text-[14px] leading-tight font-semibold">
            {label}
          </span>
          <span className="text-tertiary mt-1 block text-[13px] leading-[1.5]">
            {description}
          </span>
          {!disabled && (
            <span
              className="mt-2 block text-[11.5px] font-medium tabular-nums"
              style={{ color: active ? ACCENT : "var(--text-muted)" }}
            >
              {count}
            </span>
          )}
        </span>
      </button>
      <span className="absolute top-3.5 right-3.5">
        <InfoTooltip text={details.text} ariaLabel={details.ariaLabel} />
      </span>
    </div>
  );
}

export default function WizardFlow({
  step,
  filters,
  matchCount,
  totalWallets,
  countMatches,
  unavailableReason,
  onSetOs,
  onToggleCriterion,
  onToggleFeature,
  onGoToStep,
  onNext,
  onBack,
  onDone,
  onSkip,
  isCriterionDisabled,
  isFeatureDisabled,
}: WizardPanelProps) {
  const t = useTranslations("hodl");
  const stepId = WIZARD_STEP_IDS[step - 1] ?? "os";
  const isOptionalStep = stepId === "criteria" || stepId === "features";
  const walletCount = (count: number) =>
    t("walletFinder.wizard.walletCount", { count });

  const rootRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isFirstRender = useRef(true);
  const advanceTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    window.clearTimeout(advanceTimerRef.current);
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const node = rootRef.current;
    if (!node) return;
    const card = node.closest("[data-wallet-finder-root]") ?? node;
    // Only bring the card back when its top has scrolled out of view, so
    // stepping through the wizard doesn't jolt the page on every click.
    if (card.getBoundingClientRect().top < 96) {
      card.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    headingRef.current?.focus({ preventScroll: true });
  }, [step]);

  useEffect(() => () => window.clearTimeout(advanceTimerRef.current), []);

  const advanceSoon = () => {
    window.clearTimeout(advanceTimerRef.current);
    advanceTimerRef.current = window.setTimeout(onNext, AUTO_ADVANCE_MS);
  };

  const stepLabel = (id: (typeof WIZARD_STEP_IDS)[number]) =>
    t(`walletFinder.wizard.stepLabels.${id}`);

  return (
    <div ref={rootRef} className="mx-auto max-w-4xl py-2 md:py-6">
      <div className="mb-7 md:mb-8">
        <div className="md:hidden">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-muted text-[11px] font-semibold tracking-[0.1em] uppercase">
              {t("walletFinder.wizard.progress", {
                step,
                total: TOTAL_STEPS,
              })}
              <span className="text-tertiary font-medium tracking-normal normal-case">
                {" · "}
                {stepLabel(stepId)}
              </span>
            </p>
            <button
              type="button"
              onClick={onSkip}
              className="text-tertiary hover:text-primary shrink-0 text-[12px] font-medium underline-offset-2 transition-colors hover:underline"
            >
              {t("walletFinder.wizard.skip")}
            </button>
          </div>
          <ol
            className="flex gap-1.5"
            aria-label={t("walletFinder.wizard.progressLabel")}
          >
            {WIZARD_STEP_IDS.map((id, index) => {
              const stepNumber = index + 1;
              return (
                <li key={id} className="flex-1">
                  <button
                    type="button"
                    onClick={() => onGoToStep(stepNumber)}
                    aria-current={stepNumber === step ? "step" : undefined}
                    aria-label={`${stepNumber}. ${stepLabel(id)}`}
                    className="flex h-5 w-full items-center"
                  >
                    <span
                      className="h-[3px] w-full rounded-full transition-colors duration-300"
                      style={{
                        background:
                          stepNumber <= step ? ACCENT : "var(--track-bg)",
                      }}
                    />
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mb-6 hidden items-center gap-4 md:flex">
          <ol
            className="flex flex-1 items-center gap-2"
            aria-label={t("walletFinder.wizard.progressLabel")}
          >
            {WIZARD_STEP_IDS.map((id, index) => {
              const stepNumber = index + 1;
              const isCurrent = stepNumber === step;
              const isDone = stepNumber < step;
              return (
                <li key={id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onGoToStep(stepNumber)}
                    aria-current={isCurrent ? "step" : undefined}
                    className="group flex items-center gap-2 rounded-full py-1 pr-2 transition-colors"
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold transition-all duration-300"
                      style={
                        isCurrent
                          ? { background: ACCENT, color: "white" }
                          : isDone
                            ? { background: accentAlpha(0.15), color: ACCENT }
                            : {
                                background: "var(--chip-bg)",
                                color: "var(--text-tertiary)",
                              }
                      }
                    >
                      {isDone ? (
                        <>
                          <CheckIcon className="h-3.5 w-3.5" />
                          <span className="sr-only">{stepNumber}</span>
                        </>
                      ) : (
                        stepNumber
                      )}
                    </span>
                    <span
                      className={`text-[13px] font-medium whitespace-nowrap transition-colors ${
                        isCurrent
                          ? "text-primary"
                          : "text-tertiary group-hover:text-primary"
                      }`}
                    >
                      {stepLabel(id)}
                    </span>
                  </button>
                  {stepNumber < TOTAL_STEPS && (
                    <span
                      aria-hidden
                      className="h-[2px] w-6 rounded-full transition-colors duration-300 lg:w-10"
                      style={{
                        background: isDone ? ACCENT : "var(--track-bg)",
                      }}
                    />
                  )}
                </li>
              );
            })}
          </ol>
          <button
            type="button"
            onClick={onSkip}
            className="text-tertiary hover:text-primary shrink-0 text-[13px] font-medium underline-offset-2 transition-colors hover:underline"
          >
            {t("walletFinder.wizard.skipAll")}
          </button>
        </div>

        <div key={`heading-${step}`} className="wizard-step-enter">
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 md:mt-0">
            <h3
              ref={headingRef}
              tabIndex={-1}
              className="text-[22px] leading-snug font-semibold tracking-[-0.02em] outline-none md:text-[28px]"
            >
              {t(`walletFinder.wizard.steps.${stepId}.title`)}
            </h3>
            {isOptionalStep && (
              <span className="text-muted rounded-full bg-[var(--chip-bg)] px-2.5 py-0.5 text-[11.5px] font-medium">
                {t("walletFinder.common.optional")}
              </span>
            )}
          </div>
          <p className="text-tertiary mt-2 max-w-2xl text-[14px] leading-relaxed md:min-h-[3.25em] md:text-[15px]">
            {t(`walletFinder.wizard.steps.${stepId}.subtitle`)}
          </p>
        </div>
      </div>

      <div key={`body-${step}`} className="wizard-step-enter md:min-h-[360px]">
        {stepId === "os" && (
          <>
            <div className="grid gap-8 md:grid-cols-3 md:gap-6">
              {OS_GUIDANCE_GROUPS.map((group) => (
                <OsGroup
                  key={group.id}
                  group={group}
                  selectedOs={filters.os}
                  countFor={(os) => countMatches({ os })}
                  walletCount={walletCount}
                  onSelect={(os) => {
                    if (filters.os === os) {
                      onSetOs(undefined);
                      return;
                    }
                    onSetOs(os);
                    advanceSoon();
                  }}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                onSetOs(undefined);
                onNext();
              }}
              className="text-tertiary hover:text-primary mt-7 text-[13px] font-medium underline-offset-2 transition-colors hover:underline"
            >
              {t("walletFinder.wizard.anyOs")} →
            </button>
          </>
        )}

        {stepId === "criteria" && (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {walletCriteria.map((criterion) => {
              const active = filters.important.includes(criterion.id);
              const disabled = !active && isCriterionDisabled(criterion.id);
              const label = t(`walletFinder.criteria.${criterion.id}.label`);
              return (
                <ToggleTile
                  key={criterion.id}
                  active={active}
                  disabled={disabled}
                  label={label}
                  description={
                    disabled
                      ? t(
                          `walletFinder.common.unavailable.${unavailableReason({ important: [criterion.id] })}`,
                        )
                      : t(`walletFinder.criteria.${criterion.id}.short`)
                  }
                  count={walletCount(
                    active
                      ? matchCount
                      : countMatches({
                          important: [...filters.important, criterion.id],
                        }),
                  )}
                  details={{
                    text: t(
                      `walletFinder.criteria.${criterion.id}.description`,
                    ),
                    ariaLabel: t("walletFinder.results.aboutCriterion", {
                      criterion: label,
                    }),
                  }}
                  onToggle={() => onToggleCriterion(criterion.id)}
                />
              );
            })}
          </div>
        )}

        {stepId === "features" && (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {getVisibleFeatures(filters.user).map((feature) => {
              const active = filters.features.includes(feature.id);
              const disabled = !active && isFeatureDisabled(feature.id);
              const label = t(`walletFinder.features.${feature.id}.label`);
              return (
                <ToggleTile
                  key={feature.id}
                  active={active}
                  disabled={disabled}
                  label={label}
                  description={
                    disabled
                      ? t(
                          `walletFinder.common.unavailable.${unavailableReason({ features: [feature.id] })}`,
                        )
                      : t(`walletFinder.features.${feature.id}.short`)
                  }
                  count={walletCount(
                    active
                      ? matchCount
                      : countMatches({
                          features: [...filters.features, feature.id],
                        }),
                  )}
                  details={{
                    text: t(`walletFinder.features.${feature.id}.description`),
                    ariaLabel: t("walletFinder.results.aboutCriterion", {
                      criterion: label,
                    }),
                  }}
                  onToggle={() => onToggleFeature(feature.id)}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="border-subtle mt-8 flex flex-col gap-4 border-t pt-6 md:flex-row md:items-center">
        <p
          className="text-secondary text-[13px] md:order-2 md:flex-1 md:text-right"
          aria-live="polite"
        >
          {t.rich("walletFinder.results.summary", {
            matches: matchCount,
            total: totalWallets,
            strong: (chunks: ReactNode) => (
              <strong className="text-primary tabular-nums">{chunks}</strong>
            ),
          })}
        </p>
        <div className="flex items-center gap-3 md:contents">
          {step > 1 ? (
            <button
              type="button"
              onClick={onBack}
              className="border-subtle flex-1 rounded-[10px] border px-6 py-3 text-[15px] font-medium transition-colors hover:bg-black/[0.03] md:order-1 md:flex-none dark:hover:bg-white/[0.04]"
            >
              {t("walletFinder.wizard.back")}
            </button>
          ) : null}
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={onNext}
              className="btn-primary flex-1 justify-center md:order-3 md:flex-none"
            >
              {t("walletFinder.wizard.next")}
            </button>
          ) : (
            <button
              type="button"
              onClick={onDone}
              className="btn-primary flex-1 justify-center whitespace-nowrap tabular-nums md:order-3 md:flex-none"
            >
              {t("walletFinder.wizard.showCount", { count: matchCount })}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function OsGroup({
  group,
  selectedOs,
  countFor,
  walletCount,
  onSelect,
}: {
  group: (typeof OS_GUIDANCE_GROUPS)[number];
  selectedOs: WalletOs | undefined;
  countFor: (os: WalletOs) => number;
  walletCount: (count: number) => string;
  onSelect: (os: WalletOs) => void;
}) {
  const t = useTranslations("hodl");
  const prosConsList = (
    <ul className="flex flex-col gap-1.5">
      {group.pros.map((pro) => (
        <li key={pro} className="flex items-start gap-2">
          <span
            aria-hidden
            className="mt-px shrink-0 text-[13px] leading-none font-bold"
            style={{ color: ACCENT }}
          >
            +
          </span>
          <span className="text-secondary text-[12.5px] leading-snug">
            {t(pro)}
          </span>
        </li>
      ))}
      {group.cons.map((con) => (
        <li key={con} className="flex items-start gap-2">
          <span
            aria-hidden
            className="text-muted mt-px shrink-0 text-[13px] leading-none font-bold"
          >
            −
          </span>
          <span className="text-tertiary text-[12.5px] leading-snug">
            {t(con)}
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div>
      <p className="mb-3 text-[16px] font-semibold">
        {t(`walletFinder.guidance.${group.id}.title`)}
      </p>
      <div className="mb-4 flex gap-2">
        {group.os.map((osOption) => {
          const selected = selectedOs === osOption;
          const count = countFor(osOption);
          return (
            <button
              key={osOption}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(osOption)}
              className={`flex max-w-[5.25rem] min-w-0 flex-1 basis-0 flex-col items-center gap-1 rounded-[14px] border px-1 pt-3 pb-2.5 text-center transition-all hover:bg-black/[0.03] dark:hover:bg-white/[0.04] ${
                count === 0 && !selected ? "opacity-50" : ""
              }`}
              style={activeStyle(selected)}
            >
              <span
                style={{
                  color: selected ? ACCENT : "var(--text-secondary)",
                }}
              >
                {getOsIcon(osOption, "h-7 w-7")}
              </span>
              <span
                className="mt-0.5 text-[12px] font-medium"
                style={{
                  color: selected ? ACCENT : "var(--text-secondary)",
                }}
              >
                {t(`walletFinder.operatingSystems.${osOption}`)}
              </span>
              <span className="text-muted text-[10.5px] leading-tight tabular-nums">
                {walletCount(count)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="hidden md:block">{prosConsList}</div>
      <details className="group md:hidden">
        <summary className="text-tertiary hover:text-primary flex cursor-pointer list-none items-center gap-1.5 text-[12.5px] font-medium transition-colors [&::-webkit-details-marker]:hidden">
          <span>{t("walletFinder.wizard.prosAndCons")}</span>
          <svg
            className="h-3.5 w-3.5 transition-transform group-open:rotate-180"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden
          >
            <path
              d="M3 4.5l3 3 3-3"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </summary>
        <div className="mt-3">{prosConsList}</div>
      </details>
    </div>
  );
}
