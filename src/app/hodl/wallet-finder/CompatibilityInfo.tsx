"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";

import ExternalLink from "../../components/ExternalLink";
import type { KaspaWallet } from "./types";

export default function CompatibilityInfo({
  wallet,
}: {
  wallet: Pick<KaspaWallet, "title" | "compatibility">;
}) {
  const t = useTranslations("hodl");
  const id = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const [interaction, setInteraction] = useState<"hover" | "active">("hover");
  const [anchor, setAnchor] = useState<DOMRect | null>(null);
  const visible = anchor !== null;
  const label = `${wallet.title}: ${t("walletFinder.common.moreInformation")}`;

  useEffect(() => {
    if (!visible) return;
    if (interaction === "active") {
      panelRef.current?.querySelector("a")?.focus({ preventScroll: true });
    }
    const outside = (event: Event) => {
      const target = event.target as Node;
      if (
        !buttonRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        setAnchor(null);
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        setAnchor(null);
        buttonRef.current?.focus({ preventScroll: true });
      }
    };
    const reposition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      setAnchor(
        rect && rect.bottom > 0 && rect.top < window.innerHeight ? rect : null,
      );
    };
    const scroll = (event: Event) => {
      if (!panelRef.current?.contains(event.target as Node)) reposition();
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("scroll", scroll, true);
    window.addEventListener("resize", reposition);
    return () => {
      clearTimeout(closeTimerRef.current);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", outside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("scroll", scroll, true);
      window.removeEventListener("resize", reposition);
    };
  }, [visible, interaction]);

  const cancelClose = () => clearTimeout(closeTimerRef.current);
  const scheduleClose = (event: { pointerType: string }) => {
    if (event.pointerType !== "mouse" || interaction !== "hover" || !visible)
      return;
    cancelClose();
    closeTimerRef.current = setTimeout(() => setAnchor(null), 150);
  };

  if (!wallet.compatibility) return null;
  const showAbove = anchor ? window.innerHeight - anchor.bottom < 200 : false;
  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-expanded={!!anchor}
        aria-controls={anchor ? id : undefined}
        aria-haspopup="dialog"
        className="text-muted hover:text-secondary inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-2"
        onPointerEnter={(event) => {
          if (event.pointerType !== "mouse") return;
          cancelClose();
          if (!anchor) {
            setInteraction("hover");
            setAnchor(event.currentTarget.getBoundingClientRect());
          }
        }}
        onPointerLeave={scheduleClose}
        onClick={(event) => {
          event.stopPropagation();
          cancelClose();
          setInteraction("active");
          setAnchor(
            anchor && interaction === "active"
              ? null
              : event.currentTarget.getBoundingClientRect(),
          );
        }}
      >
        <svg
          className="h-[14px] w-[14px]"
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm9-2.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zM7 7a.75.75 0 0 1 1.5 0v3.5a.75.75 0 0 1-1.5 0V7z"
          />
        </svg>
      </button>
      {anchor &&
        createPortal(
          <div
            ref={panelRef}
            id={id}
            role="dialog"
            aria-label={label}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              if (event.key !== "Tab") return;
              event.stopPropagation();
              // The panel has one link. Resume tab order at its trigger,
              // instead of at the portal's position at the end of the page.
              buttonRef.current?.focus({ preventScroll: true });
              setAnchor(null);
              if (event.shiftKey) event.preventDefault();
            }}
            onPointerEnter={cancelClose}
            onPointerLeave={scheduleClose}
            className="text-secondary fixed z-[9999] w-60 max-w-[calc(100vw-16px)] overflow-y-auto rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg)] p-3 text-[12px] leading-relaxed shadow-md"
            style={{
              left: Math.max(8, Math.min(window.innerWidth - 248, anchor.left)),
              ...(showAbove
                ? { bottom: window.innerHeight - anchor.top + 6 }
                : { top: anchor.bottom + 6 }),
              maxHeight: Math.max(
                60,
                (showAbove ? anchor.top : window.innerHeight - anchor.bottom) -
                  14,
              ),
            }}
          >
            <ExternalLink
              href={wallet.compatibility.link}
              className="rounded-sm no-underline hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {wallet.compatibility.note} <span aria-hidden="true">↗</span>
            </ExternalLink>
          </div>,
          document.body,
        )}
    </>
  );
}
