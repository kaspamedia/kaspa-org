import { apiCatalog, apiCatalogContentType } from "@/data/agent-discovery";

export const dynamic = "force-static";

export function GET() {
  return new Response(`${JSON.stringify(apiCatalog, null, 2)}\n`, {
    headers: {
      "Content-Type": apiCatalogContentType,
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}
