import type { RefObject } from "react";

import { ACCENT } from "../content";
import { ShieldKeyIcon } from "../icons";
import { JourneyStepHeader } from "../ui";
import WalletFinder from "../wallet-finder/WalletFinder";

export default function WalletSection({
  headingRef,
}: {
  headingRef?: RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <section
      id="wallet"
      className="scroll-mt-32 px-6 py-20 md:scroll-mt-40 md:px-12 lg:px-20 lg:py-32"
      style={{ background: "var(--surface)" }}
    >
      <div className="mx-auto max-w-7xl lg:pl-[96px]">
        <JourneyStepHeader
          step={1}
          title="Get a wallet"
          description="Choose a wallet that fits how you plan to hold and use KAS."
          headingRef={headingRef}
        />

        <WalletFinder />

        <div className="mt-6 flex items-start gap-3 rounded-[24px] bg-black/[0.03] px-5 py-4 dark:bg-white/[0.03]">
          <div className="mt-0.5 shrink-0" style={{ color: ACCENT }}>
            <ShieldKeyIcon />
          </div>
          <p className="text-secondary text-[14px] leading-[1.7]">
            <strong className="text-primary font-medium">Important:</strong>{" "}
            Back up your recovery phrase or wallet instructions before moving
            meaningful funds. Send a small test transaction first, then move the
            rest only after it arrives.
          </p>
        </div>
      </div>
    </section>
  );
}
