"use client";

import { useEffect, useRef, useState } from "react";

import {
  CONNECT_MESSAGE_TYPE,
  initialKaspaNodeState,
  isWorkerMessage,
  type KaspaNodeState,
} from "./kaspaWorkerMessages";

function createWorkerFrame(): HTMLIFrameElement {
  const iframe = document.createElement("iframe");
  iframe.src = "/kaspa-worker.html";
  iframe.style.display = "none";
  document.body.appendChild(iframe);
  return iframe;
}

export function useKaspaNode(): KaspaNodeState {
  const [state, setState] = useState<KaspaNodeState>(initialKaspaNodeState);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const iframe = createWorkerFrame();
    iframeRef.current = iframe;

    const handleMessage = (event: MessageEvent): void => {
      if (
        event.origin !== window.location.origin ||
        event.source !== iframeRef.current?.contentWindow ||
        !isWorkerMessage(event.data)
      ) {
        return;
      }

      const data = event.data;

      if (data.type === "connected") {
        setState((previous) => ({
          ...previous,
          isConnected: true,
          nodeUrl: data.url,
          error: null,
        }));
        return;
      }

      if (data.type === "disconnected") {
        setState((previous) => ({ ...previous, isConnected: false }));
        return;
      }

      if (data.type === "data") {
        setState((previous) => ({
          ...previous,
          circulatingSompi: BigInt(data.supply),
          daaScore: BigInt(data.daaScore),
          blockCount: BigInt(data.blockCount),
        }));
        return;
      }

      setState((previous) => ({ ...previous, error: data.error }));
    };

    window.addEventListener("message", handleMessage);

    iframe.onload = () => {
      iframe.contentWindow?.postMessage(
        { type: CONNECT_MESSAGE_TYPE },
        window.location.origin,
      );
    };

    return () => {
      window.removeEventListener("message", handleMessage);
      iframe.onload = null;
      if (iframeRef.current) {
        document.body.removeChild(iframeRef.current);
        iframeRef.current = null;
      }
    };
  }, []);

  return state;
}
