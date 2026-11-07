"use client";

import { ArrowRight, Check, Headphones, LineChart, Wallet, Zap } from "lucide-react";
import { useSiteConfig } from "./SiteConfigProvider";
import { formatSize, formatUSD } from "@/lib/plans";

const TRUST = [
  { icon: Zap, label: "Daily Payouts" },
  { icon: Headphones, label: "24/7 Human Support" },
  { icon: LineChart, label: "MetaTrader 5" },
  { icon: Check, label: "Up to 100% Split" },
];

export default function Hero() {
  const { config } = useSiteConfig();

  // The preview card shows real numbers from the first visible model (editable in /admin).
  const model = config.models.find((m) => m.enabled) ?? config.models[0];
  const size = 10000 as const;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white pb-16 pt-32 sm:pb-24 sm:pt-40">
      {/* Decorative background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue-200/50 blur-3xl" />
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.5]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(37,99,235,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(37,99,235,0.07) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse at top, black 25%, transparent 70%)",
            WebkitMaskImage: "radial-gradient(ellipse at top, black 25%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8">
        {/* Copy */}
        <div className="text-center lg:text-left">
          <span className="inline-flex animate-fade-in-up items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-sm sm:text-sm">
            {config.hero.badge}
          </span>

          <h1 className="mt-6 animate-fade-in-up font-display text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 [animation-delay:80ms] sm:text-5xl lg:text-6xl">
            {config.hero.headlineTop}
            <br />
            <span className="text-gradient">{config.hero.headlineAccent}</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl animate-fade-in-up text-base leading-relaxed text-slate-600 [animation-delay:160ms] sm:text-lg lg:mx-0">
            {config.hero.subheadline}
          </p>

          <div className="mt-8 flex animate-fade-in-up flex-col items-center gap-3 [animation-delay:240ms] sm:flex-row sm:justify-center lg:justify-start">
            <a href="#models" className="btn-glow w-full px-8 py-4 text-base sm:w-auto">
              View Funded Plans
              <ArrowRight className="h-5 w-5" />
            </a>
            <a
              href="#how"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-700 sm:w-auto"
            >
              How it works
            </a>
          </div>

          <ul className="mt-10 flex animate-fade-in-up flex-wrap items-center justify-center gap-2.5 [animation-delay:320ms] lg:justify-start">
            {TRUST.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm sm:text-sm"
              >
                <Icon className="h-4 w-4 text-blue-600" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        {/* Preview card */}
        {model && (
          <div className="relative mx-auto w-full max-w-md animate-fade-in-up [animation-delay:200ms]">
            <div aria-hidden="true" className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-300/40 to-cyan-200/40 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                    {model.drawdownType} Drawdown
                  </span>
                  <Wallet className="h-5 w-5 text-blue-100" />
                </div>
                <p className="mt-4 text-sm text-blue-100">{model.name}</p>
                <p className="font-display text-4xl font-bold">{formatUSD(size)}</p>
                <p className="mt-1 text-sm text-blue-100">
                  from <span className="font-bold text-white">{formatUSD(model.prices[size])}</span> one-time
                </p>
                {/* abstract equity curve (decorative) */}
                <svg viewBox="0 0 300 60" className="mt-4 h-14 w-full" fill="none" aria-hidden="true">
                  <path
                    d="M0 48 C30 44 40 30 70 34 S110 52 140 36 S190 8 220 18 S270 6 300 4"
                    stroke="#fff"
                    strokeOpacity="0.9"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M0 48 C30 44 40 30 70 34 S110 52 140 36 S190 8 220 18 S270 6 300 4 V60 H0Z"
                    fill="#fff"
                    fillOpacity="0.12"
                  />
                </svg>
              </div>
              <dl className="divide-y divide-slate-100 px-6 py-2 text-sm">
                {[
                  ["Daily Loss Limit", `${model.dailyLossPct}%`],
                  ["Max Drawdown", `${model.maxDrawdownPct}%`],
                  ["Leverage", model.leverage],
                  ["Profit Split", model.profitSplit],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between py-3">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="font-semibold text-slate-900">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-6 py-3 text-xs text-slate-600">
                <Check className="h-4 w-4 text-blue-600" /> {formatSize(size)} account shown
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
