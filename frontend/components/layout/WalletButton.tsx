"use client";

import { useWallet } from "@/lib/wallet";
import { useMounted } from "@/hooks/useMounted";
import { truncateAddress } from "@/hooks/useContractAddress";
import { ArrowRight } from "@/components/icons";

/* The landing navbar's wallet entry point: the filled cream pill. */
export function WalletButton() {
  const mounted = useMounted();
  const { isConnected, isConnecting, address, connect, disconnect, error } = useWallet();
  const connected = mounted && isConnected && !!address;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={connected ? disconnect : connect}
        disabled={!mounted || isConnecting}
        aria-label={connected ? `Disconnect wallet ${address}` : "Connect wallet"}
        className="text-nav flex shrink-0 cursor-pointer items-center rounded-full bg-cream-bright py-[0.92em] pr-[1.55em] pl-[1.55em] leading-none font-medium whitespace-nowrap text-ground transition-opacity duration-300 hover:opacity-90 disabled:cursor-default"
      >
        {connected ? (
          <span className="font-mono text-[0.92em]">{truncateAddress(address!)}</span>
        ) : isConnecting ? (
          <span>Connecting…</span>
        ) : (
          <>
            <span className="sm:hidden">Connect</span>
            <span className="hidden sm:inline">Connect wallet</span>
          </>
        )}
        <ArrowRight className="ml-[1.5em] h-[1.15em] w-[1.15em]" />
      </button>
      {error ? (
        <p className="text-fine absolute top-full right-0 z-20 mt-3 w-[min(22rem,80vw)] text-right text-amber">
          {error}
        </p>
      ) : null}
    </div>
  );
}
