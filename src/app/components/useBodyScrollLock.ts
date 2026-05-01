"use client";

import { useEffect, useLayoutEffect } from "react";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

let lockCount = 0;
let savedScrollY = 0;
let savedStyles: {
  overflow: string;
  position: string;
  top: string;
  left: string;
  right: string;
  width: string;
} | null = null;

function applyLock(): void {
  if (lockCount > 0) {
    lockCount += 1;
    return;
  }

  savedScrollY = window.scrollY;
  const body = document.body;
  savedStyles = {
    overflow: body.style.overflow,
    position: body.style.position,
    top: body.style.top,
    left: body.style.left,
    right: body.style.right,
    width: body.style.width,
  };

  body.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${savedScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";

  lockCount = 1;
}

function releaseLock(): void {
  if (lockCount === 0) {
    return;
  }

  lockCount -= 1;
  if (lockCount > 0 || savedStyles === null) {
    return;
  }

  const body = document.body;
  body.style.overflow = savedStyles.overflow;
  body.style.position = savedStyles.position;
  body.style.top = savedStyles.top;
  body.style.left = savedStyles.left;
  body.style.right = savedStyles.right;
  body.style.width = savedStyles.width;

  // Restore instantly — html { scroll-behavior: smooth } would otherwise
  // animate this, which is wrong for a lock/unlock that should be invisible.
  window.scrollTo({ top: savedScrollY, left: 0, behavior: "instant" });
  savedStyles = null;
}

export function useBodyScrollLock(locked: boolean): void {
  useIsomorphicLayoutEffect(() => {
    if (!locked) {
      return;
    }

    applyLock();

    return () => {
      releaseLock();
    };
  }, [locked]);
}
