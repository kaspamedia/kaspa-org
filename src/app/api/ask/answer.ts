const ANCHOR_TAG_PATTERN = /<a\s+([^>]*?)>([\s\S]*?)<\/a>/gi;
const HREF_ATTRIBUTE_PATTERN = /\bhref\s*=\s*(["'])(.*?)\1/i;
const HTML_ENTITY_PATTERN = /&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi;

function isValidCodePoint(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 0x10ffff;
}

function decodeHtmlEntities(value: string): string {
  return value.replace(HTML_ENTITY_PATTERN, (entity, name: string) => {
    const normalized = name.toLowerCase();

    if (normalized.startsWith("#x")) {
      const codePoint = Number.parseInt(normalized.slice(2), 16);
      return isValidCodePoint(codePoint)
        ? String.fromCodePoint(codePoint)
        : entity;
    }

    if (normalized.startsWith("#")) {
      const codePoint = Number.parseInt(normalized.slice(1), 10);
      return isValidCodePoint(codePoint)
        ? String.fromCodePoint(codePoint)
        : entity;
    }

    switch (normalized) {
      case "amp":
        return "&";
      case "lt":
        return "<";
      case "gt":
        return ">";
      case "quot":
        return '"';
      case "apos":
        return "'";
      case "nbsp":
        return " ";
      default:
        return entity;
    }
  });
}

function escapeMarkdownLinkText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]");
}

function formatMarkdownLink(attributes: string, labelHtml: string): string {
  const href = HREF_ATTRIBUTE_PATTERN.exec(attributes)?.[2];
  const label = decodeHtmlEntities(labelHtml.replace(/<[^>]*>/g, ""))
    .replace(/\s+/g, " ")
    .trim();

  if (!href || !label) {
    return label;
  }

  try {
    const url = new URL(decodeHtmlEntities(href));
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return label;
    }

    return `[${escapeMarkdownLinkText(label)}](${url.toString()})`;
  } catch {
    return label;
  }
}

export function normalizeAskAnswer(answer: string): string {
  return answer.replace(
    ANCHOR_TAG_PATTERN,
    (_match, attributes: string, labelHtml: string) =>
      formatMarkdownLink(attributes, labelHtml),
  );
}
