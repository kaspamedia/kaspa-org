import type {
  KaspaWallet,
  WalletAction,
  WalletCheck,
  WalletCheckRating,
  WalletCompanionOs,
  WalletCriterion,
  WalletDisplayRating,
  WalletFeature,
  WalletFilters,
  WalletOs,
  WalletTransparencyRating,
  WalletTransparencySurface,
} from "./types";

const positiveRatings = new Set<WalletCheckRating>(["good", "acceptable"]);

export type WalletMatch = {
  wallet: KaspaWallet;
  platforms: WalletOs[];
  primary: WalletOs | undefined;
};

export type WalletPresentation = {
  ratings: Omit<WalletCheck, "transparency"> & {
    transparency: WalletDisplayRating;
  };
  transparency: {
    surfaces: WalletTransparencySurface[];
  };
};

export type WalletFinderModel = {
  matches: WalletMatch[];
  totalWallets: number;
  isCriterionDisabled: (criterion: WalletCriterion) => boolean;
  isFeatureDisabled: (feature: WalletFeature) => boolean;
};

export function effectiveCheck(
  wallet: KaspaWallet,
  os: WalletOs | undefined,
): WalletCheck {
  if (!os) return wallet.check;
  const override = wallet.platformOverrides?.[os]?.check;
  return override ? { ...wallet.check, ...override } : wallet.check;
}

function transparencySurfacesForPlatform(
  wallet: KaspaWallet,
  os: WalletOs | undefined,
): WalletTransparencySurface[] {
  const surfaces = wallet.transparency?.surfaces ?? [];
  if (!os || os === "hardware") return [...surfaces];

  return surfaces.filter(
    (surface) => !surface.platforms || surface.platforms.includes(os),
  );
}

function transparencyRatingsForPlatform(
  wallet: KaspaWallet,
  os: WalletOs,
): WalletCheckRating[] {
  const surfaces = transparencySurfacesForPlatform(wallet, os);
  return surfaces.length > 0
    ? surfaces.map((surface) => surface.rating)
    : [effectiveCheck(wallet, os).transparency];
}

function fallbackTransparencySurfaces(
  wallet: KaspaWallet,
): WalletTransparencySurface[] {
  const platformsByRating = new Map<
    WalletTransparencyRating,
    [WalletCompanionOs, ...WalletCompanionOs[]]
  >();

  for (const platform of wallet.platforms) {
    if (
      platform === "hardware" ||
      transparencySurfacesForPlatform(wallet, platform).length > 0
    ) {
      continue;
    }

    const rating = effectiveCheck(wallet, platform).transparency;
    if (rating === "not_applicable") continue;
    const platforms = platformsByRating.get(rating);
    if (platforms) platforms.push(platform);
    else platformsByRating.set(rating, [platform]);
  }

  return Array.from(platformsByRating, ([rating, platforms]) => ({
    kind: "application" as const,
    rating,
    platforms,
  }));
}

export function resolveWalletPresentation(
  wallet: KaspaWallet,
  os: WalletOs | undefined,
): WalletPresentation {
  const check = effectiveCheck(wallet, os);
  const declaredSurfaces = transparencySurfacesForPlatform(wallet, os);
  const surfaces =
    !os && wallet.transparency
      ? [...declaredSurfaces, ...fallbackTransparencySurfaces(wallet)]
      : declaredSurfaces;
  const effectiveTransparencyRatings = wallet.transparency
    ? os
      ? transparencyRatingsForPlatform(wallet, os)
      : wallet.platforms.flatMap((platform) =>
          transparencyRatingsForPlatform(wallet, platform),
        )
    : [check.transparency];
  const transparencyRatings = new Set(effectiveTransparencyRatings);
  const transparency =
    transparencyRatings.size > 1
      ? "mixed"
      : (effectiveTransparencyRatings[0] ?? check.transparency);

  return {
    ratings: { ...check, transparency },
    transparency: { surfaces },
  };
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
  return criteria.every((criterion) => {
    if (criterion === "transparency" && wallet.transparency) {
      const surfaces = transparencySurfacesForPlatform(wallet, os);
      return surfaces.length > 0
        ? surfaces.every((surface) => positiveRatings.has(surface.rating))
        : positiveRatings.has(check.transparency);
    }
    return positiveRatings.has(check[criterion]);
  });
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

      const hasPlatformPreference = Boolean(
        filters.os || filters.important.length || filters.features.length,
      );
      return [
        {
          wallet,
          platforms,
          primary: hasPlatformPreference ? platforms[0] : undefined,
        },
      ];
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
