import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import { WalletButton } from "@/components/layout/WalletButton";
import { primaryNav } from "@/config/nav";

export function Navbar() {
  return (
    <header className="relative z-10 flex items-center justify-between gap-4 px-gutter pt-(--gap-nav)">
      <Wordmark />

      <nav
        aria-label="Primary"
        className="flex shrink-0 items-center gap-[clamp(1.25rem,4.69vw,4.5rem)]"
      >
        <ul className="hidden items-center gap-[clamp(1.25rem,4.69vw,4.5rem)] md:flex">
          {primaryNav.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="text-nav text-chalk transition-opacity duration-300 hover:opacity-65"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
        <WalletButton />
      </nav>
    </header>
  );
}
