import {
  aggregateWalletRatings,
  isPositiveWalletRating,
  WALLET_CRITERIA_IDS,
} from "./taxonomy.ts";
import type {
  KaspaWallet,
  WalletCheck,
  WalletCheckRating,
  WalletCompanionOs,
  WalletCriterion,
  WalletDisplayRating,
  NonEmptyArray,
  WalletOs,
  WalletRatingBreakdownItem,
  WalletTransparencySurface,
} from "./types";

export type WalletPresentation = {
  ratings: Record<WalletCriterion, WalletDisplayRating>;
  breakdowns: Record<WalletCriterion, WalletRatingBreakdownItem[]>;
};

type WalletAssessment = {
  presentation: WalletPresentation;
  supportsCriteria: (criteria: readonly WalletCriterion[]) => boolean;
};

export function effectiveCheck(
  wallet: KaspaWallet,
  os: WalletOs | undefined,
): WalletCheck {
  if (!os) return wallet.check;
  const override = wallet.platformOverrides?.[os]?.check;
  return override ? { ...wallet.check, ...override } : wallet.check;
}

function resolveEffectiveTransparency(
  wallet: KaspaWallet,
  platforms: readonly WalletOs[],
) {
  const fallbackRatings = () =>
    platforms.map((platform) => effectiveCheck(wallet, platform).transparency);
  if (!wallet.transparency) {
    return { surfaces: [], ratings: fallbackRatings() };
  }

  const allSurfaces = wallet.transparency.surfaces;
  const companionPlatforms = new Set(
    platforms.filter(
      (platform): platform is WalletCompanionOs => platform !== "hardware",
    ),
  );
  const isHardwareOnly = platforms.length === 1 && platforms[0] === "hardware";
  const surfaces = isHardwareOnly
    ? allSurfaces
    : allSurfaces.flatMap((surface): WalletTransparencySurface[] => {
        if (surface.kind === "firmware") return [surface];
        const selectedPlatforms = surface.platforms.filter((platform) =>
          companionPlatforms.has(platform),
        );
        return selectedPlatforms.length === 0
          ? []
          : [
              {
                ...surface,
                platforms:
                  selectedPlatforms as NonEmptyArray<WalletCompanionOs>,
              },
            ];
      });

  return {
    surfaces,
    ratings:
      surfaces.length > 0
        ? surfaces.map((surface) => surface.rating)
        : fallbackRatings(),
  };
}

function platformBreakdown(
  wallet: KaspaWallet,
  platforms: readonly WalletOs[],
  criterion: WalletCriterion,
): WalletRatingBreakdownItem[] {
  const platformsByRating = new Map<WalletCheckRating, WalletOs[]>();
  for (const platform of platforms) {
    const rating = effectiveCheck(wallet, platform)[criterion];
    const groupedPlatforms = platformsByRating.get(rating);
    if (groupedPlatforms) groupedPlatforms.push(platform);
    else platformsByRating.set(rating, [platform]);
  }

  return platformsByRating.size < 2
    ? []
    : Array.from(platformsByRating, ([rating, groupedPlatforms]) => ({
        kind: "platform",
        rating,
        platforms: groupedPlatforms as NonEmptyArray<WalletOs>,
      }));
}

export function assessWallet(
  wallet: KaspaWallet,
  platforms: readonly WalletOs[],
): WalletAssessment {
  const transparency = resolveEffectiveTransparency(wallet, platforms);
  const criterionRatings = Object.fromEntries(
    WALLET_CRITERIA_IDS.map((criterion) => [
      criterion,
      criterion === "transparency"
        ? transparency.ratings
        : platforms.map(
            (platform) => effectiveCheck(wallet, platform)[criterion],
          ),
    ]),
  ) as Record<WalletCriterion, WalletCheckRating[]>;
  const ratings = Object.fromEntries(
    WALLET_CRITERIA_IDS.map((criterion) => [
      criterion,
      aggregateWalletRatings(
        criterionRatings[criterion],
        wallet.check[criterion],
      ),
    ]),
  ) as WalletPresentation["ratings"];
  const breakdowns = Object.fromEntries(
    WALLET_CRITERIA_IDS.map((criterion) => [
      criterion,
      criterion === "transparency" && transparency.surfaces.length > 0
        ? transparency.surfaces
        : platformBreakdown(wallet, platforms, criterion),
    ]),
  ) as WalletPresentation["breakdowns"];

  return {
    presentation: { ratings, breakdowns },
    supportsCriteria: (criteria) =>
      criteria.every((criterion) =>
        criterionRatings[criterion].every(isPositiveWalletRating),
      ),
  };
}

export function resolveWalletPresentation(
  wallet: KaspaWallet,
  platforms: readonly WalletOs[],
): WalletPresentation {
  return assessWallet(wallet, platforms).presentation;
}
