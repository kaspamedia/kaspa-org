import { RUSTY_KASPA_URL } from "../constants";
import type { CommunityTool, EmergingTool, ToolCard } from "../types";

export const toolingCards: ToolCard[] = [
  {
    eyebrow: "Native stack",
    title: "Rusty Kaspa",
    desc: "Rust crates, wallet internals, full node, RPC, indexing, and direct network access.",
    tags: ["Native Rust", "Node & infra"],
    actionLabel: "Open repo",
    href: RUSTY_KASPA_URL,
  },
  {
    eyebrow: "Libraries & SDKs",
    title: "WASM SDK",
    desc: "Upstream browser and Node bindings for applications, wallets, and transaction flows.",
    tags: ["Browser + Node"],
    actionLabel: "Open docs",
    href: "https://kaspa.aspectron.org/docs/",
  },
];

export const emergingTools: EmergingTool[] = [
  {
    status: "Beta",
    title: "Python SDK",
    desc: "Nearly complete. Usable today if Python is part of your stack.",
    actionLabel: "Open repo",
    href: "https://github.com/kaspanet/kaspa-python-sdk",
  },
];

export const communityTools: CommunityTool[] = [
  {
    type: "Indexer",
    title: "Simply Kaspa Indexer",
    desc: "Standalone indexing for Kaspa block and transaction data.",
    href: "https://github.com/supertypo/simply-kaspa-indexer",
  },
  {
    type: "Infra",
    title: "DNS Seeder",
    desc: "Bootstrapping infrastructure for the Kaspa peer-to-peer network.",
    href: "https://github.com/kaspanet/dnsseeder",
  },
  {
    type: "Hosting",
    title: "kHost",
    desc: "Tooling for running and contributing node capacity to the wider ecosystem.",
    href: "https://github.com/aspectron/khost",
  },
  {
    type: "Library",
    title: "kaspa-js",
    desc: "Community-maintained JavaScript tooling around the Kaspa stack.",
    href: "https://github.com/K-Kluster/kaspa-js",
  },
];
