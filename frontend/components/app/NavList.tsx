"use client";

import Link from "next/link";
import { isActive, primaryNav, type NavItem } from "@/config/nav";

/*
  The navigation rail's contents, shared by the desktop rail and the mobile
  sheet so the two can never drift apart. The active item is marked by a
  single dot in the margin plus a shift from faint to cream.
*/
export function NavList({
  pathname,
  onNavigate,
  size = "rail",
}: {
  pathname: string;
  onNavigate?: () => void;
  size?: "rail" | "sheet";
}) {
  return (
    <nav aria-label="Application">
      <ul>
        {primaryNav.map((item) => (
          <li key={item.href}>
            <NavEntry
              item={item}
              active={isActive(pathname, item.href)}
              onNavigate={onNavigate}
              size={size}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}

function NavEntry({
  item,
  active,
  onNavigate,
  size,
}: {
  item: NavItem;
  active: boolean;
  onNavigate?: () => void;
  size: "rail" | "sheet";
}) {
  const scale = size === "sheet" ? "text-[1rem] py-3" : "text-rail py-[0.6rem]";

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`relative block leading-none font-medium tracking-[0.14em] uppercase transition-colors duration-300 ${scale} ${
        active ? "text-cream" : "text-faint hover:text-chalk"
      }`}
    >
      {active ? (
        <span
          aria-hidden="true"
          className="absolute top-1/2 -left-[0.875rem] size-[3px] -translate-y-1/2 rounded-full bg-cream"
        />
      ) : null}
      {item.label}
    </Link>
  );
}
