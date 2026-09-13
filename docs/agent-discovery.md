# Agent discovery

`npm run build` regenerates `public/llms.txt` and `public/llms-full.txt` in
its `postbuild` step. The generator reads the five English pages from this
build's `.next/server/app` HTML artifacts. It never fetches the live site or
calls an AI service. Missing artifacts, metadata, or main content fail generation.

The index contains page summaries, developer resources, and links to the
published language versions. The full file converts the rendered main content
to Markdown, retaining links and code while removing navigation, controls,
scripts, and media. It reflects the initial static page content; interactive
states and live data still require visiting the website. External documentation
is linked, not mirrored. Update the website sources, not these generated files.

Run `npm run build` before committing content changes and include regenerated
files. `npm run agents:generate` can regenerate them from an existing build,
but that build must match the source being reviewed. Development mode serves
the last generated files.

`src/data/agent-discovery.ts` owns the API catalog and discovery headers.
The catalog currently lists only the community REST API at `api.kaspa.org`,
with its existing documentation URL and explicit best-effort/no-SLA wording.
It does not describe node RPC as a hosted service or promise API availability.

The upstream [README](https://github.com/kaspa-ng/kaspa-rest-server)
identifies the deployment and recommends self-hosting for dependent integrators.
Its `server.py` identifies upstream contacts as lAmeR1 / supertypo; these are
project contacts, not an independently verified hosting-operator identity.
On 2026-09-13, the live docs and OpenAPI requests returned 403 from the review
environment. No live API health or unrestricted crawler access is claimed.

The catalog follows [RFC 9727](https://www.rfc-editor.org/rfc/rfc9727.html),
using Linkset JSON and `service-doc` links. HTTP Link headers advertise the
LLM index (`describedby`), full content (`related`), and API catalog
(`api-catalog`). There is no standardized `llms-full` relation here.

All existing robots groups remain open. Each explicitly permits search,
AI input, and AI training through Content Signals. Responses also carry the
same permissive Content-Signal header. These communicate usage preferences;
they do not change authentication or override third-party resource policies.

Validation:

- `npm run test:agents`: content conversion and fail-closed export checks.
- `npm run agents:verify`: after a build, verifies production responses,
  content types, discovery headers, robots groups, and generated internal links.
- `npm run test:i18n:production`: existing localized-route smoke checks.

No ARD, Skills, MCP, auth discovery, DNS changes, or Markdown negotiation is
included. External service checks remain manual so their outages cannot prevent
publishing the site.
