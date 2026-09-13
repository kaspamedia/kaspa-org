import assert from "node:assert/strict";
import { test } from "node:test";
import { extractPage } from "../../scripts/agent-content.mts";
import { DOCKER_RUN_COMMAND } from "../../src/app/build/constants.ts";

const document = (body: string, robots = "index, follow") =>
  `<html><head><title>Test page</title><meta name="description" content="A description"><meta name="robots" content="${robots}"></head><body><nav>Global navigation</nav><main>${body}</main><footer>Footer</footer></body></html>`;

test("copy buttons export their command without the prompt or control label", () => {
  const page = extractPage(
    document(
      `<h1>Run a node</h1><p>Spin up Rusty Kaspa locally with Docker. For a persistent setup, check Docker Hub or build from source.</p><button aria-label="Copy Docker command"><span><span>$</span><code class="truncate">${DOCKER_RUN_COMMAND}</code></span><span><svg>Clipboard icon</svg></span></button><button>Reconnect</button>`,
    ),
    "https://kaspa.org/build",
  );
  assert.ok(page.markdown.includes(`\`\`\`\n${DOCKER_RUN_COMMAND}\n\`\`\``));
  assert.doesNotMatch(page.markdown, /\$|Copy Docker|Clipboard|Reconnect/);
});

test("export preserves documentation, code, and absolute links while excluding interactive chrome", () => {
  const page = extractPage(
    document(
      `<h1>Node documentation</h1><p>Run your own node for workloads that need reliable access. Public APIs are best-effort with no guaranteed availability.</p><a href="/build#access">Access</a><a href="https://example.com/docs">External docs</a><pre><code>docker run node</code></pre><button>Copy</button><script>secretScript()</script><aside>Sidebar</aside><div hidden>Hidden</div><a href="javascript:alert(1)">Unsafe</a>`,
    ),
    "https://kaspa.org/lore",
  );
  assert.match(page.markdown, /best-effort with no guaranteed availability/);
  assert.match(
    page.markdown,
    /\[Access\]\(https:\/\/kaspa.org\/build#access\)/,
  );
  assert.match(
    page.markdown,
    /\[External docs\]\(https:\/\/example.com\/docs\)/,
  );
  assert.match(page.markdown, /```\ndocker run node\n```/);
  assert.doesNotMatch(
    page.markdown,
    /Global navigation|Footer|Copy|secretScript|Sidebar|Hidden|javascript:/,
  );
});

test("generation fails rather than exporting missing or non-public content", () => {
  assert.throws(
    () => extractPage(document("private", "noindex"), "https://kaspa.org/lore"),
    /noindex/,
  );
  assert.throws(
    () => extractPage("<html>missing main</html>", "https://kaspa.org/lore"),
    /Expected/,
  );
  assert.throws(
    () => extractPage(document(""), "https://kaspa.org/lore"),
    /Empty/,
  );
});

test("image-only links keep their labels and animated replacement letters are omitted", () => {
  const page = extractPage(
    document(
      '<h1><span>H</span><span class="animate-flicker-in">K</span>ODL</h1><p>Choose an exchange supported in your region and transfer your funds to a wallet you control after checking the address.</p><a href="https://example.com"><img alt="Exchange name" src="/logo.svg"></a>',
    ),
    "https://kaspa.org/hodl",
  );
  assert.match(page.markdown, /# HODL/);
  assert.match(page.markdown, /\[Exchange name\]\(https:\/\/example.com\/\)/);
  assert.doesNotMatch(page.markdown, /HKODL|logo.svg/);
});
