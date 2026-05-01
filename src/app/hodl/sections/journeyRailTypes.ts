import type { ReactNode, RefObject } from "react";

export type JourneyRailStepId = "wallet" | "buy" | "transfer";

export type JourneyRailStep = {
  id: JourneyRailStepId;
  step: number;
  background: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
};

export type JourneyRailProps = {
  children: ReactNode;
  steps: readonly JourneyRailStep[];
};

export type StepPosition = {
  id: JourneyRailStepId;
  abs: number;
  center: number;
};
