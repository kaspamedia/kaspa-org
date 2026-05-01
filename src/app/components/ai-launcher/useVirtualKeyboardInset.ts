"use client";

import { useEffect } from "react";

type VirtualKeyboardLike = {
  overlaysContent: boolean;
};

type NavigatorWithVirtualKeyboard = Navigator & {
  virtualKeyboard?: VirtualKeyboardLike;
};

const CSS_VAR = "--keyboard-inset";

export function useVirtualKeyboardInset(active: boolean): void {
  useEffect(() => {
    const root = document.documentElement;

    if (!active) {
      root.style.removeProperty(CSS_VAR);
      return;
    }

    const viewport = window.visualViewport;
    const nav = navigator as NavigatorWithVirtualKeyboard;
    const virtualKeyboard = nav.virtualKeyboard;
    const previousOverlays = virtualKeyboard?.overlaysContent;

    if (virtualKeyboard) {
      virtualKeyboard.overlaysContent = true;
    }

    if (!viewport) {
      return () => {
        if (virtualKeyboard && previousOverlays !== undefined) {
          virtualKeyboard.overlaysContent = previousOverlays;
        }
        root.style.removeProperty(CSS_VAR);
      };
    }

    const update = (): void => {
      const inset = Math.max(
        0,
        window.innerHeight - viewport.height - viewport.offsetTop,
      );
      root.style.setProperty(CSS_VAR, `${Math.round(inset)}px`);
    };

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);

    return () => {
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      if (virtualKeyboard && previousOverlays !== undefined) {
        virtualKeyboard.overlaysContent = previousOverlays;
      }
      root.style.removeProperty(CSS_VAR);
    };
  }, [active]);
}
