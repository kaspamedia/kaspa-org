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
  WalletRatingBreakdownItem,
  WalletTransparencySurface,
} from "./types";

const positiveRatings = new Set<WalletCheckRating>(["good", "acceptable"]);

export type WalletMatch = {
  wallet: KaspaWallet;
  platforms: WalletOs[];
};

export type WalletPresentation = {
  ratings: Record<WalletCriterion, WalletDisplayRating>;
  breakdowns: Record<WalletCriterion, WalletRatingBreakdownItem[]>;
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

function aggregateRating(
  ratings: readonly WalletCheckRating[],
  fallback: WalletCheckRating,
): WalletDisplayRating {
  const applicableRatings = ratings.filter(
    (rating) => rating !== "not_applicable",
  );

  if (applicableRatings.length === 0) {
    return ratings.length > 0 ? "not_applicable" : fallback;
  }

  return new Set(applicableRatings).size > 1 ? "mixed" : applicableRatings[0];
}

function aggregatePlatformRating(
  wallet: KaspaWallet,
  platforms: readonly WalletOs[],
  criterion: WalletCriterion,
): WalletDisplayRating {
  return aggregateRating(
    platforms.map((platform) => effectiveCheck(wallet, platform)[criterion]),
    wallet.check[criterion],
  );
}

type RatingGroup<Platform extends WalletOs> = {
  rating: WalletCheckRating;
  platforms: [Platform, ...Platform[]];
};

function groupPlatformsByRating<Platform extends WalletOs>(
  wallet: KaspaWallet,
  platforms: readonly Platform[],
  criterion: WalletCriterion,
): RatingGroup<Platform>[] {
  const platformsByRating = new Map<
    WalletCheckRating,
    [Platform, ...Platform[]]
  >();

  for (const platform of platforms) {
    const rating = effectiveCheck(wallet, platform)[criterion];
    const groupedPlatforms = platformsByRating.get(rating);
    if (groupedPlatforms) groupedPlatforms.push(platform);
    else platformsByRating.set(rating, [platform]);
  }

  return Array.from(platformsByRating, ([rating, groupedPlatforms]) => ({
    rating,
    platforms: groupedPlatforms,
  }));
}

function platformBreakdown(
  wallet: KaspaWallet,
  platforms: readonly WalletOs[],
  criterion: WalletCriterion,
): WalletRatingBreakdownItem[] {
  const groups = groupPlatformsByRating(wallet, platforms, criterion);
  return groups.length < 2
    ? []
    : groups.map((group) => ({ kind: "platform", ...group }));
}

function resolveEffectiveTransparency(
  wallet: KaspaWallet,
  platforms: readonly WalletOs[],
): EffectiveTransparency {
  if (!wallet.transparency) {
    const ratings = platforms.map(
      (platform) => effectiveCheck(wallet, platform).transparency,
    );
    return { surfaces: [], ratings };
  }

  const allSurfaces = wallet.transparency.surfaces;
  const companionPlatforms = platforms.filter(
    (platform): platform is WalletCompanionOs => platform !== "hardware",
  );
  const isHardwareOnly = platforms.length === 1 && platforms[0] === "hardware";
  const surfaces = isHardwareOnly
    ? allSurfaces
    : allSurfaces.flatMap((surface): WalletTransparencySurface[] => {
        if (surface.kind === "firmware") return [surface];
        const [firstPlatform, ...remainingPlatforms] = surface.platforms.filter(
          (platform) => companionPlatforms.includes(platform),
        );
        return firstPlatform === undefined
          ? []
          : [
              {
                ...surface,
                platforms: [firstPlatform, ...remainingPlatforms],
              },
            ];
      });
  const ratings: WalletCheckRating[] = surfaces.map(
    (surface) => surface.rating,
  );
  if (ratings.length === 0) {
    ratings.push(
      ...platforms.map(
        (platform) => effectiveCheck(wallet, platform).transparency,
      ),
    );
  }
  return { surfaces, ratings };
}

export function resolveWalletPresentation(
  wallet: KaspaWallet,
  platforms: readonly WalletOs[],
): WalletPresentation {
  const effectiveTransparency = resolveEffectiveTransparency(wallet, platforms);

  return {
    ratings: {
      control: aggregatePlatformRating(wallet, platforms, "control"),
      validation: aggregatePlatformRating(wallet, platforms, "validation"),
      transparency: aggregateRating(
        effectiveTransparency.ratings,
        wallet.check.transparency,
      ),
      fees: aggregatePlatformRating(wallet, platforms, "fees"),
    },
    breakdowns: {
      control: platformBreakdown(wallet, platforms, "control"),
      validation: platformBreakdown(wallet, platforms, "validation"),
      transparency:
        effectiveTransparency.surfaces.length > 0
          ? effectiveTransparency.surfaces
          : platformBreakdown(wallet, platforms, "transparency"),
      fees: platformBreakdown(wallet, platforms, "fees"),
    },
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
      return resolveEffectiveTransparency(wallet, [os]).ratings.every(
        (rating) => positiveRatings.has(rating),
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

      return [{ wallet, platforms }];
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
