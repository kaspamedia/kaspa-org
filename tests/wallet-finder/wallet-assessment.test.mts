import assert from "node:assert/strict";
import test from "node:test";

import { validateTransparency } from "../../scripts/wallet-transparency-validation.mts";
import {
  createWalletFinderModel,
  resolveWalletPresentation,
} from "../../src/app/hodl/wallet-finder/filterWallets.ts";
import type { KaspaWallet } from "../../src/app/hodl/wallet-finder/types.ts";

function walletFixture({
  check,
  ...overrides
}: Omit<Partial<KaspaWallet>, "check"> & {
  check?: Partial<KaspaWallet["check"]>;
}): KaspaWallet {
  return {
    id: "test-wallet",
    title: "Test Wallet",
    icon: "/hodl/wallets/test-wallet/icon.svg",
    user: "beginner",
    summary: "A wallet test fixture.",
    platforms: ["android"],
    features: [],
    check: {
      control: "good",
      validation: "acceptable",
      transparency: "acceptable",
      fees: "good",
      ...check,
    },
    actions: [{ action: "open", link: "https://example.com" }],
    ...overrides,
  };
}

test("platform overrides remain mixed through non-platform filters", () => {
  const wallet = walletFixture({
    platforms: ["android", "ios"],
    features: ["two_fa"],
    platformOverrides: {
      ios: { check: { transparency: "caution", fees: "caution" } },
    },
  });

  const match = createWalletFinderModel([wallet], {
    important: [],
    features: ["two_fa"],
  }).matches[0];

  const presentation = resolveWalletPresentation(wallet, match.platforms);
  assert.equal(presentation.ratings.transparency, "mixed");
  assert.equal(presentation.ratings.fees, "mixed");
  assert.deepEqual(presentation.breakdowns.fees, [
    { kind: "platform", platforms: ["android"], rating: "good" },
    { kind: "platform", platforms: ["ios"], rating: "caution" },
  ]);
});

test("wallet validation rejects overlapping application transparency scopes", () => {
  assert.deepEqual(
    validateTransparency(
      "wallet.transparency",
      {
        surfaces: [
          { kind: "application", rating: "acceptable", platforms: ["android"] },
          { kind: "application", rating: "caution", platforms: ["android"] },
        ],
      },
      new Set(["android", "ios"]),
    ),
    [
      'wallet.transparency.surfaces[1].platforms[0]: platform "android" is already covered by another application surface',
      'wallet.transparency.surfaces: must cover companion platform "ios"',
    ],
  );
});

test("explicit transparency and platform ratings resolve through one seam", () => {
  const wallet = walletFixture({
    platforms: ["hardware", "android", "ios"],
    check: { validation: "caution" },
    platformOverrides: {
      hardware: { check: { validation: "not_applicable" } },
    },
    transparency: {
      surfaces: [
        { kind: "firmware", rating: "good" },
        { kind: "application", rating: "good", platforms: ["android"] },
        { kind: "application", rating: "caution", platforms: ["ios"] },
      ],
    },
  });

  const all = resolveWalletPresentation(wallet, wallet.platforms);
  assert.equal(all.ratings.validation, "caution");
  const iosPresentation = resolveWalletPresentation(wallet, ["ios"]);
  assert.equal(iosPresentation.ratings.transparency, "mixed");
  assert.deepEqual(iosPresentation.breakdowns.transparency, [
    { kind: "firmware", rating: "good" },
    { kind: "application", rating: "caution", platforms: ["ios"] },
  ]);

  const transparentOnly = createWalletFinderModel([wallet], {
    important: ["transparency"],
    features: [],
  });
  assert.deepEqual(transparentOnly.matches[0]?.platforms, ["android"]);
});
