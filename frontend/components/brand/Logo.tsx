import Image from "next/image";
import logo from "@/public/logo.png";

/* The brand mark, keyed to a transparent field so it sits on the black ground. */
export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src={logo}
      alt=""
      aria-hidden="true"
      priority
      sizes="128px"
      className={className}
    />
  );
}
