import type { Metadata } from "next";
import { createPageMetadata } from "../seo";

const title = "Kaspa Developer Docs, SDKs, APIs, and Node Access | Kaspa";
const description =
  "Everything you need to start building on Kaspa. WASM SDK, Rust libraries, live API playground, node access, and developer tooling.";

export const metadata: Metadata = createPageMetadata({
  title,
  description,
  canonical: "/build",
});

export default function BuildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
