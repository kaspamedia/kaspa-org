import { REST_API_URL } from "../app/build/constants.ts";

export const apiCatalogPath = "/.well-known/api-catalog";
export const apiCatalogContentType =
  'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"';
export const discoveryLinkHeader = [
  '</llms.txt>; rel="describedby"; type="text/plain"',
  '</llms-full.txt>; rel="related"; type="text/plain"; title="Full English site content"',
  `<${apiCatalogPath}>; rel="api-catalog"; type="application/linkset+json"`,
].join(", ");

export const communityApi = {
  url: new URL(REST_API_URL).origin,
  docs: REST_API_URL,
  source: "https://github.com/kaspa-ng/kaspa-rest-server",
  description:
    "Community-operated Kaspa REST API. Best-effort, no SLA or guaranteed availability. Integrators who depend on it should run their own instance.",
};

export const apiCatalog = {
  linkset: [
    {
      anchor: "https://kaspa.org/.well-known/api-catalog",
      item: [{ href: communityApi.url, title: communityApi.description }],
    },
    {
      anchor: communityApi.url,
      "service-doc": [
        {
          href: communityApi.docs,
          type: "text/html",
          title: communityApi.description,
        },
        {
          href: communityApi.source,
          type: "text/html",
          title:
            "Source and self-hosting instructions; upstream contacts: lAmeR1 / supertypo",
        },
      ],
    },
  ],
};
