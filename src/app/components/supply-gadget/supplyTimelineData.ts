import {
  CHECKPOINT_DAA,
  CHECKPOINT_DATE,
  CRESCENDO_DAA,
  DEFLATIONARY_PHASE_DAA,
} from "./emissionConstants";
import { computeHistoricalSupply } from "./emissionMath";

export type Milestone = {
  label: string;
  date: string;
  daaScore: bigint;
  description: string;
};

export type HistoricalMilestone = Milestone & {
  expectedSompi: bigint;
};

const HISTORICAL_MILESTONES: Milestone[] = [
  {
    label: "Genesis",
    date: "Nov 7, 2021",
    daaScore: 0n,
    description:
      "Empty UTXO set, so zero coins exist. The original genesis is anchored to Bitcoin block #708,639.",
  },
  {
    label: "Checkpoint",
    date: CHECKPOINT_DATE,
    daaScore: CHECKPOINT_DAA,
    description:
      "Block rewards were randomized between 1–1000 KAS per block for the first ~2 weeks of mainnet, emitting +327,792,544 KAS before a hardfork fixed the per-block reward. Historical supply committed to by the hardwired genesis.",
  },
  {
    label: "Pre-deflationary phase",
    date: "Nov 22, 2021 – May 7, 2022",
    daaScore: (CHECKPOINT_DAA + DEFLATIONARY_PHASE_DAA) / 2n,
    description:
      "Fixed per-block reward for ~6 months after the checkpoint, before the deflationary schedule kicks in.",
  },
  {
    label: "Chromatic phase begins",
    date: "~May 7, 2022",
    daaScore: DEFLATIONARY_PHASE_DAA,
    description:
      "Pre-deflationary phase ends. Reward drops from 500 to 440 KAS/block and decreases geometrically each month.",
  },
  {
    label: "Crescendo",
    date: "~May 5, 2025",
    daaScore: CRESCENDO_DAA,
    description:
      "10 blocks per second, with the per-block reward divided by 10.",
  },
];

export function getHistoricalMilestones(): HistoricalMilestone[] {
  return HISTORICAL_MILESTONES.map((milestone) => ({
    ...milestone,
    expectedSompi: computeHistoricalSupply(milestone.daaScore),
  }));
}
