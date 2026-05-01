import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const nextBinPath = path.resolve(
  __dirname,
  "../node_modules/next/dist/bin/next",
);
const preferredInterfaceNames = [
  "en0",
  "en1",
  "eth0",
  "wlan0",
  "Wi-Fi",
  "Ethernet",
];
const forwardedArgs = process.argv.slice(2);

const isPrivateIpv4 = (address) =>
  address.startsWith("10.") ||
  address.startsWith("192.168.") ||
  /^172\.(1[6-9]|2\d|3[01])\./.test(address);

const isWildcardHost = (host) =>
  host === "0.0.0.0" || host === "::" || host === "[::]";

const splitOrigins = (value) =>
  value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const hasHostnameArg = forwardedArgs.some(
  (arg, index, args) =>
    arg === "--hostname" ||
    arg === "-H" ||
    arg.startsWith("--hostname=") ||
    (index > 0 &&
      (args[index - 1] === "--hostname" || args[index - 1] === "-H")),
);

const getExplicitHost = () => {
  const envHost = process.env.NEXT_DEV_HOST?.trim();
  if (envHost) {
    return envHost;
  }

  if (!hasHostnameArg) {
    return undefined;
  }

  for (let index = 0; index < forwardedArgs.length; index += 1) {
    const arg = forwardedArgs[index];

    if (arg === "--hostname" || arg === "-H") {
      return forwardedArgs[index + 1]?.trim();
    }

    if (arg.startsWith("--hostname=")) {
      return arg.slice("--hostname=".length).trim();
    }
  }

  return undefined;
};

const getExplicitPort = () => {
  for (let index = 0; index < forwardedArgs.length; index += 1) {
    const arg = forwardedArgs[index];

    if (arg === "--port" || arg === "-p") {
      return forwardedArgs[index + 1]?.trim();
    }

    if (arg.startsWith("--port=")) {
      return arg.slice("--port=".length).trim();
    }
  }

  return process.env.PORT?.trim();
};

const detectLanHost = () => {
  const addresses = Object.entries(os.networkInterfaces()).flatMap(
    ([name, entries]) => (entries ?? []).map((entry) => ({ name, ...entry })),
  );

  const candidates = addresses.filter(
    ({ address, family, internal }) =>
      Boolean(address) && !internal && (family === "IPv4" || family === 4),
  );

  const preferredPrivate = candidates.find(
    ({ address, name }) =>
      isPrivateIpv4(address) && preferredInterfaceNames.includes(name),
  );
  if (preferredPrivate) {
    return preferredPrivate.address;
  }

  const privateCandidate = candidates.find(({ address }) =>
    isPrivateIpv4(address),
  );
  if (privateCandidate) {
    return privateCandidate.address;
  }

  const preferredCandidate = candidates.find(({ name }) =>
    preferredInterfaceNames.includes(name),
  );
  if (preferredCandidate) {
    return preferredCandidate.address;
  }

  return candidates[0]?.address;
};

const explicitHost = getExplicitHost();
const detectedLanHost = detectLanHost();
const bindHost = explicitHost ?? detectedLanHost;
const publicHost =
  explicitHost && !isWildcardHost(explicitHost)
    ? explicitHost
    : detectedLanHost;
const port = getExplicitPort() || "3000";

if (!bindHost || !publicHost) {
  console.error(
    "Could not detect a LAN IPv4 address. Set NEXT_DEV_HOST manually, for example NEXT_DEV_HOST=192.168.1.50 npm run dev:lan",
  );
  process.exit(1);
}

const allowedOrigins = Array.from(
  new Set([
    "127.0.0.1",
    "::1",
    publicHost,
    ...(explicitHost && !isWildcardHost(explicitHost) ? [explicitHost] : []),
    ...splitOrigins(process.env.NEXT_DEV_ALLOWED_ORIGINS ?? ""),
  ]),
);

const nextArgs = ["dev"];

if (!hasHostnameArg) {
  nextArgs.push("--hostname", bindHost);
}

nextArgs.push(...forwardedArgs);

console.log(`Starting Next dev for LAN/mobile on http://${publicHost}:${port}`);

const child = spawn(process.execPath, [nextBinPath, ...nextArgs], {
  cwd: process.cwd(),
  stdio: "inherit",
  env: {
    ...process.env,
    NEXT_DEV_ALLOWED_ORIGINS: allowedOrigins.join(","),
  },
});

const forwardSignal = (signal) => {
  if (!child.killed) {
    child.kill(signal);
  }
};

const getSignalExitCode = (signal) => {
  const signalNumber = os.constants.signals[signal];
  return signalNumber ? 128 + signalNumber : 1;
};

process.on("SIGINT", () => forwardSignal("SIGINT"));
process.on("SIGTERM", () => forwardSignal("SIGTERM"));

child.on("exit", (code, signal) => {
  if (signal) {
    process.exit(getSignalExitCode(signal));
    return;
  }

  process.exit(code ?? 0);
});
