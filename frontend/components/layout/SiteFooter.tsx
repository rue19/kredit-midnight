import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { primaryNav } from "@/config/nav";
import { site } from "@/config/site";

const RESOURCES = [
  { label: "GitHub", href: site.repo },
  { label: "Documentation", href: `${site.repo}#readme` },
  { label: "Demo video", href: site.video },
  { label: "X", href: site.x },
];

const CONTRACT = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-hair-soft px-gutter pt-(--page-pad)">
      <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
        <div>
          <Link href="/" aria-label={`${site.name} home`} className="inline-flex items-center gap-3 transition-opacity duration-300 hover:opacity-80">
            <Logo className="h-9 w-auto" />
            <span className="text-[1.0625rem] font-medium tracking-[0.06em] text-chalk">{site.wordmark}</span>
          </Link>
          <p className="text-fine mt-6 max-w-[30ch] leading-relaxed text-faint">
            Prove you qualify. Reveal nothing.
          </p>
        </div>

        <FooterColumn title="Protocol">
          {primaryNav.map((link) => (
            <FooterLink key={link.href} href={link.href}>
              {link.label}
            </FooterLink>
          ))}
          <FooterLink href="/#faq">FAQ</FooterLink>
        </FooterColumn>

        <FooterColumn title="Resources">
          {RESOURCES.map((link) => (
            <FooterLink key={link.label} href={link.href} external>
              {link.label}
            </FooterLink>
          ))}
        </FooterColumn>

        <FooterColumn title="Network">
          <li className="text-fine text-chalk">{site.network}</li>
          <li className="text-fine text-faint">{site.compact}</li>
          {CONTRACT ? (
            <li className="text-fine font-mono text-faint" title={CONTRACT}>
              {CONTRACT.slice(0, 8)}…{CONTRACT.slice(-6)}
            </li>
          ) : null}
        </FooterColumn>
      </div>

      {/* The wordmark, set at display size and cropped by the page edge. */}
      <p
        aria-hidden="true"
        className="text-display pointer-events-none mt-(--page-pad) -mb-[0.2em] select-none text-center leading-none font-medium tracking-[-0.045em] text-transparent [-webkit-text-stroke:1px_rgba(228,220,200,0.18)] lg:text-[clamp(8rem,21vw,20rem)]"
      >
        {site.wordmark}
      </p>

      <div className="relative flex flex-wrap items-center justify-between gap-4 border-t border-hair-soft py-6">
        <span className="text-label leading-none font-medium tracking-[0.13em] text-dim uppercase">MIT License</span>
        <span className="text-label leading-none font-medium tracking-[0.13em] text-dim uppercase">
          Built on Midnight
        </span>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-label leading-none font-medium tracking-[0.13em] text-faint uppercase">{title}</p>
      <ul className="mt-6 space-y-3.5">{children}</ul>
    </div>
  );
}

function FooterLink({ href, external, children }: { href: string; external?: boolean; children: React.ReactNode }) {
  return (
    <li>
      {external ? (
        <a href={href} target="_blank" rel="noreferrer noopener" className="text-fine text-chalk transition-opacity duration-300 hover:opacity-65">
          {children}
        </a>
      ) : (
        <Link href={href} className="text-fine text-chalk transition-opacity duration-300 hover:opacity-65">
          {children}
        </Link>
      )}
    </li>
  );
}
