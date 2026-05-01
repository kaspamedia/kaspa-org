import type { KaspaNodeState } from "../kaspaWorkerMessages";
import { LiveDot, LoadingDot } from "../supplyVisuals";

type SupplyConnectionStatusProps = {
  node: KaspaNodeState;
};

export function SupplyConnectionStatus({
  node,
}: SupplyConnectionStatusProps): React.JSX.Element {
  return (
    <div className="text-muted mb-5 flex items-center gap-2 font-mono text-xs">
      {node.isConnected ? (
        <>
          <LiveDot />
          <span>Connected to {node.nodeUrl}</span>
        </>
      ) : node.error ? (
        <span className="text-red-400">Connection error</span>
      ) : (
        <>
          <LoadingDot />
          <span>Connecting to Kaspa network...</span>
        </>
      )}
    </div>
  );
}
