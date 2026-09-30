"use client";

import { site } from "@/config/site";
import { describeStatus, useNetworkStatus } from "@/hooks/useNetworkStatus";

/*
  The bottom-right status panel. NETWORK is the chain Kredit is deployed on;
  STATUS is a live reachability probe of its public indexer.
*/
export function NetworkStatusCard() {
  const status = describeStatus(useNetworkStatus());

  return (
    <aside className="w-full rounded-[clamp(0.75rem,1.17vw,1.125rem)] border border-hair bg-raised p-[clamp(1.125rem,1.63vw,1.5625rem)] lg:w-[clamp(15rem,20.2vw,19.375rem)]">
      <p className="text-label leading-none font-medium tracking-[0.13em] text-faint uppercase">
        Network
      </p>
      <div className="mt-[clamp(0.5rem,0.98vw,0.9375rem)] flex items-center justify-between gap-4">
        <span className="text-value truncate text-chalk">{site.network}</span>
        <span aria-hidden="true" className="text-value size-[0.62em] shrink-0 rounded-full bg-violet" />
      </div>

      <hr className="my-[clamp(0.875rem,1.37vw,1.3125rem)] border-0 border-t border-hair-soft" />

      <p className="text-label leading-none font-medium tracking-[0.13em] text-faint uppercase">
        Status
      </p>
      <div
        className="mt-[clamp(0.5rem,0.98vw,0.9375rem)] flex items-center gap-[0.7em]"
        title={status.title}
      >
        <span aria-hidden="true" className={`text-value size-[0.5em] shrink-0 rounded-full ${status.dot}`} />
        <span className={`text-value ${status.tone}`}>{status.label}</span>
      </div>
    </aside>
  );
}
