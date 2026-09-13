import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { routeIds, routeManifest } from "../src/i18n/manifest.ts";
import {
  defaultLocale,
  localeRegistry,
  supportedLocaleCodes,
} from "../src/i18n/locale-registry.ts";
import {
  DOCS_URL,
  RUSTY_KASPA_URL,
  WASM_SDK_DOCS_URL,
} from "../src/app/build/constants.ts";
import { communityApi } from "../src/data/agent-discovery.ts";
import { extractPage } from "./agent-content.mts";

// Read this build's prerendered HTML: no live-site fetch, browser, or AI call.
const pages = await Promise.all(
  routeIds.map(async (id) => {
    const pathname = routeManifest[id].pathname;
    const artifact = `${defaultLocale}${pathname === "/" ? "" : pathname}.html`;
    const html = await readFile(join(".next/server/app", artifact), "utf8");
    return extractPage(html, `https://kaspa.org${pathname}`);
  }),
);

const introduction = `# Kaspa\n\n> ${pages[0].description}\n\nEnglish content generated from the website during the build. External resources are linked, not copied.\n`;
const resources = `## Developer resources\n\n- [Kaspa documentation](${DOCS_URL}): Developer guides and protocol documentation.\n- [WASM SDK documentation](${WASM_SDK_DOCS_URL}): Browser and Node.js bindings for applications, wallets, and RPC access.\n- [Rusty Kaspa](${RUSTY_KASPA_URL}): Core node, native Rust libraries, wallet and RPC implementation.\n- [Developer tools and SDK documentation](https://kaspa.org/build): WASM SDK, node access, and separately labelled community tools.\n- [Community REST API](${communityApi.docs}): ${communityApi.description}\n- [REST API source and self-hosting](${communityApi.source}): Upstream contacts: lAmeR1 / supertypo.\n- [API catalog](https://kaspa.org/.well-known/api-catalog): Machine-readable directory of listed APIs.\n`;
const languages = `## Other languages\n\n${supportedLocaleCodes
  .filter((locale) => locale !== defaultLocale)
  .map(
    (locale) =>
      `- [${localeRegistry[locale].label}](https://kaspa.org/${locale})`,
  )
  .join("\n")}\n`;
const index = `${introduction}\n## Pages\n\n${pages.map((page) => `- [${page.title}](${page.url}): ${page.description}`).join("\n")}\n\n${resources}\n## Full content\n\n- [Full English site content](https://kaspa.org/llms-full.txt): Main page content with source URLs; interactive and live data require the website.\n\n${languages}`;
const full = `${introduction}\n${resources}\n${pages.map((page) => `---\n\n# ${page.title}\n\nSource: ${page.url}\n\n${page.description}\n\n${page.markdown}`).join("\n\n")}\n\n${languages}`;

await writeFile("public/llms.txt", index);
await writeFile("public/llms-full.txt", full);
console.log(`Generated LLM files from ${pages.length} English pages.`);
