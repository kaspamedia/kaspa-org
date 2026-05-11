"use client";

import { ACCENT, accentAlpha } from "../content";
import type { JourneyRailProps } from "./journeyRailTypes";
import { useJourneyRailProgress } from "./useJourneyRailProgress";

export type { JourneyRailStep } from "./journeyRailTypes";

const INACTIVE_STEP_COLOR = "rgba(128, 128, 128, 0.3)";

export default function JourneyRail({
  children,
  steps,
}: JourneyRailProps): React.JSX.Element {
  const { wrapperRef, fillRef, reachedIndex, stepPositions } =
    useJourneyRailProgress(steps);

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        aria-hidden="true"
      >
        <div className="relative mx-auto h-full max-w-[calc(72rem+160px)]">
          <div
            ref={fillRef}
            className="absolute z-[1] w-[2px] rounded-full transition-opacity duration-300"
            style={{
              left: "64px",
              background: accentAlpha(0.25),
              height: 0,
              opacity: 0,
            }}
          />
          {steps.map((step, index) => {
            const position = stepPositions.find(
              (entry) => entry.id === step.id,
            );
            const reached = reachedIndex >= index;

            return (
              <span
                key={step.id}
                className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center py-3 text-[56px] leading-none font-bold tracking-[-0.04em] tabular-nums transition-[color,opacity,top] duration-200"
                style={{
                  top: position ? `${position.center}px` : undefined,
                  left: "65px",
                  opacity: position ? 1 : 0,
                  color: reached ? ACCENT : INACTIVE_STEP_COLOR,
                  background: step.background,
                }}
              >
                {step.step}
              </span>
            );
          })}
        </div>
      </div>

      {children}
    </div>
  );
}
