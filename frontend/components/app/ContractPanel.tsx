"use client";

import { network } from "@/config/network";
import { useState } from "react";
import type { LedgerState } from "@/hooks/useLedger";
import { ProofOrb, type OrbState } from "@/components/visual/ProofOrb";

/*
  The contract this page talks to, read live from the network's indexer, with
  the commitment orb beside it reacting to whatever the page is doing.
*/
export function ContractPanel({
  address,
  ledger,
  orb,
  emptyNote = "No contract deployed yet. Deploy the Kredit contract from the issuer console first.",
}: {
  address: string | null;
  ledger: LedgerState;
  orb: OrbState;
  emptyNote?: string;
}) {
  return (
    <section className="mt-(--page-pad) grid items-center gap-8 border-t border-hair-soft pt-(--row-pad) lg:grid-cols-[minmax(0,1fr)_minmax(0,19rem)] lg:gap-12">
      <div className="min-w-0">
        <p className="text-label leading-none font-medium tracking-[0.13em] text-faint uppercase">
          Contract
        </p>

        {address ? (
          <>
            <div className="mt-5 flex items-start gap-3">
              <p className="min-w-0 font-mono text-[0.9375rem] leading-relaxed break-all text-chalk">{address}</p>
              <CopyButton value={address} />
            </div>

            <dl className="mt-8 grid grid-cols-3 gap-6 border-t border-hair-soft pt-6">
              <Stat label="Credentials" ledger={ledger} pick={(v) => v.credentials} />
              <Stat label="Issuers" ledger={ledger} pick={(v) => v.issuers} />
              <Stat label="Revoked" ledger={ledger} pick={(v) => v.revoked} />
            </dl>

            <p className="mt-5 flex items-center gap-2 text-[0.75rem] text-dim">
              <span
                aria-hidden="true"
                className={`size-[5px] rounded-full ${
                  ledger.status === "ready" ? "bg-signal" : ledger.status === "error" ? "bg-amber" : "bg-faint pulse"
                }`}
              />
              {ledger.status === "ready"
                ? `Live from the ${network.label} indexer`
                : ledger.status === "error"
                  ? ledger.message
                  : "Reading public ledger…"}
            </p>
          </>
        ) : (
          <p className="text-metric mt-5 max-w-[26ch] text-muted">{emptyNote}</p>
        )}
      </div>

      <ProofOrb state={orb} className="mx-auto aspect-square w-full max-w-[19rem]" />
    </section>
  );
}

function Stat({
  label,
  ledger,
  pick,
}: {
  label: string;
  ledger: LedgerState;
  pick: (v: Extract<LedgerState, { status: "ready" }>["value"]) => number;
}) {
  return (
    <div>
      <dt className="text-label leading-none font-medium tracking-[0.13em] text-dim uppercase">{label}</dt>
      <dd className="text-metric mt-3 tabular-nums text-cream">
        {ledger.status === "ready" ? (
          pick(ledger.value).toLocaleString()
        ) : (
          <span className="skeleton inline-block h-[0.8em] w-[2.5ch] align-middle" />
        )}
      </dd>
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="text-label shrink-0 cursor-pointer rounded-full border border-hair px-3 py-1.5 tracking-[0.08em] text-chalk uppercase transition-colors duration-300 hover:border-cream"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
