"use client";

import Image from "next/image";
import { useId, useState } from "react";
import { useTranslations } from "next-intl";

import ExternalLink from "../../components/ExternalLink";
import { ACCENT, accentAlpha } from "../content";
import { getStoreIcon } from "./icons";
import CompatibilityInfo from "./CompatibilityInfo";
import { RatingLegend, RatingSymbol, RatingTooltip } from "./Rating";
import type { WalletMatch } from "./walletModel";
import { WALLET_DISPLAY_RATINGS } from "./taxonomy";
import type { WalletEntryAction, WalletOs } from "./types";
import { walletCriteria } from "./walletMetadata";

const RATING_ORDER = WALLET_DISPLAY_RATINGS;

function getActionStoreIconOs(action: WalletEntryAction): WalletOs | null {
  if (action === "app_store") return "ios";
  if (action === "google_play") return "android";
  return null;
}

function AdvancedBadge() {
  const t = useTranslations("hodl");
  return (
    <span className="ml-1 shrink-0 rounded-full border border-[var(--border-subtle)] px-2 py-px text-[10.5px] font-semibold tracking-[0.02em] text-[var(--text-tertiary)]">
      {t("walletFinder.results.advanced")}
    </span>
  );
}

function WalletRow({
  match,
  isExpanded,
  onToggle,
}: {
  match: WalletMatch;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations("hodl");
  const { wallet, presentation, actions: visibleActions, features } = match;
  const totalColumns = walletCriteria.length + 2;
  const linksId = useId();

  return (
    <>
      <tr
        className="border-subtle group cursor-pointer border-t transition-colors hover:bg-black/[0.015] dark:hover:bg-white/[0.02]"
        onClick={onToggle}
      >
        <td className="py-4 pr-4">
          <div className="flex items-center gap-3">
            <Image
              src={wallet.icon}
              alt={wallet.title}
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-[13px] bg-black/[0.04] object-cover dark:bg-white/[0.06]"
            />
            <div>
              <div className="flex items-center gap-1">
                <p
                  className="text-[15px] leading-tight font-semibold"
                  style={{ color: ACCENT }}
                >
                  {wallet.title}
                </p>
                <CompatibilityInfo wallet={wallet} />
                {wallet.user === "experienced" && <AdvancedBadge />}
              </div>
              <p className="text-muted mt-0.5 text-[11.5px]">
                {wallet.summary}
              </p>
              {features.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {features.map((feature) => (
                    <span
                      key={feature}
                      className="text-secondary rounded-full bg-black/[0.04] px-2 py-px text-[10.5px] font-medium dark:bg-white/[0.05]"
                    >
                      {t(`walletFinder.features.${feature}.label`)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </td>

        {walletCriteria.map((criterion) => (
          <td key={criterion.id} className="min-w-[64px] px-2 py-4 text-center">
            <div className="flex justify-center">
              <RatingTooltip
                rating={presentation.ratings[criterion.id]}
                criterion={criterion.id}
                breakdown={presentation.breakdowns[criterion.id]}
              />
            </div>
          </td>
        ))}

        <td className="w-10 py-4 pl-1 text-right">
          <button
            type="button"
            aria-expanded={isExpanded}
            aria-controls={linksId}
            aria-label={t("walletFinder.results.linksFor", {
              wallet: wallet.title,
            })}
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
            className="text-muted group-hover:text-secondary inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-black/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 dark:hover:bg-white/[0.06]"
          >
            <svg
              className={`h-4 w-4 transition-transform duration-300 ${
                isExpanded ? "rotate-180" : ""
              }`}
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden
            >
              <path
                d="M4 6l4 4 4-4"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </td>
      </tr>
      <tr className="border-subtle border-t">
        <td colSpan={totalColumns} className="p-0">
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-out ${
              isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden" id={linksId} inert={!isExpanded}>
              <div className="flex flex-wrap items-center gap-2 bg-black/[0.015] px-4 py-3 dark:bg-white/[0.02]">
                {visibleActions.length === 0 ? (
                  <span className="text-muted text-[12.5px]">
                    {t("walletFinder.results.noLinks")}
                  </span>
                ) : (
                  visibleActions.map((entry, index) => {
                    const iconOs = getActionStoreIconOs(entry.action);
                    return (
                      <ExternalLink
                        key={`${wallet.id}-${entry.action}-${index}`}
                        href={entry.link}
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-1.5 rounded-[8px] bg-[var(--btn-bg)] px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap transition-all duration-150 hover:-translate-y-px hover:bg-[var(--btn-bg-hover)] hover:shadow-sm"
                        style={
                          {
                            "--btn-bg": accentAlpha(0.1),
                            "--btn-bg-hover": accentAlpha(0.18),
                            color: ACCENT,
                          } as React.CSSProperties
                        }
                      >
                        {iconOs && getStoreIcon(iconOs, "h-3.5 w-3.5")}
                        {t(`walletFinder.actions.${entry.action}`)}
                      </ExternalLink>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </td>
      </tr>
    </>
  );
}

function WalletCard({ match }: { match: WalletMatch }) {
  const t = useTranslations("hodl");
  const { wallet, presentation, actions: visibleActions, features } = match;
  const uniqueFeatures = features.slice(0, 4);

  return (
    <div className="border-subtle rounded-[20px] border p-4 sm:p-5">
      <div className="flex items-center gap-3">
        <Image
          src={wallet.icon}
          alt={wallet.title}
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 rounded-[14px] bg-black/[0.04] object-cover dark:bg-white/[0.06]"
        />
        <div className="flex items-center gap-1">
          <h4
            className="text-[18px] leading-tight font-semibold tracking-[-0.02em]"
            style={{ color: ACCENT }}
          >
            {wallet.title}
          </h4>
          <CompatibilityInfo wallet={wallet} />
          {wallet.user === "experienced" && <AdvancedBadge />}
        </div>
      </div>

      <p className="text-tertiary mt-3 text-[13px] leading-[1.6]">
        {wallet.summary}
      </p>

      {uniqueFeatures.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {uniqueFeatures.map((feature) => {
            const label = t(`walletFinder.features.${feature}.label`);
            return (
              <span
                key={feature}
                className="text-secondary rounded-full bg-black/[0.04] px-2.5 py-0.5 text-[11.5px] font-medium dark:bg-white/[0.05]"
              >
                {label}
              </span>
            );
          })}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-1.5 min-[360px]:grid-cols-2">
        {walletCriteria.map((criterion) => {
          const rating = presentation.ratings[criterion.id];
          return (
            <RatingTooltip
              key={criterion.id}
              rating={rating}
              criterion={criterion.id}
              breakdown={presentation.breakdowns[criterion.id]}
              className="min-w-0 flex-col gap-1 rounded-[12px] bg-black/[0.025] px-3 py-2.5 transition-colors hover:bg-black/[0.05] dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
            >
              <span className="text-secondary block text-[13px] leading-tight font-medium [overflow-wrap:anywhere]">
                {t(`walletFinder.criteria.${criterion.id}.label`)}
              </span>
              <span className="text-muted flex items-center gap-1.5 text-[11.5px] leading-tight">
                <RatingSymbol rating={rating} />
                {t(
                  rating === "not_applicable"
                    ? "walletFinder.ratings.notApplicableCompact"
                    : `walletFinder.ratings.${rating}`,
                )}
              </span>
            </RatingTooltip>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {visibleActions.map((entry, index) => {
          const iconOs = getActionStoreIconOs(entry.action);
          return (
            <ExternalLink
              key={`${wallet.id}-${entry.action}-${index}`}
              href={entry.link}
              className="inline-flex items-center gap-1.5 rounded-[8px] bg-[var(--btn-bg)] px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap transition-all duration-150 hover:-translate-y-px hover:bg-[var(--btn-bg-hover)] hover:shadow-sm"
              style={
                {
                  "--btn-bg": accentAlpha(0.1),
                  "--btn-bg-hover": accentAlpha(0.18),
                  color: ACCENT,
                } as React.CSSProperties
              }
            >
              {iconOs && getStoreIcon(iconOs, "h-3.5 w-3.5")}
              {t(`walletFinder.actions.${entry.action}`)}
            </ExternalLink>
          );
        })}
      </div>
    </div>
  );
}

function MobileLegendBanner() {
  const t = useTranslations("hodl");

  return (
    <div className="border-subtle mb-3 flex flex-wrap items-center justify-between gap-2 rounded-[10px] border bg-black/[0.015] px-3 py-1.5 dark:bg-white/[0.02]">
      {RATING_ORDER.map((rating) => (
        <div key={rating} className="flex shrink-0 items-center gap-1.5">
          <RatingSymbol rating={rating} />
          <span className="text-secondary text-[11px] leading-none whitespace-nowrap">
            {rating === "not_applicable"
              ? t("walletFinder.ratings.notApplicableCompact")
              : t(`walletFinder.ratings.${rating}`)}
          </span>
        </div>
      ))}
    </div>
  );
}

function EmptyResults() {
  const t = useTranslations("hodl");

  return (
    <div className="border-subtle rounded-[20px] border px-6 py-12 text-center">
      <p className="text-primary text-[16px] font-medium">
        {t("walletFinder.results.noMatches")}
      </p>
      <p className="text-tertiary mx-auto mt-2 max-w-sm text-[14px]">
        {t("walletFinder.results.removeFilters")}
      </p>
    </div>
  );
}

export function DesktopResults({
  matches,
  totalWallets,
  mode,
  onRestartWizard,
  hideHeader = false,
}: {
  matches: WalletMatch[];
  totalWallets: number;
  mode: "intro" | "guided" | "table";
  onRestartWizard: () => void;
  hideHeader?: boolean;
}) {
  const t = useTranslations("hodl");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div>
      {!hideHeader && (
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-secondary text-[13px]">
            {t.rich("walletFinder.results.summary", {
              matches: matches.length,
              total: totalWallets,
              strong: (chunks) => (
                <strong className="text-primary">{chunks}</strong>
              ),
            })}
          </p>
          {mode === "table" && (
            <button
              type="button"
              className="text-tertiary hover:text-primary flex shrink-0 items-center gap-1.5 text-[12.5px] font-medium underline-offset-2 transition-colors hover:underline"
              onClick={onRestartWizard}
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
          )}
        </div>
      )}
      {matches.length === 0 ? (
        <EmptyResults />
      ) : (
        <>
          {/* overflow-x alone makes overflow-y auto too; subpixel rounding then
              adds a 1px vertical overflow that flashes a scrollbar (and reflows
              the table) on every frame of a row expanding. */}
          <div className="overflow-x-auto overflow-y-hidden">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="pr-4 pb-3 text-left text-[11px] font-semibold tracking-[0.06em] text-[var(--text-muted)] uppercase">
                    {t("walletFinder.results.walletColumn")}
                  </th>
                  {walletCriteria.map((criterion) => (
                    <th
                      key={criterion.id}
                      className="min-w-[64px] px-2 pb-3 text-center text-[11px] font-semibold tracking-[0.06em] whitespace-nowrap text-[var(--text-muted)] uppercase"
                      title={t(
                        `walletFinder.criteria.${criterion.id}.description`,
                      )}
                    >
                      {t(`walletFinder.criteria.${criterion.id}.label`)}
                    </th>
                  ))}
                  <th aria-hidden className="w-10 pb-3" />
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <WalletRow
                    key={match.wallet.id}
                    match={match}
                    isExpanded={expandedId === match.wallet.id}
                    onToggle={() =>
                      setExpandedId((current) =>
                        current === match.wallet.id ? null : match.wallet.id,
                      )
                    }
                  />
                ))}
              </tbody>
            </table>
          </div>
          <RatingLegend />
        </>
      )}
    </div>
  );
}

export function MobileResults({ matches }: { matches: WalletMatch[] }) {
  const t = useTranslations("hodl");

  if (matches.length === 0) {
    return (
      <div className="border-subtle rounded-[20px] border px-6 py-10 text-center">
        <p className="text-primary text-[16px] font-medium">
          {t("walletFinder.results.noMatches")}
        </p>
        <p className="text-tertiary mx-auto mt-2 max-w-sm text-[14px]">
          {t("walletFinder.results.removeFilters")}
        </p>
      </div>
    );
  }

  return (
    <>
      <MobileLegendBanner />
      <div className="grid gap-4">
        {matches.map((match) => (
          <WalletCard key={match.wallet.id} match={match} />
        ))}
      </div>
    </>
  );
}
