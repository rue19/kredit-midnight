/*
  How a credential moves. The numbering is the protocol's order: a score is
  committed before it can be held, and held before it can be proven.
*/
const PILLARS = [
  {
    n: "01",
    title: "Issue",
    body: "An issuer commits to a holder's score on-chain — persistentCommit(score, salt). The number itself never leaves the issuer's machine.",
  },
  {
    n: "02",
    title: "Hold",
    body: "The holder keeps their score, salt, and keys in local storage. No server, wallet, or contract ever sees the plaintext value.",
  },
  {
    n: "03",
    title: "Prove",
    body: "Asked to clear a threshold, the holder's browser produces a zero-knowledge proof. The verifier learns pass or fail — nothing else.",
  },
] as const;

export function Pillars() {
  return (
    <ol
      id="protocol"
      aria-label="How a credential moves"
      className="grid w-full grid-cols-1 gap-y-10 sm:grid-cols-3 sm:gap-x-(--pillar-gap) sm:gap-y-0 lg:max-w-[62%]"
    >
      {PILLARS.map((pillar) => (
        <li key={pillar.n}>
          <div className="flex items-center">
            <span className="text-pillar-num leading-none tabular-nums text-muted">
              {pillar.n}
            </span>
            <span
              aria-hidden="true"
              className="pillar-rule ml-[clamp(0.875rem,2.54vw,2.4375rem)] h-px flex-1"
            />
            <span
              aria-hidden="true"
              className="ml-[3px] size-[6px] shrink-0 rounded-full bg-chalk"
            />
          </div>

          <h2 className="text-pillar-title mt-[clamp(1rem,1.5vw,1.4375rem)] leading-none font-medium tracking-[0.06em] text-cream uppercase">
            {pillar.title}
          </h2>

          <p className="text-pillar-body mt-[clamp(0.75rem,1.24vw,1.1875rem)] max-w-[24em] text-faint">
            {pillar.body}
          </p>
        </li>
      ))}
    </ol>
  );
}
