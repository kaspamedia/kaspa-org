export interface KaspaNodeState {
  circulatingSompi: bigint | null;
  daaScore: bigint | null;
  blockCount: bigint | null;
  isConnected: boolean;
  nodeUrl: string | null;
  error: string | null;
}

export const initialKaspaNodeState: KaspaNodeState = {
  circulatingSompi: null,
  daaScore: null,
  blockCount: null,
  isConnected: false,
  nodeUrl: null,
  error: null,
};

export const WORKER_MESSAGE_SOURCE = "kaspa-worker";
export const CONNECT_MESSAGE_TYPE = "kaspa-worker:connect";

export type WorkerMessage =
  | {
      source: typeof WORKER_MESSAGE_SOURCE;
      type: "connected";
      url: string | null;
    }
  | {
      source: typeof WORKER_MESSAGE_SOURCE;
      type: "data";
      supply: string;
      daaScore: string;
      blockCount: string;
    }
  | {
      source: typeof WORKER_MESSAGE_SOURCE;
      type: "disconnected";
    }
  | {
      source: typeof WORKER_MESSAGE_SOURCE;
      type: "error";
      error: string;
    };

export function isWorkerMessage(data: unknown): data is WorkerMessage {
  if (!data || typeof data !== "object") {
    return false;
  }

  const candidate = data as Partial<WorkerMessage>;
  return (
    candidate.source === WORKER_MESSAGE_SOURCE &&
    typeof candidate.type === "string"
  );
}
