import assert from "node:assert/strict";
import test from "node:test";

import {
  getRatingExplanationKey,
  ratingExplanations,
} from "../../src/app/hodl/wallet-finder/walletMetadata.ts";
import {
  WALLET_CRITERIA_IDS,
  WALLET_RATINGS_BY_CRITERION,
} from "../../src/app/hodl/wallet-finder/taxonomy.ts";
import type { WalletCheckRating } from "../../src/app/hodl/wallet-finder/types.ts";
import { kaspaWallets } from "../../src/data/wallets.ts";
import { supportedLocaleCodes } from "../../src/i18n/locale-registry.ts";
import { englishMessages, spanishMessages } from "../../src/i18n/messages.ts";
import {
  getLocalizedWallets,
  localizeWalletCatalog,
} from "../../src/i18n/wallets.ts";

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

test("English records are canonical", () => {
  assert.deepEqual(getLocalizedWallets("en"), kaspaWallets);
});

test("compatibility translations preserve canonical links and wallet behavior", () => {
  for (const locale of supportedLocaleCodes) {
    for (const wallet of getLocalizedWallets(locale)) {
      const canonical = kaspaWallets.find(({ id }) => id === wallet.id)!;
      const { summary, compatibility, ...behavior } = wallet;
      const {
        summary: englishSummary,
        compatibility: englishCompatibility,
        ...canonicalBehavior
      } = canonical;
      assert.deepEqual(behavior, canonicalBehavior);
      assert.ok(summary);
      assert.ok(englishSummary);
      assert.equal(compatibility?.link, englishCompatibility?.link);
      if (englishCompatibility) {
        assert.ok(compatibility?.note.trim());
        if (locale !== "en")
          assert.notEqual(compatibility?.note, englishCompatibility.note);
      } else {
        assert.equal(compatibility, undefined);
      }
    }
  }
});

test("catalogs cannot omit compatibility notes or invent them for other wallets", () => {
  const catalog = Object.fromEntries(
    kaspaWallets.map((wallet) => [
      wallet.id,
      {
        summary: wallet.summary,
        ...(wallet.compatibility
          ? { compatibilityNote: wallet.compatibility.note }
          : {}),
      },
    ]),
  );
  const missing = structuredClone(catalog);
  delete missing.ledger.compatibilityNote;
  assert.throws(
    () => localizeWalletCatalog("es", missing),
    /ledger:es must contain exactly/,
  );
  const empty = structuredClone(catalog);
  empty.ledger.compatibilityNote = " ";
  assert.throws(
    () => localizeWalletCatalog("es", empty),
    /must be a non-empty string/,
  );
  const extra = structuredClone(catalog);
  extra["tangem-wallet"].compatibilityNote = "An unsupported qualification";
  assert.throws(
    () => localizeWalletCatalog("es", extra),
    /tangem-wallet:es must contain exactly/,
  );
});

test("route catalogs do not own wallet records", () => {
  assert.equal("wallets" in englishMessages.hodl.walletFinder, false);
  assert.equal("wallets" in spanishMessages.hodl.walletFinder, false);
});

test("every validator-approved rating resolves through the explanation map", () => {
  const explanationCatalog =
    englishMessages.hodl.walletFinder.ratings.explanations;

  for (const criterion of WALLET_CRITERIA_IDS) {
    const approvedRatings = WALLET_RATINGS_BY_CRITERION[criterion];
    assert.deepEqual(
      Object.keys(ratingExplanations[criterion]).sort(),
      [...approvedRatings].sort(),
    );

    for (const rating of approvedRatings) {
      const key = getRatingExplanationKey(criterion, rating);
      assert.ok(key);
      const catalogKey = key.split(".").at(-1) as WalletCheckRating;
      const criterionCatalog = explanationCatalog[criterion] as Partial<
        Record<WalletCheckRating, string>
      >;
      assert.equal(typeof criterionCatalog[catalogKey], "string");
    }
  }
});
