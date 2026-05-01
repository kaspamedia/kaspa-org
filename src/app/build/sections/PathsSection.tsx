import type { MouseEventHandler } from "react";

import ExternalLink from "../../components/ExternalLink";
import SectionHeading from "../../components/SectionHeading";
import type { SectionId } from "../content";
import { REST_API_URL, choosePathCards } from "../content";
import { ArrowUpRightIcon } from "../icons";
import { MetaPill } from "../ui";

export default function PathsSection({
  onHashClick,
}: {
  onHashClick: (href: `#${SectionId}`) => MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <section
      id="paths"
      className="scroll-mt-32 px-6 py-16 md:scroll-mt-40 md:px-12 lg:px-20 lg:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          label="Paths"
          title="Choose your path"
          description="Start with the SDK or infrastructure path that matches the system you're building."
        />

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {choosePathCards.map((card) => (
            <div
              key={card.title}
              className="border-subtle flex h-full flex-col rounded-[28px] border p-6"
              style={{
                background: "var(--bg)",
              }}
            >
              <MetaPill>{card.tier}</MetaPill>
              <h3 className="mt-5 text-[24px] leading-[1.06] font-medium tracking-[-0.03em]">
                {card.title}
              </h3>
              <p className="text-tertiary mt-4 text-[15px] leading-[1.72]">
                {card.desc}
              </p>
              <div className="mt-auto flex flex-wrap gap-x-4 gap-y-2 pt-6">
                {card.links.map((link) => (
                  <ExternalLink
                    key={link.label}
                    href={link.href}
                    onClick={
                      link.href.startsWith("#")
                        ? onHashClick(link.href as `#${SectionId}`)
                        : undefined
                    }
                    className="group text-secondary hover:text-primary inline-flex items-center gap-1 text-[14px] font-medium transition-colors"
                  >
                    {link.label}
                    <span className="text-muted group-hover:text-secondary inline-flex transition-all duration-200 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]">
                      <ArrowUpRightIcon size={10} />
                    </span>
                  </ExternalLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="border-subtle mt-4 border-t pt-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:justify-between md:gap-6">
            <p className="text-muted max-w-4xl text-[14px] leading-[1.68]">
              <span className="text-muted mr-3 text-[11px] font-medium tracking-[0.08em] uppercase">
                Community API
              </span>
              For quick reads or constrained environments, a community-hosted
              API is available. Best-effort, no SLA.
            </p>
            <ExternalLink
              href={REST_API_URL}
              className="group text-secondary hover:text-primary inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium transition-colors"
            >
              REST API docs
              <span className="text-muted group-hover:text-secondary inline-flex transition-all duration-200 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]">
                <ArrowUpRightIcon size={10} />
              </span>
            </ExternalLink>
          </div>
        </div>
      </div>
    </section>
  );
}
