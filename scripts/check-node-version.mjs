import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const nvmrcPath = path.join(projectRoot, ".nvmrc");

const getRequiredMajor = () => {
  try {
    const raw = fs.readFileSync(nvmrcPath, "utf8").trim();
    const match = raw.match(/^v?(\d+)$/);
    if (match) {
      return Number(match[1]);
    }
  } catch {
    // Fall back to the repo's known supported major if .nvmrc is unavailable.
  }

  return 24;
};

const requiredMajor = getRequiredMajor();
const currentVersion = process.versions.node;
const currentMajor = Number(currentVersion.split(".")[0]);

if (currentMajor !== requiredMajor) {
  console.error(
    [
      `This repo requires Node ${requiredMajor}.x.`,
      `Current runtime: v${currentVersion}`,
      "",
      "Switch your shell to the repo version from .nvmrc before running Next commands.",
    ].join("\n"),
  );
  process.exit(1);
}
