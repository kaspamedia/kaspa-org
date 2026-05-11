import { walletFeatures } from "./walletMetadata";
import type {
  WalletCriterion,
  WalletFeature,
  WalletFilters,
  WalletOs,
  WalletUserType,
} from "./types";

export function getVisibleFeatures(user: WalletUserType | undefined) {
  if (user !== "beginner") return walletFeatures;
  return walletFeatures.filter((feature) => !feature.experiencedOnly);
}

function toggleValue<T extends string>(items: T[], value: T) {
  return items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value];
}

export function selectOs(filters: WalletFilters, os: WalletOs | undefined) {
  return {
    ...filters,
    os,
  };
}

export function selectUser(
  filters: WalletFilters,
  user: WalletUserType | undefined,
): WalletFilters {
  const visibleIds = new Set(
    getVisibleFeatures(user).map((feature) => feature.id),
  );

  return {
    ...filters,
    user,
    features: filters.features.filter((feature) => visibleIds.has(feature)),
  };
}

export function toggleCriterion(
  filters: WalletFilters,
  criterion: WalletCriterion,
): WalletFilters {
  return {
    ...filters,
    important: toggleValue(filters.important, criterion),
  };
}

export function toggleFeature(
  filters: WalletFilters,
  feature: WalletFeature,
): WalletFilters {
  return {
    ...filters,
    features: toggleValue(filters.features, feature),
  };
}
