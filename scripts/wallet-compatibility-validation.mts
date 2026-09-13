export function validateWalletCompatibility(
  value: unknown,
  maxNoteLength?: number,
): string[] {
  if (value === undefined) return [];
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return ["must be an object containing note and link"];
  }

  const errors: string[] = [];
  if (Object.keys(value).sort().join(",") !== "link,note") {
    errors.push("must contain exactly note and link");
  }
  if (
    !("note" in value) ||
    typeof value.note !== "string" ||
    !value.note.trim()
  ) {
    errors.push("note must be a non-empty string");
  } else {
    if (maxNoteLength !== undefined && value.note.length > maxNoteLength) {
      errors.push(`note must be ${maxNoteLength} characters or fewer`);
    }
    if (/[\r\n]/.test(value.note)) errors.push("note must be a single line");
    if (/https?:\/\/|www\./i.test(value.note))
      errors.push("put the URL in link, not note");
  }
  try {
    if (!("link" in value) || typeof value.link !== "string") throw new Error();
    const url = new URL(value.link);
    if (
      url.protocol !== "https:" ||
      !url.hostname ||
      url.username ||
      url.password
    ) {
      throw new Error();
    }
  } catch {
    errors.push("link must be an absolute HTTPS URL without credentials");
  }
  return errors;
}
