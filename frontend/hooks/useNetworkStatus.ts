"use client";

import { network } from "@/config/network";
import { useEffect, useState } from "react";

export type NetworkStatus =
  | { state: "checking" }
  | { state: "reachable"; height: number }
  | { state: "unreachable" };

/* Polls the network's indexer (via /api/network) for the latest block. */
export function useNetworkStatus(intervalMs = 30_000): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({ state: "checking" });

  useEffect(() => {
    let cancelled = false;

    async function probe() {
      try {
        const res = await fetch("/api/network", { cache: "no-store" });
        const json = (await res.json()) as { ok: boolean; height?: number };
        if (cancelled) return;
        setStatus(json.ok && json.height !== undefined ? { state: "reachable", height: json.height } : { state: "unreachable" });
      } catch {
        if (!cancelled) setStatus({ state: "unreachable" });
      }
    }

    probe();
    const timer = setInterval(probe, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [intervalMs]);

  return status;
}

export function describeStatus(status: NetworkStatus) {
  switch (status.state) {
    case "checking":
      return { label: "Checking", tone: "text-faint", dot: "bg-faint pulse", title: `Checking the ${network.label} indexer` };
    case "unreachable":
      return { label: "Unreachable", tone: "text-amber", dot: "bg-amber", title: `The ${network.label} indexer did not respond` };
    case "reachable":
      return {
        label: "Indexer reachable",
        tone: "text-chalk",
        dot: "bg-signal",
        title: `Latest block ${status.height.toLocaleString()}`,
      };
  }
}
