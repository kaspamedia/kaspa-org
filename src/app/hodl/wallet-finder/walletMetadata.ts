import type {
  WalletCheckRating,
  WalletCriterion,
  WalletFeature,
} from "./types";
import { WALLET_CRITERIA_IDS, WALLET_FEATURE_IDS } from "./taxonomy.ts";

const criterionMetadata = {
  control: {
    label: "Control",
    description:
      "Some wallets give you full control over your KAS. This means no third party can freeze or take away your funds. You are still responsible, however, for securing and backing up your wallet.",
  },
  validation: {
    label: "Validation",
    description:
      "Some wallets let you control which Kaspa node processes your transactions, either by running their own, or by letting you point them at any node you trust.",
  },
  transparency: {
    label: "Transparency",
    description:
      "Some wallets are open-source and can be built deterministically, a process of compiling software which ensures the resulting code can be reproduced to help ensure it hasn't been tampered with.",
  },
  fees: {
    label: "Fees",
    description:
      "Some wallets give you full control over setting the fee paid to the Kaspa network before making a transaction, to ensure that your transactions are confirmed in a timely manner without paying more than you have to.",
  },
} as const satisfies Record<
  WalletCriterion,
  {
    label: string;
    description: string;
  }
>;

export const walletCriteria = WALLET_CRITERIA_IDS.map((id) => ({
  id,
  ...criterionMetadata[id],
}));

export const ratingExplanations: Record<
  WalletCriterion,
  Partial<Record<WalletCheckRating, string>>
> = {
  control: {
    good: "Self-custodial. You hold your private keys, so no third party can freeze or seize your funds.",
    caution:
      "Custodial. A third party holds your keys and can freeze or seize your funds.",
  },
  validation: {
    good: "Runs its own full Kaspa node by default, so it validates transactions independently.",
    acceptable:
      "Lets you point it at any Kaspa node you trust, but cannot run as a node itself.",
    caution:
      "Connects only to fixed centralised infrastructure, so you have to trust the wallet's chosen node.",
    not_applicable:
      "Hardware device only. It does not handle transactions itself.",
  },
  transparency: {
    good: "Open source with reproducible builds, so the published binary can be verified against the source code.",
    acceptable:
      "Open source, but builds are not reproducible, so you have to trust that the published binary matches the source.",
    caution: "Closed source. The code cannot be independently audited.",
  },
  fees: {
    good: "Lets you set an arbitrary custom fee on each transaction.",
    acceptable:
      "Offers preset fee tiers, but does not let you set a fully custom fee.",
    caution: "Fees are forced or hidden, with no user control.",
  },
};

const featureMetadata = {
  two_fa: {
    label: "2FA",
    description:
      "Two-factor authentication (2FA) adds a second layer of security to your wallet. Beyond your password, a verification code from an app or text message is required to access your funds. Note that 2FA typically relies on a third-party service to provide the verification.",
  },
  hardware_wallet: {
    label: "Hardware wallet support",
    description:
      "Some software wallets can pair with a hardware wallet device (e.g. Ledger or Tangem), letting you keep your private keys isolated on the device while still using a familiar software interface.",
  },
  multisig: {
    label: "Multisig",
    description:
      "Some wallets support multi-signature transactions, which require more than one key to authorize a transfer. This can be used to divide responsibility across multiple parties or add an extra layer of protection for high-value holdings.",
    experiencedOnly: true,
  },
} as const satisfies Record<
  WalletFeature,
  {
    label: string;
    description: string;
    experiencedOnly?: boolean;
  }
>;

export const walletFeatures: Array<{
  id: WalletFeature;
  label: string;
  description: string;
  experiencedOnly?: boolean;
}> = WALLET_FEATURE_IDS.map((id) => ({
  id,
  ...featureMetadata[id],
}));
