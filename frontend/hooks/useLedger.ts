"use client";

import { useCallback, useEffect, useState } from "react";

export type LedgerSummary = {
  credentials: number;
  issuers: number;
  revoked: number;
  admin: string;
};

export type LedgerState =
  | { status: "none" }
  | { status: "loading" }
  | { status: "ready"; value: LedgerSummary }
  | { status: "error"; message: string };

/* Live public ledger of the contract, polled and refreshable after a transaction. */
export function useLedger(address: string | null, intervalMs = 20_000) {
  const [state, setState] = useState<LedgerState>({ status: "loading" });
  const [tick, setTick] = useState(0);
  const refresh = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (!address) return;
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/ledger?address=${address}`, { cache: "no-store" });
        const json = (await res.json()) as { ok: boolean; error?: string } & Partial<LedgerSummary>;
        if (cancelled) return;
        setState(
          json.ok
            ? { status: "ready", value: json as LedgerSummary }
            : { status: "error", message: json.error ?? "Could not read the contract" },
        );
      } catch {
        if (!cancelled) setState({ status: "error", message: "Could not reach the indexer" });
      }
    }

    load();
    const timer = setInterval(load, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [address, intervalMs, tick]);

  return { state: address ? state : ({ status: "none" } as LedgerState), refresh };
}
