"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";

import {
  notifyKaspaAiReady,
  OPEN_KASPA_AI_EVENT,
  type OpenKaspaAiDetail,
} from "../aiLauncherEvents";
import { useBodyScrollLock } from "../useBodyScrollLock";
import { getPanelHeight, PANEL_TRANSITION_MS } from "./constants";
import type { PanelState } from "./types";
import { useVirtualKeyboardInset } from "./useVirtualKeyboardInset";

type UseAiLauncherPanelOptions = {
  inputRef: RefObject<HTMLInputElement | null>;
  setInput: Dispatch<SetStateAction<string>>;
};

type UseAiLauncherPanelResult = {
  closePanel: () => void;
  isOpen: boolean;
  openPanel: () => void;
  panelHeight: string;
  panelState: PanelState;
  renderPanel: boolean;
  togglePanelSize: () => void;
};

function requestOpenPanel(
  setPanelState: Dispatch<SetStateAction<PanelState>>,
): void {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      setPanelState("mid");
    });
  });
}

export function useAiLauncherPanel({
  inputRef,
  setInput,
}: UseAiLauncherPanelOptions): UseAiLauncherPanelResult {
  const [panelState, setPanelState] = useState<PanelState>("closed");
  const [renderPanel, setRenderPanel] = useState(false);
  const focusTimeoutRef = useRef<number | null>(null);

  const isOpen = panelState !== "closed";

  useBodyScrollLock(isOpen);
  useVirtualKeyboardInset(isOpen);

  const openPanel = useCallback((): void => {
    if (renderPanel) {
      return;
    }

    setRenderPanel(true);
    requestOpenPanel(setPanelState);
  }, [renderPanel]);

  const openPanelFromEvent = useCallback((): void => {
    if (!renderPanel) {
      setRenderPanel(true);
      requestOpenPanel(setPanelState);
      return;
    }

    if (panelState === "closed") {
      requestOpenPanel(setPanelState);
    }
  }, [panelState, renderPanel]);

  const closePanel = useCallback((): void => {
    setPanelState("closed");
  }, []);

  const togglePanelSize = useCallback((): void => {
    setPanelState((current) => (current === "full" ? "mid" : "full"));
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    focusTimeoutRef.current = window.setTimeout(() => {
      inputRef.current?.focus();
      focusTimeoutRef.current = null;
    }, 350);

    return () => {
      if (focusTimeoutRef.current !== null) {
        window.clearTimeout(focusTimeoutRef.current);
        focusTimeoutRef.current = null;
      }
    };
  }, [inputRef, isOpen]);

  useEffect(() => {
    if (panelState !== "closed" || !renderPanel) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRenderPanel(false);
    }, PANEL_TRANSITION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [panelState, renderPanel]);

  useEffect(() => {
    notifyKaspaAiReady();
  }, []);

  useEffect(() => {
    const handleOpenRequest: EventListener = (event) => {
      const customEvent = event as CustomEvent<OpenKaspaAiDetail>;
      const prompt = customEvent.detail?.prompt?.trim();

      if (prompt) {
        setInput(prompt);
      }

      openPanelFromEvent();
    };

    window.addEventListener(OPEN_KASPA_AI_EVENT, handleOpenRequest);

    return () => {
      window.removeEventListener(OPEN_KASPA_AI_EVENT, handleOpenRequest);
    };
  }, [openPanelFromEvent, setInput]);

  return {
    closePanel,
    isOpen,
    openPanel,
    panelHeight: getPanelHeight(panelState),
    panelState,
    renderPanel,
    togglePanelSize,
  };
}
