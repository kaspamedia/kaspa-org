import type { PanelState, ProviderLink } from "./types";

const DEFAULT_PUBLIC_SITE_ORIGIN = "https://kaspa.org";
const PUBLIC_SITE_ORIGIN =
  process.env.NEXT_PUBLIC_PUBLIC_SITE_ORIGIN ?? DEFAULT_PUBLIC_SITE_ORIGIN;
const URL_PROMPT = `Read ${PUBLIC_SITE_ORIGIN}/llms.txt, I want to ask questions about it.`;

export const ASK_API_PATH = "/api/ask";
export const PANEL_TRANSITION_MS = 500;
export const LOADING_MESSAGE_ROTATE_MS = 1400;
export const GENERIC_ERROR_MESSAGE =
  "Sorry, something went wrong. Please try again.";

export const LOADING_MESSAGES = [
  "AtomicArc-ing safely...",
  "IBD-ing the new node...",
  "FTR-relaying the block...",
  "activating the KIP...",
  "binding the template...",
  "bootstrapping from commitment...",
  "braiding the blue set...",
  "computing merge depth...",
  "convincing silverscript to compile...",
  "deriving the covenant_id...",
  "encoding covenant state...",
  "evicting the orphans...",
  "filling the mempool...",
  "lane-bucketing the fees...",
  "negotiating with covenants...",
  "parallel-dispatching blocks...",
  "pruning the past...",
  "publishing to the DAG layer...",
  "pushing to the stack...",
  "rebalancing the 10 BPS...",
  "recalculating blue work...",
  "reorg-filtering L2 events...",
  "scheduling the vProg batch...",
  "schnorring the signature...",
  "serializing the virtual state...",
  "snapshotting the UTXO set...",
  "traversing the anticone...",
  "un-orphaning transactions...",
  "unlocking the UTXO...",
  "virtualizing the vProgs...",
  "waiting for crescendo...",
] as const;

export const SUGGESTED_QUESTIONS = [
  "What does Kaspa solve?",
  "What are the block times?",
  "Why is real-time decentralization important?",
  "Was there a premine?",
] as const;

export const AI_PROVIDER_LINKS: readonly ProviderLink[] = [
  {
    label: "ChatGPT",
    href: `https://chatgpt.com/?q=${encodeURIComponent(URL_PROMPT)}`,
  },
  {
    label: "Claude",
    href: `https://claude.ai/new?q=${encodeURIComponent(URL_PROMPT)}`,
  },
  {
    label: "Perplexity",
    href: `https://www.perplexity.ai/search/?q=${encodeURIComponent(URL_PROMPT)}`,
  },
];

export function getPanelHeight(panelState: PanelState): string {
  if (panelState === "full") {
    return "var(--panel-full)";
  }

  if (panelState === "mid") {
    return "var(--panel-mid)";
  }

  return "0px";
}
