"use client";

import Link from "next/link";
import { useSiteConfig } from "./SiteConfigProvider";

export default function Logo({ className = "" }: { className?: string }) {
  const { config } = useSiteConfig();
  const name = config.brandName || "FundedX";

  return (
    <Link
      href="/"
      aria-label={`${name} home`}
      className={`group inline-flex items-center gap-2.5 ${className}`}
    >
      <svg
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
        className="h-8 w-8 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)] transition-transform duration-300 group-hover:scale-110"
      >
        <path
          d="M16 2.5 27.5 9v14L16 29.5 4.5 23V9L16 2.5Z"
          stroke="#10B981"
          strokeWidth="1.8"
          fill="rgba(16,185,129,0.12)"
        />
        <path d="M17.5 8 11 17h4.5l-1 7 6.5-9h-4.5l1-7Z" fill="#22C55E" />
      </svg>
      <span className="font-display text-xl font-bold tracking-tight text-white [text-shadow:0_0_18px_rgba(16,185,129,0.55)]">
        {name.slice(0, -1)}
        <span className="text-emerald-400">{name.slice(-1)}</span>
      </span>
    </Link>
  );
}
