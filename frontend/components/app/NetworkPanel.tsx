"use client";

import { site } from "@/config/site";
import { describeStatus, useNetworkStatus } from "@/hooks/useNetworkStatus";
import { truncateAddress, useContractAddress } from "@/hooks/useContractAddress";

/*
  Network state, at the foot of the rail: the chain, whether its indexer
  answered, and which Kredit contract this browser talks to.
*/
export function NetworkPanel({ className = "" }: { className?: string }) {
  const status = describeStatus(useNetworkStatus());
  const contract = useContractAddress();

  return (
    <div className={className}>
      <p className="text-label leading-none font-medium tracking-[0.13em] text-faint uppercase">
        Network
      </p>

      <div className="mt-3 flex items-center justify-between gap-3">
        <span className="truncate text-[0.9375rem] text-chalk">{site.network}</span>
        <span aria-hidden="true" className="size-[6px] shrink-0 rounded-full bg-violet" />
      </div>

      <div className="mt-3 flex items-center gap-2" title={status.title}>
        <span aria-hidden="true" className={`size-[5px] shrink-0 rounded-full ${status.dot}`} />
        <span className={`text-[0.75rem] ${status.tone}`}>{status.label}</span>
      </div>

      <p className="mt-2 truncate text-[0.75rem] leading-snug text-dim" title={contract ?? undefined}>
        {contract ? (
          <>
            Contract <span className="font-mono">{truncateAddress(contract, 6, 4)}</span>
          </>
        ) : (
          "No contract deployed"
        )}
      </p>
    </div>
  );
}
