import type { RefObject } from "react";

import ExternalLink from "../../components/ExternalLink";
import {
  APP_STORE_URL,
  GOOGLE_PLAY_URL,
  USE_ACCENT,
  walletFeatures,
} from "../content";
import { AppleIcon, PlayIcon, ShieldKeyIcon } from "../icons";
import { JourneyStepHeader, PhoneFrame } from "../ui";

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
      <div className="mx-auto max-w-6xl lg:pl-[72px]">
        <JourneyStepHeader
          step={1}
          title="Get a wallet"
          description="To hold KAS yourself, you'll need a wallet. This is where you receive, store, and send your KAS."
          headingRef={headingRef}
        />

        <div
          className="border-subtle relative mt-12 overflow-hidden rounded-[30px] border p-6 pb-10 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.03),0_24px_48px_-8px_rgba(0,0,0,0.05)] md:p-10 md:pb-14 dark:border-[rgba(255,255,255,0.08)] dark:shadow-none"
          style={{ background: "var(--surface)" }}
        >
          <div
            className="pointer-events-none absolute inset-0 hidden dark:block"
            style={{
              background:
                "radial-gradient(120% 60% at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 100%)",
            }}
          />
          <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
            <div className="order-1">
              <h3 className="text-[30px] leading-[1.02] font-medium tracking-[-0.03em] md:text-[38px]">
                Kaspium
              </h3>
              <p className="text-tertiary mt-4 max-w-2xl text-[16px] leading-[1.75] md:text-[17px]">
                A mobile wallet for Kaspa. Send, receive, and hold your KAS from
                your phone.
              </p>
            </div>

            <div className="order-2 lg:col-start-2 lg:row-span-2 lg:self-start">
              <PhoneFrame
                className="mx-auto w-[260px] lg:w-[240px]"
                frameClassName="shadow-[0_20px_50px_rgba(15,23,42,0.08)] lg:shadow-none"
              />
            </div>

            <div className="order-3 lg:col-start-1">
              <div className="mt-10 mb-20 flex flex-col gap-3 sm:flex-row lg:hidden">
                <ExternalLink
                  href={APP_STORE_URL}
                  className="btn-primary flex-1 justify-center"
                >
                  <AppleIcon />
                  App Store
                </ExternalLink>
                <ExternalLink
                  href={GOOGLE_PLAY_URL}
                  className="btn-primary flex-1 justify-center"
                >
                  <PlayIcon />
                  Google Play
                </ExternalLink>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:mt-8">
                {walletFeatures.map((feature) => {
                  const Icon = feature.icon;

                  return (
                    <div
                      key={feature.label}
                      className="group rounded-[22px] border border-transparent bg-[#F7F7F7] px-4 py-4 transition-all duration-300 hover:-translate-y-[2px] hover:border-[rgba(118,167,158,0.5)] dark:border-[rgba(255,255,255,0.04)] dark:bg-[rgba(255,255,255,0.02)]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="border-subtle mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl border transition-colors duration-300 group-hover:border-[rgba(118,167,158,0.4)] group-hover:text-[rgb(118,167,158)]">
                          <Icon />
                        </div>
                        <div>
                          <p className="text-secondary text-[15px] font-medium">
                            {feature.label}
                          </p>
                          <p className="text-muted mt-1 text-[14px] leading-[1.65]">
                            {feature.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-start gap-3 rounded-[24px] border border-transparent bg-[#F7F7F7] px-5 py-4 dark:border-[rgba(255,255,255,0.04)] dark:bg-[rgba(255,255,255,0.02)]">
                <div
                  className="mt-0.5 shrink-0"
                  style={{ color: `rgb(${USE_ACCENT})` }}
                >
                  <ShieldKeyIcon />
                </div>
                <p className="text-secondary text-[14px] leading-[1.7]">
                  <strong className="text-primary font-medium">
                    Important:
                  </strong>{" "}
                  You&apos;ll receive a recovery phrase during setup. Write it
                  down and keep it offline. If you lose your phone, it&apos;s
                  the only way to get your wallet back. Never share it with
                  anyone.
                </p>
              </div>

              <div className="mt-7 hidden flex-col gap-3 sm:flex-row lg:flex">
                <ExternalLink
                  href={APP_STORE_URL}
                  className="btn-primary flex-1 justify-center"
                >
                  <AppleIcon />
                  App Store
                </ExternalLink>
                <ExternalLink
                  href={GOOGLE_PLAY_URL}
                  className="btn-primary flex-1 justify-center"
                >
                  <PlayIcon />
                  Google Play
                </ExternalLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
