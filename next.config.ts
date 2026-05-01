import type { NextConfig } from "next";

const legacyRedirects = [
  { source: "/.well-known/llms.txt", destination: "/llms.txt" },
  { source: "/.well-known/llms-full.txt", destination: "/llms-full.txt" },
  { source: "/about-kaspa", destination: "/lore" },
  { source: "/kaspa-overview", destination: "/lore" },
  { source: "/vision", destination: "/lore" },
  { source: "/developer", destination: "/build" },
  { source: "/developers-resources", destination: "/build" },
  { source: "/developers-resourses", destination: "/build" },
  { source: "/developments", destination: "/build#developments" },
  { source: "/swaps", destination: "/hodl#buy" },
  {
    source: "/where-to-buy-kaspa-cryptocurrency-exchanges-for-trading-kas",
    destination: "/hodl#buy",
  },
  {
    source: "/kaspa-wallets-non-custodial-wallet-options-for-kas",
    destination: "/hodl#wallet",
  },
  {
    source: "/resources/block-explorer",
    destination: "https://explorer.kaspa.org/",
  },
  { source: "/about-kaspa/contact-us", destination: "/lore" },
  { source: "/about-kaspa/press-room", destination: "/lore" },
  { source: "/features", destination: "/lore" },
  { source: "/publications", destination: "/lore" },
  { source: "/whitepapers", destination: "/lore" },
  { source: "/resources/white-papers", destination: "/lore" },
  { source: "/kaspa-faq", destination: "/lore" },
] as const;

const allowedDevOrigins = Array.from(
  new Set([
    "127.0.0.1",
    "::1",
    ...(process.env.NEXT_DEV_ALLOWED_ORIGINS?.split(",")
      .map((origin) => origin.trim())
      .filter(Boolean) ?? []),
  ]),
);

const nextConfig: NextConfig = {
  allowedDevOrigins,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },
  async redirects() {
    return legacyRedirects.map(({ source, destination }) => ({
      source,
      destination,
      permanent: true,
    }));
  },
};

export default nextConfig;
