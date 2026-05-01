import {
  computeBlockReward,
  computeHistoricalSupply,
  computeUltimateSupply,
} from "./emissionMath";
import type { KaspaNodeState } from "./kaspaWorkerMessages";

const ULTIMATE_SUPPLY = computeUltimateSupply();

export type SupplyMetrics = {
  blockReward: number | null;
  expectedSompi: bigint | null;
  pctEmitted: number | null;
};

export function getSupplyMetrics(node: KaspaNodeState): SupplyMetrics {
  const expectedSompi =
    node.daaScore !== null ? computeHistoricalSupply(node.daaScore) : null;

  const pctEmitted =
    node.circulatingSompi !== null
      ? Number((node.circulatingSompi * 10000n) / ULTIMATE_SUPPLY) / 100
      : null;

  const blockReward =
    node.daaScore !== null ? computeBlockReward(node.daaScore) : null;

  return {
    blockReward,
    expectedSompi,
    pctEmitted,
  };
}
