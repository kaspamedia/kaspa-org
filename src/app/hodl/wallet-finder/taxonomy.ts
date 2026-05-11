export const WALLET_OS_IDS = [
  "android",
  "ios",
  "windows",
  "mac",
  "linux",
  "hardware",
] as const;

export const WALLET_USER_TYPES = ["beginner", "experienced"] as const;

export const WALLET_CHECK_RATINGS = [
  "good",
  "acceptable",
  "caution",
  "not_applicable",
] as const;

export const WALLET_CRITERIA_IDS = [
  "control",
  "validation",
  "transparency",
  "fees",
] as const;

export const WALLET_FEATURE_IDS = [
  "two_fa",
  "hardware_wallet",
  "multisig",
] as const;

export const WALLET_ACTION_IDS = [
  "app_store",
  "google_play",
  "download",
  "open",
  "view_source",
] as const;

export const ACTION_IMPLIED_OS = {
  app_store: "ios",
  google_play: "android",
} as const satisfies Partial<Record<WalletEntryAction, WalletOs>>;

export type WalletOs = (typeof WALLET_OS_IDS)[number];
export type WalletUserType = (typeof WALLET_USER_TYPES)[number];
export type WalletCheckRating = (typeof WALLET_CHECK_RATINGS)[number];
export type WalletCriterion = (typeof WALLET_CRITERIA_IDS)[number];
export type WalletFeature = (typeof WALLET_FEATURE_IDS)[number];
export type WalletEntryAction = (typeof WALLET_ACTION_IDS)[number];
