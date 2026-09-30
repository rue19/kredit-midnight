"use client";

import { useEffect, useState } from "react";

const CONTRACT_ADDRESS_KEY = "kredit-contract-address";

/* The contract this browser deployed, else the one configured for the site. */
export function useContractAddress(): string | null {
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(CONTRACT_ADDRESS_KEY);
    } catch {
      /* storage unavailable */
    }
    // localStorage cannot be read during render without risking a hydration mismatch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAddress(saved || process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || null);
  }, []);

  return address;
}

export function truncateAddress(value: string, head = 8, tail = 6): string {
  return value.length <= head + tail + 1 ? value : `${value.slice(0, head)}…${value.slice(-tail)}`;
}
