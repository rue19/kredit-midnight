"use client";

import { useWallet } from "@/lib/wallet";
import { useMounted } from "@/hooks/useMounted";
import { truncateAddress } from "@/hooks/useContractAddress";
import { ArrowRight, Disconnect } from "@/components/icons";

/*
  The shell's wallet control: quieter than the landing page's filled cream
  CTA, because inside the product the wallet is a status readout.
*/
export function WalletControl({ className = "" }: { className?: string }) {
  const mounted = useMounted();
  const { isConnected, isConnecting, address, connect, disconnect, error } = useWallet();
  const connected = mounted && isConnected && !!address;

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={connected ? disconnect : connect}
        disabled={!mounted || isConnecting}
        aria-label={connected ? `Disconnect wallet ${address}` : "Connect wallet"}
        className="flex cursor-pointer items-center gap-3 rounded-full border border-hair px-4 py-2 text-[0.8125rem] leading-none whitespace-nowrap transition-colors duration-300 hover:border-cream disabled:cursor-default"
      >
        {connected ? (
          <>
            <span className="font-mono text-chalk">{truncateAddress(address!)}</span>
            <Disconnect className="size-[0.95rem] shrink-0 text-faint" />
          </>
        ) : (
          <>
            <span className="text-chalk">{isConnecting ? "Connecting…" : "Connect wallet"}</span>
            {isConnecting ? null : <ArrowRight className="size-[0.95rem] shrink-0 text-faint" />}
          </>
        )}
      </button>

      {error ? (
        <p className="z-20 mt-2 max-w-[20rem] text-[0.75rem] leading-snug text-amber sm:absolute sm:top-full sm:right-0 sm:mt-2 sm:text-right">
          {error}
        </p>
      ) : null}
    </div>
  );
}
