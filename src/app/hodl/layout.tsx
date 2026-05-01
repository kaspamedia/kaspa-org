import type { Metadata } from "next";
import { createPageMetadata } from "../seo";

const title = "Buy KAS, Set Up a Wallet, and Self-Custody | Kaspa";
const description = "Get a wallet, buy KAS, and transfer to self-custody.";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  canonical: "/hodl",
});

export default function HodlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
