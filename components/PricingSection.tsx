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

const FEATURES = ["Daily Payouts", "News Trading (Challenge)", "No Max Trading Period", "MetaTrader 5"];

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
  const [modelId, setModelId] = useState<ModelId>("one-step");
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
    <section id="models" className="relative scroll-mt-16 bg-slate-50 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />
            Funded Models
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
            Choose Your Challenge
          </h2>
          <p className="mt-3 text-slate-600">
            Pick a model and an account size. Rules and price update instantly.
          </p>
        </div>

        {/* Model tabs */}
        <div
          role="tablist"
          aria-label="Account model"
          className="mx-auto mt-10 grid max-w-5xl grid-cols-2 gap-1.5 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-slate-200 sm:grid-cols-3 lg:grid-cols-6"
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
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                {m.tabLabel}
                {m.popular && (
                  <span className="absolute -top-2 right-2 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-900">
                    Popular
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Size pills */}
        <div role="radiogroup" aria-label="Account size" className="mt-6 flex flex-wrap justify-center gap-2.5">
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
                    ? "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                    : "border-slate-200 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700"
                }`}
              >
                {formatSize(s)}
              </button>
            );
          })}
        </div>

        {/* Pricing / feature card */}
        <div className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-blue-900/10 ring-1 ring-slate-200">
          <div key={`${model.id}-${size}`} className="grid animate-fade-in lg:grid-cols-5">
            {/* Left: summary + CTA */}
            <div className="flex flex-col bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white sm:p-8 lg:col-span-2">
              <span className="w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                {model.drawdownType} Drawdown
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold">{model.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-blue-100">{model.tagline}</p>

              <div className="mt-6">
                <p className="text-xs font-medium uppercase tracking-wider text-blue-200">Account Size</p>
                <p className="font-display text-5xl font-bold">{formatUSD(size)}</p>
              </div>

              <div className="mt-6 flex flex-wrap items-end gap-x-3 gap-y-1">
                <span className="font-display text-4xl font-bold">{formatUSD(price)}</span>
                {model.discountPct > 0 && (
                  <>
                    <span className="pb-1 text-base text-blue-200 line-through">{formatUSD(listPrice)}</span>
                    <span className="mb-1 rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-blue-700">
                      -{model.discountPct}%
                    </span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => onBuy({ modelId: model.id, size, price })}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white py-4 text-base font-bold text-blue-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-50 lg:mt-auto"
              >
                Buy Account - {formatUSD(price)}
                <ArrowRight className="h-5 w-5" />
              </button>
              <p className="mt-3 text-center text-xs text-blue-200">One-time fee · Prices in USD</p>
            </div>

            {/* Right: feature matrix */}
            <div className="p-6 sm:p-8 lg:col-span-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Trading Rules</h4>
              <dl className="mt-2">
                {rows.map((r) => (
                  <div
                    key={r.label}
                    className="flex items-center justify-between gap-4 border-b border-slate-100 py-3.5 last:border-b-0"
                  >
                    <dt className="text-sm text-slate-500">{r.label}</dt>
                    <dd className="flex flex-wrap items-center justify-end gap-2 text-right">
                      {r.badge && (
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            r.badge === "Trailing" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {r.badge}
                        </span>
                      )}
                      <span className={`font-semibold ${r.good ? "text-emerald-600" : "text-slate-900"}`}>
                        {r.value}
                      </span>
                      {r.sub && <span className="text-xs text-slate-400">({r.sub})</span>}
                    </dd>
                  </div>
                ))}
              </dl>

              <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {FEATURES.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2.5 rounded-xl bg-blue-50 px-3.5 py-2.5 text-sm font-medium text-slate-700"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
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
          <h3 className="mb-3 text-center text-sm font-semibold uppercase tracking-wider text-slate-500">
            Compare all models · {formatSize(size)} account
          </h3>
          <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
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
                      className={`cursor-pointer border-b border-slate-100 transition-colors last:border-b-0 hover:bg-blue-50/60 ${
                        active ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => setModelId(m.id)}
                          className={`font-semibold ${active ? "text-blue-700" : "text-slate-900"}`}
                        >
                          {m.name}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-blue-600">{formatUSD(m.prices[size])}</td>
                      <td className="px-4 py-3.5 text-slate-600">{m.dailyLossPct}%</td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {m.maxDrawdownPct}% <span className="text-xs text-slate-400">({m.drawdownType})</span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">{m.profitTarget}</td>
                      <td className="px-4 py-3.5 text-slate-600">{m.minTradingDays}</td>
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
