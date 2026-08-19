import type {
  WalletCheckRating,
  WalletCriterion,
  WalletDisplayRating,
  WalletEntryAction,
  WalletFeature,
  WalletOs,
  WalletUserType,
} from "./taxonomy";

export type {
  WalletCheckRating,
  WalletCriterion,
  WalletDisplayRating,
  WalletEntryAction,
  WalletFeature,
  WalletOs,
  WalletUserType,
};

export type NonEmptyArray<T> = [T, ...T[]];

export type WalletCheck = Record<WalletCriterion, WalletCheckRating>;

export type WalletTransparencySurface = {
  kind: "firmware" | "application";
  rating: Exclude<WalletCheckRating, "not_applicable">;
  platforms?: NonEmptyArray<WalletOs>;
};

export type WalletTransparency = {
  surfaces: NonEmptyArray<WalletTransparencySurface>;
};

export type WalletPlatformOverride = {
  features?: WalletFeature[];
  check?: Partial<WalletCheck>;
};

export type WalletAction = {
  action: WalletEntryAction;
  link: string;
  platforms?: NonEmptyArray<WalletOs>;
};

export type WalletReview = {
  submitter: string;
  submission: string;
};

export type KaspaWallet = {
  id: string;
  title: string;
  icon: string;
  user: WalletUserType;
  summary: string;
  review?: WalletReview;

  platforms: NonEmptyArray<WalletOs>;
  features: WalletFeature[];
  check: WalletCheck;
  transparency?: WalletTransparency;
  platformOverrides?: Partial<Record<WalletOs, WalletPlatformOverride>>;

  actions: NonEmptyArray<WalletAction>;
};

export type WalletFilters = {
  os?: WalletOs;
  user?: WalletUserType;
  important: WalletCriterion[];
  features: WalletFeature[];
};
