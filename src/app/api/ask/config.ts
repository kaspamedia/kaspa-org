export const MAX_MESSAGE_COUNT = 5;
export const ASK_MODE = "knowledge";
const DEFAULT_ASK_API_URL = "https://kaspa.news/api/ask";

export function getAskApiKey(): string | undefined {
  return process.env.KASPA_NEWS_ASK_API_KEY;
}

export function getAskApiUrl(): string {
  return process.env.KASPA_NEWS_ASK_API_URL ?? DEFAULT_ASK_API_URL;
}
