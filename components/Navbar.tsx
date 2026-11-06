"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe, Menu, X } from "lucide-react";
import Link from "next/link";
import Logo from "./Logo";
import { useAuth } from "./AuthProvider";
import { useSiteConfig } from "./SiteConfigProvider";
import type { AuthMode } from "./AuthModal";

const NAV_LINKS = [
  { label: "Models", href: "/#models" },
  { label: "Rules & FAQ", href: "/#faq" },
  { label: "Payouts", href: "/#payouts" },
  { label: "About Us", href: "/#about" },
];

// Placeholder language list. TODO(i18n): wire to next-intl / next-i18next later.
const LANGUAGES = [
  { code: "EN", label: "English" },
  { code: "UR", label: "اردو" },
  { code: "AR", label: "العربية" },
  { code: "ES", label: "Español" },
];

function LanguageSwitcher({ align = "right" }: { align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState(LANGUAGES[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="glass inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
      >
        <Globe className="h-4 w-4 text-emerald-400" />
        {lang.code}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          className={`absolute z-50 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#0D1320] p-1 shadow-xl animate-fade-in ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {LANGUAGES.map((l) => (
            <li key={l.code}>
              <button
                type="button"
                role="option"
                aria-selected={l.code === lang.code}
                onClick={() => {
                  setLang(l);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                <span>{l.label}</span>
                {l.code === lang.code && <Check className="h-4 w-4 text-emerald-400" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PortalButton({
  onOpenAuth,
  onDone,
  className,
}: {
  onOpenAuth: (mode: AuthMode) => void;
  onDone?: () => void;
  className: string;
}) {
  const { user } = useAuth();
  if (user) {
    return (
      <Link href="/dashboard" onClick={onDone} className={className}>
        Dashboard
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => {
        onDone?.();
        onOpenAuth("signin");
      }}
      className={className}
    >
      Client Portal
    </button>
  );
}

interface NavbarProps {
  onOpenAuth: (mode: AuthMode) => void;
}

export default function Navbar({ onOpenAuth }: NavbarProps) {
  const { config } = useSiteConfig();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const showBg = scrolled || mobileOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        showBg
          ? "border-b border-white/10 bg-obsidian/85 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      {config.announcement.enabled && config.announcement.text && (
        <div className="bg-gradient-to-r from-emerald-600 to-green-500 px-4 py-1.5 text-center text-xs font-semibold text-[#04110B] sm:text-sm">
          {config.announcement.text}
        </div>
      )}
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageSwitcher />
          <PortalButton onOpenAuth={onOpenAuth} className="btn-glow px-5 py-2.5 text-sm" />
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="glass inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-200 md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="animate-fade-in border-t border-white/10 px-4 pb-5 pt-3 md:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-slate-200 transition hover:bg-white/5"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex items-center gap-3">
            <LanguageSwitcher align="left" />
            <PortalButton
              onOpenAuth={onOpenAuth}
              onDone={() => setMobileOpen(false)}
              className="btn-glow flex-1 py-2.5 text-sm"
            />
          </div>
        </div>
      )}
    </header>
  );
}
