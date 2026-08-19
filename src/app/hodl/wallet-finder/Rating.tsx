"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { ACCENT } from "../content";
import { WALLET_DISPLAY_RATINGS } from "./taxonomy";
import type {
  WalletCriterion,
  WalletDisplayRating,
  WalletTransparencySurface,
} from "./types";
import { getRatingExplanationKey } from "./walletMetadata";

const RATING_META = {
  good: { color: ACCENT },
  acceptable: { color: "rgb(90, 165, 90)" },
  mixed: { color: "rgb(170, 145, 55)" },
  caution: { color: "rgb(210, 130, 30)" },
  not_applicable: { color: "rgba(160,160,170,0.5)" },
} as const satisfies Record<WalletDisplayRating, { color: string }>;

const TOOLTIP_WIDTH = 240;

export function RatingSymbol({ rating }: { rating: WalletDisplayRating }) {
  if (rating === "good") {
    return (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16">
        <circle cx="8" cy="8" r="7" fill={RATING_META.good.color} />
      </svg>
    );
  }
  if (rating === "acceptable") {
    return (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16">
        <path d="M2 14L14 14L14 2z" fill={RATING_META.acceptable.color} />
      </svg>
    );
  }
  if (rating === "mixed") {
    return (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16">
        <path d="M8 1a7 7 0 0 0 0 14z" fill={RATING_META.mixed.color} />
        <path
          d="M8 1a7 7 0 0 1 0 14z"
          fill={RATING_META.mixed.color}
          fillOpacity="0.4"
        />
      </svg>
    );
  }
  if (rating === "caution") {
    return (
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16">
        <path d="M8 2L15 14H1z" fill={RATING_META.caution.color} />
      </svg>
    );
  }
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 16 16">
      <rect
        x="5"
        y="5"
        width="6"
        height="6"
        rx="1"
        fill={RATING_META.not_applicable.color}
      />
    </svg>
  );
}

export function RatingTooltip({
  rating,
  criterion,
  children,
  className,
  transparencySurfaces = [],
}: {
  rating: WalletDisplayRating;
  criterion: WalletCriterion;
  children?: ReactNode;
  className?: string;
  transparencySurfaces?: WalletTransparencySurface[];
}) {
  const t = useTranslations("hodl");
  const locale = useLocale();
  const [visible, setVisible] = useState(false);
  const [tipRect, setTipRect] = useState<DOMRect | null>(null);
  const ref = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const explanationKey =
    rating === "mixed" ? undefined : getRatingExplanationKey(criterion, rating);
  const explanation =
    rating === "mixed" && criterion === "transparency"
      ? t("walletFinder.ratings.explanations.transparency.mixed")
      : explanationKey
        ? t(explanationKey)
        : undefined;

  const criterionLabel = t(`walletFinder.criteria.${criterion}.label`);
  const ratingLabel = t(`walletFinder.ratings.${rating}`);
  const surfaceLabel = (surface: WalletTransparencySurface) => {
    const platformLabel = surface.platforms
      ?.map((platform) => t(`walletFinder.operatingSystems.${platform}`))
      .join(" / ");

    return surface.kind === "firmware"
      ? t("walletFinder.transparencySurfaces.firmware")
      : t("walletFinder.transparencySurfaces.application", {
          platform: platformLabel ?? "",
        });
  };
  const transparencyReasons = Array.from(
    transparencySurfaces.reduce((groups, surface) => {
      const labels = groups.get(surface.rating) ?? [];
      labels.push(surfaceLabel(surface));
      groups.set(surface.rating, labels);
      return groups;
    }, new Map<WalletTransparencySurface["rating"], string[]>()),
  );
  const surfaceList = new Intl.ListFormat(locale, {
    style: "long",
    type: "conjunction",
  });
  const hasTransparencyBreakdown =
    criterion === "transparency" && transparencySurfaces.length > 0;
  const tooltipWidth = hasTransparencyBreakdown ? 300 : TOOLTIP_WIDTH;

  const open = () => {
    if (ref.current) {
      setTipRect(ref.current.getBoundingClientRect());
      setVisible(true);
    }
  };

  const close = () => setVisible(false);

  useEffect(() => {
    if (!visible) return;
    const handlePointer = (event: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setVisible(false);
      }
    };
    const handleScroll = () => setVisible(false);
    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer, { passive: true });
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [visible]);

  useLayoutEffect(() => {
    if (!visible || !tipRect || !tooltipRef.current) return;

    const viewportPadding = 8;
    const gap = 6;
    const tooltipHeight = tooltipRef.current.getBoundingClientRect().height;
    const below = tipRect.bottom + gap;
    const above = tipRect.top - tooltipHeight - gap;
    const centeredLeft = Math.max(
      viewportPadding,
      Math.min(
        window.innerWidth - tooltipWidth - viewportPadding,
        tipRect.left + tipRect.width / 2 - tooltipWidth / 2,
      ),
    );
    let top = below;
    let left = centeredLeft;

    if (below + tooltipHeight > window.innerHeight - viewportPadding) {
      if (above >= viewportPadding) {
        top = above;
      } else {
        top = Math.max(
          viewportPadding,
          Math.min(
            window.innerHeight - tooltipHeight - viewportPadding,
            tipRect.top + tipRect.height / 2 - tooltipHeight / 2,
          ),
        );
        left =
          tipRect.left - tooltipWidth - gap >= viewportPadding
            ? tipRect.left - tooltipWidth - gap
            : tipRect.right + tooltipWidth + gap <=
                window.innerWidth - viewportPadding
              ? tipRect.right + gap
              : centeredLeft;
      }
    }

    tooltipRef.current.style.top = `${top}px`;
    tooltipRef.current.style.left = `${left}px`;
  }, [tipRect, tooltipWidth, visible]);

  const tooltipLeft = tipRect
    ? Math.max(
        8,
        Math.min(
          window.innerWidth - tooltipWidth - 8,
          tipRect.left + tipRect.width / 2 - tooltipWidth / 2,
        ),
      )
    : 0;

  return (
    <>
      <span
        ref={ref}
        role="button"
        tabIndex={0}
        aria-expanded={visible}
        aria-label={t("walletFinder.ratings.aria", {
          criterion: criterionLabel,
          rating: ratingLabel,
        })}
        className={`inline-flex cursor-pointer ${className ?? ""}`}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") open();
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") close();
        }}
        onClick={(event) => {
          event.stopPropagation();
          if (visible) close();
          else open();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            if (visible) close();
            else open();
          } else if (event.key === "Escape") {
            close();
          }
        }}
      >
        {children ?? <RatingSymbol rating={rating} />}
      </span>
      {visible &&
        tipRect &&
        explanation &&
        createPortal(
          <div
            ref={tooltipRef}
            className={`pointer-events-none fixed z-[9999] rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg)] p-3 text-[11px] leading-[1.5] text-[var(--text-secondary)] shadow-md ${hasTransparencyBreakdown ? "w-[300px]" : "w-60"}`}
            style={{
              top: tipRect.bottom + 6,
              left: tooltipLeft,
            }}
          >
            <p
              className="mb-1 text-[10px] font-semibold tracking-[0.06em] uppercase"
              style={{ color: RATING_META[rating].color }}
            >
              {t("walletFinder.ratings.tooltipHeading", {
                criterion: criterionLabel,
                rating: ratingLabel,
              })}
            </p>
            <p>{explanation}</p>
            {hasTransparencyBreakdown && (
              <div className="mt-2 border-t border-[var(--border-subtle)] pt-2">
                <p className="mb-1.5 text-[10px] font-semibold tracking-[0.04em] text-[var(--text-muted)] uppercase">
                  {t("walletFinder.ratings.transparencyBreakdown")}
                </p>
                <ul className="space-y-1.5">
                  {transparencySurfaces.map((surface) => {
                    return (
                      <li
                        key={`${surface.kind}-${surface.platforms?.join("-") ?? "required"}`}
                        className="flex items-center justify-between gap-3"
                      >
                        <span>{surfaceLabel(surface)}</span>
                        <span className="grid w-[88px] shrink-0 grid-cols-[16px_1fr] items-center gap-1.5 font-medium whitespace-nowrap">
                          <RatingSymbol rating={surface.rating} />
                          {t(`walletFinder.ratings.${surface.rating}`)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-2 border-t border-[var(--border-subtle)] pt-2">
                  <p className="mb-1.5 text-[10px] font-semibold tracking-[0.04em] text-[var(--text-muted)] uppercase">
                    {t("walletFinder.ratings.transparencyWhy")}
                  </p>
                  <ul className="space-y-1.5">
                    {transparencyReasons.map(([surfaceRating, labels]) => (
                      <li key={surfaceRating}>
                        <span className="font-medium text-[var(--text-primary)]">
                          {surfaceList.format(labels)}:
                        </span>{" "}
                        {t(
                          `walletFinder.ratings.explanations.transparency.${surfaceRating}`,
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

export function RatingLegend({
  className = "mt-6 flex flex-wrap gap-5",
}: {
  className?: string;
} = {}) {
  const t = useTranslations("hodl");

  return (
    <div className={className}>
      {WALLET_DISPLAY_RATINGS.map((rating) => (
        <div key={rating} className="flex items-center gap-1.5">
          <RatingSymbol rating={rating} />
          <span className="text-secondary text-[12.5px]">
            {t(`walletFinder.ratings.${rating}`)}
          </span>
        </div>
      ))}
    </div>
  );
}
