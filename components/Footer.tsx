"use client";

import Logo from "./Logo";
import { useSiteConfig } from "./SiteConfigProvider";
import { MastercardBadge, UsdtBadge, VisaBadge } from "./icons";

const QUICK_LINKS = [
  { label: "Models", href: "/#models" },
  { label: "Rules & FAQ", href: "/#faq" },
  { label: "Payouts", href: "/#payouts" },
  { label: "About Us", href: "/#about" },
];

const LEGAL_LINKS = [
  { label: "Terms of Service", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Risk Disclosure", href: "#" },
];

export default function Footer() {
  const { config } = useSiteConfig();
  const year = new Date().getFullYear();

  return (
    <footer id="about" className="scroll-mt-16 border-t border-white/10 bg-obsidian-deep">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              {config.brandName} gives skilled traders access to firm capital with simple rules, fast payouts
              and up to 100% profit split. Trade your strategy, keep your profits.
            </p>
            <div className="mt-5">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
                We accept
              </p>
              <div className="flex flex-wrap gap-2">
                <UsdtBadge />
                <VisaBadge />
                <MastercardBadge />
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-sm font-semibold text-white">Quick Links</h4>
            <ul className="mt-4 space-y-2.5">
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-slate-400 transition hover:text-emerald-400"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-sm font-semibold text-white">Legal</h4>
            <ul className="mt-4 space-y-2.5">
              {LEGAL_LINKS.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-slate-400 transition hover:text-emerald-400"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* TODO(legal): have a lawyer review this disclaimer for your jurisdiction. */}
        <div className="mt-12 rounded-xl border border-white/10 bg-white/5 p-5 text-xs leading-relaxed text-slate-400">
          <strong className="text-slate-300">Risk Disclosure:</strong> Trading forex &amp; CFDs
          carries a high level of risk and may not be suitable for all investors. You could lose
          some or all of your capital. Past performance is not indicative of future results.
          Nothing on this website constitutes financial advice. Only trade with money you can
          afford to lose.
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
          <p>© {year} {config.brandName}. All rights reserved.</p>
          <p>Built for traders, by traders.</p>
        </div>
      </div>
    </footer>
  );
}
