import {
  buildExampleContract,
  type BuildArtifactLocale,
} from "./build-example-contract.ts";
import {
  defaultLocale,
  supportedLocaleCodes,
  type Locale,
} from "./locale-registry.ts";
import { routeManifest, type RouteId } from "./manifest.ts";
import {
  createI18nPublicationProfile,
  type I18nPublicationProfile,
} from "./publication-profile-contract.ts";

export type LocalePublicationProjection = Readonly<{
  locale: Locale;
  publicRoutePathnames: Readonly<Record<RouteId, string | null>>;
  openGraphImagePathname: string | null;
  proofCatalogPathname: string | null;
  buildArtifactUrls: readonly string[];
}>;

export type I18nPublicationInventory = Readonly<{
  enabledLocales: readonly Locale[];
  productionLocales: readonly Locale[];
  translatedProductionLocales: readonly Locale[];
  unavailableLocales: readonly Locale[];
  enabledBuildArtifactLocales: readonly BuildArtifactLocale[];
  unavailableBuildArtifactLocales: readonly BuildArtifactLocale[];
  byLocale: Readonly<Record<Locale, LocalePublicationProjection>>;
}>;

function publicPathname(locale: Locale, pathname: string): string {
  if (locale === defaultLocale) return pathname;
  return `/${locale}${pathname === "/" ? "" : pathname}`;
}

export function createI18nPublicationInventory(
  profile: I18nPublicationProfile,
): I18nPublicationInventory {
  const productionLocales = [...profile.productionLocales];
  const unavailableLocales = supportedLocaleCodes.filter(
    (locale) => !profile.enabledLocales.includes(locale),
  );
  const artifactLocales = buildExampleContract.artifactManifest.locales;
  const enabledBuildArtifactLocales = artifactLocales.filter((locale) =>
    profile.enabledLocales.includes(locale),
  );
  const unavailableBuildArtifactLocales = artifactLocales.filter(
    (locale) => !profile.enabledLocales.includes(locale),
  );

  const byLocale = Object.freeze(
    Object.fromEntries(
      supportedLocaleCodes.map((locale) => {
        const isHomePublished = profile.routePublications.home[locale] !== null;
        const publicRoutePathnames = Object.freeze(
          Object.fromEntries(
            Object.entries(routeManifest).map(([routeId, route]) => [
              routeId,
              profile.routePublications[routeId as RouteId][locale] === "public"
                ? publicPathname(locale, route.pathname)
                : null,
            ]),
          ) as Record<RouteId, string | null>,
        );
        const projection: LocalePublicationProjection = Object.freeze({
          locale,
          publicRoutePathnames,
          openGraphImagePathname:
            locale === defaultLocale || isHomePublished
              ? publicPathname(locale, "/opengraph-image")
              : null,
          proofCatalogPathname: isHomePublished
            ? `/api/i18n/home-proof/${locale}`
            : null,
          buildArtifactUrls:
            locale !== defaultLocale && artifactLocales.includes(locale)
              ? buildExampleContract.artifactManifest.urlsByLocale[
                  locale as BuildArtifactLocale
                ]
              : Object.freeze([]),
        });
        return [locale, projection];
      }),
    ) as Record<Locale, LocalePublicationProjection>,
  );

  return Object.freeze({
    enabledLocales: Object.freeze([...profile.enabledLocales]),
    productionLocales: Object.freeze(productionLocales),
    translatedProductionLocales: Object.freeze(
      productionLocales.filter((locale) => locale !== defaultLocale),
    ),
    unavailableLocales: Object.freeze(unavailableLocales),
    enabledBuildArtifactLocales: Object.freeze(enabledBuildArtifactLocales),
    unavailableBuildArtifactLocales: Object.freeze(
      unavailableBuildArtifactLocales,
    ),
    byLocale,
  });
}

export const productionI18nPublicationInventory =
  createI18nPublicationInventory(createI18nPublicationProfile("production"));
