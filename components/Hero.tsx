"use client";

import { ArrowRight, Bot, ShieldCheck, Wallet, Zap } from "lucide-react";
import { useSiteConfig } from "./SiteConfigProvider";

const CHIPS = [
  { icon: Zap, label: "<48h Payouts" },
  { icon: Bot, label: "EAs Allowed" },
  { icon: ShieldCheck, label: "No Consistency Rule" },
  { icon: Wallet, label: "Crypto & Bank Withdrawals" },
];

export default function Hero() {
  const { config } = useSiteConfig();
  return (
    <section className="relative overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40">
      {/* Background glow + grid */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-12%] h-[520px] w-[820px] max-w-full -translate-x-1/2 rounded-full bg-emerald-500/20 blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at top, black 30%, transparent 75%)",
            WebkitMaskImage: "radial-gradient(ellipse at top, black 30%, transparent 75%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6">
        <span className="inline-flex animate-fade-in-up items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold text-emerald-300 shadow-glow backdrop-blur-md sm:text-sm">
          {config.hero.badge}
        </span>

        <h1 className="mt-6 animate-fade-in-up font-display text-4xl font-bold leading-[1.1] tracking-tight text-white [animation-delay:80ms] sm:text-6xl lg:text-7xl">
          {config.hero.headlineTop}
          <br />
          <span className="text-gradient">{config.hero.headlineAccent}</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl animate-fade-in-up text-base leading-relaxed text-slate-400 [animation-delay:160ms] sm:text-lg">
          {config.hero.subheadline}
        </p>

        <div className="mt-9 flex animate-fade-in-up flex-col items-center justify-center gap-3 [animation-delay:240ms] sm:flex-row">
          <a href="#models" className="btn-glow w-full px-8 py-4 text-base sm:w-auto">
            View Funded Plans
            <ArrowRight className="h-5 w-5" />
          </a>
          <a
            href="#faq"
            className="glass inline-flex w-full items-center justify-center rounded-xl px-8 py-4 text-base font-semibold text-slate-200 transition hover:bg-white/10 sm:w-auto"
          >
            Rules &amp; FAQ
          </a>
        </div>

        <ul className="mt-12 flex animate-fade-in-up flex-wrap items-center justify-center gap-2.5 [animation-delay:320ms]">
          {CHIPS.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium text-slate-300 sm:text-sm"
            >
              <Icon className="h-4 w-4 text-emerald-400" />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
