"use client";

import { useState } from "react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useSiteConfig } from "./SiteConfigProvider";
import {
  ACCOUNT_SIZES,
  formatSize,
  formatUSD,
  getListPrice,
  type AccountSize,
  type ModelId,
  type PlanSelection,
} from "@/lib/plans";

const FEATURES = ["EAs Allowed", "News Trading Allowed", "No Consistency Rule", "Fast <48h Payouts"];

type Row = {
  label: string;
  value: string;
  sub?: string;
  badge?: string;
  good?: boolean;
};

interface PricingSectionProps {
  onBuy: (selection: PlanSelection) => void;
}

export default function PricingSection({ onBuy }: PricingSectionProps) {
  const { config } = useSiteConfig();
  const models = config.models.filter((m) => m.enabled);
  const [modelId, setModelId] = useState<ModelId>("instant-flex");
  const [size, setSize] = useState<AccountSize>(10000);

  const model = models.find((m) => m.id === modelId) ?? models[0];
  if (!model) return null;
  const price = model.prices[size];
  const listPrice = getListPrice(model, size);
  const dailyLossUsd = (size * model.dailyLossPct) / 100;
  const drawdownUsd = (size * model.maxDrawdownPct) / 100;

  const rows: Row[] = [
    { label: "Daily Loss Limit", value: `${model.dailyLossPct}%`, sub: formatUSD(dailyLossUsd) },
    {
      label: "Max Drawdown",
      value: `${model.maxDrawdownPct}%`,
      sub: formatUSD(drawdownUsd),
      badge: model.drawdownType,
    },
    { label: "Leverage", value: model.leverage },
    { label: "Profit Target", value: model.profitTarget, good: model.profitTarget === "None" },
    {
      label: "Minimum Trading Days",
      value: model.minTradingDays,
      good: model.minTradingDays.startsWith("0"),
    },
    { label: "Profit Split", value: model.profitSplit },
    { label: "Payouts", value: model.payouts },
  ];

  return (
    <section id="models" className="relative scroll-mt-16 py-20 sm:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/3 mx-auto h-72 w-3/4 rounded-full bg-emerald-500/10 blur-[120px]"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            Funded Models
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Choose Your Funded Model
          </h2>
          <p className="mt-3 text-slate-400">
            Pick a model and an account size. Rules and price update instantly.
          </p>
        </div>

        {/* Model tabs */}
        <div
          role="tablist"
          aria-label="Account model"
          className="glass mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-1.5 rounded-2xl p-1.5 lg:grid-cols-4"
        >
          {models.map((m) => {
            const active = m.id === model.id;
            return (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setModelId(m.id)}
                className={`relative rounded-xl px-3 py-3 text-sm font-semibold transition-all duration-300 ${
                  active
                    ? "bg-gradient-to-r from-emerald-500 to-green-400 text-[#04110B] shadow-glow"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {m.tabLabel}
                {m.popular && (
                  <span className="absolute -top-2 right-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase text-black">
                    Popular
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Size pills */}
        <div
          role="radiogroup"
          aria-label="Account size"
          className="mt-6 flex flex-wrap justify-center gap-2.5"
        >
          {ACCOUNT_SIZES.map((s) => {
            const active = s === size;
            return (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setSize(s)}
                className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all duration-300 ${
                  active
                    ? "border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-glow"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-emerald-500/40 hover:text-white"
                }`}
              >
                {formatSize(s)}
              </button>
            );
          })}
        </div>

        {/* Pricing / feature card */}
        <div className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-3xl border border-emerald-500/20 bg-card/80 shadow-[0_0_80px_-30px_rgba(16,185,129,0.45)] backdrop-blur-md">
          <div key={`${modelId}-${size}`} className="grid animate-fade-in lg:grid-cols-5">
            {/* Left: summary + CTA */}
            <div className="flex flex-col border-b border-white/10 bg-gradient-to-b from-emerald-500/10 to-transparent p-6 sm:p-8 lg:col-span-2 lg:border-b-0 lg:border-r">
              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                  model.drawdownType === "Trailing"
                    ? "bg-amber-500/15 text-amber-300 ring-amber-400/30"
                    : "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30"
                }`}
              >
                {model.drawdownType} Drawdown
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold text-white">{model.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{model.tagline}</p>

              <div className="mt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Account Size
                </p>
                <p className="font-display text-5xl font-bold text-white">{formatUSD(size)}</p>
              </div>

              <div className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-1">
                <span className="font-display text-4xl font-bold text-emerald-400">
                  {formatUSD(price)}
                </span>
                {model.discountPct > 0 && (
                  <>
                <span className="pb-1 text-base text-slate-500 line-through">
                  {formatUSD(listPrice)}
                </span>
                <span className="mb-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/30">
                  -{model.discountPct}%
                </span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => onBuy({ modelId: model.id, size, price })}
                className="btn-glow mt-8 w-full py-4 text-base lg:mt-auto"
              >
                Buy Account - {formatUSD(price)}
                <ArrowRight className="h-5 w-5" />
              </button>
              <p className="mt-3 text-center text-xs text-slate-500">
                One-time fee · Prices in USD
              </p>
            </div>

            {/* Right: feature matrix */}
            <div className="p-6 sm:p-8 lg:col-span-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Trading Rules
              </h4>
              <dl className="mt-2">
                {rows.map((r) => (
                  <div
                    key={r.label}
                    className="flex items-center justify-between gap-4 border-b border-white/5 py-3.5 last:border-b-0"
                  >
                    <dt className="text-sm text-slate-400">{r.label}</dt>
                    <dd className="flex flex-wrap items-center justify-end gap-2 text-right">
                      {r.badge && (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${
                            r.badge === "Trailing"
                              ? "bg-amber-500/15 text-amber-300 ring-amber-400/30"
                              : "bg-emerald-500/15 text-emerald-300 ring-emerald-400/30"
                          }`}
                        >
                          {r.badge}
                        </span>
                      )}
                      <span className={`font-semibold ${r.good ? "text-emerald-400" : "text-white"}`}>
                        {r.value}
                      </span>
                      {r.sub && <span className="text-xs text-slate-500">({r.sub})</span>}
                    </dd>
                  </div>
                ))}
              </dl>

              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {FEATURES.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-slate-200"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Compare table */}
        <div className="mx-auto mt-10 max-w-5xl">
          <h3 className="mb-3 text-center text-sm font-semibold uppercase tracking-wider text-slate-400">
            Compare all models · {formatSize(size)} account
          </h3>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-card/60 backdrop-blur-md">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-4 font-medium">Model</th>
                  <th className="px-4 py-4 font-medium">Price</th>
                  <th className="px-4 py-4 font-medium">Daily Loss</th>
                  <th className="px-4 py-4 font-medium">Max Drawdown</th>
                  <th className="px-4 py-4 font-medium">Profit Target</th>
                  <th className="px-4 py-4 font-medium">Min Days</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m) => {
                  const active = m.id === model.id;
                  return (
                    <tr
                      key={m.id}
                      onClick={() => setModelId(m.id)}
                      className={`cursor-pointer border-b border-white/5 transition-colors last:border-b-0 hover:bg-white/5 ${
                        active ? "bg-emerald-500/10" : ""
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => setModelId(m.id)}
                          className={`font-semibold ${active ? "text-emerald-300" : "text-white"}`}
                        >
                          {m.name}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-emerald-400">
                        {formatUSD(m.prices[size])}
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">{m.dailyLossPct}%</td>
                      <td className="px-4 py-3.5 text-slate-300">
                        {m.maxDrawdownPct}%{" "}
                        <span className="text-xs text-slate-500">({m.drawdownType})</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">{m.profitTarget}</td>
                      <td className="px-4 py-3.5 text-slate-300">{m.minTradingDays}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
