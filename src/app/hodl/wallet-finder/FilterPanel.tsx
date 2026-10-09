"use client";

import { useTranslations } from "next-intl";

import { ACCENT, accentAlpha } from "../content";
import { OS_GUIDANCE_GROUPS } from "./constants";
import { getVisibleFeatures } from "./filterState";
import InfoTooltip from "./InfoTooltip";
import { getOsIcon } from "./icons";
import type {
  WalletCriterion,
  WalletFeature,
  WalletFilters,
  WalletOs,
  WalletUserType,
} from "./types";
import { walletCriteria } from "./walletMetadata";

export type FilterPanelProps = {
  filters: WalletFilters;
  onSetOs: (os: WalletOs | undefined) => void;
  onSetUser: (user: WalletUserType | undefined) => void;
  onToggleCriterion: (criterion: WalletCriterion) => void;
  onToggleFeature: (feature: WalletFeature) => void;
  onReset: () => void;
  isCriterionDisabled: (criterion: WalletCriterion) => boolean;
  isFeatureDisabled: (feature: WalletFeature) => boolean;
};

type InlineFilterPanelProps = FilterPanelProps & {
  matchCount: number;
  onShowResults: () => void;
};

function CheckGlyph({ active }: { active: boolean }) {
  return (
    <span
      className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[4px] border-[1.5px] transition-colors"
      style={
        active
          ? {
              borderColor: ACCENT,
              background: ACCENT,
            }
          : { borderColor: "var(--border-subtle)" }
      }
    >
      {active && (
        <svg className="h-2 w-2 text-white" viewBox="0 0 8 8" fill="none">
          <path
            d="M1.5 4l2 2 3-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  );
}

function GroupTooltip({
  group,
}: {
  group: (typeof OS_GUIDANCE_GROUPS)[number];
}) {
  const t = useTranslations("hodl");

  return (
    <div>
      <p className="text-primary mb-2 text-[11px] font-semibold">
        {t(`walletFinder.guidance.${group.id}.title`)}
      </p>
      <div className="space-y-2">
        <div>
          <p className="mb-1 text-[10px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
            {t("walletFinder.common.pros")}
          </p>
          <ul className="space-y-1">
            {group.pros.map((pro) => (
              <li key={pro} className="flex gap-1.5">
                <span style={{ color: ACCENT }}>+</span>
                <span>{t(pro)}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1 text-[10px] font-semibold tracking-[0.08em] text-[var(--text-muted)] uppercase">
            {t("walletFinder.common.cons")}
          </p>
          <ul className="space-y-1">
            {group.cons.map((con) => (
              <li key={con} className="flex gap-1.5">
                <span className="text-muted">-</span>
                <span>{t(con)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function osButtonStyle(active: boolean) {
  return active
    ? {
        borderColor: "transparent",
        background: accentAlpha(0.08),
        boxShadow: `0 0 0 1.5px ${accentAlpha(0.5)}`,
      }
    : { borderColor: "var(--border-subtle)" };
}

function HideAdvancedSwitch({
  hideAdvanced,
  onSetUser,
}: {
  hideAdvanced: boolean;
  onSetUser: FilterPanelProps["onSetUser"];
}) {
  const t = useTranslations("hodl");
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={hideAdvanced}
        onClick={() => onSetUser(hideAdvanced ? undefined : "beginner")}
        className="flex flex-1 items-center justify-between gap-3 rounded-[11px] py-1 text-left"
      >
        <span className="text-secondary text-[13.5px] font-medium">
          {t("walletFinder.filters.hideAdvanced")}
        </span>
        <span
          aria-hidden
          className="relative h-5 w-9 shrink-0 rounded-full transition-colors"
          style={{ background: hideAdvanced ? ACCENT : "var(--track-bg)" }}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              hideAdvanced ? "translate-x-4" : ""
            }`}
          />
        </span>
      </button>
      <InfoTooltip text={t("walletFinder.filters.hideAdvancedHint")} />
    </div>
  );
}

function ChipToggle({
  active,
  disabled,
  label,
  onToggle,
}: {
  active: boolean;
  disabled: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-pressed={active}
      onClick={onToggle}
      className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-all ${
        disabled
          ? "cursor-not-allowed opacity-40"
          : active
            ? ""
            : "text-secondary hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
      }`}
      style={
        active
          ? {
              borderColor: "transparent",
              background: accentAlpha(0.1),
              boxShadow: `0 0 0 1.5px ${accentAlpha(0.5)}`,
              color: ACCENT,
            }
          : { borderColor: "var(--border-subtle)" }
      }
    >
      {active && (
        <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path
            d="M2.5 6.2l2.3 2.3 4.7-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {label}
    </button>
  );
}

/** One tooltip explaining every option in a section, instead of one per chip. */
function SectionGlossary({
  title,
  items,
}: {
  title: string;
  items: { id: string; label: string; text: string }[];
}) {
  const t = useTranslations("hodl");
  return (
    <InfoTooltip
      ariaLabel={t("walletFinder.results.aboutCriterion", { criterion: title })}
    >
      <dl className="space-y-1.5">
        {items.map((item) => (
          <div key={item.id}>
            <dt className="font-semibold text-[var(--text-primary)]">
              {item.label}
            </dt>
            <dd>{item.text}</dd>
          </div>
        ))}
      </dl>
    </InfoTooltip>
  );
}

/**
 * Compact filter layout for phones and tablets: labelled platform buttons,
 * wrapping chips, and a pinned bar that shows the live match count.
 */
export function InlineFilterPanel({
  filters,
  onSetOs,
  onSetUser,
  onToggleCriterion,
  onToggleFeature,
  onReset,
  isCriterionDisabled,
  isFeatureDisabled,
  matchCount,
  onShowResults,
}: InlineFilterPanelProps) {
  const t = useTranslations("hodl");
  const sectionHeader =
    "text-[11px] font-semibold tracking-[0.1em] uppercase text-[var(--text-muted)]";
  const divider = "border-subtle my-5 border-t";
  const visibleFeatures = getVisibleFeatures(filters.user);

  return (
    <div className="border-subtle rounded-[24px] border bg-[var(--bg)] dark:bg-[color-mix(in_srgb,var(--surface),white_2%)]">
      <div className="p-5">
        <p className={`${sectionHeader} mb-3`}>
          {t("walletFinder.filters.operatingSystem")}
        </p>
        <div className="flex flex-wrap gap-x-5 gap-y-4">
          {OS_GUIDANCE_GROUPS.map((group) => (
            <div key={group.id}>
              <div className="mb-2 flex items-center gap-1.5">
                <p className="text-muted text-[10px] font-semibold tracking-[0.1em] uppercase">
                  {t(`walletFinder.guidance.${group.id}.shortTitle`)}
                </p>
                <InfoTooltip>
                  <GroupTooltip group={group} />
                </InfoTooltip>
              </div>
              <div className="flex gap-1.5">
                {group.os.map((osOption) => {
                  const active = filters.os === osOption;
                  return (
                    <button
                      key={osOption}
                      type="button"
                      aria-pressed={active}
                      onClick={() => onSetOs(active ? undefined : osOption)}
                      className="flex min-w-14 flex-col items-center gap-1 rounded-[12px] border px-2 pt-2.5 pb-2 transition-all hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                      style={{
                        ...osButtonStyle(active),
                        color: active ? ACCENT : "var(--text-secondary)",
                      }}
                    >
                      {getOsIcon(osOption, "h-5 w-5")}
                      <span className="text-[11px] leading-tight font-medium">
                        {t(`walletFinder.operatingSystems.${osOption}`)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className={divider} />

        <HideAdvancedSwitch
          hideAdvanced={filters.user === "beginner"}
          onSetUser={onSetUser}
        />

        <div className={divider} />

        <div className="mb-3 flex items-center gap-1.5">
          <p className={sectionHeader}>{t("walletFinder.filters.criteria")}</p>
          <SectionGlossary
            title={t("walletFinder.filters.criteria")}
            items={walletCriteria.map(({ id }) => ({
              id,
              label: t(`walletFinder.criteria.${id}.label`),
              text: t(`walletFinder.criteria.${id}.short`),
            }))}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {walletCriteria.map(({ id }) => {
            const active = filters.important.includes(id);
            return (
              <ChipToggle
                key={id}
                active={active}
                disabled={!active && isCriterionDisabled(id)}
                label={t(`walletFinder.criteria.${id}.label`)}
                onToggle={() => onToggleCriterion(id)}
              />
            );
          })}
        </div>

        <div className={divider} />

        <div className="mb-3 flex items-center gap-1.5">
          <p className={sectionHeader}>{t("walletFinder.filters.features")}</p>
          <SectionGlossary
            title={t("walletFinder.filters.features")}
            items={visibleFeatures.map(({ id }) => ({
              id,
              label: t(`walletFinder.features.${id}.label`),
              text: t(`walletFinder.features.${id}.short`),
            }))}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {visibleFeatures.map(({ id }) => {
            const active = filters.features.includes(id);
            return (
              <ChipToggle
                key={id}
                active={active}
                disabled={!active && isFeatureDisabled(id)}
                label={t(`walletFinder.features.${id}.label`)}
                onToggle={() => onToggleFeature(id)}
              />
            );
          })}
        </div>
      </div>

      <div className="border-subtle sticky bottom-0 z-10 flex items-center gap-3 rounded-b-[24px] border-t bg-[var(--bg)] px-5 py-3 dark:bg-[color-mix(in_srgb,var(--surface),white_2%)]">
        <button
          type="button"
          onClick={onReset}
          className="text-tertiary hover:text-primary min-h-11 px-1 text-[13px] font-medium underline-offset-2 transition-colors hover:underline"
        >
          {t("walletFinder.filters.clearAll")}
        </button>
        <button
          type="button"
          onClick={onShowResults}
          className="btn-primary flex-1 justify-center tabular-nums"
        >
          <span aria-live="polite">
            {t("walletFinder.wizard.showCount", { count: matchCount })}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function FilterPanel({
  filters,
  onSetOs,
  onSetUser,
  onToggleCriterion,
  onToggleFeature,
  onReset,
  isCriterionDisabled,
  isFeatureDisabled,
}: FilterPanelProps) {
  const t = useTranslations("hodl");
  const hideAdvanced = filters.user === "beginner";
  const sectionHeader =
    "text-[11px] font-semibold tracking-[0.1em] uppercase text-[var(--text-muted)] mb-3";
  const divider = "border-subtle my-5 border-t";

  return (
    <div className="border-subtle rounded-[24px] border bg-[var(--bg)] p-5 dark:bg-[rgba(255,255,255,0.02)]">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[14px] font-semibold">
          {t("walletFinder.filters.heading")}
        </p>
        <button
          type="button"
          className="text-tertiary hover:text-primary text-[12px] font-medium underline-offset-2 transition-colors hover:underline"
          onClick={onReset}
        >
          {t("walletFinder.filters.clearAll")}
        </button>
      </div>

      <div>
        <p className={sectionHeader}>
          {t("walletFinder.filters.operatingSystem")}
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          {OS_GUIDANCE_GROUPS.map((group) => (
            <div
              key={group.id}
              className={group.os.length === 1 ? "col-span-2" : undefined}
            >
              <div className="mb-2 flex items-center gap-1.5">
                <p className="text-muted text-[10px] font-semibold tracking-[0.1em] uppercase">
                  {t(`walletFinder.guidance.${group.id}.shortTitle`)}
                </p>
                <InfoTooltip>
                  <GroupTooltip group={group} />
                </InfoTooltip>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {group.os.map((osOption) => {
                  const active = filters.os === osOption;
                  const osLabel = t(
                    `walletFinder.operatingSystems.${osOption}`,
                  );
                  return (
                    <button
                      key={osOption}
                      type="button"
                      title={osLabel}
                      aria-label={osLabel}
                      aria-pressed={active}
                      onClick={() => onSetOs(active ? undefined : osOption)}
                      className="flex h-11 w-11 items-center justify-center rounded-[10px] border transition-all hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                      style={osButtonStyle(active)}
                    >
                      <span
                        style={{
                          color: active ? ACCENT : "var(--text-secondary)",
                        }}
                      >
                        {getOsIcon(osOption, "h-5 w-5")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={divider} />

      <HideAdvancedSwitch hideAdvanced={hideAdvanced} onSetUser={onSetUser} />

      <div className={divider} />

      <div>
        <p className={sectionHeader}>{t("walletFinder.filters.criteria")}</p>
        <div className="flex flex-col gap-0.5">
          {walletCriteria.map((criterion) => {
            const active = filters.important.includes(criterion.id);
            const disabled = !active && isCriterionDisabled(criterion.id);
            return (
              <div
                key={criterion.id}
                className={`flex items-center rounded-[11px] pr-3 transition-colors ${
                  active
                    ? "text-primary"
                    : disabled
                      ? "opacity-35"
                      : "text-secondary hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                }`}
              >
                <button
                  type="button"
                  disabled={disabled}
                  aria-pressed={active}
                  className="flex flex-1 items-center gap-2.5 rounded-[11px] py-2 pl-3 text-left disabled:cursor-not-allowed"
                  onClick={() => onToggleCriterion(criterion.id)}
                >
                  <CheckGlyph active={active} />
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-medium">
                      {t(`walletFinder.criteria.${criterion.id}.label`)}
                    </span>
                    {disabled && (
                      <span className="block text-[11px] text-[var(--text-muted)]">
                        {t("walletFinder.common.notAvailable")}
                      </span>
                    )}
                  </span>
                </button>
                {disabled ? null : (
                  <InfoTooltip
                    text={t(
                      `walletFinder.criteria.${criterion.id}.description`,
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={divider} />

      <div>
        <p className={sectionHeader}>{t("walletFinder.filters.features")}</p>
        <div className="flex flex-col gap-0.5">
          {getVisibleFeatures(filters.user).map((feature) => {
            const active = filters.features.includes(feature.id);
            const disabled = !active && isFeatureDisabled(feature.id);
            return (
              <div
                key={feature.id}
                className={`flex items-center rounded-[11px] pr-3 transition-colors ${
                  active
                    ? "text-primary"
                    : disabled
                      ? "opacity-35"
                      : "text-secondary hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                }`}
              >
                <button
                  type="button"
                  disabled={disabled}
                  aria-pressed={active}
                  className="flex flex-1 items-center gap-2.5 rounded-[11px] py-2 pl-3 text-left disabled:cursor-not-allowed"
                  onClick={() => onToggleFeature(feature.id)}
                >
                  <CheckGlyph active={active} />
                  <span className="min-w-0">
                    <span className="block text-[13.5px] font-medium">
                      {t(`walletFinder.features.${feature.id}.label`)}
                    </span>
                    {disabled && (
                      <span className="block text-[11px] text-[var(--text-muted)]">
                        {t("walletFinder.common.notAvailable")}
                      </span>
                    )}
                  </span>
                </button>
                {disabled ? null : (
                  <InfoTooltip
                    text={t(`walletFinder.features.${feature.id}.description`)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
