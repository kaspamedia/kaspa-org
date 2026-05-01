import { MAX_MESSAGE_COUNT } from "./config";

export type AskMessage = {
  role: "assistant" | "system" | "user";
  content: string;
};

export type AskRequestBody = {
  messages?: unknown;
  question?: unknown;
};

function normalizeMessages(input: unknown): AskMessage[] {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .filter((message): message is Record<string, unknown> => {
      return !!message && typeof message === "object";
    })
    .map((message) => {
      const role = message.role;
      const content = message.content;

      if (
        (role !== "assistant" && role !== "system" && role !== "user") ||
        typeof content !== "string"
      ) {
        return null;
      }

      const trimmed = content.trim();
      if (!trimmed) {
        return null;
      }

      return {
        role,
        content: trimmed,
      };
    })
    .filter((message): message is AskMessage => message !== null)
    .slice(-MAX_MESSAGE_COUNT);
}

export function getAskQuestion(body: AskRequestBody): string | null {
  if (typeof body.question === "string") {
    const question = body.question.trim();
    if (question) {
      return question;
    }
  }

  return (
    normalizeMessages(body.messages)
      .toReversed()
      .find((message) => message.role === "user")?.content ?? null
  );
}
