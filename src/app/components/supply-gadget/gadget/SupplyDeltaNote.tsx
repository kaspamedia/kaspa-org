type SupplyDeltaNoteProps = {
  isConnected: boolean;
};

export function SupplyDeltaNote({
  isConnected,
}: SupplyDeltaNoteProps): React.JSX.Element | null {
  if (!isConnected) {
    return null;
  }

  return (
    <div
      className="pt-4"
      style={{ borderTop: "1px solid var(--border-subtle)" }}
    >
      <div className="flex items-baseline gap-2">
        <span className="text-muted text-xs tracking-wider uppercase">
          Anchor
        </span>
        <span className="font-mono text-sm">Nov 22, 2021 checkpoint</span>
      </div>
      <p className="text-muted mt-1.5 text-xs leading-relaxed">
        The historical supply at the Nov 22, 2021 checkpoint is committed to by
        the hardwired genesis via its UTXO set. Every coin issued after that
        point follows a deterministic consensus schedule, so the node-reported
        supply and the checkpoint-anchored expected supply should match. Small
        differences on the order of hundreds of KAS come from DAA-vs-block-count
        drift and integer rounding in the consensus subsidy table, similarly to
        Bitcoin and other PoW minting.
      </p>
    </div>
  );
}
