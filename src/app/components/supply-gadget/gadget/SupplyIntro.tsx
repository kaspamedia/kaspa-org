import { SUPPLY_TEAL } from "../supplyVisuals";

export function SupplyIntro(): React.JSX.Element {
  return (
    <div className="mb-5 max-w-2xl">
      <div
        className="text-[11px] font-semibold tracking-[0.18em] uppercase"
        style={{ color: SUPPLY_TEAL }}
      >
        Continuous Verify
      </div>
      <h2 className="text-primary mt-2 text-[24px] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[30px]">
        Live supply vs. emission schedule
      </h2>
      <p className="text-muted mt-3 text-sm leading-[1.7]">
        Compare a live node&apos;s circulating supply against the
        checkpoint-anchored expected supply — the Nov 22, 2021 checkpoint total
        committed to by the hardwired genesis, extended by Kaspa&apos;s
        deterministic emission schedule.
      </p>
    </div>
  );
}
