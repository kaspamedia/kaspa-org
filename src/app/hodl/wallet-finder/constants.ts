import type { WalletFilters, WalletOs } from "./types";

export const initialFilters: WalletFilters = { important: [], features: [] };

export const OS_LABELS = {
  android: "Android",
  ios: "iOS",
  windows: "Windows",
  mac: "macOS",
  linux: "Linux",
  hardware: "Hardware",
} as const satisfies Record<WalletOs, string>;

const osDisplayOrder: WalletOs[] = [
  "windows",
  "mac",
  "linux",
  "ios",
  "android",
  "hardware",
];

export const OS_OPTIONS = osDisplayOrder.map((id) => ({
  id,
  label: OS_LABELS[id],
}));

export const OS_GUIDANCE_GROUPS: Array<{
  title: string;
  os: Array<{ id: WalletOs; label: string }>;
  pros: string[];
  cons: string[];
}> = [
  {
    title: "Mobile wallets",
    os: [
      { id: "android", label: OS_LABELS.android },
      { id: "ios", label: OS_LABELS.ios },
    ],
    pros: [
      "Portable and convenient; ideal when making transactions face-to-face",
      "Designed to use QR codes to make quick and seamless transactions",
    ],
    cons: [
      "App marketplaces can delist/remove wallets, making future updates harder to receive",
      "Damage or loss of the device can potentially lead to loss of funds",
    ],
  },
  {
    title: "Desktop wallets",
    os: [
      { id: "linux", label: OS_LABELS.linux },
      { id: "mac", label: OS_LABELS.mac },
      { id: "windows", label: OS_LABELS.windows },
    ],
    pros: [
      "Desktop environments can give users complete control over funds",
      "Some desktop wallets offer hardware wallet support or full-node operation",
    ],
    cons: [
      "Less convenient for QR-code payments when making transactions in person",
      "Compromised computers may expose users to malware, spyware, or viruses",
    ],
  },
  {
    title: "Hardware wallets",
    os: [{ id: "hardware", label: OS_LABELS.hardware }],
    pros: [
      "One of the most secure methods to store funds",
      "Ideal for storing large amounts of KAS long-term",
    ],
    cons: [
      "Less convenient while mobile and not designed for quick transactions",
      "Loss of device without proper backup can make funds unrecoverable",
    ],
  },
];

export const STEP_TITLES = [
  "What is your operating system?",
  "How much do you know about Kaspa?",
  "Which criteria are important to you?",
  "What features are you looking for?",
] as const;

export const STEP_SUBTITLES = [
  "This filters the list to wallets that run on your OS.",
  "Helps us show wallets suited to your experience level.",
  "Optional",
  "Optional",
] as const;
