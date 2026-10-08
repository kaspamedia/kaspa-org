import assert from "node:assert/strict";
import test from "node:test";

import {
  parseWalletFinderUrl,
  serializeWalletFinderUrl,
  type WalletFinderUrlState,
} from "../../src/app/hodl/wallet-finder/urlState.ts";

const base = "https://kaspa.org/hodl";
const emptyFilters = { important: [], features: [] };

test("a URL without finder parameters has no finder state", () => {
  assert.equal(parseWalletFinderUrl("?utm_source=x"), null);
});

test("finder state round-trips through a readable URL", () => {
  const state: WalletFinderUrlState = {
    mode: "table",
    step: 4,
    filters: {
      os: "mac",
      user: "beginner",
      important: ["fees", "control"],
      features: ["hashed_addresses", "multisig"],
    },
  };
  const href = serializeWalletFinderUrl(base, state, "#wallet");

  assert.equal(
    href,
    `${base}?view=list&os=mac&advanced=hide&criteria=control,fees&features=multisig,hashed_addresses#wallet`,
  );
  assert.deepEqual(parseWalletFinderUrl(new URL(href).search), {
    mode: "table",
    step: 1,
    filters: {
      os: "mac",
      user: "beginner",
      important: ["control", "fees"],
      features: ["multisig", "hashed_addresses"],
    },
  });
});

test("guided mode records the wizard step", () => {
  const href = serializeWalletFinderUrl(
    base,
    { mode: "guided", step: 3, filters: { ...emptyFilters, os: "ios" } },
    "#wallet",
  );
  assert.equal(href, `${base}?step=3&os=ios#wallet`);
  assert.equal(parseWalletFinderUrl(new URL(href).search)?.step, 3);
});

test("unknown values and out-of-range steps are ignored", () => {
  assert.deepEqual(
    parseWalletFinderUrl("?step=9&os=amiga&advanced=x&criteria=fees,nope"),
    {
      mode: "guided",
      step: 1,
      filters: {
        os: undefined,
        user: undefined,
        important: ["fees"],
        features: [],
      },
    },
  );
});

test("the default state clears finder parameters and keeps the rest", () => {
  assert.equal(
    serializeWalletFinderUrl(
      `${base}?ref=x&view=list&os=mac#buy`,
      { mode: "guided", step: 1, filters: emptyFilters },
      "#wallet",
    ),
    `${base}?ref=x#buy`,
  );
});
