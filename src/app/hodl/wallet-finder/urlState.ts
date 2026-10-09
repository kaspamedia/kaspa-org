import {
  WALLET_CRITERIA_IDS,
  WALLET_FEATURE_IDS,
  WALLET_OS_IDS,
} from "./taxonomy.ts";
import { WIZARD_STEP_IDS } from "./constants.ts";
import type { WalletFilters } from "./types";

export type WalletFinderMode = "guided" | "table";

export type WalletFinderUrlState = {
  mode: WalletFinderMode;
  step: number;
  filters: WalletFilters;
};

const PARAM_KEYS = ["os", "advanced", "criteria", "features", "step", "view"];
const LIST_VIEW = "list";
// "Hide advanced wallets" is stored as the beginner user type.
const HIDE_ADVANCED = "hide";
const STEP_COUNT = WIZARD_STEP_IDS.length;

function pick<T extends string>(
  allowed: readonly T[],
  value: string | null,
): T | undefined {
  return allowed.find((item) => item === value);
}

function pickList<T extends string>(
  allowed: readonly T[],
  value: string | null,
): T[] {
  const requested = new Set(value?.split(",") ?? []);
  // Keep taxonomy order so equivalent links serialize identically.
  return allowed.filter((item) => requested.has(item));
}

export function parseWalletFinderUrl(
  search: string,
): WalletFinderUrlState | null {
  const params = new URLSearchParams(search);
  if (!PARAM_KEYS.some((key) => params.has(key))) return null;

  const step = Number(params.get("step"));
  return {
    mode: params.get("view") === LIST_VIEW ? "table" : "guided",
    step: Number.isInteger(step) && step >= 1 && step <= STEP_COUNT ? step : 1,
    filters: {
      os: pick(WALLET_OS_IDS, params.get("os")),
      user: params.get("advanced") === HIDE_ADVANCED ? "beginner" : undefined,
      important: pickList(WALLET_CRITERIA_IDS, params.get("criteria")),
      features: pickList(WALLET_FEATURE_IDS, params.get("features")),
    },
  };
}

function isDefaultState({ mode, step, filters }: WalletFinderUrlState) {
  return (
    mode === "guided" &&
    step === 1 &&
    !filters.os &&
    filters.user !== "beginner" &&
    filters.important.length === 0 &&
    filters.features.length === 0
  );
}

/**
 * Returns `href` with the finder state applied. Unrelated query parameters are
 * kept; the default state removes the finder's parameters entirely.
 */
export function serializeWalletFinderUrl(
  href: string,
  state: WalletFinderUrlState,
  sectionHash: string,
): string {
  const url = new URL(href);
  for (const key of PARAM_KEYS) url.searchParams.delete(key);

  if (!isDefaultState(state)) {
    const { mode, step, filters } = state;
    if (mode === "table") url.searchParams.set("view", LIST_VIEW);
    else url.searchParams.set("step", String(step));
    if (filters.os) url.searchParams.set("os", filters.os);
    if (filters.user === "beginner")
      url.searchParams.set("advanced", HIDE_ADVANCED);
    const criteria = WALLET_CRITERIA_IDS.filter((id) =>
      filters.important.includes(id),
    );
    const features = WALLET_FEATURE_IDS.filter((id) =>
      filters.features.includes(id),
    );
    if (criteria.length) url.searchParams.set("criteria", criteria.join(","));
    if (features.length) url.searchParams.set("features", features.join(","));
    url.hash = sectionHash;
  }

  // URLSearchParams encodes "," as "%2C"; keep shared links readable.
  return url.toString().replaceAll("%2C", ",");
}
