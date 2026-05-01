"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

import type { JourneyRailStep, StepPosition } from "./journeyRailTypes";
import {
  getJourneyRailBounds,
  getJourneyRailProgressState,
  getStepPositions,
  sameStepPositions,
} from "./journeyRailProgressUtils";

type JourneyRailProgressState = {
  wrapperRef: RefObject<HTMLDivElement | null>;
  fillRef: RefObject<HTMLDivElement | null>;
  reachedIndex: number;
  stepPositions: StepPosition[];
};

export function useJourneyRailProgress(
  steps: readonly JourneyRailStep[],
): JourneyRailProgressState {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const stepPositionsRef = useRef<StepPosition[]>([]);
  const boundsRef = useRef<ReturnType<typeof getJourneyRailBounds> | null>(
    null,
  );
  const [stepPositions, setStepPositions] = useState<StepPosition[]>([]);
  const [reachedIndex, setReachedIndex] = useState(-1);

  const updateFill = useCallback((): void => {
    const fill = fillRef.current;
    const bounds = boundsRef.current;

    if (!fill || !bounds) {
      return;
    }

    const { nextReachedIndex, progress } = getJourneyRailProgressState(
      bounds,
      stepPositionsRef.current,
    );

    fill.style.top = `${bounds.firstOffset}px`;
    fill.style.height = `${progress * bounds.distance}px`;
    fill.style.opacity = progress > 0 ? "1" : "0";
    setReachedIndex((currentIndex) =>
      currentIndex === nextReachedIndex ? currentIndex : nextReachedIndex,
    );
  }, []);

  const measure = useCallback((): void => {
    const wrapper = wrapperRef.current;
    if (!wrapper) {
      return;
    }

    const wrapperTop = wrapper.getBoundingClientRect().top + window.scrollY;
    const nextPositions = getStepPositions(steps, wrapperTop);

    if (nextPositions.length !== steps.length) {
      return;
    }

    boundsRef.current = getJourneyRailBounds(nextPositions, wrapperTop);
    stepPositionsRef.current = nextPositions;
    setStepPositions((currentPositions) =>
      sameStepPositions(currentPositions, nextPositions)
        ? currentPositions
        : nextPositions,
    );
    updateFill();
  }, [steps, updateFill]);

  useEffect(() => {
    let resizeObserver: ResizeObserver | null = null;
    const rafId = window.requestAnimationFrame(measure);

    const refresh = (): void => {
      measure();
      updateFill();
    };

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(refresh);

      if (wrapperRef.current) {
        resizeObserver.observe(wrapperRef.current);
      }

      steps.forEach((step) => {
        if (step.headingRef.current) {
          resizeObserver?.observe(step.headingRef.current);
        }
      });
    }

    window.addEventListener("resize", refresh);
    window.addEventListener("load", refresh);
    document.fonts?.ready.then(refresh).catch(() => {});

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver?.disconnect();
      window.removeEventListener("resize", refresh);
      window.removeEventListener("load", refresh);
    };
  }, [measure, steps, updateFill]);

  useEffect(() => {
    const onScroll = (): void => {
      if (frameRef.current !== null) {
        return;
      }

      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null;
        measure();
        updateFill();
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("scrollend", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scrollend", onScroll);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [measure, updateFill]);

  return {
    wrapperRef,
    fillRef,
    reachedIndex,
    stepPositions,
  };
}
