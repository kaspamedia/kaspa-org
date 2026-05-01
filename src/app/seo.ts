import type { Metadata } from "next";

export const siteUrl = "https://kaspa.org";

export const socialImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Kaspa — Real-time Decentralization",
} as const;

const organizationId = `${siteUrl}#organization`;
const websiteId = `${siteUrl}#website`;

export const organizationSchema = {
  "@type": "Organization",
  "@id": organizationId,
  name: "Kaspa",
  url: siteUrl,
  logo: `${siteUrl}/kaspa-logo.svg`,
  description:
    "Kaspa is a fair-launched proof-of-work blockDAG cryptocurrency running at 10 blocks per second, built for real-time decentralization.",
  sameAs: ["https://github.com/kaspanet/rusty-kaspa/", "https://t.me/kasparnd"],
} as const;

export const websiteSchema = {
  "@type": "WebSite",
  "@id": websiteId,
  name: "Kaspa",
  url: siteUrl,
  alternateName: ["kaspa.org"],
  publisher: {
    "@id": organizationId,
  },
} as const;

export const structuredDataSchema = {
  "@context": "https://schema.org",
  "@graph": [organizationSchema, websiteSchema],
} as const;

type PageMetadataOptions = {
  title: string;
  description: string;
  canonical: `/${string}` | "/";
};

export function createPageMetadata({
  title,
  description,
  canonical,
}: PageMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonical,
      siteName: "Kaspa",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage.url],
    },
  };
}
