import type { Metadata } from "next";
import { createPageMetadata } from "../seo";

const title = "LORE | Kaspa";
const description =
  "Kaspa is a fair-launched proof-of-work blockDAG focused on real-time decentralization, with no premine, no insider allocation, and 10 BPS mainnet performance.";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  canonical: "/lore",
});

export default function LoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
