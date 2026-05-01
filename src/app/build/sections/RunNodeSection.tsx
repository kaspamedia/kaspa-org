import { useState } from "react";

import ExternalLink from "../../components/ExternalLink";
import SectionHeading from "../../components/SectionHeading";
import { copyTextToClipboard } from "../../components/copyTextToClipboard";
import {
  DOCKER_HUB_URL,
  DOCKER_RUN_COMMAND,
  RUSTY_KASPA_URL,
} from "../content";
import { ArrowUpRightIcon, CheckIcon, ClipboardIcon } from "../icons";
import { MetaPill } from "../ui";

export default function RunNodeSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyTextToClipboard(DOCKER_RUN_COMMAND);
    if (!ok) return;

    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section
      id="run-a-node"
      className="scroll-mt-32 px-6 py-16 md:scroll-mt-40 md:px-12 lg:px-20 lg:py-24"
      style={{ background: "var(--surface)" }}
    >
      <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
        <div className="h-fit lg:sticky lg:top-32">
          <SectionHeading
            label="Node"
            title="Run a node"
            description="Spin up Rusty Kaspa locally with Docker. For a persistent setup, check Docker Hub or build from source."
          />
        </div>

        <div className="mt-10 lg:mt-0">
          <div
            className="border-subtle rounded-[28px] border p-6 md:p-7"
            style={{ background: "var(--surface)" }}
          >
            <MetaPill>Docker quickstart</MetaPill>
            <h3 className="mt-5 text-[22px] leading-[1.1] font-medium tracking-[-0.03em] md:text-[24px]">
              Run the latest Rusty Kaspa image
            </h3>
            <p className="text-tertiary mt-3 text-[15px] leading-[1.7]">
              Exposes gRPC on port 16110 so you can talk to the node from your
              dev machine. Ephemeral container &mdash; no persistent storage or
              inbound P2P.
            </p>

            <button
              onClick={handleCopy}
              className="group border-subtle text-secondary hover:text-primary mt-6 flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left font-mono text-[13px] transition-colors hover:border-[var(--btn-ghost-hover-border)] hover:bg-[var(--btn-ghost-hover-bg)] md:text-[14px]"
              style={{ background: "var(--bg)" }}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="text-muted select-none">$</span>
                <span className="truncate">{DOCKER_RUN_COMMAND}</span>
              </span>
              <span className="text-muted group-hover:text-secondary shrink-0 transition-colors">
                {copied ? <CheckIcon size={14} /> : <ClipboardIcon size={14} />}
              </span>
            </button>

            <div className="border-subtle mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t pt-5">
              <ExternalLink
                href={DOCKER_HUB_URL}
                className="group text-secondary hover:text-primary inline-flex items-center gap-1.5 text-[14px] font-medium transition-colors"
              >
                Docker Hub
                <span className="text-muted group-hover:text-secondary inline-flex transition-all duration-200 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]">
                  <ArrowUpRightIcon size={10} />
                </span>
              </ExternalLink>
              <ExternalLink
                href={RUSTY_KASPA_URL}
                className="group text-secondary hover:text-primary inline-flex items-center gap-1.5 text-[14px] font-medium transition-colors"
              >
                Compile from source
                <span className="text-muted group-hover:text-secondary inline-flex transition-all duration-200 group-hover:translate-x-[2px] group-hover:-translate-y-[2px]">
                  <ArrowUpRightIcon size={10} />
                </span>
              </ExternalLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
