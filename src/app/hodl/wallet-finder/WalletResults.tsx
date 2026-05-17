"use client";

import Image from "next/image";
import { useState } from "react";

import ExternalLink from "../../components/ExternalLink";
import { ACCENT, accentAlpha } from "../content";
import { getStoreIcon } from "./icons";
import InfoTooltip from "./InfoTooltip";
import { RatingLegend, RatingSymbol, RatingTooltip } from "./Rating";
import {
  actionsForPlatform,
  effectiveCheck,
  effectiveFeatures,
  type WalletMatch,
} from "./filterWallets";
import { WALLET_CHECK_RATINGS } from "./taxonomy";
import type { WalletCheckRating, WalletEntryAction, WalletOs } from "./types";
import { walletCriteria, walletFeatures } from "./walletMetadata";

const COMPACT_RATING_LABELS = {
  good: "Good",
  acceptable: "Acceptable",
  caution: "Caution",
  not_applicable: "N/A",
} as const satisfies Record<WalletCheckRating, string>;

const RATING_ORDER = WALLET_CHECK_RATINGS;

const actionLabels: Record<WalletEntryAction, string> = {
  app_store: "App Store",
  google_play: "Google Play",
  download: "Download",
  open: "Open wallet",
  view_source: "View source",
};

function getActionStoreIconOs(action: WalletEntryAction): WalletOs | null {
  if (action === "app_store") return "ios";
  if (action === "google_play") return "android";
  return null;
}

function WalletRow({
  match,
  filterOs,
  isExpanded,
  onToggle,
}: {
  match: WalletMatch;
  filterOs: WalletOs | undefined;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { wallet, primary } = match;
  const check = effectiveCheck(wallet, primary);
  const visibleActions = actionsForPlatform(wallet, filterOs);
  const totalColumns = walletCriteria.length + 1;

  return (
    <>
      <tr
        className="border-subtle group cursor-pointer border-t transition-colors hover:bg-black/[0.015] dark:hover:bg-white/[0.02]"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <td className="py-4 pr-4">
          <div className="flex items-center gap-3">
            <Image
              src={wallet.icon}
              alt={wallet.title}
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-[13px] object-cover"
            />
            <div>
              <p
                className="text-[15px] leading-tight font-semibold"
                style={{ color: ACCENT }}
              >
                {wallet.title}
              </p>
              <p className="text-muted mt-0.5 text-[11.5px]">
                {wallet.summary}
              </p>
            </div>
          </div>
        </td>

        {walletCriteria.map((criterion) => (
          <td key={criterion.id} className="min-w-[64px] px-2 py-4 text-center">
            <div className="flex justify-center">
              <RatingTooltip
                rating={check[criterion.id]}
                criterion={criterion.id}
              />
            </div>
          </td>
        ))}
      </tr>
      <tr className="border-subtle border-t">
        <td colSpan={totalColumns} className="p-0">
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-out ${
              isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div className="flex flex-wrap items-center gap-2 bg-black/[0.015] px-4 py-3 dark:bg-white/[0.02]">
                {visibleActions.length === 0 ? (
                  <span className="text-muted text-[12.5px]">
                    No links available for this filter.
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
                        {actionLabels[entry.action]}
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

function WalletCard({
  match,
  filterOs,
}: {
  match: WalletMatch;
  filterOs: WalletOs | undefined;
}) {
  const { wallet, platforms, primary } = match;
  const check = effectiveCheck(wallet, primary);
  const uniqueFeatures = Array.from(
    new Set(platforms.flatMap((os) => effectiveFeatures(wallet, os))),
  ).slice(0, 4);
  const visibleActions = actionsForPlatform(wallet, filterOs);

  return (
    <div className="border-subtle rounded-[20px] border p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <Image
          src={wallet.icon}
          alt={wallet.title}
          width={44}
          height={44}
          className="h-11 w-11 shrink-0 rounded-[14px] object-cover"
        />
        <div>
          <h4
            className="mt-0.5 text-[18px] leading-tight font-semibold tracking-[-0.02em]"
            style={{ color: ACCENT }}
          >
            {wallet.title}
          </h4>
        </div>
      </div>

      <p className="text-tertiary mt-3 text-[13px] leading-[1.6]">
        {wallet.summary}
      </p>

      {uniqueFeatures.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {uniqueFeatures.map((feature) => {
            const label =
              walletFeatures.find(
                (walletFeature) => walletFeature.id === feature,
              )?.label ?? feature;
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

      <div className="mt-4 flex flex-col gap-1">
        {walletCriteria.map((criterion) => (
          <div
            key={criterion.id}
            className="flex items-center justify-between gap-3"
          >
            <RatingTooltip
              rating={check[criterion.id]}
              criterion={criterion.id}
              className="-mx-1.5 flex flex-1 items-center gap-2.5 rounded-[8px] px-1.5 py-1.5 transition-colors hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
            >
              <RatingSymbol rating={check[criterion.id]} />
              <span className="text-secondary text-[13px] font-medium">
                {criterion.label}
              </span>
            </RatingTooltip>
            <InfoTooltip
              text={criterion.description}
              ariaLabel={`About ${criterion.label}`}
            />
          </div>
        ))}
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
              {actionLabels[entry.action]}
            </ExternalLink>
          );
        })}
      </div>
    </div>
  );
}

function MobileLegendBanner() {
  return (
    <div className="border-subtle mb-3 flex flex-nowrap items-center justify-between gap-x-2 rounded-[10px] border bg-black/[0.015] px-3 py-1.5 dark:bg-white/[0.02]">
      {RATING_ORDER.map((rating) => (
        <div key={rating} className="flex shrink-0 items-center gap-1.5">
          <RatingSymbol rating={rating} />
          <span className="text-secondary text-[11px] leading-none whitespace-nowrap">
            {COMPACT_RATING_LABELS[rating]}
          </span>
        </div>
      ))}
    </div>
  );
}

function EmptyResults() {
  return (
    <div className="border-subtle rounded-[20px] border px-6 py-12 text-center">
      <p className="text-primary text-[16px] font-medium">
        No matching wallets
      </p>
      <p className="text-tertiary mx-auto mt-2 max-w-sm text-[14px]">
        Try removing some filters.
      </p>
    </div>
  );
}

export function DesktopResults({
  matches,
  totalWallets,
  mode,
  onRestartWizard,
  filterOs,
  hideHeader = false,
}: {
  matches: WalletMatch[];
  totalWallets: number;
  mode: "intro" | "guided" | "table";
  onRestartWizard: () => void;
  filterOs: WalletOs | undefined;
  hideHeader?: boolean;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div>
      {!hideHeader && (
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-secondary text-[13px]">
            <strong className="text-primary">{matches.length}</strong> of{" "}
            {totalWallets} wallets
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
              Help me choose
            </button>
          )}
        </div>
      )}
      {matches.length === 0 ? (
        <EmptyResults />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="pr-4 pb-3 text-left text-[11px] font-semibold tracking-[0.06em] text-[var(--text-muted)] uppercase">
                    Wallet
                  </th>
                  {walletCriteria.map((criterion) => (
                    <th
                      key={criterion.id}
                      className="min-w-[64px] px-2 pb-3 text-center text-[11px] font-semibold tracking-[0.06em] whitespace-nowrap text-[var(--text-muted)] uppercase"
                      title={criterion.description}
                    >
                      {criterion.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <WalletRow
                    key={match.wallet.id}
                    match={match}
                    filterOs={filterOs}
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

export function MobileResults({
  matches,
  filterOs,
}: {
  matches: WalletMatch[];
  filterOs: WalletOs | undefined;
}) {
  if (matches.length === 0) {
    return (
      <div className="border-subtle rounded-[20px] border px-6 py-10 text-center">
        <p className="text-primary text-[16px] font-medium">
          No matching wallets
        </p>
        <p className="text-tertiary mx-auto mt-2 max-w-sm text-[14px]">
          Try removing some filters.
        </p>
      </div>
    );
  }

  return (
    <>
      <MobileLegendBanner />
      <div className="grid gap-4">
        {matches.map((match) => (
          <WalletCard key={match.wallet.id} match={match} filterOs={filterOs} />
        ))}
      </div>
    </>
  );
}
