import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { startProductionServer } from "./i18n/production-server.mts";
import { routeIds, routeManifest } from "../src/i18n/manifest.ts";
import { DOCKER_RUN_COMMAND } from "../src/app/build/constants.ts";

const server = await startProductionServer(process.cwd());
try {
  for (const path of [
    "/",
    "/build",
    "/es/build",
    "/llms.txt",
    "/llms-full.txt",
    "/.well-known/api-catalog",
  ]) {
    const response = await fetch(`${server.baseUrl}${path}`, {
      redirect: "manual",
    });
    assert.equal(response.status, 200, path);
    assert.match(
      response.headers.get("link") ?? "",
      /<\/llms.txt>; rel="describedby"/,
    );
    assert.match(
      response.headers.get("link") ?? "",
      /<\/.well-known\/api-catalog>; rel="api-catalog"/,
    );
    assert.equal(
      response.headers.get("content-signal"),
      "search=yes, ai-input=yes, ai-train=yes",
    );
    if (path.endsWith(".txt")) {
      assert.match(response.headers.get("content-type") ?? "", /^text\/plain/);
      assert.equal(
        await response.text(),
        await readFile(`public${path}`, "utf8"),
      );
    }
    if (path.endsWith("api-catalog")) {
      assert.match(
        response.headers.get("content-type") ?? "",
        /^application\/linkset\+json/,
      );
      const catalog = await response.json();
      assert.equal(catalog.linkset[0].item[0].href, "https://api.kaspa.org");
      assert.match(catalog.linkset[0].item[0].title, /Best-effort, no SLA/);
      assert.equal(
        catalog.linkset[1]["service-doc"][0].href,
        "https://api.kaspa.org/docs",
      );
    }
  }
  const full = await readFile("public/llms-full.txt", "utf8");
  assert.ok(
    full.includes(DOCKER_RUN_COMMAND),
    "Docker quickstart command is exported",
  );
  for (const id of routeIds)
    assert.ok(
      full.includes(`Source: https://kaspa.org${routeManifest[id].pathname}`),
      id,
    );
  const robots = await (await fetch(`${server.baseUrl}/robots.txt`)).text();
  for (const group of robots.trim().split(/\n\s*\n/)) {
    if (!group.includes("User-agent:")) continue;
    assert.match(group, /Allow: \//);
    assert.match(
      group,
      /Content-Signal: search=yes, ai-input=yes, ai-train=yes/,
    );
  }
  // Check local links only. A community API outage must not break site builds.
  const documents = full + (await readFile("public/llms.txt", "utf8"));
  const links = new Set(
    [...documents.matchAll(/\]\((https:\/\/kaspa\.org[^\s)]*)\)/g)].map(
      (match) => match[1],
    ),
  );
  for (const link of links) {
    const url = new URL(link);
    const response = await fetch(
      `${server.baseUrl}${url.pathname}${url.search}`,
    );
    assert.equal(response.status, 200, link);
    await response.body?.cancel();
  }
  console.log(
    `Agent discovery verified, including ${links.size} internal links.`,
  );
} finally {
  await server.stop();
}
