import Link from "next/link";
import { EyebrowPill } from "@/components/primitives/EyebrowPill";
import { ArrowRight, ShieldCheck } from "@/components/icons";

export function Hero() {
  return (
    <div className="relative z-10 px-gutter">
      <div className="rise mt-(--gap-eyebrow)" style={{ animationDelay: "60ms" }}>
        <EyebrowPill>Confidential credentials · Midnight network</EyebrowPill>
      </div>

      <h1
        className="rise text-display mt-(--gap-head) text-cream"
        style={{ animationDelay: "120ms" }}
      >
        Prove you qualify.
        <br />
        Reveal nothing.
      </h1>

      <p
        className="rise text-lede mt-(--gap-lede) max-w-[44ch] text-muted"
        style={{ animationDelay: "200ms" }}
      >
        Kredit lets a holder carry a private score — a credit rating, a KYC
        tier, a reputation index — and prove a claim about it on Midnight
        without ever putting the number on-chain.
      </p>

      <div
        className="rise mt-(--gap-cta) flex flex-wrap items-center gap-x-8 gap-y-5"
        style={{ animationDelay: "280ms" }}
      >
        <Link
          href="/user"
          className="text-lede group flex items-center rounded-full bg-cream py-[0.16em] pr-[0.16em] pl-[2.18em] font-medium whitespace-nowrap text-ground transition-opacity duration-300 hover:opacity-90"
        >
          Generate a proof
          <span className="ml-[1.5em] flex size-[3.27em] items-center justify-center rounded-full bg-ground text-cream transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[2px]">
            <ArrowRight className="size-[1.3em]" />
          </span>
        </Link>
        <Link
          href="/issuer"
          className="text-nav text-chalk underline decoration-hair underline-offset-[0.4em] transition-opacity duration-300 hover:opacity-65"
        >
          Open issuer console
        </Link>
      </div>

      <p
        className="rise text-fine mt-(--gap-fine) flex flex-wrap items-center gap-[0.85em] text-dim"
        style={{ animationDelay: "360ms" }}
      >
        <ShieldCheck className="size-[1.45em] shrink-0" />
        <span className="font-mono">
          score <span className="redacted mx-1 px-2 py-0.5">700</span> &ge; 650 &rarr;{" "}
          <span className="text-signal">eligible</span>
        </span>
      </p>
    </div>
  );
}
