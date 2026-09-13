import assert from "node:assert/strict";
import test from "node:test";
import { validateWalletCompatibility } from "../../scripts/wallet-compatibility-validation.mts";

test("compatibility is optional and has its own text allowance", () => {
  assert.deepEqual(validateWalletCompatibility(undefined, 240), []);
  assert.deepEqual(
    validateWalletCompatibility(
      { note: "A".repeat(200), link: "https://example.com/support" },
      240,
    ),
    [],
  );
  assert.ok(
    validateWalletCompatibility(
      { note: "A".repeat(241), link: "https://example.com/support" },
      240,
    ).length,
  );
  assert.deepEqual(
    validateWalletCompatibility({
      note: "A".repeat(241),
      link: "https://example.com/support",
    }),
    [],
  );
});

test("compatibility links cannot execute scripts or embed credentials", () => {
  for (const link of [
    "javascript:alert(1)",
    "data:text/html,test",
    "//example.com",
    "/support",
    "https://user:password@example.com",
    "not a URL",
  ]) {
    assert.ok(
      validateWalletCompatibility({ note: "Model compatibility varies.", link })
        .length,
      link,
    );
  }
});

test("a compatibility record needs both meaningful text and a link", () => {
  for (const value of [
    null,
    [],
    {},
    { note: "" },
    { link: "https://example.com" },
    { note: " ", link: "https://example.com" },
    { note: "Line one\nLine two", link: "https://example.com" },
  ]) {
    assert.ok(validateWalletCompatibility(value).length);
  }
});
