export type Message = {
  id: number;
  role: "user" | "ai";
  text: string;
};

export type PanelState = "closed" | "mid" | "full";

export type ChatRequestMessage = {
  role: "assistant" | "user";
  content: string;
};

export type ProviderLink = {
  href: string;
  label: string;
};
