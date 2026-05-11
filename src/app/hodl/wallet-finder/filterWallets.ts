import type {
  KaspaWallet,
  WalletAction,
  WalletCheck,
  WalletCheckRating,
  WalletCriterion,
  WalletFeature,
  WalletFilters,
  WalletOs,
} from "./types";

const positiveRatings = new Set<WalletCheckRating>(["good", "acceptable"]);

export type WalletMatch = {
  wallet: KaspaWallet;
  platforms: WalletOs[];
  primary: WalletOs;
};

export type WalletFinderModel = {
  matches: WalletMatch[];
  totalWallets: number;
  isCriterionDisabled: (criterion: WalletCriterion) => boolean;
  isFeatureDisabled: (feature: WalletFeature) => boolean;
};

export function effectiveCheck(wallet: KaspaWallet, os: WalletOs): WalletCheck {
  const override = wallet.platformOverrides?.[os]?.check;
  return override ? { ...wallet.check, ...override } : wallet.check;
}

export function effectiveFeatures(
  wallet: KaspaWallet,
  os: WalletOs,
): WalletFeature[] {
  return wallet.platformOverrides?.[os]?.features ?? wallet.features;
}

export function actionsForPlatform(
  wallet: KaspaWallet,
  os: WalletOs | undefined,
): WalletAction[] {
  if (!os) return [...wallet.actions];
  return wallet.actions.filter(
    (action) => !action.platforms || action.platforms.includes(os),
  );
}

function getMatchingPlatforms(
  wallet: KaspaWallet,
  filters: WalletFilters,
): WalletOs[] {
  if (!filters.os) return [...wallet.platforms];
  return wallet.platforms.includes(filters.os) ? [filters.os] : [];
}

function platformSupportsCriteria(
  wallet: KaspaWallet,
  os: WalletOs,
  criteria: WalletCriterion[],
): boolean {
  const check = effectiveCheck(wallet, os);
  return criteria.every((criterion) => positiveRatings.has(check[criterion]));
}

function platformSupportsFeatures(
  wallet: KaspaWallet,
  os: WalletOs,
  features: WalletFeature[],
): boolean {
  const platformFeatures = effectiveFeatures(wallet, os);
  return features.every((feature) => platformFeatures.includes(feature));
}

function getMatches(wallets: KaspaWallet[], filters: WalletFilters) {
  return wallets
    .flatMap<WalletMatch>((wallet) => {
      if (filters.user === "beginner" && wallet.user !== "beginner") {
        return [];
      }

      const candidatePlatforms = getMatchingPlatforms(wallet, filters);
      if (!candidatePlatforms.length) return [];

      const platforms = candidatePlatforms.filter(
        (os) =>
          (!filters.important.length ||
            platformSupportsCriteria(wallet, os, filters.important)) &&
          (!filters.features.length ||
            platformSupportsFeatures(wallet, os, filters.features)),
      );

      if (!platforms.length) return [];

      return [{ wallet, platforms, primary: platforms[0] }];
    })
    .sort((a, b) => a.wallet.title.localeCompare(b.wallet.title));
}

function hasMatchesWithFilter(
  wallets: KaspaWallet[],
  filters: WalletFilters,
  patch: Partial<WalletFilters>,
) {
  return getMatches(wallets, { ...filters, ...patch }).length > 0;
}

export function createWalletFinderModel(
  wallets: KaspaWallet[],
  filters: WalletFilters,
): WalletFinderModel {
  return {
    matches: getMatches(wallets, filters),
    totalWallets: wallets.length,
    isCriterionDisabled: (criterion) =>
      !filters.important.includes(criterion) &&
      !hasMatchesWithFilter(wallets, filters, {
        important: [...filters.important, criterion],
      }),
    isFeatureDisabled: (feature) =>
      !filters.features.includes(feature) &&
      !hasMatchesWithFilter(wallets, filters, {
        features: [...filters.features, feature],
      }),
  };
}

export function filterWallets(wallets: KaspaWallet[], filters: WalletFilters) {
  return createWalletFinderModel(wallets, filters).matches.map(
    (match) => match.wallet,
  );
}
