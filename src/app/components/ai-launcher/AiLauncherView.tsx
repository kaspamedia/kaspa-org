import type { FormEvent, RefObject } from "react";

import type { Message, PanelState, ProviderLink } from "./types";
import { AiLauncherCollapsedBar } from "./view/AiLauncherCollapsedBar";
import { AiLauncherHeader } from "./view/AiLauncherHeader";
import { AiLauncherInputBar } from "./view/AiLauncherInputBar";
import { AiLauncherMessages } from "./view/AiLauncherMessages";
import { AiLauncherProviderLinks } from "./view/AiLauncherProviderLinks";
import { AiLauncherWelcome } from "./view/AiLauncherWelcome";

type AiLauncherViewProps = {
  copiedMessageId: number | null;
  input: string;
  inputRef: RefObject<HTMLInputElement | null>;
  isOpen: boolean;
  isTyping: boolean;
  loadingMessage: string;
  messages: Message[];
  messagesEndRef: RefObject<HTMLDivElement | null>;
  panelHeight: string;
  panelState: PanelState;
  providerLinks: readonly ProviderLink[];
  renderPanel: boolean;
  onChangeInput: (value: string) => void;
  onClose: () => void;
  onCopy: (messageId: number, text: string) => Promise<void>;
  onOpen: () => void;
  onSendMessage: (text: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleSize: () => void;
};

export function AiLauncherView({
  copiedMessageId,
  input,
  inputRef,
  isOpen,
  isTyping,
  loadingMessage,
  messages,
  messagesEndRef,
  panelHeight,
  panelState,
  providerLinks,
  renderPanel,
  onChangeInput,
  onClose,
  onCopy,
  onOpen,
  onSendMessage,
  onSubmit,
  onToggleSize,
}: AiLauncherViewProps): React.JSX.Element {
  return (
    <>
      {renderPanel ? (
        <div
          className={`fixed inset-0 z-40 transition-opacity duration-500 ${
            isOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
          style={{ background: "rgba(0, 0, 0, 0.4)" }}
          onClick={onClose}
        />
      ) : null}

      <div
        className="fixed right-0 left-0 z-50"
        style={{ bottom: "var(--keyboard-inset, 0px)" }}
      >
        {renderPanel ? (
          <div
            inert={!isOpen}
            className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              height: isOpen ? panelHeight : "0px",
              pointerEvents: isOpen ? "auto" : "none",
            }}
          >
            <div
              className="border-subtle flex flex-col overflow-hidden border-t"
              style={{
                background: "var(--surface)",
                height: isOpen ? panelHeight : "0px",
              }}
            >
              <AiLauncherHeader
                onClose={onClose}
                onToggleSize={onToggleSize}
                panelState={panelState}
              />

              <div className="flex-1 overflow-y-auto overscroll-contain px-5 md:px-8 lg:px-10">
                {messages.length === 0 ? (
                  <AiLauncherWelcome
                    onSendMessage={onSendMessage}
                    providerLinks={providerLinks}
                  />
                ) : (
                  <AiLauncherMessages
                    copiedMessageId={copiedMessageId}
                    isTyping={isTyping}
                    loadingMessage={loadingMessage}
                    messages={messages}
                    messagesEndRef={messagesEndRef}
                    onCopy={onCopy}
                  />
                )}
              </div>

              {messages.length > 0 ? (
                <AiLauncherProviderLinks providerLinks={providerLinks} />
              ) : null}

              <AiLauncherInputBar
                input={input}
                inputRef={inputRef}
                isTyping={isTyping}
                onChangeInput={onChangeInput}
                onSubmit={onSubmit}
              />
            </div>
          </div>
        ) : (
          <AiLauncherCollapsedBar onOpen={onOpen} />
        )}
      </div>
    </>
  );
}
