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

type EffectiveTransparency = {
  surfaces: WalletTransparencySurface[];
  ratings: WalletCheckRating[];
};

function transparencyRating(
  rating: WalletCheckRating,
): WalletTransparencyRating | undefined {
  return rating === "not_applicable" ? undefined : rating;
}

function fallbackApplicationSurfaces(
  wallet: KaspaWallet,
  platforms: WalletCompanionOs[],
): WalletTransparencySurface[] {
  const platformsByRating = new Map<
    WalletTransparencyRating,
    [WalletCompanionOs, ...WalletCompanionOs[]]
  >();

  for (const platform of platforms) {
    const rating = transparencyRating(
      effectiveCheck(wallet, platform).transparency,
    );
    if (!rating) continue;
    const groupedPlatforms = platformsByRating.get(rating);
    if (groupedPlatforms) groupedPlatforms.push(platform);
    else platformsByRating.set(rating, [platform]);
  }

  return Array.from(platformsByRating, ([rating, groupedPlatforms]) => ({
    kind: "application" as const,
    rating,
    platforms: groupedPlatforms,
  }));
}

function fallbackTransparencySurfaces(
  wallet: KaspaWallet,
  platforms: WalletOs[],
): WalletTransparencySurface[] {
  const surfaces: WalletTransparencySurface[] = [];
  if (platforms.includes("hardware")) {
    const rating = transparencyRating(
      effectiveCheck(wallet, "hardware").transparency,
    );
    if (rating) surfaces.push({ kind: "firmware", rating });
  }

  surfaces.push(
    ...fallbackApplicationSurfaces(
      wallet,
      platforms.filter(
        (platform): platform is WalletCompanionOs => platform !== "hardware",
      ),
    ),
  );
  return surfaces;
}

function effectiveTransparencySurfaces(
  wallet: KaspaWallet,
): WalletTransparencySurface[] {
  const declaredSurfaces = wallet.transparency?.surfaces ?? [];
  const firmwareSurfaces = declaredSurfaces.filter(
    (surface) => surface.kind === "firmware",
  );
  const applicationSurfaces = declaredSurfaces.filter(
    (
      surface,
    ): surface is Extract<WalletTransparencySurface, { kind: "application" }> =>
      surface.kind === "application",
  );
  const surfaces: WalletTransparencySurface[] = [...firmwareSurfaces];

  if (wallet.platforms.includes("hardware") && firmwareSurfaces.length === 0) {
    const rating = transparencyRating(
      effectiveCheck(wallet, "hardware").transparency,
    );
    if (rating) {
      surfaces.push({ kind: "firmware", rating });
    }
  }

  surfaces.push(...applicationSurfaces);
  const uncoveredCompanionPlatforms = wallet.platforms.filter(
    (platform): platform is WalletCompanionOs =>
      platform !== "hardware" &&
      !applicationSurfaces.some((surface) =>
        surface.platforms?.includes(platform),
      ),
  );
  surfaces.push(
    ...fallbackApplicationSurfaces(wallet, uncoveredCompanionPlatforms),
  );
  return surfaces;
}

function resolveEffectiveTransparency(
  wallet: KaspaWallet,
  os: WalletOs | undefined,
): EffectiveTransparency {
  if (!wallet.transparency) {
    const platforms = os ? [os] : [...wallet.platforms];
    const ratings = platforms.map(
      (platform) => effectiveCheck(wallet, platform).transparency,
    );
    const surfaces =
      !os && new Set(ratings).size > 1
        ? fallbackTransparencySurfaces(wallet, platforms)
        : [];
    return { surfaces, ratings };
  }

  const allSurfaces = effectiveTransparencySurfaces(wallet);
  const surfaces =
    !os || os === "hardware"
      ? allSurfaces
      : allSurfaces.filter(
          (surface) =>
            surface.kind === "firmware" || surface.platforms.includes(os),
        );
  const ratings: WalletCheckRating[] = surfaces.map(
    (surface) => surface.rating,
  );
  if (ratings.length === 0) {
    ratings.push(effectiveCheck(wallet, os).transparency);
  }
  return { surfaces, ratings };
}

export function resolveWalletPresentation(
  wallet: KaspaWallet,
  os: WalletOs | undefined,
): WalletPresentation {
  const check = effectiveCheck(wallet, os);
  const effectiveTransparency = resolveEffectiveTransparency(wallet, os);
  const transparencyRatings = new Set(effectiveTransparency.ratings);
  const transparency =
    transparencyRatings.size > 1
      ? "mixed"
      : (effectiveTransparency.ratings[0] ?? check.transparency);

  return {
    ratings: { ...check, transparency },
    transparency: { surfaces: effectiveTransparency.surfaces },
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
    if (criterion === "transparency") {
      return resolveEffectiveTransparency(wallet, os).ratings.every((rating) =>
        positiveRatings.has(rating),
      );
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
