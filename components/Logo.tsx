"use client";

import Link from "next/link";
import { useSiteConfig } from "./SiteConfigProvider";

/** `onDark` = white text version, for the navy footer and the dark admin panel. */
export default function Logo({ className = "", onDark = false }: { className?: string; onDark?: boolean }) {
  const { config } = useSiteConfig();
  const name = config.brandName || "FundedX";

  return (
    <Link
      href="/"
      aria-label={`${name} home`}
      className={`group inline-flex items-center gap-2.5 ${className}`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 shadow-glow transition-transform duration-300 group-hover:scale-105">
        <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-5 w-5">
          <path d="M17.5 4 7 18h7l-1.5 10L25 13h-7l-.5-9Z" fill="#fff" />
        </svg>
      </span>
      <span
        className={`font-display text-xl font-bold tracking-tight ${onDark ? "text-white" : "text-slate-900"}`}
      >
        {name.slice(0, -1)}
        <span className={onDark ? "text-blue-400" : "text-blue-600"}>{name.slice(-1)}</span>
      </span>
    </Link>
  );
}
