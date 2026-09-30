import { network } from "@/config/network";

/*
  Questions people ask before trusting a privacy claim. Every answer states
  a limitation plainly where one exists; the README's privacy model is the
  source for each.
*/
const FAQ = [
  {
    q: "What does a verifier actually learn?",
    a: "A single boolean — whether the holder's score clears the threshold — and whether the credential has been revoked. The score and the salt behind the commitment never leave the holder's browser.",
  },
  {
    q: "Where is my score stored?",
    a: "In this browser's local storage, next to your keys and salt. Nothing is sent to a server. Local storage is plaintext, so anything able to run script on the page could read it; treat the browser holding a credential like a wallet.",
  },
  {
    q: "Can a verifier work out my exact score?",
    a: "Not from one proof. A verifier who asks for many proofs at different thresholds could narrow it down by binary search, so a holder should only prove to thresholds they expect to be asked.",
  },
  {
    q: "Does the issuer see my score?",
    a: "Yes. The issuer is the party that knows the score in the first place — a bank or KYC provider — and commits to it on-chain with persistentCommit(score, salt). What Kredit removes is everyone after them seeing it.",
  },
  {
    q: "Who can issue credentials?",
    a: "Only issuers registered by the contract admin. The contract checks the caller's issuer key against the on-chain registry before it stores a commitment, and the same key is required to revoke one.",
  },
  {
    q: "What do I need to try it?",
    a: `The Lace wallet with developer mode on and the ${network.label} network selected, tNIGHT from the ${network.name} faucet, and that tNIGHT designated for DUST generation so the wallet can pay fees.`,
  },
  {
    q: "Is Kredit live on mainnet?",
    a: `No. The contract is deployed on ${network.label}, a Midnight test network. Proofs, commitments and revocations are real on-chain transactions there, but the tokens that pay for them have no value.`,
  },
] as const;

export function Faq() {
  return (
    <section id="faq" className="border-t border-hair-soft px-gutter py-(--page-pad)">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-16">
        <div>
          <p className="text-label leading-none font-medium tracking-[0.13em] text-faint uppercase">FAQ</p>
          <h2 className="text-page-title mt-5 max-w-[14ch] text-cream">Questions worth asking</h2>
        </div>

        <div className="border-t border-hair-soft">
          {FAQ.map((item) => (
            <details key={item.q} className="group border-b border-hair-soft">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                <span className="text-[clamp(1rem,1.3vw,1.1875rem)] text-chalk transition-colors duration-300 group-open:text-cream">
                  {item.q}
                </span>
                <span
                  aria-hidden="true"
                  className="relative flex size-8 shrink-0 items-center justify-center rounded-full border border-hair transition-colors duration-300 group-hover:border-cream"
                >
                  <span className="absolute h-px w-3 bg-chalk" />
                  <span className="absolute h-3 w-px bg-chalk transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-open:scale-y-0" />
                </span>
              </summary>
              <p className="text-fine max-w-[60ch] pb-7 leading-relaxed text-faint">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
