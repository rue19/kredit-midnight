"use client";

import { network } from "@/config/network";
import { useEffect, useState } from "react";
import { onStage } from "@/lib/providers";

export type StepStatus = "pending" | "active" | "done" | "fail";

export const TX_STEPS = [
  { key: "prepare", label: "Prepare", detail: "Loading contract and private state" },
  { key: "prove", label: "Prove", detail: "Zero-knowledge proof on the proof server" },
  { key: "sign", label: "Sign", detail: "Balanced and signed in Lace" },
  { key: "submit", label: "Submit", detail: `Sent to ${network.label}` },
  { key: "confirm", label: "Confirmed", detail: "Included on-chain" },
] as const;

type StepKey = (typeof TX_STEPS)[number]["key"];

const STAGE_TO_STEP: Record<string, StepKey> = {
  "Proving transaction": "prove",
  "Balancing/signing in wallet": "sign",
  "Deserializing balanced transaction": "sign",
  "Submitting transaction via wallet": "submit",
};

const initial = (): Record<StepKey, StepStatus> => ({
  prepare: "active",
  prove: "pending",
  sign: "pending",
  submit: "pending",
  confirm: "pending",
});

/*
  Follows the stage events emitted by lib/providers while `running`, and
  settles the remaining steps from `outcome` once the call returns.
*/
export function useTxStages(running: boolean, outcome: "success" | "error" | null) {
  const [steps, setSteps] = useState(initial);
  const [runId, setRunId] = useState(0);
  const [wasRunning, setWasRunning] = useState(running);

  // Reset at the start of each run (derived during render, not in an effect).
  if (running !== wasRunning) {
    setWasRunning(running);
    if (running) {
      setSteps(initial());
      setRunId((id) => id + 1);
    }
  }

  useEffect(() => {
    if (!running) return;
    return onStage(({ name, status }) => {
      const step = STAGE_TO_STEP[name];
      if (!step) return;
      setSteps((prev) => {
        const next = { ...prev };
        const order = TX_STEPS.map((s) => s.key);
        const index = order.indexOf(step);
        order.slice(0, index).forEach((k) => {
          if (next[k] !== "fail") next[k] = "done";
        });
        next[step] = status === "start" ? "active" : status === "done" ? "done" : "fail";
        return next;
      });
    });
  }, [running]);

  const settled: Record<StepKey, StepStatus> =
    running || outcome === null
      ? steps
      : outcome === "success"
        ? { prepare: "done", prove: "done", sign: "done", submit: "done", confirm: "done" }
        : (() => {
            const failed = { ...steps };
            const active = TX_STEPS.find((s) => failed[s.key] === "active");
            if (active) failed[active.key] = "fail";
            else if (!Object.values(failed).includes("fail")) failed.prepare = "fail";
            return failed;
          })();

  return { steps: settled, runId, visible: running || outcome !== null || runId > 0 };
}
