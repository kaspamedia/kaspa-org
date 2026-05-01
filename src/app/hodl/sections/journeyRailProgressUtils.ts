import type { JourneyRailStep, StepPosition } from "./journeyRailTypes";

type JourneyRailBounds = {
  distance: number;
  firstAbs: number;
  firstOffset: number;
  lastAbs: number;
};

export function sameStepPositions(
  left: readonly StepPosition[],
  right: readonly StepPosition[],
): boolean {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((position, index) => {
    const other = right[index];

    return (
      position.id === other.id &&
      position.abs === other.abs &&
      position.center === other.center
    );
  });
}

export function getStepPositions(
  steps: readonly JourneyRailStep[],
  wrapperTop: number,
): StepPosition[] {
  return steps
    .map((step) => {
      const heading = step.headingRef.current;
      if (!heading) {
        return null;
      }

      const rect = heading.getBoundingClientRect();
      return {
        id: step.id,
        abs: rect.top + window.scrollY + rect.height / 2,
        center: rect.top + window.scrollY + rect.height / 2 - wrapperTop,
      };
    })
    .filter((position): position is StepPosition => position !== null);
}

export function getJourneyRailBounds(
  stepPositions: readonly StepPosition[],
  wrapperTop: number,
): JourneyRailBounds {
  const firstOffset = stepPositions[0].center;
  const lastOffset = stepPositions[stepPositions.length - 1].center;

  return {
    firstAbs: wrapperTop + firstOffset,
    lastAbs: wrapperTop + lastOffset,
    firstOffset,
    distance: Math.max(lastOffset - firstOffset, 0),
  };
}

export function getJourneyRailProgressState(
  bounds: JourneyRailBounds,
  stepPositions: readonly StepPosition[],
): {
  nextReachedIndex: number;
  progress: number;
} {
  const range = Math.max(bounds.lastAbs - bounds.firstAbs, 1);
  const scrollCenter = window.scrollY + window.innerHeight * 0.5;
  const rawProgress = Math.min(
    1,
    Math.max(0, (scrollCenter - bounds.firstAbs) / range),
  );
  const scrollFactor = Math.min(1, window.scrollY / 120);
  const progress = rawProgress * scrollFactor;
  const nextReachedIndex = stepPositions.reduce(
    (lastReached, position, index) =>
      scrollCenter >= position.abs ? index : lastReached,
    -1,
  );

  return { nextReachedIndex, progress };
}
