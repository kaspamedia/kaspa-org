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

export type WalletTransparencyRating = Exclude<
  WalletCheckRating,
  "not_applicable"
>;
export type WalletCompanionOs = Exclude<WalletOs, "hardware">;

export type WalletTransparencySurface =
  | {
      kind: "firmware";
      rating: WalletTransparencyRating;
      platforms?: never;
    }
  | {
      kind: "application";
      rating: WalletTransparencyRating;
      platforms: NonEmptyArray<WalletCompanionOs>;
    };

export type WalletTransparency = {
  surfaces: NonEmptyArray<WalletTransparencySurface>;
};

export type WalletRatingBreakdownItem =
  | WalletTransparencySurface
  | {
      kind: "platform";
      rating: WalletCheckRating;
      platforms: NonEmptyArray<WalletOs>;
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
