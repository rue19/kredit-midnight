import { AppShell } from "@/components/app/AppShell";

/* Issuer, Holder and Verifier render inside the shell; URLs stay flat. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
