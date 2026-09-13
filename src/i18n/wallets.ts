import spanishWalletSummariesSource from "../../messages/es/wallets.json" with { type: "json" };
import frenchWalletSummariesSource from "../../messages/fr/wallets.json" with { type: "json" };
import chineseWalletSummariesSource from "../../messages/zh-CN/wallets.json" with { type: "json" };
import russianWalletSummariesSource from "../../messages/ru/wallets.json" with { type: "json" };
import germanWalletSummariesSource from "../../messages/de/wallets.json" with { type: "json" };
import indonesianWalletSummariesSource from "../../messages/id-ID/wallets.json" with { type: "json" };
import brazilianPortugueseWalletSummariesSource from "../../messages/pt-BR/wallets.json" with { type: "json" };
import japaneseWalletSummariesSource from "../../messages/ja/wallets.json" with { type: "json" };
import koreanWalletSummariesSource from "../../messages/ko/wallets.json" with { type: "json" };

import type { KaspaWallet } from "../app/hodl/wallet-finder/types.ts";
import { kaspaWallets, type WalletId } from "../data/wallets.ts";
import type { Locale } from "./locale-registry.ts";

type WalletCopy = {
  summary: string;
  compatibilityNote?: string;
};
type WalletCatalog = Readonly<Record<WalletId, WalletCopy>>;

const walletCatalogs = {
  es: spanishWalletSummariesSource,
  fr: frenchWalletSummariesSource,
  "zh-CN": chineseWalletSummariesSource,
  ru: russianWalletSummariesSource,
  de: germanWalletSummariesSource,
  "id-ID": indonesianWalletSummariesSource,
  "pt-BR": brazilianPortugueseWalletSummariesSource,
  ja: japaneseWalletSummariesSource,
  ko: koreanWalletSummariesSource,
} satisfies Record<Exclude<Locale, "en">, WalletCatalog>;

export function localizeWalletCatalog(
  locale: Locale,
  catalog: Readonly<Record<string, unknown>>,
): KaspaWallet[] {
  const walletIds = kaspaWallets.map((wallet) => wallet.id).sort();
  const catalogIds = Object.keys(catalog).sort();
  if (JSON.stringify(catalogIds) !== JSON.stringify(walletIds)) {
    throw new Error(`Wallet copy for ${locale} must exactly match wallet IDs`);
  }

  return kaspaWallets.map((wallet) => {
    const copy = catalog[wallet.id];
    if (typeof copy !== "object" || copy === null || Array.isArray(copy)) {
      throw new Error(
        `Wallet copy for ${wallet.id}:${locale} must be an object`,
      );
    }
    const expectedKeys = wallet.compatibility
      ? ["compatibilityNote", "summary"]
      : ["summary"];
    if (
      JSON.stringify(Object.keys(copy).sort()) !== JSON.stringify(expectedKeys)
    ) {
      throw new Error(
        `Wallet copy for ${wallet.id}:${locale} must contain exactly ${expectedKeys.join(", ")}`,
      );
    }
    if (
      !("summary" in copy) ||
      typeof copy.summary !== "string" ||
      !copy.summary.trim()
    ) {
      throw new Error(
        `Wallet summary for ${wallet.id}:${locale} must be a non-empty string`,
      );
    }
    if (!wallet.compatibility) return { ...wallet, summary: copy.summary };
    if (
      !("compatibilityNote" in copy) ||
      typeof copy.compatibilityNote !== "string" ||
      !copy.compatibilityNote.trim()
    ) {
      throw new Error(
        `Wallet compatibility note for ${wallet.id}:${locale} must be a non-empty string`,
      );
    }
    return {
      ...wallet,
      summary: copy.summary,
      compatibility: { ...wallet.compatibility, note: copy.compatibilityNote },
    };
  });
}

export function getLocalizedWallets(locale: Locale): KaspaWallet[] {
  if (locale === "en") return kaspaWallets.map((wallet) => ({ ...wallet }));
  return localizeWalletCatalog(locale, walletCatalogs[locale]);
}
