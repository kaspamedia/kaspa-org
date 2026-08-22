import assert from "node:assert/strict";
import test from "node:test";

import spanishWalletSummaries from "../../messages/es/wallets.json" with { type: "json" };
import { validateSpanishCatalogContract } from "../../scripts/i18n/spanish-contract.mts";
import { validateTransparency } from "../../scripts/wallet-transparency-validation.mts";
import {
  getRatingExplanationKey,
  ratingExplanations,
} from "../../src/app/hodl/wallet-finder/walletMetadata.ts";
import {
  WALLET_CHECK_RATINGS,
  WALLET_CRITERIA_IDS,
} from "../../src/app/hodl/wallet-finder/taxonomy.ts";
import {
  createWalletFinderModel,
  resolveWalletPresentation,
} from "../../src/app/hodl/wallet-finder/filterWallets.ts";
import type {
  KaspaWallet,
  WalletCheck,
  WalletCheckRating,
} from "../../src/app/hodl/wallet-finder/types.ts";
import { kaspaWallets } from "../../src/data/wallets.ts";
import { supportedLocaleCodes } from "../../src/i18n/locale-registry.ts";
import { englishMessages, spanishMessages } from "../../src/i18n/messages.ts";
import { getLocalizedWallets } from "../../src/i18n/wallets.ts";

test("every supported locale returns the complete canonical wallet set", () => {
  const canonicalIds = kaspaWallets.map((wallet) => wallet.id).sort();

  for (const locale of supportedLocaleCodes) {
    const localizedWallets = getLocalizedWallets(locale);
    assert.deepEqual(
      localizedWallets.map((wallet) => wallet.id).sort(),
      canonicalIds,
      locale,
    );
    assert.ok(
      localizedWallets.every((wallet) => wallet.summary.trim().length > 0),
      locale,
    );
  }
});

test("English records are canonical and pseudo summaries derive from them", () => {
  assert.deepEqual(getLocalizedWallets("en"), kaspaWallets);

  const pseudoWallets = getLocalizedWallets("en-XA");
  for (const [index, wallet] of pseudoWallets.entries()) {
    assert.notEqual(wallet.summary, kaspaWallets[index].summary);
    assert.match(wallet.summary, /^\[!! /u);
  }
});

test("route catalogs do not own wallet records", () => {
  assert.equal("wallets" in englishMessages.hodl.walletFinder, false);
  assert.equal("wallets" in spanishMessages.hodl.walletFinder, false);
});

test("Spanish wallet summaries satisfy the site translation contract", () => {
  const englishWalletSummaries = Object.fromEntries(
    kaspaWallets.map((wallet) => [wallet.id, wallet.summary]),
  );

  assert.deepEqual(
    validateSpanishCatalogContract(
      "wallets",
      englishWalletSummaries,
      spanishWalletSummaries,
    ),
    [],
  );
});

test("every validator-approved rating resolves through the explanation map", () => {
  const explanationCatalog =
    englishMessages.hodl.walletFinder.ratings.explanations;

  for (const criterion of WALLET_CRITERIA_IDS) {
    const approvedRatings = ratingExplanations[criterion] as Partial<
      Record<WalletCheckRating, string>
    >;

    for (const rating of WALLET_CHECK_RATINGS) {
      const key = getRatingExplanationKey(criterion, rating);
      assert.equal(key, approvedRatings[rating]);

      if (key) {
        const catalogKey = key.split(".").at(-1) as WalletCheckRating;
        const criterionCatalog = explanationCatalog[criterion] as Partial<
          Record<WalletCheckRating, string>
        >;
        assert.equal(typeof criterionCatalog[catalogKey], "string");
      }
    }
  }
});

function walletFixture({
  check,
  ...overrides
}: Omit<Partial<KaspaWallet>, "check"> & {
  check?: Partial<WalletCheck>;
} = {}): KaspaWallet {
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
    id: "override-wallet",
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

  assert.deepEqual(match.platforms, ["android", "ios"]);
  const presentation = resolveWalletPresentation(wallet, match.platforms);
  assert.equal(presentation.ratings.transparency, "mixed");
  assert.equal(presentation.ratings.fees, "mixed");
  assert.deepEqual(presentation.breakdowns.fees, [
    { kind: "platform", platforms: ["android"], rating: "good" },
    { kind: "platform", platforms: ["ios"], rating: "caution" },
  ]);
});

test("wallet validation rejects overlapping application transparency scopes", () => {
  const failures = validateTransparency(
    "wallet.transparency",
    {
      surfaces: [
        {
          kind: "application",
          rating: "acceptable",
          platforms: ["android"],
        },
        {
          kind: "application",
          rating: "caution",
          platforms: ["android"],
        },
      ],
    },
    new Set(["android", "ios"]),
  );

  assert.deepEqual(failures, [
    'wallet.transparency.surfaces[1].platforms[0]: platform "android" is already covered by another application surface',
    'wallet.transparency.surfaces: must cover companion platform "ios"',
  ]);
});

test("explicit transparency and platform ratings resolve through one seam", () => {
  const wallet = walletFixture({
    id: "partial-surface-wallet",
    platforms: ["hardware", "android", "ios"],
    features: ["hardware_wallet"],
    check: {
      validation: "caution",
      transparency: "caution",
    },
    platformOverrides: {
      hardware: { check: { validation: "not_applicable" } },
    },
    transparency: {
      surfaces: [
        { kind: "firmware", rating: "good" },
        {
          kind: "application",
          rating: "good",
          platforms: ["android"],
        },
        {
          kind: "application",
          rating: "caution",
          platforms: ["ios"],
        },
      ],
    },
  });

  const unfilteredPresentation = resolveWalletPresentation(
    wallet,
    wallet.platforms,
  );
  assert.equal(unfilteredPresentation.ratings.validation, "caution");
  assert.equal(unfilteredPresentation.ratings.transparency, "mixed");
  assert.deepEqual(unfilteredPresentation.breakdowns.transparency, [
    { kind: "firmware", rating: "good" },
    { kind: "application", rating: "good", platforms: ["android"] },
    { kind: "application", rating: "caution", platforms: ["ios"] },
  ]);
  assert.deepEqual(unfilteredPresentation.breakdowns.validation, [
    {
      kind: "platform",
      rating: "not_applicable",
      platforms: ["hardware"],
    },
    {
      kind: "platform",
      rating: "caution",
      platforms: ["android", "ios"],
    },
  ]);
  assert.equal(
    resolveWalletPresentation(wallet, ["hardware"]).ratings.validation,
    "not_applicable",
  );
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
