import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/layout/Hero";
import { Pillars } from "@/components/layout/Pillars";
import { NetworkStatusCard } from "@/components/layout/NetworkStatusCard";
import { ParticleField } from "@/components/visual/ParticleField";
import { ProofOrb } from "@/components/visual/ProofOrb";
import { Faq } from "@/components/layout/Faq";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ArrowRight } from "@/components/icons";
import { primaryNav } from "@/config/nav";

const observable = [
  "An address holds a credential",
  "Whether a threshold check passed",
  "Whether a credential has been revoked",
  "Which addresses are registered issuers",
];

const concealed = [
  "The raw score behind the credential",
  "The 32-byte salt used in the commitment",
  "The issuer's private signing key",
  "The holder's domain-separated secret",
];

const roles = [
  {
    href: "/issuer",
    label: "Issuer",
    body: "Deploy the contract, register trusted issuers, and commit credentials for a subject address.",
  },
  {
    href: "/user",
    label: "Holder",
    body: "Generate a local keypair and score, then produce an eligibility proof against a threshold.",
  },
  {
    href: "/verify",
    label: "Verifier",
    body: "Check whether a holder clears a threshold and whether their credential is still valid.",
  },
];

export default function Home() {
  return (
    <>
      <main className="relative flex min-h-svh flex-col overflow-hidden pb-(--pad-bottom)">
        {/*
          On wide screens the particle field is an atmosphere layer behind
          everything, masked out to the left so it never sits under the
          headline. Below lg it falls into the flow as a band.
        */}
        <ParticleField className="field-mask order-2 h-[clamp(12.5rem,58vw,19rem)] w-full opacity-70 lg:absolute lg:inset-y-0 lg:right-0 lg:left-[24%] lg:z-0 lg:order-none lg:h-auto lg:w-auto lg:opacity-100" />

        <div className="order-1 lg:order-none">
          <Navbar />
        </div>

        <div className="order-1 lg:order-none lg:flex lg:flex-1 lg:flex-col">
          <Hero />
        </div>

        <div className="relative z-10 order-3 mt-(--gap-pillars) px-gutter lg:order-none">
          <Pillars />
        </div>

        <div
          className="fade relative z-10 order-3 mt-12 w-full px-gutter lg:absolute lg:right-gutter lg:bottom-(--card-bottom) lg:order-none lg:mt-0 lg:w-auto lg:px-0"
          style={{ animationDelay: "520ms" }}
        >
          <NetworkStatusCard />
        </div>

        {/* The navbar has no room for these below md, so they land here instead. */}
        <nav
          aria-label="Secondary"
          className="relative z-10 order-4 mt-12 flex items-center gap-8 px-gutter md:hidden"
        >
          {primaryNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-fine text-faint transition-opacity duration-300 hover:opacity-65"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </main>

      <section className="border-t border-hair-soft px-gutter py-(--page-pad)">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:gap-16">
          <div className="min-w-0">
            <h2 className="text-page-title max-w-[18ch] text-cream">What crosses the boundary</h2>
            <p className="text-fine mt-5 max-w-[34ch] text-faint">
              Every circuit is designed around this line.
            </p>

            <div className="mt-(--page-pad) grid border-t border-hair-soft sm:grid-cols-2">
              <BoundaryColumn title="Observable" tone="text-signal" mark="+" items={observable} className="sm:pr-10" />
              <BoundaryColumn
                title="Concealed"
                tone="text-amber"
                mark="−"
                items={concealed}
                className="border-t border-hair-soft sm:border-t-0 sm:border-l sm:pl-10"
              />
            </div>
          </div>

          <figure className="relative flex flex-col items-center justify-center lg:sticky lg:top-8 lg:self-start">
            <ProofOrb className="aspect-square w-full max-w-[30rem]" />
            <figcaption className="text-label mt-2 text-center leading-relaxed font-medium tracking-[0.13em] text-dim uppercase">
              <span className="font-mono tracking-normal normal-case text-faint">persistentCommit(score, salt)</span>
              <br />
              On-chain: the commitment. Off-chain: everything else.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="border-t border-hair-soft px-gutter py-(--page-pad)">
        <h2 className="text-page-title max-w-[18ch] text-cream">Three ways in</h2>

        <ul className="mt-(--page-pad) border-t border-hair-soft">
          {roles.map((role) => (
            <li key={role.href} className="border-b border-hair-soft">
              <Link
                href={role.href}
                className="group grid gap-3 py-(--row-pad) lg:grid-cols-[minmax(0,11rem)_minmax(0,1fr)_auto] lg:items-baseline lg:gap-12"
              >
                <span className="text-metric text-cream">{role.label}</span>
                <span className="text-fine max-w-[52ch] leading-relaxed text-faint">
                  {role.body}
                </span>
                <span className="text-label flex items-center gap-2 leading-none font-medium tracking-[0.13em] text-dim uppercase transition-colors duration-300 group-hover:text-cream">
                  Enter
                  <ArrowRight className="size-[1.2em] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-[2px]" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Faq />

      <SiteFooter />
    </>
  );
}

function BoundaryColumn({
  title,
  tone,
  mark,
  items,
  className = "",
}: {
  title: string;
  tone: string;
  mark: string;
  items: string[];
  className?: string;
}) {
  return (
    <div className={`pt-(--row-pad) ${className}`}>
      <h3 className={`text-label leading-none font-medium tracking-[0.13em] uppercase ${tone}`}>
        {title}
      </h3>
      <ul className="mt-6 pb-(--row-pad)">
        {items.map((item) => (
          <li
            key={item}
            className="flex gap-4 border-b border-hair-soft py-4 text-[0.9375rem] text-chalk last:border-b-0"
          >
            <span aria-hidden="true" className={`w-3 shrink-0 font-mono ${tone}`}>
              {mark}
            </span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
