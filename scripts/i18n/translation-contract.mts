import {
  isLiteralElement,
  isPluralElement,
  isSelectElement,
  isTagElement,
  parse as parseIcuMessage,
  type MessageFormatElement,
} from "@formatjs/icu-messageformat-parser";

import { flattenCatalog, type MessageCatalog } from "./catalog-contract.mts";

type PreferredTermRule = readonly [pattern: RegExp, preferred: string];

export const SHARED_PROTECTED_TERMS = [
  "Kaspa",
  "KAS",
  "blockDAG",
  "GHOSTDAG",
  "DAGKnight",
  "PHANTOM",
  "SPECTRE",
  "Toccata",
  "Crescendo",
  "rusty-kaspa",
  "Silverscript",
  "OP_CAT",
  "TN12",
  "UTXO",
  "BPS",
  "RTD",
  "BFT",
  "ZK",
  "HODL",
  "BUIDL",
  "cypherpunk",
  "Bitcoin",
  "Ethereum",
  "GitHub",
  "CoinDesk",
  "Golang",
  "Rust",
] as const;

type ProtectedTerm = (typeof SHARED_PROTECTED_TERMS)[number];
type ProtectedTermBoundary = "latin" | "unicode";
type TranslationPolicy = {
  readonly allowedUnchangedKeys?: readonly string[];
  readonly preferredTerms?: readonly PreferredTermRule[];
  readonly protectedTermBoundary?: ProtectedTermBoundary;
};
type ProtectedTermMatchers = {
  readonly source: RegExp;
  readonly target: RegExp;
};

const caseInsensitiveProtectedSourceTerms = new Set<ProtectedTerm>([
  "Crescendo",
]);

// Locale policies contain only the legitimate exceptions for that language.
// The shared checks apply automatically when a new locale has no policy yet.
const translationPolicies = {
  es: {
    allowedUnchangedKeys: [
      "assets.formats.png",
      "assets.formats.svg",
      "assets.groups.lockup",
      "build.access.groups.docs.links.kips",
      "build.access.groups.docs.links.qa",
      "build.access.groups.node.links.rustyKaspa",
      "build.artifacts.utxo.error",
      "build.developments.cards.kips.title",
      "build.developments.cards.python.label",
      "build.developments.cards.python.title",
      "build.developments.cards.research.title",
      "build.developments.cards.silverscript.title",
      "build.developments.cards.vprogs.title",
      "build.help.links.discord.eyebrow",
      "build.help.links.discord.title",
      "build.help.links.github.title",
      "build.help.links.qa.title",
      "build.runNode.dockerHub",
      "build.start.release.version",
      "build.terms.daa",
      "build.terms.dag",
      "build.terms.utxo",
      "build.tooling.community.cards.dnsSeeder.title",
      "build.tooling.community.cards.indexer.title",
      "build.tooling.community.cards.kaspaJs.title",
      "build.tooling.community.cards.khost.title",
      "build.tooling.emerging.python.status",
      "build.tooling.emerging.python.title",
      "build.tooling.stable.rustyKaspa.title",
      "build.tooling.stable.wasm.title",
      "build.tryLive.examples.blockAdded.runtime",
      "build.tryLive.examples.daaChanged.mobileTabLabel",
      "build.tryLive.examples.daaChanged.runtime",
      "build.tryLive.examples.dagInfo.mobileTabLabel",
      "build.tryLive.examples.dagInfo.runtime",
      "build.tryLive.examples.serverInfo.runtime",
      "build.tryLive.examples.utxoContext.mobileTabLabel",
      "build.tryLive.examples.utxoContext.runtime",
      "errors.page.code",
      "hodl.help.discord",
      "hodl.navigation.current",
      "hodl.start.heading",
      "hodl.walletFinder.actions.app_store",
      "hodl.walletFinder.actions.google_play",
      "hodl.walletFinder.criteria.control.label",
      "hodl.walletFinder.features.multisig.label",
      "hodl.walletFinder.features.two_fa.label",
      "hodl.walletFinder.guidance.hardware.shortTitle",
      "hodl.walletFinder.operatingSystems.android",
      "hodl.walletFinder.operatingSystems.hardware",
      "hodl.walletFinder.operatingSystems.ios",
      "hodl.walletFinder.operatingSystems.linux",
      "hodl.walletFinder.operatingSystems.mac",
      "hodl.walletFinder.operatingSystems.windows",
      "hodl.walletFinder.ratings.aria",
      "hodl.walletFinder.ratings.notApplicableCompact",
      "hodl.walletFinder.ratings.tooltipHeading",
      "home.proof.supply.comparison.unit",
      "home.proof.supply.timeline.checkpoint.date",
      "home.proof.supply.timeline.chromatic.date",
      "home.proof.supply.timeline.crescendo.date",
      "home.proof.supply.timeline.crescendo.label",
      "home.proof.supply.timeline.genesis.date",
      "home.proof.supply.timeline.preDeflationary.date",
      "lore.metadata.title",
      "shared.ai.launcher.beta",
      "shared.ai.providers.chatgpt",
      "shared.ai.providers.claude",
      "shared.ai.providers.perplexity",
      "shared.footer.links.github",
      "shared.footer.links.x",
      "shared.navigation.links.build",
      "shared.navigation.links.dagviz",
      "shared.navigation.links.hodl",
      "shared.navigation.links.lore",
      "shared.navigation.links.think",
    ],
    preferredTerms: [
      [/(?:^|\W)mainnet(?:$|\W)/iu, "red principal"],
      [/(?:^|\W)testnet(?:$|\W)/iu, "red de pruebas"],
      [/(?:^|\W)hard[- ]?fork(?:$|\W)/iu, "bifurcación dura"],
      [/(?:^|\W)on-chain(?:$|\W)/iu, "en cadena"],
      [/(?:^|\W)off-chain(?:$|\W)/iu, "fuera de la cadena"],
      [/(?:^|\W)proof[- ]of[- ]work(?:$|\W)/iu, "prueba de trabajo"],
      [/(?:^|\W)fair[- ]launch(?:ed)?(?:$|\W)/iu, "lanzamiento justo"],
      [/(?:^|\W)self-custody(?:$|\W)/iu, "autocustodia"],
      [/(?:^|\W)hashrate(?:$|\W)/iu, "tasa de hash"],
      [/(?:^|\W)finality(?:$|\W)/iu, "finalidad"],
      [/(?:^|\W)bindings?(?:$|\W)/iu, "enlaces"],
      [/(?:^|\W)stack(?:$|\W)/iu, "pila tecnológica"],
    ],
  },
  "zh-CN": { protectedTermBoundary: "latin" },
  ja: { protectedTermBoundary: "latin" },
  ko: { protectedTermBoundary: "latin" },
} as const satisfies Readonly<Record<string, TranslationPolicy>>;

const emptyPolicy = {} satisfies TranslationPolicy;
const prohibitedZeroWidthCharacter = /[\u200B-\u200D\u2060\uFEFF]/u;

function getTranslationPolicy(locale: string): TranslationPolicy {
  return (
    translationPolicies[locale as keyof typeof translationPolicies] ??
    emptyPolicy
  );
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function protectedTermExpression(
  term: ProtectedTerm,
  boundary: ProtectedTermBoundary,
): string {
  const suffix = ["Kaspa", "Bitcoin", "Ethereum", "cypherpunk"].includes(term)
    ? "s?"
    : "";
  const wordCharacter = boundary === "latin" ? "A-Za-z0-9_" : "\\p{L}\\p{N}_";
  return `(?<![${wordCharacter}])${escapeRegExp(term)}${suffix}(?![${wordCharacter}])`;
}

function createProtectedTermMatchers(
  boundary: ProtectedTermBoundary,
): ReadonlyMap<ProtectedTerm, ProtectedTermMatchers> {
  return new Map(
    SHARED_PROTECTED_TERMS.map((term) => {
      const expression = protectedTermExpression(term, boundary);
      const sourceExpression = protectedTermExpression(term, "unicode");
      const sourceFlags = caseInsensitiveProtectedSourceTerms.has(term)
        ? "giu"
        : "gu";
      return [
        term,
        {
          source: new RegExp(sourceExpression, sourceFlags),
          target: new RegExp(expression, term === "cypherpunk" ? "giu" : "gu"),
        },
      ];
    }),
  );
}

const protectedTermMatchers = {
  latin: createProtectedTermMatchers("latin"),
  unicode: createProtectedTermMatchers("unicode"),
} as const satisfies Readonly<
  Record<
    ProtectedTermBoundary,
    ReadonlyMap<ProtectedTerm, ProtectedTermMatchers>
  >
>;

function countProtectedTerm(value: string, pattern: RegExp): number {
  return value.match(pattern)?.length ?? 0;
}

function collectVisibleMessageText(
  elements: readonly MessageFormatElement[],
  fragments: string[],
): void {
  for (const element of elements) {
    if (isLiteralElement(element)) {
      fragments.push(element.value);
    } else if (isTagElement(element)) {
      collectVisibleMessageText(element.children, fragments);
    } else if (isPluralElement(element) || isSelectElement(element)) {
      for (const option of Object.values(element.options)) {
        collectVisibleMessageText(option.value, fragments);
      }
    }
  }
}

function visibleMessageText(value: string): string {
  try {
    const fragments: string[] = [];
    collectVisibleMessageText(parseIcuMessage(value), fragments);
    return fragments.join(" ");
  } catch {
    return value;
  }
}

function containsOnlyMessageSyntax(value: string): boolean {
  const withoutSimpleArguments = value.replace(/\{[^{}]+\}/gu, "");
  return !/[{}\p{L}\p{N}]/u.test(withoutSimpleArguments);
}

export function isUnchangedMessageAllowed(
  locale: string,
  fullKey: string,
  sourceValue: string,
): boolean {
  if (containsOnlyMessageSyntax(sourceValue)) return true;
  return (
    getTranslationPolicy(locale).allowedUnchangedKeys?.includes(fullKey) ??
    false
  );
}

export function validateTranslationCatalogContract(
  locale: string,
  namespace: string,
  sourceCatalog: MessageCatalog,
  targetCatalog: MessageCatalog,
): string[] {
  const errors: string[] = [];
  const source = flattenCatalog(sourceCatalog);
  const target = flattenCatalog(targetCatalog);
  const policy = getTranslationPolicy(locale);

  for (const [key, sourceValue] of source) {
    const fullKey = `${namespace}.${key}`;
    const targetValue = target.get(key);
    if (targetValue === undefined) continue;

    const zeroWidthMatch = targetValue.match(prohibitedZeroWidthCharacter);
    if (zeroWidthMatch) {
      errors.push(
        `${fullKey} contains prohibited zero-width character U+${zeroWidthMatch[0]
          .codePointAt(0)!
          .toString(16)
          .toUpperCase()
          .padStart(4, "0")}`,
      );
    }

    if (
      sourceValue === targetValue &&
      !isUnchangedMessageAllowed(locale, fullKey, sourceValue)
    ) {
      errors.push(
        `${fullKey} is unchanged from English without an explicit ${locale} policy exception`,
      );
    }

    const visibleSourceValue = visibleMessageText(sourceValue);
    const visibleTargetValue = visibleMessageText(targetValue);
    const matchersForLocale =
      protectedTermMatchers[policy.protectedTermBoundary ?? "unicode"];
    for (const term of SHARED_PROTECTED_TERMS) {
      const matchers = matchersForLocale.get(term);
      if (!matchers) continue;
      const sourceCount = countProtectedTerm(
        visibleSourceValue,
        matchers.source,
      );
      const targetCount = countProtectedTerm(
        visibleTargetValue,
        matchers.target,
      );
      if (sourceCount > 0 && targetCount === 0) {
        errors.push(
          `${fullKey} removes protected term ${term} from translated copy`,
        );
      }
    }

    for (const [pattern, preferred] of policy.preferredTerms ?? []) {
      pattern.lastIndex = 0;
      if (pattern.test(targetValue)) {
        errors.push(
          `${fullKey} retains prohibited English terminology; use ${preferred}`,
        );
      }
    }
  }

  for (const fullKey of policy.allowedUnchangedKeys ?? []) {
    if (!fullKey.startsWith(`${namespace}.`)) continue;
    const key = fullKey.slice(namespace.length + 1);
    const sourceValue = source.get(key);
    if (sourceValue === undefined) {
      errors.push(`${fullKey} policy exception does not exist in English`);
      continue;
    }
    const targetValue = target.get(key);
    if (targetValue !== undefined && targetValue !== sourceValue) {
      errors.push(`${fullKey} has a stale unchanged-message policy exception`);
    }
  }

  return errors;
}
