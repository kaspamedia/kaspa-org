import assert from "node:assert/strict";
import test from "node:test";

import { kaspaWallets } from "../../src/data/wallets.ts";
import { createWalletFinderModel } from "../../src/app/hodl/wallet-finder/walletModel.ts";

const noFilters = { important: [], features: [] };

test("a feature only experienced wallets offer explains itself to new users", () => {
  const model = createWalletFinderModel(kaspaWallets, {
    ...noFilters,
    user: "beginner",
  });
  assert.equal(model.isFeatureDisabled("hashed_addresses"), true);
  assert.equal(
    model.unavailableReason({ features: ["hashed_addresses"] }),
    "experienced",
  );
});

test("a feature excluded by other selections blames the selections", () => {
  const model = createWalletFinderModel(kaspaWallets, {
    ...noFilters,
    os: "mac",
  });
  assert.equal(model.isFeatureDisabled("two_fa"), true);
  assert.equal(model.unavailableReason({ features: ["two_fa"] }), "selections");
});

test("a feature no listed wallet offers is reported as unsupported", () => {
  const withoutFeatures = kaspaWallets.map((wallet) => ({
    ...wallet,
    features: [],
    platformOverrides: undefined,
  }));
  const model = createWalletFinderModel(withoutFeatures, noFilters);
  assert.equal(
    model.unavailableReason({ features: ["hashed_addresses"] }),
    "unsupported",
  );
});
