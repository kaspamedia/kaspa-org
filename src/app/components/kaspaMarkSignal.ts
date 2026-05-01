export const KASPA_MARK_SIGNAL = "kaspa:mark";

export type KaspaMarkSignalDetail = {
  clientX: number;
  clientY: number;
};

export function dispatchKaspaMarkSignal(detail: KaspaMarkSignalDetail): void {
  window.dispatchEvent(
    new CustomEvent<KaspaMarkSignalDetail>(KASPA_MARK_SIGNAL, {
      detail,
    }),
  );
}
