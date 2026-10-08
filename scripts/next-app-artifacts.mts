import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getRouteCacheKey } from "next/dist/server/lib/route-cache-key.js";
import type { RouteKind } from "next/dist/server/route-kind.js";

export async function createAppPageArtifactResolver(nextDirectory: string) {
  const { config } = JSON.parse(
    await readFile(join(nextDirectory, "required-server-files.json"), "utf8"),
  ) as { config: { adapterPath?: string; output?: string } };

  return (pathname: string, sourcePage: string): string => {
    // Next 16.3 namespaces adapter prerenders by their source page. Use Next's
    // cache-key implementation so route groups and normalization stay aligned.
    const key =
      config.adapterPath && config.output !== "export"
        ? getRouteCacheKey(pathname, {
            kind: "APP_PAGE" as RouteKind.APP_PAGE,
            sourceRoute: sourcePage,
          })
        : join("app", pathname.slice(1));
    return join(nextDirectory, "server", key);
  };
}
