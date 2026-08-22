import { ratingExplanations } from "../src/app/hodl/wallet-finder/walletMetadata.ts";
import { WALLET_OS_IDS } from "../src/app/hodl/wallet-finder/taxonomy.ts";

const allowedOs = new Set<string>(WALLET_OS_IDS);
const allowedRatings = new Set<string>(
  Object.keys(ratingExplanations.transparency),
);
const allowedSurfaceFields = new Set(["kind", "rating", "platforms"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateTransparency(
  path: string,
  transparency: unknown,
  supportedPlatforms: Set<string>,
): string[] {
  const errors: string[] = [];
  const fail = (failurePath: string, message: string) => {
    errors.push(`${failurePath}: ${message}`);
  };

  if (!isRecord(transparency)) {
    fail(path, "must be an object when provided");
    return errors;
  }

  for (const key of Object.keys(transparency)) {
    if (key !== "surfaces") {
      fail(`${path}.${key}`, "is not a known transparency field");
    }
  }

  const { surfaces } = transparency;
  if (!Array.isArray(surfaces) || surfaces.length === 0) {
    fail(`${path}.surfaces`, "must contain at least one surface");
    return errors;
  }

  let hasFirmware = false;
  const coveredApplicationPlatforms = new Set<string>();

  surfaces.forEach((surface, index) => {
    const surfacePath = `${path}.surfaces[${index}]`;
    if (!isRecord(surface)) {
      fail(surfacePath, "must be an object");
      return;
    }

    for (const key of Object.keys(surface)) {
      if (!allowedSurfaceFields.has(key)) {
        fail(`${surfacePath}.${key}`, "is not a known surface field");
      }
    }

    if (
      typeof surface.rating !== "string" ||
      !allowedRatings.has(surface.rating)
    ) {
      fail(`${surfacePath}.rating`, "must be good, acceptable, or caution");
    }

    if (surface.kind === "firmware") {
      if (!supportedPlatforms.has("hardware")) {
        fail(
          `${surfacePath}.kind`,
          "firmware surfaces require hardware support",
        );
      }
      if (surface.platforms !== undefined) {
        fail(
          `${surfacePath}.platforms`,
          "must not be set for firmware surfaces",
        );
      }
      if (hasFirmware) {
        fail(surfacePath, 'duplicates transparency surface "firmware:all"');
      }
      hasFirmware = true;
      return;
    }

    if (surface.kind !== "application") {
      fail(`${surfacePath}.kind`, "must be firmware or application");
      return;
    }

    if (!Array.isArray(surface.platforms) || surface.platforms.length === 0) {
      fail(`${surfacePath}.platforms`, "must be a non-empty array when set");
      return;
    }

    const surfacePlatforms = new Set<string>();
    surface.platforms.forEach((platform, platformIndex) => {
      const platformPath = `${surfacePath}.platforms[${platformIndex}]`;
      if (typeof platform !== "string" || !allowedOs.has(platform)) {
        fail(platformPath, `invalid OS "${platform}"`);
      } else if (platform === "hardware") {
        fail(platformPath, "application surfaces must use a companion app OS");
      } else if (surfacePlatforms.has(platform)) {
        fail(platformPath, `duplicate platform "${platform}"`);
      } else if (!supportedPlatforms.has(platform)) {
        fail(
          platformPath,
          `platform "${platform}" is not supported by the wallet`,
        );
      } else if (coveredApplicationPlatforms.has(platform)) {
        fail(
          platformPath,
          `platform "${platform}" is already covered by another application surface`,
        );
      } else {
        surfacePlatforms.add(platform);
        coveredApplicationPlatforms.add(platform);
      }
    });
  });

  if (supportedPlatforms.has("hardware") && !hasFirmware) {
    fail(`${path}.surfaces`, "must cover required device firmware");
  }
  for (const platform of supportedPlatforms) {
    if (platform !== "hardware" && !coveredApplicationPlatforms.has(platform)) {
      fail(`${path}.surfaces`, `must cover companion platform "${platform}"`);
    }
  }

  return errors;
}
