"use client";

import { useMemo } from "react";
import { CheckIcon } from "../icons";
import { formatKas } from "./emissionMath";
import { getHistoricalMilestones } from "./supplyTimelineData";
import { LiveDot } from "./supplyVisuals";

const GREEN = "#5a9e82";
const TEAL = "rgb(118, 167, 158)";

function CheckCircle() {
  return (
    <div
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
      style={{ backgroundColor: GREEN }}
    >
      <span className="text-white">
        <CheckIcon size={12} />
      </span>
    </div>
  );
}

interface SupplyTimelineProps {
  circulatingSompi: bigint | null;
  expectedSompi: bigint | null;
  isConnected: boolean;
}

export default function SupplyTimeline({
  circulatingSompi,
  expectedSompi,
  isConnected,
}: SupplyTimelineProps) {
  const milestoneData = useMemo(() => getHistoricalMilestones(), []);

  return (
    <div className="relative">
      {/* Vertical connector line */}
      <div
        className="absolute top-3 bottom-3 left-3 w-px"
        style={{ backgroundColor: "var(--border-subtle)" }}
      />

      <div className="space-y-0">
        {/* Historical milestones */}
        {milestoneData.map((m) => (
          <div key={m.label} className="relative flex gap-4 pb-6">
            <CheckCircle />
            <div className="min-w-0 pt-0.5">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <span className="text-sm font-medium">{m.label}</span>
                <span className="text-muted text-xs">{m.date}</span>
              </div>
              <div className="mt-1 font-mono text-sm tracking-tight">
                {formatKas(m.expectedSompi)}{" "}
                <span className="text-muted text-xs">KAS</span>
              </div>
              <p className="text-muted mt-0.5 text-xs leading-relaxed">
                {m.description}
              </p>
            </div>
          </div>
        ))}

        {/* NOW — live milestone */}
        <div className="relative flex gap-4">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center">
            <LiveDot size={3} />
          </div>
          <div className="min-w-0 pt-0.5">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <span className="text-sm font-medium" style={{ color: TEAL }}>
                Now
              </span>
              <span className="text-muted text-xs">live</span>
            </div>
            {isConnected && circulatingSompi !== null ? (
              <>
                <div className="mt-1 font-mono text-sm tracking-tight">
                  {formatKas(circulatingSompi)}{" "}
                  <span className="text-muted text-xs">KAS circulating</span>
                </div>
                {expectedSompi !== null && (
                  <div className="mt-1 font-mono text-sm tracking-tight">
                    {formatKas(expectedSompi)}{" "}
                    <span className="text-muted text-xs">KAS expected</span>
                  </div>
                )}
              </>
            ) : (
              <div className="text-muted mt-1 text-xs">
                {isConnected ? "Loading..." : "Connecting to node..."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
