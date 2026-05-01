import { formatKas } from "../emissionMath";
import { Placeholder } from "../supplyVisuals";

type SupplyComparisonGridProps = {
  circulatingSompi: bigint | null;
  expectedSompi: bigint | null;
};

export function SupplyComparisonGrid({
  circulatingSompi,
  expectedSompi,
}: SupplyComparisonGridProps): React.JSX.Element {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div>
        <div className="text-muted mb-1.5 text-xs tracking-wider uppercase">
          Node-reported supply
        </div>
        <div className="font-mono text-lg tracking-tight sm:text-xl">
          {circulatingSompi !== null ? (
            <>
              {formatKas(circulatingSompi)}{" "}
              <span className="text-muted text-sm">KAS</span>
            </>
          ) : (
            <Placeholder />
          )}
        </div>
        <div className="text-muted mt-1 font-mono text-[10px]">
          via getCoinSupply RPC
        </div>
      </div>

      <div>
        <div className="text-muted mb-1.5 text-xs tracking-wider uppercase">
          Expected supply
        </div>
        <div className="font-mono text-lg tracking-tight sm:text-xl">
          {expectedSompi !== null ? (
            <>
              {formatKas(expectedSompi)}{" "}
              <span className="text-muted text-sm">KAS</span>
            </>
          ) : (
            <Placeholder />
          )}
        </div>
        <div className="text-muted mt-1 font-mono text-[10px]">
          checkpoint total + scheduled issuance since Nov 22, 2021
        </div>
      </div>
    </div>
  );
}
