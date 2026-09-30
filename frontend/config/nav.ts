export type NavItem = {
  label: string;
  href: string;
};

export const primaryNav: readonly NavItem[] = [
  { label: "Issuer", href: "/issuer" },
  { label: "Holder", href: "/user" },
  { label: "Verifier", href: "/verify" },
] as const;

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
