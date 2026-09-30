"use client";

import { network } from "@/config/network";
import { TX_STEPS, useTxStages, type StepStatus } from "@/hooks/useTxStages";

const DOT: Record<StepStatus, string> = {
  pending: "bg-hair",
  active: "bg-cream pulse",
  done: "bg-signal",
  fail: "bg-amber",
};

const LABEL: Record<StepStatus, string> = {
  pending: "text-dim",
  active: "text-cream",
  done: "text-chalk",
  fail: "text-amber",
};

/*
  A transaction's path from this browser to the chain, driven by the stage
  events lib/providers emits while it proves, signs and submits.
*/
export function TxProgress({
  running,
  outcome,
}: {
  running: boolean;
  outcome: "success" | "error" | null;
}) {
  const { steps, visible } = useTxStages(running, outcome);
  if (!visible) return null;

  const current = TX_STEPS.find((s) => steps[s.key] === "active" || steps[s.key] === "fail");

  return (
    <section aria-live="polite" className="border-t border-hair-soft py-(--row-pad)">
      <p className="text-label leading-none font-medium tracking-[0.13em] text-faint uppercase">Transaction</p>

      <ol className="mt-6 grid grid-cols-5">
        {TX_STEPS.map((step, i) => {
          const status = steps[step.key];
          return (
            <li key={step.key} className="relative min-w-0">
              <div className="flex items-center">
                <span aria-hidden="true" className={`relative z-10 size-[9px] shrink-0 rounded-full ${DOT[status]}`} />
                {i < TX_STEPS.length - 1 ? (
                  <span
                    aria-hidden="true"
                    className={`h-px flex-1 transition-colors duration-500 ${status === "done" ? "bg-signal/50" : "bg-hair-soft"}`}
                  />
                ) : null}
              </div>
              <p
                className={`text-label mt-3 truncate pr-2 leading-none font-medium tracking-[0.13em] uppercase ${LABEL[status]}`}
              >
                {step.label}
                <span className="sr-only"> — {status}</span>
              </p>
            </li>
          );
        })}
      </ol>

      <p className="mt-5 text-[0.75rem] text-dim">
        {running
          ? current?.detail ?? "Working…"
          : outcome === "success"
            ? `Confirmed on ${network.label}.`
            : outcome === "error"
              ? `Stopped at ${current?.label.toLowerCase() ?? "prepare"}.`
              : ""}
      </p>
    </section>
  );
}
