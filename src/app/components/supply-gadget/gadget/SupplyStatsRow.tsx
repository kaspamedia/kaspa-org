import { SUPPLY_TEAL } from "../supplyVisuals";

type SupplyStatsRowProps = {
  blockCount: bigint | null;
  blockReward: number | null;
  daaScore: bigint | null;
  pctEmitted: number | null;
};

export function SupplyStatsRow({
  blockCount,
  blockReward,
  daaScore,
  pctEmitted,
}: SupplyStatsRowProps): React.JSX.Element {
  return (
    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div>
        <div className="text-muted mb-1 text-xs tracking-wider uppercase">
          Mined
        </div>
        <div className="font-mono text-sm">
          {pctEmitted !== null ? `${pctEmitted.toFixed(2)}%` : "--"}
        </div>
        {pctEmitted !== null ? (
          <div
            className="mt-1.5 h-1 overflow-hidden rounded-full"
            style={{ backgroundColor: "var(--border-subtle)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pctEmitted}%`,
                backgroundColor: SUPPLY_TEAL,
              }}
            />
          </div>
        ) : null}
      </div>

      <div>
        <div className="text-muted mb-1 text-xs tracking-wider uppercase">
          Block reward
        </div>
        <div className="font-mono text-sm">
          {blockReward !== null ? `${blockReward.toFixed(2)} KAS` : "--"}
        </div>
      </div>

      <div>
        <div className="text-muted mb-1 text-xs tracking-wider uppercase">
          Node DAG blocks
        </div>
        <div className="font-mono text-sm">
          {blockCount !== null
            ? Number(blockCount).toLocaleString("en-US")
            : "--"}
        </div>
      </div>

      <div>
        <div className="text-muted mb-1 text-xs tracking-wider uppercase">
          DAA score
        </div>
        <div className="font-mono text-sm">
          {daaScore !== null ? Number(daaScore).toLocaleString("en-US") : "--"}
        </div>
      </div>
    </div>
  );
}
