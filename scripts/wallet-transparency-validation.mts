import { ratingExplanations } from "../src/app/hodl/wallet-finder/walletMetadata.ts";
import { WALLET_OS_IDS } from "../src/app/hodl/wallet-finder/taxonomy.ts";

const allowedOs = new Set<string>(WALLET_OS_IDS);
const allowedRatings = new Set<string>(
  Object.keys(ratingExplanations.transparency),
);
const allowedSurfaceKinds = new Set(["firmware", "application"]);
const allowedSurfaceFields = new Set(["kind", "rating", "platforms"]);

export function validateTransparency(
  path: string,
  transparency: unknown,
  supportedPlatforms: Set<string>,
): string[] {
  const errors: string[] = [];
  const fail = (failurePath: string, message: string) => {
    errors.push(`${failurePath}: ${message}`);
  };

  if (
    typeof transparency !== "object" ||
    transparency === null ||
    Array.isArray(transparency)
  ) {
    fail(path, "must be an object when provided");
    return errors;
  }

  const record = transparency as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (key !== "surfaces") {
      fail(`${path}.${key}`, "is not a known transparency field");
    }
  }

  if (!Array.isArray(record.surfaces) || record.surfaces.length === 0) {
    fail(`${path}.surfaces`, "must contain at least one surface");
    return errors;
  }

  const seen = new Set<string>();
  const applicationPlatformOwners = new Set<string>();
  record.surfaces.forEach((surface, index) => {
    const surfacePath = `${path}.surfaces[${index}]`;
    if (
      typeof surface !== "object" ||
      surface === null ||
      Array.isArray(surface)
    ) {
      fail(surfacePath, "must be an object");
      return;
    }

    const surfaceRecord = surface as Record<string, unknown>;
    for (const key of Object.keys(surfaceRecord)) {
      if (!allowedSurfaceFields.has(key)) {
        fail(`${surfacePath}.${key}`, "is not a known surface field");
      }
    }

    const kind = surfaceRecord.kind;
    if (typeof kind !== "string" || !allowedSurfaceKinds.has(kind)) {
      fail(`${surfacePath}.kind`, "must be firmware or application");
    } else if (kind === "firmware" && !supportedPlatforms.has("hardware")) {
      fail(`${surfacePath}.kind`, "firmware surfaces require hardware support");
    }

    const rating = surfaceRecord.rating;
    if (typeof rating !== "string" || !allowedRatings.has(rating)) {
      fail(`${surfacePath}.rating`, "must be good, acceptable, or caution");
    }

    let scope = "all";
    if (surfaceRecord.platforms !== undefined) {
      if (kind === "firmware") {
        fail(
          `${surfacePath}.platforms`,
          "must not be set for firmware surfaces",
        );
      }
      if (
        !Array.isArray(surfaceRecord.platforms) ||
        surfaceRecord.platforms.length === 0
      ) {
        fail(`${surfacePath}.platforms`, "must be a non-empty array when set");
      } else {
        const platformSeen = new Set<string>();
        const platformIndexes = new Map<string, number>();
        for (const [
          platformIndex,
          platform,
        ] of surfaceRecord.platforms.entries()) {
          const platformPath = `${surfacePath}.platforms[${platformIndex}]`;
          if (typeof platform !== "string" || !allowedOs.has(platform)) {
            fail(platformPath, `invalid OS "${platform}"`);
          } else if (kind === "application" && platform === "hardware") {
            fail(
              platformPath,
              "application surfaces must use a companion app OS",
            );
          } else if (platformSeen.has(platform)) {
            fail(platformPath, `duplicate platform "${platform}"`);
          } else if (!supportedPlatforms.has(platform)) {
            fail(
              platformPath,
              `platform "${platform}" is not supported by the wallet`,
            );
          } else {
            platformSeen.add(platform);
            platformIndexes.set(platform, platformIndex);
          }
        }
        scope = [...platformSeen].sort().join(",");

        const fingerprint = `${kind}:${scope}`;
        if (kind === "application" && !seen.has(fingerprint)) {
          for (const platform of platformSeen) {
            if (applicationPlatformOwners.has(platform)) {
              fail(
                `${surfacePath}.platforms[${platformIndexes.get(platform)}]`,
                `platform "${platform}" is already covered by another application surface`,
              );
            } else {
              applicationPlatformOwners.add(platform);
            }
          }
        }
      }
    } else if (kind === "application") {
      fail(`${surfacePath}.platforms`, "is required for application surfaces");
    }

    const fingerprint = `${kind}:${scope}`;
    if (seen.has(fingerprint)) {
      fail(surfacePath, `duplicates transparency surface "${fingerprint}"`);
    } else {
      seen.add(fingerprint);
    }
  });

  return errors;
}
